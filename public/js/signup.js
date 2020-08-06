//TODO manage employee pre selected & update url.
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

    // make ripple work correctly
    new mdc.ripple.MDCRipple(journeyPrevBtn).unbounded = true;

    firebase.auth().onAuthStateChanged(user => {
        // if user is logged out.
        if (user) {
            history.pushState(history.state, null, basePathName + `#`)
            initJourney();
            return
        }
        redirect('/')
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
 * On clicking back navigation in browser or previous button,
 * browser history will pop current state &
 * load the prev view
 */
window.addEventListener('popstate', ev => {

    if (localStorage.getItem('completed') === "true") {
        for (var i = 0; i < 50; i++) {
            history.pushState(history.state, null, null);
        };
        localStorage.removeItem("completed");
        redirect("/")
        return
    };
    const hash = window.location.hash;
    const fnName = hash.replace('#', '');
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
            addEmployeesFlow();
            break;
        default:
            redirect('/join')
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

    firebase.auth().currentUser.getIdTokenResult().then((idTokenResult) => {
        if (!isAdmin(idTokenResult)) {
            onboarding_data_save.set({status:'PENDING'})
            history.pushState(history.state, null, basePathName + `?new_user=1#welcome`)
            initFlow();
            return
        };


        journeyHeadline.innerHTML = 'How would you like to start'
        const admins = idTokenResult.claims.admin;
        const ul = createElement("ul", {
            className: 'mdc-list existing-companies--list'
        })
        ul.setAttribute('role', 'radiogroup')

        ul.appendChild(officeList('Create a new company', 0));
        ul.appendChild(createElement('div', {
            className: 'onboarding-headline--secondary mb-10 mt-10',
            textContent: 'Modify existing company'
        }));
        admins.forEach((admin, index) => {
            index++
            const li = officeList(admin, index)
            ul.appendChild(li);
            ul.appendChild(createElement('li', {
                className: 'mdc-list-divider'
            }))
        });
        const nxtButton = nextButton();
        nxtButton.element.disabled = true
        const ulInit = new mdc.list.MDCList(ul);
        ulInit.listen('MDCList:action', (ev) => {
            nxtButton.element.disabled = false;
        })
        
        journeyContainer.innerHTML = '';
        journeyContainer.appendChild(ul);

        nxtButton.element.addEventListener('click', () => {
            const selectedIndex = ulInit.selectedIndex;
            // create new company list is selected
            if (selectedIndex == 0) {
                history.pushState(history.state, null, basePathName + `?new_user=1#welcome`)
                initFlow();
                return
            };
            nxtButton.setLoader();
            http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${admins[selectedIndex -1]}&field=types`).then(response => {
                localStorage.removeItem('completed');
                const officeData = response.types.filter(type => {
                    return type.template === "office"
                })[0];
                if (!officeData) {
                    nxtButton.removeLoader();
                    ulInit.root_.insertBefore(createElement('div', {
                        className: 'list-error',
                        textContent: 'Try after some time'
                    }), ulInit.listElements[selectedIndex].nextSibling)
                    return;
                };

                const data = {
                    name: officeData.office,
                    officeId: officeData.activityId,
                    firstContact: officeData.creator,
                    category: officeData.attachment.Category ? officeData.attachment.Category.value : '',
                    registeredOfficeAddress: officeData.attachment['Registered Office Address'].value,
                    pincode: officeData.attachment.Pincode ? officeData.attachment.Pincode.value : '',
                    description: officeData.attachment.Description.value,
                    yearOfEstablishment: officeData.attachment['Year Of Establishment'] ? officeData.attachment['Year Of Establishment'].value : '',
                    template: 'office',
                    companyLogo: officeData.attachment['Company Logo'] ? officeData.attachment['Company Logo'].value : ''
                };

                onboarding_data_save.set(data);
                onboarding_data_save.set({status:'COMPLETED'})
                history.pushState(history.state, null, basePathName + `#welcome`)
                initFlow();
            }).catch(err=>{
                nxtButton.removeLoader();
            })

        })
        actionsContainer.appendChild(nxtButton.element);
    }).catch(console.error)

    // load first view
}



const officeList = (name, index) => {
    const li = createElement('li', {
        className: 'mdc-list-item'
    });
    li.setAttribute('role', 'radio')
    li.setAttribute('aria-checked', 'false')

    li.innerHTML = `<span class="mdc-list-item__graphic">
    <div class="mdc-radio">
      <input class="mdc-radio__native-control"
            type="radio"
            id="list-radio-item-${index}"
            name="demo-list-radio-item-group"
            value="1">
      <div class="mdc-radio__background">
        <div class="mdc-radio__outer-circle"></div>
        <div class="mdc-radio__inner-circle"></div>
      </div>
    </div>
  </span>
  <label class="mdc-list-item__text" for="demo-list-radio-item-1">${name}</label>
  `
    new mdc.ripple.MDCRipple(li)
    return li
}

const nextButton = (text = 'Next') => {
    if (document.getElementById('journey-next')) {
        document.getElementById('journey-next').remove();
    }
    const button = createElement('button', {
        className: 'mdc-button mdc-button--raised',
        id: 'journey-next'

    })


    button.innerHTML = ` <div class="mdc-button__ripple"></div>
        <span class="mdc-button__label">${text}</span>
        <div class='straight-loader button hidden'></div>
        `
    new mdc.ripple.MDCRipple(button)
    return {
        element: button,
        setLoader: function () {
            button.querySelector('.straight-loader').classList.remove('hidden');
            button.querySelector('.mdc-button__label').classList.add('hidden')
        },
        removeLoader: function () {
            button.querySelector('.straight-loader').classList.add('hidden');
            button.querySelector('.mdc-button__label').classList.remove('hidden')
        }
    }
}

function initFlow() {

    journeyBar.progress = 0;

    // if(new URLSearchParams(window.location.search).get("new_user") ) {
    //     journeyPrevBtn.classList.add('hidden')
    // }
    // else {
        journeyPrevBtn.classList.remove('hidden')
    // }
    journeyHeadline.textContent = 'Welcome to easy tracking';

    const secondaryText = createElement('div', {
        className: 'onboarding-headline--secondary',
        textContent: 'Lets get started! Enter your details'
    })
    const nameTitle = createElement('div', {
        className: 'onboarding-content--text',
        textContent: 'Name'
    })

    const emailTitle = createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: 'Email'
    })

    const nameField = textFieldOutlinedWithoutLabel({
        required: true,
        autocomplete: "name",
        value: firebase.auth().currentUser.displayName || ''
    });


    const emailField = textFieldOutlinedWithoutLabel({
        required: true,
        autocomplete: "email",
        type: 'email',
        value: firebase.auth().currentUser.email || ''

    });


    const frag = document.createDocumentFragment();
    frag.appendChild(secondaryText)
    frag.appendChild(nameTitle);
    frag.appendChild(nameField)
    frag.appendChild(textFieldHelper())
    frag.appendChild(emailTitle);
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
        const firstContact = {
            displayName: nameFieldInit.value,
            email: emailFieldInit.value,
            phoneNumber: firebase.auth().currentUser.phoneNumber
        }
        nextBtn.setLoader()
        handleAuthUpdate(firstContact).then(function () {
            onboarding_data_save.set({
                firstContact
            })
            categoryFlow();
            journeyPrevBtn.classList.remove('hidden')
            history.pushState(history.state, null, basePathName + `${window.location.search}#category`);

        }).catch(function (error) {
            nextBtn.removeLoader()
            const message = getEmailErrorMessage(error);
            setHelperInvalid(emailFieldInit, message);
            sendErrorLog({
                message: authError.message,
                stack: authError.stack
            });
        })
    });
    journeyContainer.innerHTML = ''
    journeyContainer.appendChild(frag);
    actionsContainer.appendChild(nextBtn.element)
    nameFieldInit.input_.addEventListener('focus', () => {
        setTimeout(() => {
            document.body.scrollTop = 80
        }, 600);
    })
}



