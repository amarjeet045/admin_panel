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

// linearProgressBar for onboarding
const journeyBar = new mdc.linearProgress.MDCLinearProgress(document.getElementById('onboarding-progress'))

// root element into which view will get updated
const journeyContainer = document.getElementById("journey-container");
const journeyHeadline = document.getElementById('journey-text');
const journeyNextBtn = document.getElementById('journey-next')
const journeyPrevBtn = document.getElementById('journey-prev')

// history states
const states = ['self','otp','category','office','office_details','employees'];
//default index.
let index = 0;

/**
 * Handle state & view updation when next or prev button is clicked. 
 * Increment or decrement index based on user navigation
 */

journeyNextBtn.addEventListener('click',function(e){
    if(index > states.length) return;
    index++;
    const currentState = states[index];
    history.pushState()
})

journeyPrevBtn.addEventListener('click',function(e){
    if(index <= 0) return;
    index--;
    const currentState = states[index]
})

/**
 * On clicking back navigation in browser or previous button,
 * browser history will pop current state &
 * load the prev view
 */
window.addEventListener('popstate',ev => {
    console.log(ev);
    
})

/**
 *  progress value is set from 0 to 1
 *  there are 6 onboarding steps . so each increment and decrement is updated by 
 *  0.16666666666666666
 */


/**
 * Increment progress bar by 1/6th
 */
const incrementProgress = () => {
    journeyBar.progress = journeyBar.foundation_.progress_ + 0.16666666666666666
}
/**
 * Decrement progress bar by 1/6th
 */
const decrementProgress = () => {
    journeyBar.progress = journeyBar.foundation_.progress_ - 0.16666666666666666
}




window.addEventListener('load', function () {
  
    firebase.auth().onAuthStateChanged(user => {
        // if user is logged out.
        if (!user) {
            initFlow();
            return;
        };
        //if user is logged in. 
        addLogoutBtn();
    })
})


function initFlow() {
    journeyHeadline.textContent = 'Welcome';
    const nameField = textFieldOutlined({
        required: true,
        label: 'Name',
        autocomplete: "name"
    });
    const emailField = textFieldOutlined({
        required: true,
        label: 'Email',
        autocomplete: "email",
        type: 'email'
    });
    const countryDom = createElement('div')
    const phoneNumberField = textFieldOutlinedWithoutLabel({
        required: true,
        autocomplete: "tel",
        type: 'tel'
    });
    phoneNumberField.root_.classList.add('phonenumber-field')
    const iti = intlTelInput(phoneNumberField.input_, {
        initialCountry: "IN",
        formatOnDisplay: false,
        separateDialCode: true,
        dropdownContainer: countryDom
    });
    const frag = document.createDocumentFragment();
    frag.appendChild(nameField.root_)
    frag.appendChild(textFieldHelper())
    frag.appendChild(emailField.root_)
    frag.appendChild(textFieldHelper()) 
    frag.appendChild(phoneNumberField.root_)
    frag.appendChild(textFieldHelper())
    journeyContainer.appendChild(frag);
}

function personalDetails() {

}

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
        btn.root_.toggleAttribute('disabled')

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

                btn.root_.toggleAttribute('disabled')

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




const textField = (attr) => {
    const label = createElement('label', {
        className: 'mdc-text-field'
    })
    label.innerHTML = `<span class="mdc-text-field__ripple"></span>
    <input class="mdc-text-field__input" type="${attr.type || 'text'}" autocomplete=${attr.autocomplete ? attr.autocomplete : 'off'} ${attr.required ? 'required':''}  ${attr.disabled ? 'disabled':''} ${attr.readonly ? 'readonly':''}>
    <span class="mdc-floating-label">${attr.label}</span>
    <span class="mdc-line-ripple"></span>`
    return label;
}

const textFieldFilled = (attr) => {
    const tf = textField(attr);
    tf.classList.add('mdc-text-field--filled');
    return new mdc.textField.MDCTextField(tf);
}

const textFieldOutlined = (attr) => {
    const label = createElement('label', {
        className: 'mdc-text-field mdc-text-field--outlined'
    })
    label.innerHTML = `<input type="${attr.type || 'text'}" class="mdc-text-field__input" aria-labelledby="my-label-id" autocomplete=${attr.autocomplete ? attr.autocomplete : 'off'} ${attr.required ? 'required':''}  ${attr.disabled ? 'disabled':''} ${attr.readonly ? 'readonly':''}>
    <span class="mdc-notched-outline">
      <span class="mdc-notched-outline__leading"></span>
      <span class="mdc-notched-outline__notch">
        <span class="mdc-floating-label" id="my-label-id">${attr.label}</span>
      </span>
      <span class="mdc-notched-outline__trailing"></span>
    </span>`

    return new mdc.textField.MDCTextField(label);
}

const textFieldOutlinedWithoutLabel = (attr) => {
    const outlinedField = textFieldOutlined(attr);
    outlinedField.outline_.notchElement_.remove();
    outlinedField.outline_.root_.classList.add('mdc-text-field--no-label');
    return outlinedField;
}

const textFieldHelper = () => {
    const div = createElement('div', {
        className: 'mdc-text-field-helper-line"'
    })
    div.innerHTML = `<div class="mdc-text-field-helper-text" id="my-helper-id" aria-hidden="true"></div>`
    return div
}