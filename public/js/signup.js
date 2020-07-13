function enableSubmitBtn() {
    document.getElementById('submit-otp').removeAttribute('disabled')
}


window.addEventListener('load', function () {
    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            initializeSignupForm();
            return;
        };
        addLogoutBtn();

        // send form data
        isElevatedUser().then(function (isElevated) {
            if (isElevated) return handleLoggedIn()
            const formData = JSON.parse('office_form_data');
            sendOfficeData(formData);
        })
    })


})


function initializeSignupForm() {
    const address = document.getElementById('address')
    const officeName = document.getElementById('office-name')
    const username = document.getElementById('display-name')
    const email = document.getElementById('email')
    var formEl = document.getElementById('form');
    const phoneNumber = new mdc.textField.MDCTextField(document.getElementById('phone-number'));
    const iti = phoneFieldInit(phoneNumber, document.getElementById('country-dom'));

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
            setHelperInvalid(phoneNumber, message);
            return
        }
        if (!iti.isValidNumber()) {
            setHelperInvalid(phoneNumber, 'Invalid number. Please check again');
            return;
        }
        setHelperValid(phoneNumber);
        officeTemplate.firstContact = {
            displayName: auth.displayName || username.value,
            email: auth.email || email.value,
            phoneNumber: iti.getNumber(intlTelInputUtils.numberFormat.E164)
        }
        localStorage.setItem('office_form_data', JSON.stringify(officeTemplate));

        verifyUser(phoneNumber.value).then(checkOTP).catch(function (error) {
            showSnacksApiResponse(error.message)
            commonDom.progressBar.close();
            sendErrorLog({
                message: error.message,
                stack: error.stack
            })
        })
    })

}

function handleAuthUpdate(authProps) {

    return new Promise(function (resolve, reject) {

        const auth = firebase.auth().currentUser;
        commonDom.progressBar.open();
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
                console.log('email added')
                if (auth.emailVerified) return Promise.resolve()
                console.log('sending verification email...')
                return firebase.auth().currentUser.sendEmailVerification()
            })
            .then(function () {
                resolve()
            })
            .catch(function (authError) {
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


        // if (appKeys.getMode() === 'dev') {
        //     firebase.auth().settings.appVerificationDisabledForTesting = true
        // }
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = handleRecaptcha('office-form-submit');
        }
        commonDom.progressBar.open();

        window.recaptchaVerifier.render().then(function (widgetId) {
                window.recaptchaWidgetId = widgetId;
                return window.recaptchaVerifier.verify()

            }).then(function () {
                return firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
            }).then(function (confirmResult) {
                commonDom.progressBar.close();
                submitBtn.classList.add('hidden');
                resolve(confirmResult);
            })
            .catch(reject)
    })
}



function checkOTP(confirmResult) {

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
    <button class='mdc-button mdc-button--raised full-width' id='submit-otp'>SUBMIT</button>
    `
    const field = new mdc.textField.MDCTextField(document.getElementById('otp'))
    const btn = new mdc.ripple.MDCRipple(document.getElementById('submit-otp'));
    field.root_.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
    })
    btn.root_.addEventListener('click', function () {
        btn.root_.toggleAttribute('disabled')

        commonDom.progressBar.open();
        commonDom.progressBar.root_.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
        })
        confirmResult.confirm(field.value).then(function (result) {
                //auth completed. onstatechange listener will fire
                setHelperValid(field)
                handleAuthAnalytics(result);
            })

            .catch(function (error) {
                btn.root_.toggleAttribute('disabled')
                console.log(error)
                commonDom.progressBar.close();
                let errorMessage = error.message
                if (error.code === 'auth/invalid-verification-code') {
                    errorMessage = 'WRONG OTP'
                }
                sendErrorLog({
                    message: error.message,
                    stack: error.stack
                })
                setHelperInvalid(field, errorMessage)
            })
    })
}

function sendOfficeData(requestBody) {

    console.log(requestBody)
    linearProgress = commonDom.progressBar;
    linearProgress.open()
    const officeBody = requestBody.office
    handleAuthUpdate(requestBody.auth).then(function () {
            console.log('auth updated')
            return getLocation()
        }).then(function (geopoint) {
            officeBody.geopoint = geopoint;
            const sb = snackBar('Creating your company ...');
            sb.timeoutMs = 10000
            sb.open();
            return http('POST', `${appKeys.getBaseUrl()}/api/services/office`, officeBody)
        })
        .then(function () {
            localStorage.setItem('selected_office', officeBody.name)
            fbq('trackCustom', 'Office Created')
            analyticsApp.logEvent('office_created', {
                location: officeBody.registeredOfficeAddress
            });
            linearProgress.open()
            handleLoggedIn(true);
        })
        .catch(function (error) {
            sendErrorLog({
                message: error.message,
                stack: error.stack
            });
            linearProgress.close()
            console.log(error);
            document.getElementById('submit-otp').toggleAttribute('disabled')
            if (error.type === 'geolocation') return handleLocationError(error);
            if (error.type === 'auth') return showSnacksApiResponse(getEmailErrorMessage(error));
            showSnacksApiResponse(error.message)
        })
}