function categoryFlow() {
    journeyBar.progress = 0.40
    document.body.scrollTop = 0

    journeyHeadline.innerHTML = 'Choose the category that fits your business best';

    const grid = createElement('div', {
        className: 'mdc-layout-grid'
    })
    const container = createElement('div', {
        className: 'category-container mdc-layout-grid__inner'
    });
    let selectedDiv;
    let otherCateogryInput;

    const nextBtn = nextButton();
    nextBtn.element.disabled = true;
    categoriesDataset().forEach(category => {

        const div = createElement('div', {
            className: 'category-box mdc-card mdc-elevation--z4 mdc-layout-grid__cell--span-2-phone mdc-layout-grid__cell'
        })
        div.dataset.name = category.name;

        const svgCont = createElement('div', {
            className: 'cateogry-icon'
        });
        category.icon.then(svg => {
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
                const field = categoryInputField(container, '');
                otherCateogryInput = field;
                field.root_.scrollIntoView();
            };
            nextBtn.element.disabled = false;
        });
        container.appendChild(div);
    });


    grid.appendChild(container)

    nextBtn.element.addEventListener('click', () => {
        let selectedCategoryName = selectedDiv.dataset.name;
        if (selectedCategoryName === 'Others') {
            if (!otherCateogryInput.value) {
                setHelperInvalid(otherCateogryInput, 'Enter a category')
                return
            }
            setHelperValid(otherCateogryInput);
            selectedCategoryName = otherCateogryInput.value;
        }
        // onboarding_data_save.set({
        //     'category': selectedCategoryName
        // })
        officeFlow(selectedCategoryName);
        history.pushState(history.state, null, basePathName + `${window.location.search}#office`);
    });
    actionsContainer.appendChild(nextBtn.element)
    journeyContainer.innerHTML = ''
    journeyContainer.appendChild(grid);



    if (onboarding_data_save.get().category) {
        let el = container.querySelector(`[data-name="${onboarding_data_save.get().category}"]`)
        if (!el) {
            el = container.querySelector(`[data-name="Others"]`)
            const field = categoryInputField(container, onboarding_data_save.get().category);
            otherCateogryInput = field;
            field.root_.scrollIntoView();
        }
        el.classList.add('category-active');
        selectedDiv = el;
        nextBtn.element.disabled = false;
    }
}


