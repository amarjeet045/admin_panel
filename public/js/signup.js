/*
Custom event polyfill for IE
*/
(function () {

    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: null
        };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    window.CustomEvent = CustomEvent;
})();
/**
 * polyfill for toggleAttribute
 * 
 */
if (!Element.prototype.toggleAttribute) {
    Element.prototype.toggleAttribute = function (name, force) {
        if (force !== void 0) force = !!force

        if (this.hasAttribute(name)) {
            if (force) return true;

            this.removeAttribute(name);
            return false;
        }
        if (force === false) return false;

        this.setAttribute(name, "");
        return true;
    };
};

window.addEventListener('load', function () {
    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            initializeSignupForm();
            return;
        };
        addLogoutBtn();
    })
})

function submitFormData() {
    // send form data
    isElevatedUser().then(function (isElevated) {
        if (isElevated) return handleLoggedIn();
        document.getElementById('form').dispatchEvent(new Event('submit', {
            bubbles: true,
            cancelable: true
        }));
    })
}


function initializeSignupForm() {
    const address = document.getElementById('address')
    const officeName = document.getElementById('office-name')
    const username = document.getElementById('display-name')
    const email = document.getElementById('email')
    var formEl = document.getElementById('form');
    const phoneNumberField = new mdc.textField.MDCTextField(document.getElementById('phone-number'));
    const iti = phoneFieldInit(phoneNumberField, document.getElementById('country-dom'));
    const template = {
        'template': 'office',
        'firstContact': '',
        'name': '',
        'registeredOfficeAddress': '',
    };

    formEl.addEventListener('submit', function (e) {
        e.preventDefault();
        template.registeredOfficeAddress = address.value;
        template.name = officeName.value;
        var error = iti.getValidationError();
        if (error !== 0) {
            const message = getPhoneFieldErrorMessage(error);
            setHelperInvalid(phoneNumberField, message);
            return
        }
        if (!iti.isValidNumber()) {
            setHelperInvalid(phoneNumberField, 'Invalid number. Please check again');
            return;
        };
        setHelperValid(phoneNumberField);
        const formattedPhoneNumber = iti.getNumber(intlTelInputUtils.numberFormat.E164)

        template.firstContact = {
            displayName: username.value,
            email: email.value,
            phoneNumber: formattedPhoneNumber
        }
        localStorage.setItem('office_form_data', JSON.stringify(template));
        if (!document.querySelector('.otp-container')) {
            sendOfficeData();
            return
        }

        sendOTP(formattedPhoneNumber)
        return false;
    })

}

function sendOTP(formattedPhoneNumber) {
    snackBar('Sending OTP').open();
    verifyUser(formattedPhoneNumber).then(function (confirmResult) {
        snackBar('OTP has been sent').open();
        document.getElementById('submit-form').classList.add('hidden');
        checkOTP(confirmResult, formattedPhoneNumber)
    }).catch(function (error) {

        console.log(error)
        showSnacksApiResponse(error.message)
        sendErrorLog({
            message: error.message,
            stack: error.stack
        })
    });
}

function handleAuthUpdate(authProps) {

    return new Promise(function (resolve, reject) {

        const auth = firebase.auth().currentUser;
        const nameProm = auth.displayName === authProps.displayName ? Promise.resolve() : auth.updateProfile({
            displayName: authProps.displayName
        })
        nameProm
            .then(function () {
                console.log('name updated')
                if (auth.email === authProps.email) return Promise.resolve()
                console.log('adding email...')
                return firebase.auth().currentUser.updateEmail(authProps.email)
            }).then(function () {
                if (auth.emailVerified) return Promise.resolve()
                console.log('sending verification email...')
                return firebase.auth().currentUser.sendEmailVerification()
            })
            .then(resolve)
            .catch(function (authError) {

                console.log(authError);
                sendErrorLog({
                    message: authError.message,
                    stack: authError.stack
                });
                authError.type = 'auth'
                if (authError.code === 'auth/requires-recent-login') return resolve()
                reject(authError)
            })
    })
}


function verifyUser(phoneNumber) {
    return new Promise(function (resolve, reject) {

        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = handleRecaptcha('submit-form');
        }

        window.recaptchaVerifier.render().then(function (widgetId) {
                window.recaptchaWidgetId = widgetId;
                return window.recaptchaVerifier.verify();
            }).then(function () {
                return firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
            }).then(resolve)
            .catch(function (error) {
                grecaptcha.reset(window.recaptchaWidgetId);
            })
    })
}



