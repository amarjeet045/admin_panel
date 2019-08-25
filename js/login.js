import * as firebase from "firebase/app";
import "firebase/auth";
import {
    MDCTextField
} from '@material/textfield';
import {
    MDCRipple
} from '@material/ripple';
import {
    MDCLinearProgress
} from '@material/linear-progress';
import {
    home,
    signOut
} from "./home";
import {
    appKeys
} from '../env-config';
import {
    phoneFieldInit
} from './phoneNumber';
var linearProgress;
export const login = () => {


    document.getElementById('app').innerHTML = loginDom();

    linearProgress = new MDCLinearProgress(document.querySelector('.mdc-linear-progress'));
    if (appKeys.getMode() === 'dev') {
        firebase.auth().settings.appVerificationDisabledForTesting = true
    }

    const numberField = new MDCTextField(document.getElementById('phone-number-field'));
    const iti = phoneFieldInit(numberField);
    
    numberField.focus()
    numberField.foundation_.autoCompleteFocus();
    numberField.listen
    console.log(numberField);

    const verifyNumber = new MDCRipple(document.getElementById('verify-phone-number'))
    const cancelNumber = new MDCRipple(document.getElementById('cancel-phone-auth'));
    
    cancelNumber.root_.addEventListener('click', login);
    verifyNumber.root_.addEventListener('click', function () {
        var error = iti.getValidationError();
        if(error !== 0) {
            const message = getMessageStringErrorCode(error);
            setHelperInvalid(numberField,message);
            return
        }
        if(!iti.isValidNumber()) {
            setHelperInvalid(numberField,'Invalid number. Please check again');
            return;
        }
     
        console.log(iti.getNumber())
        console.log(iti.getNumber(intlTelInputUtils.numberFormat.E164))
        console.log(iti.isValidNumber())
        return;

        if (!isValidPhoneNumber(numberField.value)) {
            setHelperInvalid(numberField, 'Please enter a correct phone number');
            return;
        };
        linearProgress.open();
        disabledLoginArea();

        numberField.helperTextContent = '';
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = handleRecaptcha('verify-phone-number');
        }

        window.recaptchaVerifier.render().then(function (widgetId) {

            window.recaptchaWidgetId = widgetId;
        });

        window.recaptchaVerifier.verify().then(function () {
            removeInfoBarMessage()
            return sendOtpToPhoneNumber(numberField);
        }).then(function (confirmResult) {
            return handleOtp(confirmResult, numberField);
        }).catch(function (error) {
            grecaptcha.reset(window.recaptchaWidgetId);
            errorUI(error)
        })
    })
}

const getMessageStringErrorCode = (code) => {
    let message = ''
    switch(code) {
        case 1:
        message = 'Please enter a correct country code';
        break;

        case 2:
        message = 'Number is too short';
        break;
        case 3:
        message = 'Number is too long';
        break;
        case 4:
        message = 'Invalid Number'
        break;

        default:
        message = ''
        break
    }
    return message;
}

const errorUI = (error) => {
    console.log(error);
    linearProgress.close();
    enableLoginArea();
    setInfoBarMessage(error)
}

export const updateAuth = (auth) => {
    document.getElementById('app').innerHTML = updateAuthDom(auth);
    linearProgress = new MDCLinearProgress(document.querySelector('.mdc-linear-progress'));


    let nameField;
    if (!auth.displayName) {
        nameField = new MDCTextField(document.getElementById('name-field'))
    }

    const emailField = new MDCTextField(document.getElementById('email-field'))
    emailField.value = auth.email || '';

    const updateBtn = new MDCRipple(document.getElementById('update-auth-btn'))

    if (auth.displayName && auth.email && !auth.emailVerified) {
        document.querySelector('.text-indicator p').textContent = 'Verify email address';
        updateBtn.root_.querySelector('span').textContent = 'SEND VERIFICATION LINK'
    }
    updateBtn.root_.addEventListener('click', function () {
        removeInfoBarMessage();
        if (nameField && !nameField.value) {
            setHelperInvalid(nameField, 'Name cannot be empty');
            return;
        }
        if (!emailField.value) {
            setHelperInvalid(emailField, 'Email cannot be empty');
            return;
        }
        if (!isValidEmail(emailField.value)) {
            setHelperInvalid(emailField, 'Enter a correct email address');
            return;
        };

        linearProgress.open();
        disabledLoginArea();

        auth.updateProfile({
            displayName: nameField ? nameField.value.trim() : auth.displayName
        }).then(function () {

            if (auth.emailVerified && auth.email) {
                linearProgress.close();
                return home(auth);
            };

            const actionSettings = {
                url: `${window.location.origin}${window.location.pathname}?email=${emailField.value}`,
                handleCodeInApp: false,
            }

            if (!auth.email || emailField.value !== auth.email) {
                auth.updateEmail(emailField.value).then(function () {

                    return auth.sendEmailVerification(actionSettings)
                }).then(updateLoginCardForEmailVerificaion).catch(function (error) {
                    handleEmailError(error, emailField);
                })
                return;
            }
            if (!auth.emailVerified) {

                auth.sendEmailVerification(actionSettings).then(updateLoginCardForEmailVerificaion).catch(function (error) {
                    handleEmailError(error, emailField);
                })
                return;
            }
        })
    })
}