const categoryInputField = (container, inputValue) => {
    const inputDiv = createElement('div', {
        className: 'input-div mt-10 mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-12-desktop'
    });
    const inputField = textFieldOutlined({
        type: 'text',
        required: true,
        value: inputValue,
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
    return new Promise((resolve, reject) => {
        fetch(source, {
            headers: new Headers({
                'content-type': 'image/svg+xml',
                mode: 'no-cors'
            }),
            method: 'GET'
        }).then(response => {
            return response.text()
        }).then(resolve)
    })
}

function officeFlow(category = onboarding_data_save.get().category) {
    journeyBar.progress = 0.60

    journeyHeadline.innerHTML = 'Tell us about your company';
    const officeContainer = createElement('div', {
        className: 'office-container'
    })
    const savedData = onboarding_data_save.get();

    const companyName = textFieldOutlinedWithoutLabel({
        required: true,

        id: 'company-name',
        autocomplete: 'organization',
        value: savedData.name || ''
    })
    const year = textFieldOutlined({
        type: 'number',
        label: 'Year',
        id: 'year',
        autocomplete: 'bday-year',
        max: new Date().getFullYear(),
        value: savedData.yearOfEstablishment || '',
        min: 1
    })
    const logoCont = createElement('div', {
        className: 'logo-container'
    })
    const actionCont = createElement('div')
    const logoText = createElement('div', {
        className: 'logo-text',
        textContent: 'Company logo'
    })
    const logo = createElement('input', {
        type: 'file',
        accept: 'image/*'
    });

    let companyLogo;


    // open file explorer and get image
    logo.addEventListener('change', (ev) => {
        getImageBase64(ev).then(base64 => {
            companyLogo = base64;
            if (document.querySelector('.image-cont')) {
                document.querySelector('.image-cont').remove()
            }
            logoCont.appendChild(createImage(companyLogo, logo, companyLogo));
        }).catch(console.error);
    })
    actionCont.appendChild(logoText);
    actionCont.appendChild(logo);
    logoCont.appendChild(actionCont);
    if (savedData.companyLogo) {
        companyLogo = savedData.companyLogo;
        logoCont.appendChild(createImage(companyLogo, logo, companyLogo));
    };
    const address = textAreaOutlined({
        required: true,
        label: 'Address',
        autocomplete: 'address-line1',
        id: 'address',
        rows: 2,
        value: savedData.registeredOfficeAddress || '',
        cols: 8
    })
    const pincode = textFieldOutlinedWithoutLabel({
        required: true,
        type: 'number',
        label: 'PIN code',
        autocomplete: 'postal-code',
        value: savedData.pincode || ''
    });
    const description = textAreaOutlined({
        label: 'Description',
        rows: 4,
        cols: 8,
        id: 'description',
        value: savedData.description || ''
    })

    const frag = document.createDocumentFragment();
    officeContainer.appendChild(createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: "Company name"
    }));
    officeContainer.appendChild(companyName);
    officeContainer.appendChild(textFieldHelper())
    officeContainer.appendChild(createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: "When was your company established ?"
    }));
    officeContainer.appendChild(year);
    officeContainer.appendChild(textFieldHelper())
    officeContainer.appendChild(logoCont);
    officeContainer.appendChild(createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: "Company's address"
    }));
    officeContainer.appendChild(address);
    officeContainer.appendChild(textFieldHelper())
    officeContainer.appendChild(createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: "PIN code"
    }));
    officeContainer.appendChild(pincode);
    officeContainer.appendChild(textFieldHelper())
    officeContainer.appendChild(createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: "Description"
    }));
    officeContainer.appendChild(description);
    officeContainer.appendChild(textFieldHelper())
    frag.appendChild(officeContainer)

    const inputFields = {
        name: new mdc.textField.MDCTextField(companyName),
        address: new mdc.textField.MDCTextField(address),
        year: new mdc.textField.MDCTextField(year),
        pincode: new mdc.textField.MDCTextField(pincode),
        description: new mdc.textField.MDCTextField(description),
    }

    /**
     * handle listeners for name,year & Address field to autofill description;
     * 
     */


    inputFields.description.input_.addEventListener('input', () => {
        if (!inputFields.description.value.trim()) {
            inputFields.description.input_.dataset.typed = "no";
        } else {
            inputFields.description.input_.dataset.typed = "yes";
        }
    });
    
    [inputFields.name.input_,inputFields.year.input_,inputFields.address.input_].forEach(el=>{
        el.addEventListener('input',(ev)=>{
            handleOfficeDescription(category)
        })
    });
    
    const nxtButton = nextButton();
    nxtButton.element.addEventListener('click', () => {
        if (!inputFields.name.value) {
            setHelperInvalid(inputFields.name, 'Enter your company name');
            return;
        };
        if (!inputFields.address.value) {
            setHelperInvalid(inputFields.address, 'Enter your company address');
            return
        };
        if (!isValidPincode(inputFields.pincode.value)) {
            setHelperInvalid(inputFields.pincode, 'Enter correct PIN code');
            return
        };
        if (inputFields.year.value && !isValidYear(inputFields.year.value)) {
            setHelperInvalid(inputFields.year, 'Enter correct year');
            return
        }

        const officeData = {
            name: inputFields.name.value,
            registeredOfficeAddress: inputFields.address.value,
            pincode: inputFields.pincode.value,
            description: inputFields.description.value,
            yearOfEstablishment: inputFields.year.value,
            companyLogo: companyLogo || "",
            category: category,
            template: 'office',
        };

        if (!shouldProcessRequest(savedData, officeData)) {
            handleOfficeRequestSuccess(officeData);
            return;
        }
        const officeRequest = createRequestBodyForOffice(officeData)
        nxtButton.setLoader();

        sendOfficeRequest(officeRequest).then(res => {
            if (res.officeId) {
                officeData.officeId = res.officeId;
            }
            handleOfficeRequestSuccess(officeData)

            fbq('trackCustom', 'Office Created')
            analyticsApp.logEvent('office_created', {
                location: officeData.registeredOfficeAddress
            });
            sendAcqusition();
        }).catch(function (error) {

            nxtButton.removeLoader();
            let field;
            let message
            if (error.message === `Office with the name '${officeData.name}' already exists`) {
                field = inputFields.name;
                message = `${officeData.name} already exists. Choose a differnt company name`;
            }
            if (error.message === `Invalid registered address: '${officeData.registeredOfficeAddress}'`) {
                field = inputFields.address;
                message = `Enter a valid company address`;
            }
            if (error.message === 'Pincode is not valid') {
                field = inputFields.pincode;
                message = 'PIN code is not correct';
            };

            if (field) {
                setHelperInvalid(field, message);
                return;
            };
            sendErrorLog({
                message: error.message,
                stack: error.stack
            });
        })

    })
    journeyContainer.innerHTML = ''
    journeyContainer.appendChild(frag);
    actionsContainer.appendChild(nxtButton.element);
    document.body.scrollTop = 0;
};