function checkOTP(confirmResult, formattedPhoneNumber) {

    const otpCont = document.querySelector('.otp-container');
    otpCont.classList.remove('hidden');
    otpCont.innerHTML = `
    ${textField({
        id:'otp',
        type:'number',
        required:true,
        label:'ENTER OTP',
        customClass:'full-width'
    })}
    <div class="mdc-text-field-helper-line">
        <div class="mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg"></div>
    </div>
    <button class='mdc-button mdc-button--raised full-width' id='submit-otp' type='button'>SUBMIT</button>
    `
    const field = new mdc.textField.MDCTextField(document.getElementById('otp'))
    const btn = new mdc.ripple.MDCRipple(document.getElementById('submit-otp'));
    field.root_.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
    })
    btn.root_.addEventListener('click', function (e) {
        e.preventDefault();
        if (btn.root_) {
            btn.root_.toggleAttribute('disabled')
        }

        let promise = Promise.resolve();
        if (otpCont) {
            promise = confirmResult.confirm(field.value);
            snackBar('Verifying OTP').open();
        }

        if (firebase.auth().currentUser) {

            return submitFormData();
        };


        promise.then(function (result) {
                // auth completed. onstatechange listener will fire
                otpCont.remove();
                setHelperValid(field)
                if (result) {
                    handleAuthAnalytics(result);
                }
                submitFormData();
            })
            .catch(function (error) {
                console.log(error);
                if (btn.root_) {
                    btn.root_.toggleAttribute('disabled')
                }

                let errorMessage = error.message
                if (error.code === 'auth/invalid-verification-code') {
                    errorMessage = 'WRONG OTP'
                    setHelperInvalid(field, errorMessage)
                    return
                }
                if (error.code === 'auth/code-expired') {
                    //since user is already logged in , no need to do re-auth
                    if (firebase.auth().currentUser) {
                        return submitFormData();
                    };
                    errorMessage = 'OTP EXPIRED. Resending ...';
                    setHelperInvalid(field, errorMessage);
                    sendOTP(formattedPhoneNumber)
                    return;
                }
                sendErrorLog({
                    message: errorMessage,
                    stack: error.stack
                })
            })
    })
}

function setFormLoader(text) {
    if (document.getElementById("form-loader")) {
        document.getElementById("form-loader").appendChild(loader(text));
    }
}

function clearFormLoader() {
    document.getElementById("form-loader").innerHTML = ''
}

function sendOfficeData() {


    const formData = JSON.parse(localStorage.getItem('office_form_data'));
    setFormLoader('Creating your company');

    document.getElementById('submit-form').classList.add('hidden');
    handleAuthUpdate(formData.firstContact).then(function () {
            console.log('auth updated');
            return http('POST', `${appKeys.getBaseUrl()}/api/services/office`, formData)
        })
        .then(function () {
            localStorage.setItem('selected_office', formData.name)
            fbq('trackCustom', 'Office Created')
            analyticsApp.logEvent('office_created', {
                location: formData.registeredOfficeAddress
            });

            handleLoggedIn(true);
        })
        .catch(function (error) {
            document.getElementById('submit-form').classList.remove('hidden');
            console.log(error);
            clearFormLoader()
            if (document.getElementById('submit-otp')) {
                document.getElementById('submit-otp').toggleAttribute('disabled')
            }
            let field;
            let message
            if (error.message === `Office with the name '${formData.name}' already exists`) {
                field = new mdc.textField.MDCTextField(document.querySelector('.form-component.office .mdc-text-field'));
                message = `${formData.name} already exists`;
            }
            if (error.message === `Invalid registered address: '${formData.registeredOfficeAddress}'`) {
                field = new mdc.textField.MDCTextField(document.querySelector('.form-component.address .mdc-text-field'));
                message = `Invalid address`;
            }
            if (error.type === 'auth') {
                field = new mdc.textField.MDCTextField(document.querySelector('.form-component.email .mdc-text-field'));
                message = getEmailErrorMessage(error);
            }
            if (field) {
                field.root_.scrollIntoView();
                setHelperInvalid(field, message);
                return;
            }

            showSnacksApiResponse(error.message)
            sendErrorLog({
                message: error.message,
                stack: error.stack
            });
        })
}