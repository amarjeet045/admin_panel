const submitBtn = document.getElementById('office-form-submit')
const iframe = document.getElementById('form-iframe')
const authProps = {
    displayName: '',
    phoneNumber: '',
    email: ''
}
let creatingOffice = false;
const template = {
    'template': 'office',
    'firstContact': authProps,
    'name': '',
    'registeredOfficeAddress': '',
    'canEdit': true 
};
window.addEventListener('load', function () {
    firebase.auth().onAuthStateChanged(user => {
        if(user && !creatingOffice) return handleLoggedIn();
            iframe.addEventListener('load', function () {
                commonDom.progressBar.close()
                submitBtn.classList.remove('hidden');
                iframe.contentWindow.postMessage({
                    name: 'init',
                    template: template,
                    body: authProps,
                    deviceType: ''
                }, 'http://localhost');
                submitBtn.addEventListener('click', function () {
                    creatingOffice = true
                    iframe.contentWindow.postMessage({
                        name: 'getFormData',
                        template: '',
                        body: '',
                        deviceType: ''
                    }, 'http://localhost');
                });
            })
            iframe.src = 'http://localhost/frontend/dist/v2/forms/office/office-with-phonenumber.html'
    
    });    
    [...document.querySelectorAll('.free-signup')].forEach(el => {
        el.addEventListener('click', function () {
            iframe.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest"
            })    
        })    
    })    



})


function handleAuthUpdate(authProps) {

    return new Promise(function (resolve, reject) {
        const auth = firebase.auth().currentUser;
        commonDom.progressBar.open();
        const nameProm = auth.displayName ? Promise.resolve() : auth.updateProfile({
            displayName: authProps.displayName
        })
        
        nameProm
            .then(function () {
                if (auth.email) return Promise.resolve()
                return firebase.auth().currentUser.updateEmail(authProps.email)
            }).then(function () {
                if (auth.emailVerified) return Promise.resolve()
                return firebase.auth().currentUser.sendEmailVerification()
            })
            .then(function () {
                resolve()
            })
            .catch(function (authError) {
                authError.type = 'auth'
                if (authError.code === 'auth/requires-recent-login') return resolve()
                reject(authError)
            })
    })
}


function verifyUser(requestBody) {

    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = handleRecaptcha('office-form-submit');
    }
    commonDom.progressBar.open();

    window.recaptchaVerifier.render().then(function (widgetId) {
        window.recaptchaWidgetId = widgetId;
        return window.recaptchaVerifier.verify()
            .then(function () {
                return firebase.auth().signInWithPhoneNumber(requestBody.auth.phoneNumber, window.recaptchaVerifier)
            }).then(function (confirmResult) {
                commonDom.progressBar.close();
                document.getElementById('office-form-submit').classList.add('hidden')
                checkOTP(confirmResult, requestBody)
            }).catch(function (error) {
                showSnacksApiResponse(error.message)
                commonDom.progressBar.close();

            })
    }).catch(console.error)

}



function checkOTP(confirmResult, requestBody) {

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
    const form = document.querySelector('.office-form')
    field.root_.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
    })
    btn.root_.addEventListener('click', function () {
        commonDom.progressBar.open();
        commonDom.progressBar.root_.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
        })
        btn.root_.toggleAttribute('disabled')
        confirmResult.confirm(field.value).then(function (result) {
            setHelperValid(field)
            handleAuthAnalytics(result);

            sendOfficeData(requestBody);
        }).catch(function (error) {
            btn.root_.toggleAttribute('disabled')
            console.log(error)
            commonDom.progressBar.close();
            let errorMessage = error.message
            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = 'WRONG OTP'
            }
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
            return getLocation()
        }).then(function (geopoint) {
            officeBody.geopoint = geopoint;
            return http('POST', `${appKeys.getBaseUrl()}/api/services/office`, officeBody)
        })
        .then(function () {
            localStorage.setItem('created_office', officeBody.name)

            fbq('trackCustom', 'Office Created')
            analyticsApp.logEvent('office_created', {
                location: officeBody.registeredOfficeAddress
            });

            firebase.auth().currentUser.getIdToken(true).then(function () {
                return handleLoggedIn();
            }).catch(function (error) {
                return handleLoggedIn();
            })
        })
        .catch(function (error) {
            linearProgress.close()
            toggleForm(error.message)
            if (error.type === 'geolocation') return handleLocationError(error);
            if (error.type === 'auth') return showSnacksApiResponse(getEmailErrorMessage(error));
        })
}