const sendOfficeRequest = (officeRequest, retry) => {
    return new Promise((resolve, reject) => {
        if (officeRequest.method === 'PUT') {
            http(officeRequest.method, officeRequest.endpoint, officeRequest.data).then(resolve).catch(err => {
                if (err.message !== "unauthorized") return reject(err);
                retry++
                if (retry > 3) {
                    return reject(err)
                }
                setTimeout(() => {
                    return sendOfficeRequest(officeRequest, retry).then(resolve).catch(reject);
                }, 1000)
            });
            return;
        }
        http(officeRequest.method, officeRequest.endpoint, officeRequest.data).then(resolve).catch(reject);
    })
}

const handleOfficeRequestSuccess = (officeData) => {
    onboarding_data_save.set({
        'category': officeData.category
    })
    onboarding_data_save.set(officeData);
    addEmployeesFlow()
    history.pushState(history.state, null, basePathName + `${window.location.search}#employees`)
}

/**
 * Check if office request body has any changes
 * @param {object} savedData 
 * @param {object} officeData 
 * @returns {Boolean} match
 */
const shouldProcessRequest = (savedData, officeData) => {
    let match = false;
    Object.keys(officeData).forEach(key => {

        if (officeData[key] !== savedData[key]) {
            match = true
        }
    })
    return match

}


const createImage = (base64, inputFile, companyLogo) => {
    const imageCont = createElement('div', {
        className: 'image-cont',
        style: `background-image:url("${base64}")`
    })

    const removeImage = createElement('i', {
        className: 'material-icons remove',
        textContent: 'delete'
    });
    //remove image
    removeImage.addEventListener('click', () => {
        //reset logo
        inputFile.value = '';
        //remove image container;
        imageCont.remove();
        //reset companyLogo variable
        companyLogo = null;
    })
    imageCont.appendChild(removeImage)
    return imageCont;
}


/**
 * creates request for creating/updating an office
 * @param {object} officeData 
 * @returns {object} req
 */
