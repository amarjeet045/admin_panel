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

// root element into which view will get updated
const journeyContainer = document.getElementById("journey-container");
const journeyHeadline = document.getElementById('journey-text');

// next button
const journeyNextBtn = document.getElementById('journey-next')
// prev button
const journeyPrevBtn = document.getElementById('journey-prev')
// linearProgressBar for onboarding
const journeyBar = new mdc.linearProgress.MDCLinearProgress(document.getElementById('onboarding-progress'))


// make ripple work correctly
new mdc.ripple.MDCRipple(journeyPrevBtn).unbounded = true;

/**
 * state object for each view to get index,view name and other data
 * @param {object} state 
 */
const handleJourneyState = (state) => {

    journeyPrevBtn.classList.remove('hidden');
    journeyNextBtn.disabled = false;
    const currentState = state.name;
    history.pushState(state, null, state.basePathName + `#${currentState}`);
    journeyContainer.innerHTML = ''
    switch (state.index) {
        case 0:
            journeyPrevBtn.classList.add('hidden');
            initFlow();
            break;
        case 1:
            otpFlow();
            break;
        case 2:
            categoryFlow();
            break;
        default:
            break;
    }
}
/**
 * On clicking back navigation in browser or previous button,
 * browser history will pop current state &
 * load the prev view
 */
window.addEventListener('popstate', ev => {
    console.log(ev);
    decrementProgress()
    handleJourneyState(ev.state)
})

/**
 *  progress value is set from 0 to 1
 *  there are 6 onboarding steps . so each increment and decrement is updated by 
 *  0.16666666666666666
 */

/**
 * 
 * Increment progress bar by 1/6th
 */
const incrementProgress = () => {
    journeyBar.progress = journeyBar.foundation_.progress_ + 0.16666666666666666
}
/**
 * 
 * Decrement progress bar by 1/6th
 */
const decrementProgress = () => {
    journeyBar.progress = journeyBar.foundation_.progress_ - 0.16666666666666666
}




window.addEventListener('load', function () {
    firebase.auth().onAuthStateChanged(user => {
        // if user is logged out.
        if (!user) {
            initJourney();
            initFlow();
            return;
        };
        //if user is logged in. 
        addLogoutBtn();
    })
})

const initJourney = () => {


    // history states
    const views = ['self', 'otp', 'category', 'office', 'office_details', 'employees', 'finish'];
    //default index.
    let index = 0;
    const basePathName = window.location.pathname;

    /**
     * Handle state & view updation when next or prev button is clicked. 
     * Increment or decrement index based on user navigation
     */

    journeyNextBtn.addEventListener('click', function (e) {
        if (index == views.length - 1) return;
        index++;
        const state = {
            index,
            name: views[index],
            basePathName,
        }
        incrementProgress();
        handleJourneyState(state)
    })

    journeyPrevBtn.addEventListener('click', function (e) {
        index--;
        if (index <= 0) {
            index = 0;
            journeyPrevBtn.classList.add('hidden');
        };
        history.back();
    })

    // load first view
    history.pushState({
        index,
        name: views[0],
        basePathName
    }, null, basePathName + `#${views[0]}`)
}


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

function otpFlow() {
    journeyHeadline.textContent = 'Enter 6 digit otp';
    journeyNextBtn.disabled = true;
    const frag = document.createDocumentFragment();
    const div = createElement('div', {
        className: 'otp-container'
    })

    /** 6 inputs fields because otp length is 6 digits */
    for (let i = 0; i < 6; i++) {
        let disabled = true;
        if (i == 0) {
            disabled = false
        }
        const tf = textFieldOutlinedWithoutLabel({
            type: 'tel',
            required: true,
            disabled: disabled,
            maxLength: "1",
            size: "1",
            min: "0",
            max: "9",
            pattern: "[0-9]{1}"
        });
        div.appendChild(tf.root_);
    }

    div.addEventListener('keydown', otpKeyDown)
    div.addEventListener('keyup', otpKeyUp);

    const resendCont = createElement('div', {
        className: 'resend-box text-center',
        textContent: "Didn't receive the code ?"
    })
    const resend = createElement('div', {
        className: 'mdc-theme--secondary',
        textContent: 'Send code again'
    })
    /**
     * resent otp code
     */
    resend.addEventListener('click', (e) => {

    })
    resendCont.appendChild(resend);
    frag.appendChild(div)
    frag.appendChild(resendCont);
    journeyContainer.appendChild(frag);
}