const updateLoginCardForEmailVerificaion = () => {
    linearProgress.close();
    enableLoginArea();
    document.querySelector('.login-area').innerHTML = `<p class='mdc-typography--body1'>
        Verification link has been sent to ${firebase.auth().currentUser.email}
    </p>
    <p class='mdc-typography--body1'>
    On clicking verification link you will be redirected to ${window.location.hostname}
    </p>
    `
}

const handleEmailError = (error, emailField) => {
    linearProgress.close();
    enableLoginArea()
    console.log(error);
    if (error.code === 'auth/requires-recent-login') {
        errorUI(error);
        linearProgress.open();
        setTimeout(signOut, 2000)
        return;
    };
    if (error.code === 'auth/email-already-in-use') {
        setHelperInvalid(emailField, 'Email address is already in use. Add a different email address');
        return;
    };
    if (error.code === 'auth/invalid-email') {
        setHelperInvalid(emailField, 'Enter a correct email address');
        return;
    }
    errorUI(error);
}
const loginDom = () => {
    return `
    <div class='login-container'>
    <div class='login-box mdc-card'>
    <div class='progress-container'>
    <div role="progressbar" class="mdc-linear-progress mdc-linear-progress--indeterminate mdc-linear-progress--closed">
    <div class="mdc-linear-progress__buffering-dots"></div>
    <div class="mdc-linear-progress__buffer"></div>
    <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
      <span class="mdc-linear-progress__bar-inner"></span>
    </div>
    <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
      <span class="mdc-linear-progress__bar-inner"></span>
    </div>
  </div>
    </div>
    ${infoBar()}
    <div class='mdc-card__primary'>
        <div class='logo'>
            <img src='./img/icon.png' class='logo'>

        </div>
        <div class='login-area'>
        
        <div class='text-indicator'>
            <p class='mdc-typography--headline6 text-center mb-0'>Sign in</p>
             <div class='pt-10 text-center'>
             </div>
        </div>
        <div class='input-container'>
            <div class='phone-number-container'>
                ${textField({label:'Enter phone number',id:'phone-number-field',type:'tel',autocomplete:'on'})}
                <div class="mdc-text-field-helper-line">
                    <div class="mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg"></div>
                </div>
                </div>
                <div class='pt-10' id='recaptcha-container'></div>
                <div class='otp-container hidden'>
                    ${textField({label:'Enter otp',id:'otp-number-field',type:'number',autocomplete:'off'})}
                    <div class="mdc-text-field-helper-line">
                        <div class="mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg"></div>
                    </div>
                </div>
            
        </div>
        <div class='action-buttons'>
        <button class='mdc-button' id='cancel-phone-auth'>
            <span class='mdc-button__label'>
                CANCEL
            </span>
        </button>
        <div class='actions'>
            <button class='mdc-button mdc-button--raised' id='verify-phone-number'>
                <span class='mdc-button__label'>
                    VERIFY
                </span>
            </button>
        </div>
      
    </div>
        </div>
      
    </div>
    </div>
    <div id='country-dom'></div>
    </div>`
}
const updateAuthDom = (auth) => {
    return ` <div class='login-container'>
    <div class='login-box mdc-card'>
    <div class='progress-container'>
    <div role="progressbar" class="mdc-linear-progress mdc-linear-progress--indeterminate mdc-linear-progress--closed">
    <div class="mdc-linear-progress__buffering-dots"></div>
    <div class="mdc-linear-progress__buffer"></div>
    <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
      <span class="mdc-linear-progress__bar-inner"></span>
    </div>
    <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
      <span class="mdc-linear-progress__bar-inner"></span>
    </div>
  </div>
    </div>
    ${infoBar()}
    
    <div class='mdc-card__primary'>
        <div class='logo'>
            <img src='./img/icon.png' class='logo'>

        </div>
        <div class='login-area'>
        
        <div class='text-indicator'>
            <p class='mdc-typography--headline6 text-center mb-0'>Complete your profile</p>
             <div class='pt-10 text-center'>
             </div>
             
        </div>
        <div class='input-container'>
        ${!auth.displayName ? `${textField({label:'Name',id:'name-field',type:'text',autocomplete:'off'})}
        <div class="mdc-text-field-helper-line">
             <div class="mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg"></div>
        </div>`:''}
        
          
            <div class='pt-20'>
                ${textField({label:'Email',id:'email-field',type:'email',autocomplete:'off'})}
                <div class="mdc-text-field-helper-line">
                    <div class="mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg"></div>
            </div>
                </div>
           
        </div>
        <div class='action-buttons'>
            <div class='actions'>
                <button class='mdc-button mdc-button--raised' id='update-auth-btn'>
                    <span class='mdc-button__label'>
                        UPDATE
                    </span>
                </button>
            </div>
        </div>
        </div>
      
    </div>
    </div>
    </div>`
}