const createRequestBodyForOffice = (officeData) => {
    let url = `${appKeys.getBaseUrl()}/api/services/office`;
    const savedData = onboarding_data_save.get()
    const req = {
        endpoint: url,
        data: '',
        method: 'POST'
    }
    if (onboarding_data_save.get().name === officeData.name) {

        url = `${appKeys.getBaseUrl()}/api/activities/update`;
        const template = {
            schedule: [],
            venue: [],
            template: 'office',
            attachment: {
                'Company Logo': {
                    type: 'base64',
                    value: officeData.companyLogo
                },
                'Description': {
                    type: 'string',
                    value: officeData.description
                },
                'First Contact': {
                    type: 'phoneNumber',
                    value: savedData.firstContact.phoneNumber
                },
                'Name': {
                    type: 'string',
                    value: officeData.name
                },
                'Registered Office Address': {
                    type: 'string',
                    value: officeData.registeredOfficeAddress
                },
                'Pincode': {
                    type: 'string',
                    value: officeData.pincode
                },
                'Year Of Establishment': {
                    type: 'string',
                    value: officeData.yearOfEstablishment
                },
                'Category': {
                    type: 'string',
                    value: officeData.category
                }
            },
            office: officeData.name,
            activityId: savedData.officeId
        };
        template.geopoint = {
            latitude: 0,
            longitude: 0
        }
        req.endpoint = url;
        req.data = template
        req.method = 'PUT'
        return req;
    };
    officeData.category = savedData.category;
    officeData.firstContact = savedData.firstContact;
    req.data = officeData
    return req;
}

/**
 * Checks for a valid PIN code. should be 6 digits number only
 * @param {string} pincode 
 * @returns {Boolean} 
 */
const isValidPincode = (pincode) => {
    return /^[1-9][0-9]{5}$/.test(Number(pincode))
}

/**
 * Checks if year is valid . should be number only
 * @param {string} pincode 
 * @returns {Boolean} 
 */
const isValidYear = (year) => {
    return /^\d+$/.test(year)
}

const handleOfficeDescription = (category) => {
    const nameEl = document.querySelector('#company-name input');
    const year = document.querySelector('#year input');
    const address = document.querySelector('#address');
    const description = document.querySelector('#description');
    new mdc.textField.MDCTextField(description.parentNode.parentNode);
    if (!nameEl.value) return;
    if (description.dataset.typed === "yes") return;
    let string = `${nameEl.value} is ${prefixForVowel(category)} ${category} company ${address.value ? `, based out of  ${address.value}`:''} ${year.value > 0 ? `. They have been in business since ${year.value}`:''}`;
    description.value = string;
}


/**
 *  returns a/an if a string first character is a vowel
 * @param {string} string
 * @returns {string} a/an
 */
const prefixForVowel = (string) => {
    const firstChar = string.charAt(0);
    //vowel regex test
    if (!/A|a|E|e|I|i|O|o|U|u/i.test(firstChar)) {
        return 'a'
    }
    return 'an';
}


