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



window.addEventListener('load', function () {

    // make ripple work correctly
    new mdc.ripple.MDCRipple(journeyPrevBtn).unbounded = true;

    firebase.auth().onAuthStateChanged(user => {
        // if user is logged out.

        initJourney();
        initFlow();

    })
})


// root element into which view will get updated
const journeyContainer = document.getElementById("journey-container");
const journeyHeadline = document.getElementById('journey-text');

// cta-actions container;
const actionsContainer = document.querySelector('.cta-actions');
// prev button
const journeyPrevBtn = document.getElementById('journey-prev')
// linearProgressBar for onboarding
const journeyBar = new mdc.linearProgress.MDCLinearProgress(document.getElementById('onboarding-progress'))

// default path name;
const basePathName = window.location.pathname;
/**
 * state object for each view to get index,view name and other data
 * @param {object} state 
 */
const handleJourneyState = (state) => {

}
/**
 * On clicking back navigation in browser or previous button,
 * browser history will pop current state &
 * load the prev view
 */
window.addEventListener('popstate', ev => {
    console.log(ev);
    const hash = window.location.hash;
    const fnName = hash.replace('#','');
    switch (fnName) {
        case 'welcome':
            initFlow();
        break;
        case 'category':
            categoryFlow();
        break;
        case 'office':
            officeFlow();
        break;
        case 'employees':
            employeesFlow();
        break;
        default:
            initFlow();
        break
    }
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

const initJourney = () => {
    onboarding_data_save.init();

    journeyPrevBtn.addEventListener('click', function (e) {
        history.back();
    })

    // load first view
    history.pushState(history.state, null, basePathName + `#welcome`)
}

const nextButton = (text = 'Next') => {
    if(document.getElementById('journey-next')) {
        document.getElementById('journey-next').remove();
    }
    const button = createElement('button', {
        className: 'mdc-button mdc-button--raised',
        id:'journey-next'

    })
   
  
    button.innerHTML = ` <div class="mdc-button__ripple"></div>
        <span class="mdc-button__label">${text}</span>
        <div class='straight-loader button hidden'></div>
        `
    new mdc.ripple.MDCRipple(button)
    return {
        element:button,
        setLoader : function() {
            button.querySelector('.straight-loader').classList.remove('hidden');
            button.querySelector('.mdc-button__label').classList.add('hidden')
        },
        removeLoader : function() {
            button.querySelector('.straight-loader').classList.add('hidden');
            button.querySelector('.mdc-button__label').classList.remove('hidden')
        }
    }
}

function initFlow() {
    journeyBar.progress = 0;
    journeyPrevBtn.classList.add('hidden')
    journeyHeadline.textContent = 'Welcome to easy tracking! Lets get started. Enter your details';
    

    const nameField = textFieldOutlined({
        required: true,
        label: 'Name',
        autocomplete: "name",
        value:firebase.auth().currentUser.displayName || ''
    });
    

    const emailField = textFieldOutlined({
        required: true,
        label: 'Email',
        autocomplete: "email",
        type: 'email',
        value:firebase.auth().currentUser.email || ''

    });
   

    const frag = document.createDocumentFragment();
    frag.appendChild(nameField)
    frag.appendChild(textFieldHelper())
    frag.appendChild(emailField)
    frag.appendChild(textFieldHelper())
    
    const nameFieldInit = new mdc.textField.MDCTextField(nameField)
    const emailFieldInit = new mdc.textField.MDCTextField(emailField)

    const nextBtn = nextButton();
    nextBtn.element.addEventListener('click', (ev) => {
       
        if (!nameFieldInit.value) {
            setHelperInvalid(nameFieldInit, 'Enter your name')
            return
        }
        if (!emailFieldInit.value) {
            setHelperInvalid(emailFieldInit, 'Enter your email')
            return
        }
     
        setHelperValid(nameFieldInit)
        setHelperValid(emailFieldInit);
        const firstContact =  {
            displayName: nameFieldInit.value,
            email: emailFieldInit.value,
            phoneNumber: firebase.auth().currentUser.phoneNumber
        }
        nextBtn.setLoader()
        handleAuthUpdate(firstContact).then(function(){
            onboarding_data_save.set({firstContact})
            categoryFlow();
            journeyPrevBtn.classList.remove('hidden')
            history.pushState(history.state, null, basePathName + `#category`);
            
        }).catch(function(error){
            console.log(error)
            nextBtn.removeLoader()
            const message = getEmailErrorMessage(error); 
            setHelperInvalid(emailFieldInit,message);
            sendErrorLog({
                message: authError.message,
                stack: authError.stack
            });
        })
    });
    journeyContainer.innerHTML = ''
    journeyContainer.appendChild(frag);
    actionsContainer.appendChild(nextBtn.element)

}



function categoryFlow() {
    journeyBar.progress = 0.16
    journeyHeadline.innerHTML = 'Choose the category that fits your business best';
    
    const grid = createElement('div', {
        className: 'mdc-layout-grid'
    })
    const container = createElement('div', {
        className: 'category-container mdc-layout-grid__inner'
    });
    let selectedDiv;
    let otherCateogryInput;


    categoriesDataset().forEach(category => {

        const div = createElement('div', {
            className: 'category-box mdc-card mdc-elevation--z4 mdc-layout-grid__cell--span-2-phone mdc-layout-grid__cell'
        })
        div.dataset.name = category.name;
        
        const svgCont = createElement('div', {
            className: 'cateogry-icon'
        });
        category.icon.then(svg=>{
            svgCont.innerHTML = svg;
        });

        const text = createElement('div', {
            className: 'category-text',
            textContent: category.name
        })
        div.appendChild(svgCont)
        div.appendChild(text);

        div.addEventListener('click', ev => {
            if (selectedDiv) {
                selectedDiv.classList.remove('category-active')
            }

            selectedDiv = div;
            selectedDiv.classList.add('category-active');

            if (document.querySelector('.input-div')) {
                document.querySelector('.input-div').remove();
            };
            if (category.name === 'Others') {
                const field  = categoryInputField(container,'');
                 otherCateogryInput = field;
            };
        });
        container.appendChild(div);
    });


    grid.appendChild(container)
    const nextBtn = nextButton();
    nextBtn.element.addEventListener('click', () => {
        let selectedCategoryName = selectedDiv.dataset.name;
        if (selectedCategoryName === 'Others') {
            if(!otherCateogryInput.value) {
                setHelperInvalid(otherCateogryInput,'Enter a cateogry')
                return
            }
            setHelperValid(otherCateogryInput);
            selectedCategoryName = otherCateogryInput.value;
        }
        onboarding_data_save.set({'category':selectedCategoryName})
        officeFlow();
        history.pushState(history.state, null, basePathName + `#office`);
    });
    actionsContainer.appendChild(nextBtn.element)
    journeyContainer.innerHTML = ''
    journeyContainer.appendChild(grid);

    if(onboarding_data_save.get().category) {
       let el =  container.querySelector(`[data-name="${onboarding_data_save.get().category}"]`)
       if(!el) {
            el = container.querySelector(`[data-name="Others"]`)
            const field  = categoryInputField(container,onboarding_data_save.get().category);
            otherCateogryInput = field;
       }
       el.classList.add('category-active');
       selectedDiv = el;
    }
}


const categoryInputField = (container,inputValue) => {
    const inputDiv = createElement('div', {
        className: 'input-div mt-10 mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-12-desktop'
    });
    const inputField = textFieldOutlined({
        type: 'text',
        required: true,
        value:inputValue,
        label: 'Enter your cateogry',
        id: 'other-category-input'
    });
    inputDiv.appendChild(inputField)
    inputDiv.appendChild(textFieldHelper())
    container.appendChild(inputDiv);
    return new mdc.textField.MDCTextField(inputField)
  
}

const categoriesDataset = () => {
    const categories = [{
        name: 'Security service',
        icon: svgLoader('./img/category/security.svg')
    }, {
        name: 'Maintenance',
        icon: svgLoader('./img/category/maintenance.svg')
    }, {
        name: 'House keeping',
        icon: svgLoader('./img/category/housekeeping.svg')
    }, {
        name: 'Sales',
        icon: svgLoader('./img/category/salesman.svg')
    }, {
        name: 'Facility management',
        icon: svgLoader('./img/category/facility-management.svg')
    }, {
        name: 'Inspection',
        icon: svgLoader('./img/category/inspection.svg')
    }, {
        name: 'Audit',
        icon: svgLoader('./img/category/audit2.svg')
    }, {
        name: 'Compliance',
        icon: svgLoader('./img/category/compliance3.svg')
    }, {
        name: 'Others',
        icon: svgLoader('./img/category/others.svg')
    }]
    return categories
}

const svgLoader = (source) => {
    return new Promise((resolve,reject)=>{
        fetch(source,{
            headers:new Headers({'content-type': 'image/svg+xml',mode:'no-cors'}),
            method:'GET'
        }).then(response=>{
            return response.text()
        }).then(resolve)
    })
}

function officeFlow() {
    journeyBar.progress = 0.32
    journeyHeadline.innerHTML = 'office';
    journeyContainer.innerHTML = ''
}

function employeesFlow() {
    journeyBar.progress = 0.64
    journeyHeadline.innerHTML = 'employee';
    journeyContainer.innerHTML = ''
}

const onboarding_data_save = function() {
    return {
        init: function(){
            localStorage.setItem('onboarding_data',JSON.stringify({}))
        },
        get : function() {
            return JSON.parse(localStorage.getItem('onboarding_data'))
        },
        set : function(data) {
            const storedData = this.get();
            Object.assign(storedData,data)
            localStorage.setItem('onboarding_data',JSON.stringify(storedData));  
        },
    }
}();

const initButtonLoad = (button) => {
    const loader = createElement('div',{
        className:'straight-loader button'
    })
    button.replaceChild(loader,button.querySelector('.mdc-button__label'));
}

const resetButton = () => {

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
                if (auth.emailVerified) return Promise.resolve();
                console.log('sending verification email...')
                // return firebase.auth().currentUser.sendEmailVerification()
                return Promise.resolve();
            })
            .then(resolve)
            .catch(function (authError) {

                console.log(authError);
               
                authError.type = 'auth'
                if (authError.code === 'auth/requires-recent-login') return resolve()
                reject(authError)
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
    return tf;
}

/**
 * creates MDCTextFielled outlined with label
 * @param {object} attr 
 * @returns {MDCTextField} 
 */
const textFieldOutlined = (attrs) => {
    const label = createElement('label', {
        className: 'mdc-text-field mdc-text-field--outlined',
        id: attrs.id
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

    return label;
}

/**
 * creates MDCTextFielled outlined without label
 * @param {object} attr 
 * @returns {MDCTextField} 
 */
const textFieldOutlinedWithoutLabel = (attr) => {
    const outlinedField = textFieldOutlined(attr);
    outlinedField.querySelector('.mdc-notched-outline__notch').remove();
    outlinedField.classList.add('mdc-text-field--no-label');
    return outlinedField;
}
/**
 * creates hellper text for textfield
 * @returns {HTMLElement}
 */
const textFieldHelper = () => {
    const div = createElement('div', {
        className: 'mdc-text-field-helper-line',
    })
    div.innerHTML = `<div class="mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg" aria-hidden="true"></div>`
    return div
}


const setHelperInvalid = (field, message) => {
    field.focus()
    field.foundation_.setValid(false)
    field.foundation_.adapter_.shakeLabel(true);
    field.helperTextContent = message;
}
  
const setHelperValid = (field) => {
    field.focus();
    field.foundation_.setValid(true);
    field.helperTextContent = '';
}