const textField = (attr) => {
    return `<div class="mdc-text-field mdc-text-field--outlined" id=${attr.id}>
    <input class="mdc-text-field__input" id="text-field-hero-input" type=${attr.type ? attr.type:'number'} required autocomplete=${attr.autocomplete}>
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      <div class="mdc-notched-outline__notch">
        <label for="text-field-hero-input" class="mdc-floating-label">${attr.label}</label>
      </div>
      <div class="mdc-notched-outline__trailing"></div>
    </div>
  </div>`
}

const isValidPhoneNumber = (phoneNumber = '') => {
    const pattern = /^\+[0-9\s\-\(\)]+$/;
    return phoneNumber.search(pattern) !== -1;
}

const isValidEmail = (emailString) => {
    return /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
        .test(emailString);
}

const handleRecaptcha = (buttonId) => {
    return new firebase.auth.RecaptchaVerifier(buttonId, {
        'size': 'invisible',
        'callback': function (response) {
            // reCAPTCHA solved, allow signInWithPhoneNumber.

        },
        'expired-callback': function () {
            // Response expired. Ask user to solve reCAPTCHA again.
            // ...

        }
    });
}


const sendOtpToPhoneNumber = (numberField) => {
    return new Promise((resolve, reject) => {

        firebase.auth().signInWithPhoneNumber(numberField.value, window.recaptchaVerifier).then(resolve).catch(reject)
    })
}
const disabledLoginArea = () => {
    document.querySelector('.login-area').classList.add('disabled')


}
const enableLoginArea = () => {
    document.querySelector('.login-area').classList.remove('disabled');

}
const handleOtp = (confirmResult, numberField) => {
    enableLoginArea()
    if (numberField) {
        numberField.disabled = true;
    }
    document.querySelector('.action-buttons .actions').innerHTML = `
    
        <button class='mdc-button mdc-button--raised' id='verify-otp-number'>
            <span class='mdc-button__label'>
                SIGN-IN
            </span>
        </button>
    `
    document.querySelector('.otp-container').classList.remove('hidden');
    linearProgress.close();

    const otpField = new MDCTextField(document.getElementById('otp-number-field'));
    const otpVerifyBtn = new MDCRipple(document.getElementById('verify-otp-number'));
    otpVerifyBtn.root_.addEventListener('click', function () {

        if (!otpField.value) {
            setHelperInvalid(otpField, 'Invalid OTP');
            return;
        }
        linearProgress.open();
        confirmResult.confirm(otpField.value).then(function (result) {
            linearProgress.close();
        }).catch(function (error) {
            linearProgress.close();

            console.log(error)
            if (error.code === 'auth/invalid-verification-code') {
                setHelperInvalid(otpField, 'Wrong OTP');
                return;
            }
        })
    })
}
const setHelperInvalid = (field, message) => {
    field.focus()
    
    field.foundation_.setValid(false)
    field.foundation_.adapter_.shakeLabel(true);
    field.helperTextContent = message;
}

const infoBar = (error = {}) => {
    return `<div class="info-bar hidden">
        <p class="info-bar-heading mdc-typography--body1 mt-0 mb-0">
            ${error.code}
        </p>
        <span class='info-bar-message mdc-typography--body1'>
            ${error.message}
        </span>
    </div>`
}
const setInfoBarMessage = (body) => {
    document.querySelector(".info-bar").classList.remove('hidden');
    document.querySelector('.info-bar-message').textContent = body.message;
    document.querySelector('.info-bar-heading').textContent = body.code || ''
}

const removeInfoBarMessage = () => {
    document.querySelector(".info-bar").classList.add('hidden');
    document.querySelector('.info-bar-message').textContent = '';
    document.querySelector('.info-bar-heading').textContent = '';
}