const start = () => {
    // 2. Initialize the JavaScript client library.
    gapi.client.init({
        'apiKey': appKeys.getKeys().apiKey,
        // clientId and scope are optional if auth is not required.
        'clientId': appKeys.getGoogleClientId(),
        'discoveryDocs': ["https://www.googleapis.com/discovery/v1/apis/people/v1/rest"],
        'scope': 'https://www.googleapis.com/auth/contacts.readonly',
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

    }, function (error) {
        const el = document.getElementById('authorize-error')
        if (error.details === "Cookies are not enabled in current environment.") {
            el.innerHTML = 'Google contacts will not work when cookies are disabled. If you are in incognito , Please leave it.'
            return
        }
        el.innerHTML = error.details
    });
};

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {


        document.getElementById('authorize_button').remove();
        document.getElementById('onboarding-headline-contacts').remove();

        if(new URLSearchParams(window.location.search).get('new_user')) {
            listConnectionNames();
            return
        }

        http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${onboarding_data_save.get().name}&field=roles`).then(response => {
            const phoneNumbers = {}
            const admin = response.roles.admin || [];
            const subs = response.roles.subscription || [];
            const employees = response.roles.employees || [];

            const usersData = [...admin,...subs,...employees];
            usersData.forEach(data => {
                phoneNumbers[data.attachment['Phone Number'].value] = {
                    phoneNumber: data.attachment['Phone Number'].value,
                    displayName: '',
                    photo: '',
                    isAdmin: data.template === "admin" ? true : false
                }
            });
            listConnectionNames(phoneNumbers);
        }).catch(err => {
            listConnectionNames();
        })
    } else {
        //   authorizeButton.style.display = 'block';
        //   signoutButton.style.display = 'none';
        console.log("logged out");
    }
}

const getAllContacts = (pageToken, result, currentEmployees) => {
    return new Promise((resolve, reject) => {


        // if (localStorage.getItem('contacts')) {
        //     return resolve(JSON.parse(localStorage.getItem('contacts')))
        // }
        gapi.client.people.people.connections.list({
            'resourceName': 'people/me',
            'pageSize': 100,
            'personFields': 'names,emailAddresses,phoneNumbers,photos',
            pageToken: pageToken || ''
        }).then(response => {
            var connections = response.result.connections;
            if (!connections.length) return resolve(result);

            connections.forEach(person => {
                if (person.names && person.names.length > 0 && person.phoneNumbers && person.phoneNumbers.length > 0 && person.phoneNumbers[0].canonicalForm) {
                    if (currentEmployees && currentEmployees[person.phoneNumbers[0].canonicalForm]) return;
                    
                    const key = `${person.phoneNumbers[0].canonicalForm}${person.names[0].displayName.toLowerCase()}`
                    result.data[key] = {
                        displayName: person.names[0].displayName,
                        phoneNumber: person.phoneNumbers[0].canonicalForm,
                        photoURL: person.photos[0].url || './img/person.png'
                    }
                    result.indexes.push(key)
                    
                }
            })


           

            if (response.result.nextPageToken) {
                return getAllContacts(response.result.nextPageToken, result,currentEmployees).then(resolve)
            };
            return resolve(result);
        })
    })
}

function listConnectionNames(currentEmployees) {
    const ul = document.getElementById("contacts-list");
    const ulInit = new mdc.list.MDCList(ul);
    const selected = {};

    getAllContacts(null, {
        data: {},
        indexes: []
    }, currentEmployees).then(contactData => {
        // localStorage.setItem('contacts', JSON.stringify(contactData));
        const length = contactData.indexes.length;
        if (!length) {
            document.getElementById('authorize-error').innerHTML = 'No Contacts found !. Use share link to invite your employees';
            return
        }
        document.querySelector('.imported-number').innerHTML = `Imported ${length} contacts`
        document.querySelector('.contact-list--label').innerHTML = 'Manager';
        if (length >= 10) {
            const searchBar = new mdc.textField.MDCTextField(textFieldOutlined({
                label: 'Search your contacts'
            }));

            searchBar.input_.addEventListener('input', () => {
                searchDebounce(function () {
                    const value = searchBar.value.toLowerCase();

                    let matchFound = 0;
                    const frag = document.createDocumentFragment();

                    contactData.indexes.forEach((item, index) => {
                        if (item.indexOf(value) > -1) {
                            matchFound++
                            if (matchFound < 10) {
                                const li = userList(contactData.data[item], index);
                                const switchControl = new mdc.switchControl.MDCSwitch(li.querySelector('.mdc-switch'));
                                if (selected[item]) {
                                    li.querySelector('.mdc-checkbox__native-control').checked = true
                                    li.setAttribute('aria-checked', "true");
                                    li.setAttribute('tabindex', "0");
                                    switchControl.checked = true;
                                }
                                frag.appendChild(li)
                                li.querySelector('span:nth-child(3)').innerHTML = `<img src='${contactData.data[item].photoURL}' data-name="${contactData.data[item].displayName}" class='contact-photo' onerror="contactImageError(this);"></img>`
                            };
                        }
                    });
                    ul.innerHTML = '';
                    ul.appendChild(frag);
                }, 1000);
            });
            document.querySelector('.search-bar--container').appendChild(searchBar.root_);
        };


        ulInit.foundation_.isCheckboxList_ = true;
        for (let i = 0; i < 5; i++) {
            const element = contactData.indexes[i];
            const li = userList(contactData.data[element], i);
            const switchControl = new mdc.switchControl.MDCSwitch(li.querySelector('.mdc-switch'));
            switchControl.disabled = true
            ul.appendChild(li);
            li.querySelector('span:nth-child(3)').innerHTML = `<img src='${contactData.data[element].photoURL}' data-name="${contactData.data[element].displayName}" class='contact-photo' onerror="contactImageError(this);"></img>`
        }
        ulInit.listen('MDCList:action', ev => {
         
            const el = ulInit.listElements[ev.detail.index];
            const switchControl = new mdc.switchControl.MDCSwitch(el.querySelector('.mdc-switch'));
            if (ulInit.selectedIndex.indexOf(ev.detail.index) == -1) {
                switchControl.disabled = true;
                switchControl.checked = false;
                delete selected[el.dataset.name];
                document.querySelector('.selected-people').innerHTML = `${Object.keys(selected).length == 0 ? '' : `${Object.keys(selected).length} Contacts selected`}`;
            } else {
                switchControl.disabled = false;
                const selectedContact = JSON.parse(el.dataset.value);
                selectedContact.isAdmin = switchControl.checked;
                selected[el.dataset.name] = selectedContact
                document.querySelector('.selected-people').innerHTML = `${Object.keys(selected).length} Contacts selected`;
            }
            onboarding_data_save.set({
                users: selected
            })
        })
    })
}


let timerId;
const searchDebounce = (func, delay) => {
    clearTimeout(timerId);
    timerId = setTimeout(func, delay)
}

function contactImageError(image) {
    const tag = createElement('span');
    tag.dataset.letters = image.dataset.name.charAt(0);
    image.parentNode.replaceChild(tag, image);
    image.onerror = "";
    image.remove();
    return true;
}

const userList = (contact, index) => {
    const li = createElement('li', {
        className: 'mdc-list-item'
    })
    li.dataset.name = `${contact.phoneNumber}${contact.displayName.toLowerCase()}`
    li.dataset.value = JSON.stringify(contact)
    li.setAttribute('role', 'checkbox')
    li.setAttribute('tabindex', "-1");
    li.setAttribute('aria-checked', "false");

    li.innerHTML = `<span class="mdc-list-item__ripple"></span>
      <span class="mdc-list-item__graphic">
        <div class="mdc-checkbox">
            <input type="checkbox"
                    class="mdc-checkbox__native-control"
                    id="contact-list-checkbox-item-${index}"  />
            <div class="mdc-checkbox__background">
                <svg class="mdc-checkbox__checkmark"
                        viewBox="0 0 24 24">
                    <path class="mdc-checkbox__checkmark-path"
                        fill="none"
                        d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                </svg>
                <div class="mdc-checkbox__mixedmark"></div>
            </div>
        </div>
    </span>

    <span class="mdc-list-item__graphic">
     
    </span>
    <label class="mdc-list-item__text" for="contact-list-checkbox-item-${index}">
        <span class="mdc-list-item__primary-text">${contact.displayName}</span>
        <span class="mdc-list-item__secondary-text">${contact.phoneNumber}</span>
    </label>
    <span class='mdc-list-item__meta'>
        <div class="mdc-switch">
            <div class="mdc-switch__track"></div>
            <div class="mdc-switch__thumb-underlay">
                <div class="mdc-switch__thumb"></div>
                <input type="checkbox" id="basic-switch-${index}" class="mdc-switch__native-control" role="switch" aria-checked="false">
            </div>
        </div>
    </span>
      `
    return li;
}

function addEmployeesFlow() {
    journeyBar.progress = 0.80
    journeyHeadline.innerHTML = 'Add employees by using any one of these methods';
    // 1. Load the JavaScript client library.
    gapi.load('client', start);
    const secondaryTextContacts = createElement('div', {
        className: 'onboarding-headline--secondary',
        id: 'onboarding-headline-contacts',
        textContent: 'Import from Google contacts'
    })
    const authorizeContainer = createElement('div', {
        className: 'import-cont'
    })
    const text = createElement('h2')
    text.innerHTML = `<span  class="line-center">Or</span>`

    const authorize = createElement('button', {
        className: 'mdc-button mdc-button--raised',
        id: 'authorize_button',
        textContent: 'Import from Google contacts'
    })
    const authorizeError = createElement('div', {
        className: 'mdc-theme--error authorize-failed',
        id: 'authorize-error'
    });

    authorize.addEventListener('click', () => {
        gapi.auth2.getAuthInstance().signIn();
    })
    authorizeContainer.appendChild(secondaryTextContacts)
    authorizeContainer.appendChild(authorize);
    authorizeContainer.appendChild(authorizeError)


    const employeesContainer = createElement('div', {
        className: 'employees-container'
    })

    const selectionContainer = createElement('div', {
        className: 'user-selection'
    })

    const importedText = createElement('div', {
        className: 'imported-number'
    })
    const selectedPeople = createElement('div', {
        className: 'selected-people mdc-typography--headline5'
    })
    const searchCont = createElement('div', {
        className: 'search-bar--container'
    });
    const contactListLabel = createElement('div', {
        className: 'contact-list--label mdc-typography--headline6'
    });
    const ul = createElement('ul', {
        className: 'mdc-list mdc-list--two-line mdc-list--avatar-list',
        id: 'contacts-list'
    })
    ul.setAttribute('aria-label', 'List with checkbox items');
    ul.setAttribute('role', 'group');
    selectionContainer.appendChild(selectedPeople);
    selectionContainer.appendChild(searchCont);
    selectionContainer.appendChild(contactListLabel);
    selectionContainer.appendChild(ul);
    selectionContainer.appendChild(importedText);


    const shareContainer = createElement('div', {
        className: 'share-container'
    });


    const officeName = onboarding_data_save.get().name
    const loader = createElement('div', {
        className: 'straight-loader'
    })
    shareContainer.appendChild(loader)
    let shareLink;
    waitTillCustomClaimsUpdate(officeName, function () {
        getShareLink(onboarding_data_save.get().name).then(response => {
            const secondaryTextShareLink = createElement('div', {
                className: 'onboarding-headline--secondary',
                textContent: 'Invite employees by sharing this download link with them.'
            })
            shareLink = response.shareLink
            loader.remove();
            shareContainer.appendChild(text)
            shareContainer.appendChild(secondaryTextShareLink);
            shareContainer.appendChild(shareWidget(shareLink))
        }).catch(console.error)
    })

    employeesContainer.appendChild(selectionContainer)
    employeesContainer.appendChild(authorizeContainer);
    employeesContainer.appendChild(shareContainer);
    journeyContainer.innerHTML = ''
    journeyContainer.appendChild(employeesContainer)
    const nxtButton = nextButton();
    nxtButton.element.addEventListener('click', () => {
        const selectedUsers = onboarding_data_save.get().users;

        if (selectedUsers && Object.keys(selectedUsers).length > 0) {
            nxtButton.setLoader();
            const array = []
            Object.keys(selectedUsers).forEach(user => {
                array.push(selectedUsers[user])
            })
            http('POST', `${appKeys.getBaseUrl()}/api/services/addUsers`, {
                office: onboarding_data_save.get().name,
                users: array
            }).then(res => {
                nxtButton.removeLoader();
                onboardingSucccess(shareLink)
                history.pushState(history.state, null, basePathName + `${window.location.search}#completed`);

            }).catch(err => {})
            return
        }
        onboardingSucccess(shareLink)
    });
    actionsContainer.appendChild(nxtButton.element);
}