function categoryFlow() {
    journeyHeadline.innerHTML = 'Choose the category that fits your description best';
    const categories = [{
        name: 'Security service',
        icon: './img/category/security.svg'
    }, {
        name: 'Maintenance',
        icon: './img/category/security.svg'
    }, {
        name: 'House keeping',
        icon: './img/category/housekeeping.svg'
    }, {
        name: 'Sales',
        icon: './img/category/salesman.svg'
    }, {
        name: 'Facility management',
        icon: './img/category/facility-management.svg'
    }, {
        name: 'Inspection',
        icon: './img/category/security.svg'
    }, {
        name: 'Audit',
        icon: './img/category/audit2.svg'
    }, {
        name: 'Compliance',
        icon: './img/category/compliance3.svg'
    },{
        name: 'Others',
        icon: './img/category/add-black-18dp.svg'
    }]
    const grid = createElement('div',{
        className:'mdc-layout-grid'
    })
    const container = createElement('div',{
        className:'category-container mdc-layout-grid__inner'
    })
    categories.forEach(category=>{

        const div = createElement('div',{
            className:'category-box mdc-card mdc-elevation--z4 mdc-layout-grid__cell--span-2-phone mdc-layout-grid__cell'
        })
        const image = createElement('img',{
            src:category.icon,
            className:'cateogry-icon'
        })
        const text = createElement('div',{
            className:'category-text',
            textContent:category.name
        })
        div.appendChild(image)
        div.appendChild(text);

        div.addEventListener('click',ev=>{
            div.classList.add('cateogry-active');
            if(category.name === 'Others') {
                const textField = textFieldOutlined({type:'text',label:'Enter a category',required:true})
                container.appendChild(textField.root_);
                return
            }
        });

        container.appendChild(div)
    });

    grid.appendChild(container)
    journeyContainer.appendChild(grid);
}
/**
 *  Handles keyDown event for otp input. Allow only numeric characters ,
 *  enter & backspace
 * @param {Event} e 
 */
const otpKeyDown = (e) => {
    const key = e.which;

    if (/^[0-9]*$/.test(e.key) || key == 8 || key == 13) return true
    e.preventDefault();
    return false;
}
/**
 * Go to next otp input. Allow only numeric characters ,
 *  enter & backspace
 * @param {Event} e 
 */
const otpKeyUp = (e) => {
    const key = e.which;
    const target = e.target;
    // get next parent sibling
    const parentSibling = target.parentElement.nextSibling;

    if (/^[0-9]*$/.test(e.key) || key == 8 || key == 13) {
        // focus next element after sometime to handle fast typing
        setTimeout(() => {
            if (parentSibling) {
                parentSibling.classList.remove('mdc-text-field--disabled')
                parentSibling.querySelector('input').removeAttribute('disabled');
                parentSibling.querySelector('input').focus();
            };
            journeyNextBtn.disabled = !otpBoxesFilled()
        }, 300)

        return true
    }

    e.preventDefault();
    return false;
}

/**
 * checks if all otp input fields are fileld with value
 * @returns {Boolean}
 */
const otpBoxesFilled = () => {
    const container = document.querySelector('.otp-container');
    if (!container) return;
    let filled = true
    container.querySelectorAll('input').forEach(el => {
        if (!el.value) {
            filled = false;
            return
        }
    })
    return filled;
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



/**
 *  Returns base mdc text field component without init
 * @param {object} attr 
 * @returns HTMLElement
 */
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

/**
 * creates MDCTextFielled filled
 * @param {object} attr 
 * @returns {MDCTextField} 
 */
const textFieldFilled = (attr) => {
    const tf = textField(attr);
    tf.classList.add('mdc-text-field--filled');
    return new mdc.textField.MDCTextField(tf);
}

/**
 * creates MDCTextFielled outlined with label
 * @param {object} attr 
 * @returns {MDCTextField} 
 */
const textFieldOutlined = (attrs) => {
    const label = createElement('label', {
        className: 'mdc-text-field mdc-text-field--outlined'
    })
    const input = createElement('input', {
        className: 'mdc-text-field__input'
    })

    Object.keys(attrs).forEach(attr => {
        if (attr === 'label' || attr === 'id') return;
        if (attr === 'required' || attr === 'disabled') {
            input[attr] = attrs[attr]
            return
        }
        input.setAttribute(attr, attrs[attr]);
    })

    label.innerHTML = `${input.outerHTML}
    <span class="mdc-notched-outline">
      <span class="mdc-notched-outline__leading"></span>
      <span class="mdc-notched-outline__notch">
        <span class="mdc-floating-label" id="my-label-id">${attrs.label}</span>
      </span>
      <span class="mdc-notched-outline__trailing"></span>
    </span>`

    return new mdc.textField.MDCTextField(label);
}

/**
 * creates MDCTextFielled outlined without label
 * @param {object} attr 
 * @returns {MDCTextField} 
 */
const textFieldOutlinedWithoutLabel = (attr) => {
    const outlinedField = textFieldOutlined(attr);
    outlinedField.outline_.notchElement_.remove();
    outlinedField.root_.classList.add('mdc-text-field--no-label');
    return outlinedField;
}
/**
 * creates hellper text for textfield
 * @returns {HTMLElement}
 */
const textFieldHelper = () => {
    const div = createElement('div', {
        className: 'mdc-text-field-helper-line"'
    })
    div.innerHTML = `<div class="mdc-text-field-helper-text" id="my-helper-id" aria-hidden="true"></div>`
    return div
}