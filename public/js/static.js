window.mdc.autoInit();

const numberField = new mdc.textField.MDCTextField(document.getElementById('home-login-number'));
const iti = phoneFieldInit(numberField, document.getElementById('country-dom'));

numberField.focus()
numberField.foundation_.autoCompleteFocus();
console.log(numberField);

const verifyNumber = new mdc.ripple.MDCRipple(document.getElementById('verify-phone-number'))

verifyNumber.root_.addEventListener('click', function () {
    var error = iti.getValidationError();
    if (error !== 0) {
        // const message = getMessageStringErrorCode(error);
        setHelperInvalid(numberField, message);
        return
    }
    if (!iti.isValidNumber()) {
        setHelperInvalid(numberField, 'Invalid number. Please check again');
        return;
    }
    console.log(iti.getNumber(intlTelInputUtils.numberFormat.E164))
    numberField.value = iti.getNumber(intlTelInputUtils.numberFormat.E164);

    // linearProgress.open();
    disabledLoginArea();

    numberField.helperTextContent = '';
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = handleRecaptcha('verify-phone-number');
    }

    window.recaptchaVerifier.render().then(function (widgetId) {

        window.recaptchaWidgetId = widgetId;
    }).catch(console.error)

    // window.recaptchaVerifier.verify().then(function () {
    //     removeInfoBarMessage()
    //     return sendOtpToPhoneNumber(numberField);
    // }).then(function (confirmResult) {
    //     return handleOtp(confirmResult, numberField);
    // }).catch(function (error) {
    //     grecaptcha.reset(window.recaptchaWidgetId);
    //     console.log(error)
    //     errorUI(error)
    // })
})


const featuresBtn = document.getElementById('features-button');
const featuresMenu = new mdc.menu.MDCMenu(document.getElementById('features-menu'));
featuresBtn.addEventListener('click', function () {
    featuresMenu.open = true;
})

const solutionsBtn = document.getElementById('solutions-button');
const solutionsMenu = new mdc.menu.MDCMenu(document.getElementById('solutions-menu'));
solutionsBtn.addEventListener('click', function () {
    solutionsMenu.open = true;
})


// const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
// menu.listen('MDCIconButtonToggle:change', function (event) {

// })


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

const setHelperInvalid = (field, message) => {
    field.focus()

    field.foundation_.setValid(false)
    field.foundation_.adapter_.shakeLabel(true);
    field.helperTextContent = message;
}