/**
 * Gets the share link for and office. 
 * Retries 3 times if link fails to fetch
 * @param {string} office 
 * @param {string} retry 
 */

const getShareLink = (office) => {
    return new Promise((resolve, reject) => {
        http('POST', `${appKeys.getBaseUrl()}/api/services/shareLink`, {
            office: office
        }).then(resolve).catch(reject)
    })
}

const onboardingSucccess = (shareLink) => {
    const isNewUser = new URLSearchParams(window.location.search).get('new_user');

    journeyBar.progress = 1
    journeyHeadline.innerHTML = isNewUser ? 'Account creation successful!' : 'Account updated successful';
    localStorage.setItem("completed", "true")
    journeyContainer.innerHTML = `
    <div class='completion-container'>
    <h1 class='onboarding-headline--secondary mt-0 mb-0'>Congratulations you can now start tracking your employees</h1>
    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
        <p class='mdc-typography--headline5 text-center mb-0 mt-0' style='padding-top:10px;border-top:1px solid #ccc'>Download the app and try it</p>
        <div class="full-width">
          <div style="width: 300px;display: block;margin: 0 auto;">
            <div style="width: 100%;display: inline-flex;align-items: center;">
              <div class="play-store">
                <a
                  href="https://play.google.com/store/apps/details?id=com.growthfile.growthfileNew&amp;pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"><img
                    alt="Get it on Google Play"
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"></a>
              </div>
              <div class="app-store full-width">
                <a href="https://apps.apple.com/in/app/growthfile-gps-attendance-app/id1441388774?mt=8"
                  style="display:inline-block;overflow:hidden;background:url(https://linkmaker.itunes.apple.com/en-gb/badge-lrg.svg?releaseDate=2018-12-06&amp;kind=iossoftware&amp;bubble=ios_apps) no-repeat;width:135px;height:40px;"></a>
              </div>
            </div>
          </div>
      </div>
      ${shareLink ? ` <div class='share-container'>
          <h2><span class="line-center">Or</span></h2>
          <p class='mt-10 mb-0 mdc-typography--headline6 text-center'>Invite employees by sharing this download link with them.</p>
            ${shareWidget(shareLink).outerHTML}
      </div>` :''}
    </div>`;


    onboarding_data_save.clear();
    actionsContainer.innerHTML = '';
}


const onboarding_data_save = function () {
    return {
        init: function () {
            localStorage.setItem('onboarding_data', JSON.stringify({}))
        },
        get: function () {
            return JSON.parse(localStorage.getItem('onboarding_data'))
        },
        set: function (data) {
            const storedData = this.get();
            Object.assign(storedData, data)
            localStorage.setItem('onboarding_data', JSON.stringify(storedData));
        },
        clear: function () {
            localStorage.removeItem('onboarding_data');
        }
    }
}();



const handleAuthUpdate = (authProps) => {

    return new Promise((resolve, reject) => {

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
                return firebase.auth().currentUser.sendEmailVerification()
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
        id: attrs.id || ''
    })
    if (attrs.value) {
        label.classList.add('mdc-text-field--label-floating')
    }
    const input = createElement('input', {
        className: 'mdc-text-field__input',
        value: attrs.value || ''
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
        <span class="mdc-floating-label ${attrs.value ? 'mdc-floating-label--float-above' : ''}">${attrs.label}</span>
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

const textAreaOutlined = (attr) => {

    const label = createElement('label', {
        className: 'mdc-text-field mdc-text-field--outlined mdc-text-field--textarea'
    })
    if (attr.value) {
        label.classList.add('mdc-text-field--label-floating')
    }
    label.innerHTML = `<span class="mdc-notched-outline">
    <span class="mdc-notched-outline__leading"></span>
    <span class="mdc-notched-outline__notch">
      <span class="mdc-floating-label ${attr.value ? 'mdc-floating-label--float-above' :''}">${attr.label}</span>
    </span>
    <span class="mdc-notched-outline__trailing"></span>
</span>
<span class="mdc-text-field__resizer">
    <textarea class="mdc-text-field__input" rows="${attr.rows}" cols="${attr.cols}" aria-label="Label" id="${attr.id || ''}" ${attr.required ? 'required':''} ${attr.autocomplete ? `autocomplete = ${attr.autocomplete}`:''}>${attr.value || ''}</textarea>
</span>`
    return label;
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