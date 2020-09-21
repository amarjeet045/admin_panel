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

/** Polyfill for Childnode.remove() */
(function (arr) {
    arr.forEach(function (item) {
        if (item.hasOwnProperty('remove')) {
            return;
        }

        Object.defineProperty(item, 'remove', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function remove() {
                if (this.parentNode === null) {
                    return;
                }

                this.parentNode.removeChild(this);
            }
        });
    });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);


window.addEventListener('load', function () {

    // make ripple work correctly
    new mdc.ripple.MDCRipple(journeyPrevBtn).unbounded = true;

    firebase.auth().onAuthStateChanged(user => {
        // if user is logged out.

        if (user) {
            // history.pushState(history.state, null, basePathName + `#`)
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
    const view = hash.replace('#', '');
    let fnName = redirect;
    switch (view) {
        case 'welcome':
            fnName = initFlow;
            break;
        case 'category':
            fnName = categoryFlow;
            break;
        case 'office':
            fnName = officeFlow;
            break;
        case 'choosePlan':
            fnName = choosePlan;
            break;
        case 'payment':
            history.pushState(null, null, basePathName + `${window.location.search}#employees`)
            fnName = addEmployeesFlow;
            break;
        case 'employees':
            fnName = addEmployeesFlow;
            break;
        default:
            fnName = redirect;
            break
    }
    if (fnName === redirect) {
        redirect('/join');
        return;
    }
    fnName();
    decrementProgress();
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
    journeyBar.progress = journeyBar.foundation.progress + 0.16666666666666666
}
/**
 * 
 * Decrement progress bar by 1/6th
 */
const decrementProgress = () => {
    journeyBar.progress = journeyBar.foundation.progress - 0.16666666666666666
}

const initJourney = () => {
    onboarding_data_save.init();

    journeyPrevBtn.addEventListener('click', function (e) {
        history.back();
    })

    firebase.auth().currentUser.getIdTokenResult().then((idTokenResult) => {
        if (!isAdmin(idTokenResult)) {
            onboarding_data_save.set({
                status: 'PENDING'
            })
            history.pushState(history.state, null, basePathName + `?new_user=1#welcome`)
            initFlow();
            return
        };

        const office = idTokenResult.claims.admin[0];
        let officeActivity;

        http('GET', `${appKeys.getBaseUrl()}/api/office?office=${office}`).then(officeMeta => {
            if (!officeMeta.results.length) {
                onboarding_data_save.set({
                    status: 'PENDING'
                })
                history.pushState(history.state, null, basePathName + `?new_user=1#welcome`)
                initFlow();
                return;
            }
            return http('GET', `${appKeys.getBaseUrl()}/api/office/${officeMeta.results[0].officeId}/activity/${officeMeta.results[0].officeId}/`)
        }).then(officeData => {
            officeActivity = officeData;

            if (officeHasMembership(officeData.schedule)) return Promise.resolve(null);
            officeData.geopoint = {
                latitude: 0,
                longitude: 0
            }
            return http('PUT', `${appKeys.getBaseUrl()}/api/activities/update`, officeData)

        }).then(res => {
            if (!res) return redirect('/admin/');

            localStorage.removeItem('completed');

            const data = {
                name: officeActivity.office,
                officeId: officeActivity.activityId,
                firstContact: officeActivity.creator,
                category: officeActivity.attachment.Category ? officeActivity.attachment.Category.value : '',
                registeredOfficeAddress: officeActivity.attachment['Registered Office Address'].value,
                pincode: officeActivity.attachment.Pincode ? officeActivity.attachment.Pincode.value : '',
                description: officeActivity.attachment.Description.value,
                yearOfEstablishment: officeActivity.attachment['Year Of Establishment'] ? officeActivity.attachment['Year Of Establishment'].value : '',
                template: 'office',
                companyLogo: officeActivity.attachment['Company Logo'] ? officeActivity.attachment['Company Logo'].value : '',
                schedule: officeActivity.schedule
            };

            onboarding_data_save.set(data);
            onboarding_data_save.set({
                status: 'COMPLETED'
            })
            history.pushState(history.state, null, basePathName + `#choosePlan`)
            choosePlan();
            return


        }).catch(console.error)
    })
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
            button.style.pointerEvents = 'none'
            button.querySelector('.straight-loader').classList.remove('hidden');
            button.querySelector('.mdc-button__label').classList.add('hidden')
        },
        removeLoader: function () {
            button.style.pointerEvents = 'all'
            button.querySelector('.straight-loader').classList.add('hidden');
            button.querySelector('.mdc-button__label').classList.remove('hidden')
        }
    }
}

function initFlow() {


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
            history.pushState(history.state, null, basePathName + `${window.location.search}#category`);
            incrementProgress();
            categoryFlow();
            journeyPrevBtn.classList.remove('hidden')

        }).catch(function (error) {
            nextBtn.removeLoader()
            const message = getEmailErrorMessage(error);
            if (message) {
                setHelperInvalid(emailFieldInit, message);
                return
            }

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
                field.root.scrollIntoView();
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
        history.pushState(history.state, null, basePathName + `${window.location.search}#office`);
        officeFlow(selectedCategoryName);
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
            field.root.scrollIntoView();
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
        if (!window.fetch) {
            var request = new XMLHttpRequest();
            request.open('GET', source);
            request.setRequestHeader('Content-Type', 'image/svg+xml');
            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    resolve(request.responseText)
                    return
                }
            };
            request.send();
            return
        }
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
};





function officeFlow(category = onboarding_data_save.get().category) {
    incrementProgress();
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
        autocomplete: 'street-address',
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

    [inputFields.name.input_, inputFields.year.input_, inputFields.address.input_].forEach(el => {
        el.addEventListener('input', (ev) => {
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
            handleOfficeRequestSuccess(officeData);
            if (window.fbq) {
                fbq('trackCustom', 'Office Created')
            }

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



    history.pushState(history.state, null, basePathName + `${window.location.search}#choosePlan`)
    incrementProgress();
    choosePlan();

}

function choosePlan() {

    const officeData = onboarding_data_save.get();
    document.body.scrollTop = 0
    journeyHeadline.innerHTML = 'Choose your plan';

    const ul = createElement('ul', {
        className: 'mdc-list'
    });
    ul.setAttribute('role', 'radiogroup');
    const plans = [{
        amount: 999,
        duration: '3 Months',
        preferred: true
    }, {
        amount: 2999,
        duration: 'Year',
        preferred: false
    }];
    plans.forEach((plan, index) => {
        const li = createElement('li', {
            className: 'mdc-list-item plan-list'
        })
        li.setAttribute('role', 'radio');
        if (plan.preferred) {
            li.setAttribute('aria-checked', 'true');
            li.setAttribute('tabindex', '0');
        } else {
            li.setAttribute('aria-checked', 'false')
        }
        li.innerHTML = `
        <span class="mdc-list-item__ripple"></span>
        <span class="mdc-list-item__graphic">
        <div class="mdc-radio">
          <input class="mdc-radio__native-control"
                type="radio"
                id="plan-list-radio-item-${index}"
                name="plan-list-radio-item-group"
                value="${plan.amount}"
                ${plan.preferred ? 'checked':''}
                >
          <div class="mdc-radio__background">
            <div class="mdc-radio__outer-circle"></div>
            <div class="mdc-radio__inner-circle"></div>
          </div>
        </div>
      </span>
      <label class="mdc-list-item__text" for="plan-list-radio-item-${index}">${convertNumberToInr(plan.amount)} / ${plan.duration}</label>
        `
        new mdc.ripple.MDCRipple(li);
        ul.appendChild(li);
    })
    journeyContainer.innerHTML = '';
    journeyContainer.appendChild(ul);
    const ulInit = new mdc.list.MDCList(ul);
    console.log(ulInit);

    const nextBtn = nextButton();
    nextBtn.element.addEventListener('click', () => {
        nextBtn.setLoader();
        waitTillCustomClaimsUpdate(officeData.name, function () {
            onboarding_data_save.set({
                plan: plans[ulInit.selectedIndex].amount
            });

            history.pushState(history.state, null, basePathName + `${window.location.search}#payment`)
            incrementProgress();
            managePayment();
        })
    });
    actionsContainer.appendChild(nextBtn.element);
}

const convertNumberToInr = (amount) => {
    return Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount)
}

function managePayment() {
    const officeData = onboarding_data_save.get();

    document.body.scrollTop = 0
    journeyHeadline.innerHTML = 'Choose your payment method';
    console.log(officeData);

    const payment_modes = [{
        label: 'Add Debit/Credit/ATM Card',
        id: 'card'
    }, {

        label: 'Netbanking',
        id: 'netbanking'
    }, {

        label: 'UPI',
        id: 'upi'
    }, {

        label: 'Wallet',
        id: 'wallet'
    }]
    const div = createElement('form', {
        className: 'payment-form mdc-form'
    })
    let selectedMode;
    const nextBtn = nextButton('Pay '+ convertNumberToInr(officeData.plan));
    payment_modes.forEach((mode, index) => {

        const cont = createElement('div', {
            className: 'payment-mode'
        });


        const paymentModeCont = createElement('div', {
            className: 'full-width inline-flex',
            style: 'width:100%'
        })
        paymentModeCont.appendChild(createRadio(mode.id, mode.label))

        cont.appendChild(paymentModeCont);
        if (mode.id === 'card') {
            const cardsLogo = createElement('div', {
                className: 'cards-logo'
            })
            cardsLogo.appendChild(createElement('img', {
                src: './img/brand-logos/visa.png'
            }))
            cardsLogo.appendChild(createElement('img', {
                src: './img/brand-logos/master_card.png'
            }))
            cardsLogo.appendChild(createElement('img', {
                src: './img/brand-logos/maestro.png'
            }))
            cardsLogo.appendChild(createElement('img', {
                src: './img/brand-logos/amex.jpg'
            }))
            cardsLogo.appendChild(createElement('img', {
                src: './img/brand-logos/diners_club_intl_logo.jpg'
            }))
            cardsLogo.appendChild(createElement('img', {
                src: './img/brand-logos/RuPay.jpg'
            }))
            cont.appendChild(cardsLogo)
        }

        const expanded = createElement('div', {
            className: 'payment-mode--expand hidden'
        });

        paymentModeCont.addEventListener('click', () => {
            document.querySelectorAll('.payment-mode--selected').forEach(el => {
                el.classList.remove('payment-mode--selected')
            })
            cont.classList.add('payment-mode--selected');
            paymentModeCont.querySelector('.mdc-radio input').checked;

            document.querySelectorAll('.payment-mode--expand').forEach(el => {
                if (el) {
                    el.innerHTML = '';
                    el.classList.add('hidden')
                }
            })
            expanded.classList.remove('hidden')
            let view;
            if (mode.id === 'card') {
                view = cardMode();
            }
            if (mode.id === 'upi') {
                view = upiMode()
            };
            if (mode.id === 'wallet') {
                view = walletMode()

            }
            if (mode.id === 'netbanking') {
                view = netBankingMode();
            }
            selectedMode = view;
            selectedMode.method = mode.id;

            expanded.innerHTML = '';
            nextBtn.element.removeAttribute('disabled');
            expanded.appendChild(view.element);
        })
        cont.appendChild(expanded)
        div.appendChild(cont)
    });


    if (!selectedMode) {
        nextBtn.element.setAttribute('disabled', 'true');
    }
    nextBtn.element.addEventListener('click', () => {

        let isValid = false;
        nextBtn.setLoader();
        const method = selectedMode.method
        if (method === 'card') {
            isValid = isCardValid(selectedMode.fields);
        }
        if (method === 'upi') {
            isValid = isUpiValid(selectedMode.fields);

        }
        if (method === 'wallet') {
            isValid = isWalletValid(selectedMode.fields);
        }
        if (method === 'netbanking') {
            isValid = isNetbankingValid(selectedMode.fields);

        };

        if (!isValid) return nextBtn.removeLoader();


        CashFree.initPopup();
        getPaymentBody().then(paymentBody => {
            const cshFreeRes = CashFree.init({
                layout: {},
                mode: appKeys.getMode() === 'dev' ? "TEST" : "PROD",
                checkout: "transparent"
            });

            if (cshFreeRes.status !== "OK") {
                console.log(cshFreeRes);
                nextBtn.removeLoader();
                return
            };

            let cashFreeRequestBody;
            switch (method) {
                case 'card':
                    cashFreeRequestBody = getCardPaymentRequestBody(selectedMode.fields, paymentBody)
                    break;
                case 'netbanking':
                    cashFreeRequestBody = getNetbankingRequestBody(selectedMode.fields, paymentBody)
                    break;
                case 'upi':
                    cashFreeRequestBody = getUpiRequestBody(selectedMode.fields, paymentBody)
                    break;
                case 'wallet':
                    cashFreeRequestBody = getWalletRequestBody(selectedMode.fields, paymentBody)
                    break;
                default:
                    console.log("no payment option found")
                    break;
            }
            console.log(cashFreeRequestBody);
            CashFree.paySeamless(cashFreeRequestBody, function (ev) {
                cashFreePaymentCallback(ev, nextBtn,officeData.officeId)
            });
        }).catch(err=>{
            showSnacksApiResponse('An error occured. Try again later');
            nextBtn.removeLoader();
        })
    })
    actionsContainer.appendChild(nextBtn.element);

    journeyContainer.innerHTML = '';
    journeyContainer.appendChild(div);
}
/**
 * 
 * @param {object} fields
 * @returns {Boolean} 
 */
const isCardValid = (fields) => {
    if (!fields.holder.valid) {
        setHelperInvalid(fields.holder);
        return
    }
    if (!fields.cvv.valid) {
        setHelperInvalid(fields.cvv);
        return;
    }
    if (!isCardNumberValid(fields.number.value)) {
        setHelperInvalid(fields.number)
        return;
    }
    if (!fields.expiryMonth.value) {
        document.getElementById('expiry-label').textContent = 'Choose card expiry month'
        document.getElementById('expiry-label').classList.remove('hidden')
        return;
    }
    if (!fields.expiryYear.value) {
        document.getElementById('expiry-label').textContent = 'Choose card expiry year'
        document.getElementById('expiry-label').classList.remove('hidden')
        return;
    }
    return true;
}

const isUpiValid = (field) => {
    if (!field.vpa.valid) {
        setHelperInvalid(field.vpa);
        return
    }
    return true
};

const isWalletValid = (field) => {

    if (field.code.value === "Choose an option") {
        document.getElementById('wallet-helper-text').classList.remove('hidden')
        return
    }
    return true
}

const isNetbankingValid = (field) => {
    return field.code.valid;
}

const isCardNumberValid = (cardNumber) => {
    if (!cardNumber) return;
    const formattedNumber = cardNumber.split(" ").join("");
    const luhnValue = checkLuhn(formattedNumber);
    if (luhnValue == 0) return true;
    return false;
}




const getPaymentBody = () => {
    return new Promise((resolve, reject) => {
        const officeData = onboarding_data_save.get();
        const amount = officeData.plan;
        const d = new Date();
        if (amount === 999) {
            d.setMonth(d.getMonth() + 3);
        } else {
            d.setMonth(d.getMonth() + 12);
        }

        http('POST', `${appKeys.getBaseUrl()}/api/services/payment`, {
            orderAmount: amount,
            orderCurrency: 'INR',
            office: officeData.name,
            paymentType: "membership",
            paymentMethod: "pgCashfree",
            extendDuration: Date.parse(d),
            phoneNumber: firebase.auth().currentUser.phoneNumber
        }).then(res => {

            resolve({
                appId: appKeys.cashFreeId(),
                orderId: res.orderId,
                paymentToken: res.paymentToken,
                orderAmount: amount,
                customerName: firebase.auth().currentUser.displayName,
                customerPhone: firebase.auth().currentUser.phoneNumber,
                customerEmail: firebase.auth().currentUser.email,
                orderCurrency: 'INR',
                notifyUrl: appKeys.cashFreeWebhook()
            })
        }).catch(reject)
    })
}
// const cshFreeRes = CashFree.init({
//     layout: {
//         view: "popup",
//         width: "600"
//     },
//     mode: appKeys.getMode() === 'dev' ? "TEST" : "PROD",
//     checkout: "transparent"
// });
// if (cshFreeRes.status !== "OK") {
//     console.log(cshFreeRes);
//     return
// };

/**
 * Handle card payment
 * @param {Object} cardFields 
 * @param {Object} paymentBody 
 */
const getCardPaymentRequestBody = (cardFields, paymentBody) => {
    paymentBody.paymentOption = 'card';
    paymentBody.card = {
        number: cardFields.number.value.split(" ").join(""),
        expiryMonth: cardFields.expiryMonth.value,
        expiryYear: cardFields.expiryYear.value,
        cvv: cardFields.cvv.value,
        holder: cardFields.holder.value
    };
    return paymentBody

}

const getNetbankingRequestBody = (nbFields, paymentBody) => {

    paymentBody.paymentOption = "nb";
    paymentBody.nb = {
        code: nbFields.code.value
    }
    return paymentBody;
}
const getUpiRequestBody = (upiFields, paymentBody) => {
    paymentBody.paymentOption = 'upi';
    paymentBody.upi = {
        vpa: upiFields.vpa.value
    };
    return paymentBody;
}
const getWalletRequestBody = (walletFields, paymentBody) => {
    paymentBody.paymentOption = 'wallet';
    paymentBody.wallet = {
        code: walletFields.code.value
    };
    return paymentBody

}

const cashFreePaymentCallback = (ev, nextBtn,officeId) => {
    console.log(ev)

    if (ev.name === "VALIDATION_ERROR") {
        showSnacksApiResponse('An error occured. Try again later');
        nextBtn.removeLoader();
        return
    }
    showTransactionDialog(ev.response,officeId);
}

const showTransactionDialog = (paymentResponse,officeId) => {

    const dialog = new mdc.dialog.MDCDialog(document.getElementById('payment-dialog'));
    const dialogTitle = document.getElementById('payment-dialog-title');
    const dialogBtn = document.getElementById('payment-next-btn');
    dialogTitle.textContent = 'PAYMENT ' + paymentResponse.txStatus;
    dialogBtn.addEventListener('click', () => {
        if (paymentResponse.txStatus === 'SUCCESS') {
            dialog.close();
            if (new URLSearchParams(window.location.search).get('new_user')) {
                history.pushState(history.state, null, basePathName + `${window.location.search}#employees`);
                addEmployeesFlow();
                incrementProgress();
                return
            };

            setTimeout(()=>{
                http('GET',`${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${officeId}/`).then(res=>{
                    localStorage.setItem('office_updated_old',JSON.stringify(res));
                    // const tx = window.database.transaction("activities","readwrite");
                    // const store = tx.objectStore("activities");
                    // store.put(res).onsuccess = function() {
                        redirect('/admin/')
                    // } 
                })
            },1000)
            return
        }
        dialog.close();
        managePayment();
    })
    if (paymentResponse.txStatus === 'SUCCESS') {
        dialogTitle.classList.add('mdc-theme--success');
        dialogBtn.classList.add('mdc-button--raised-success');
        dialogBtn.querySelector('.mdc-button__label').textContent = 'CONTINUE'
    } else {
        dialogTitle.classList.add('mdc-theme--error')
        dialogBtn.classList.add('mdc-button--raised-error');
        dialogBtn.querySelector('.mdc-button__label').textContent = 'RETRY'

    }


    document.getElementById('txn-status').textContent = paymentResponse.txStatus;
    document.getElementById('txn-order-id').textContent = paymentResponse.orderId;
    document.getElementById('txn-amount').textContent = paymentResponse.orderAmount;
    document.getElementById('txn-ref-id').textContent = paymentResponse.referenceId;
    document.getElementById('txn-mode').textContent = paymentResponse.paymentMode;
    document.getElementById('txn-msg').textContent = paymentResponse.txMsg
    document.getElementById('txn-time').textContent = paymentResponse.txTime


    dialog.scrimClickAction = "";
    console.log(dialog)

    dialog.open();
}

const cardMode = () => {

    const cont = createElement('div', {
        className: 'payment-mode--card'
    });


    const grid = createElement('div', {
        className: 'mdc-layout-grid'
    });
    const inner = createElement('div', {
        className: 'mdc-layout-grid__inner'
    });



    const nameCont = createElement('div', {
        className: 'mdc-layout-grid__cell mdc-layout-grid__cell--span-4'
    });

    const nameField = textFieldOutlinedWithoutLabel({
        id: 'card-name',
        required: true,
        placeholder: 'Name',
        autocomplete: 'cc-name'
    });
    nameCont.appendChild(createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: 'Card holder',
        style: 'height:37px'
    }));
    nameCont.appendChild(nameField);
    nameCont.appendChild(textFieldHelper('Card holder name is incorrect'));

    const numberCont = createElement('div', {
        className: 'mdc-layout-grid__cell mdc-layout-grid__cell--span-5-desktop'
    });

    const numberField = textFieldOutlinedWithoutLabel({
        id: 'card-number',
        required: true,
        indicator: 'Card number',
        field: 'number',
        placeholder: 'Number',
        autocomplete: 'cc-number',
        type: 'tel'
    });
    numberCont.appendChild(createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: 'Card number',
        style: 'height:37px'
    }));
    numberCont.appendChild(numberField);
    numberCont.appendChild(textFieldHelper('Card number is incorrect'));

    const expiryCont = createElement('div', {
        className: 'mdc-layout-grid__cell--span-3 expiry-cont'
    });
    const expiryInner = createElement('div', {
        className: 'inline-flex mt-10 full-width',
        style: 'width:100%'
    });


    const monthSelect = createElement('select', {
        className: 'mr-10 expiry-select',
        autocomplete: 'cc-exp-month',
        style:'border:1px rgb(171,171,171) solid; border-radius: 5px; outline-color: rgb(45,75,113);'
    })

    monthSelect.appendChild(createElement('option', {
        value: "",
        textContent: 'MM',
        attrs: {
            disabled: "true",
            selected: "true"
        }
    }))
    for (var i = 1; i <= 12; i++) {
        let month = i;
        if (i < 10) {
            month = '0' + i
        }
        const option = createElement('option', {
            value: month,
            textContent: month
        })
        monthSelect.appendChild(option);
    }
    expiryInner.appendChild(monthSelect);

    const yearSelect = createElement('select', {
        className: 'expiry-select',
        autocomplete: 'cc-exp-year',
        style:'border:1px rgb(171,171,171) solid; border-radius: 5px; outline-color: rgb(45,75,113);'
    })
    yearSelect.appendChild(createElement('option', {
        value: "",
        textContent: 'YYYY',
        attrs: {
            disabled: "true",
            selected: "true"
        }
    }))
    for (var i = 2020; i <= 2040; i++) {
        const option = createElement('option', {
            value: i,
            textContent: i
        })
        yearSelect.appendChild(option);
    }
    expiryInner.appendChild(yearSelect);

    expiryCont.appendChild(createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: 'Card expiry',
        style: 'height:37px'
    }));


    const cvvCont = createElement('div', {
        className: 'mdc-layout-grid__cell mdc-layout-grid__cell--span-4'
    });

    const cvvField = textFieldOutlinedWithoutLabel({
        id: 'card-cvv',
        placeholder: 'CVV',
        autocomplete: 'cc-csc',
        type: 'password',
        maxlength: 4
    });
    cvvCont.appendChild(createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: 'Card CVV',
        style: 'height:37px'
    }));
    cvvCont.appendChild(cvvField);
    cvvCont.appendChild(textFieldHelper('CVV is incorrect'));



    expiryCont.appendChild(expiryInner)
    expiryCont.appendChild(createElement('label', {
        className: 'expiry-valid--label mdc-theme--error hidden',
        id: 'expiry-label',
        style: 'font-size:0.75rem'
    }))
    inner.appendChild(nameCont);
    inner.appendChild(numberCont);
    inner.appendChild(expiryCont);
    inner.appendChild(cvvCont);


    grid.appendChild(inner)
    cont.appendChild(grid);

    const numberFieldInit = new mdc.textField.MDCTextField(numberField);

    numberFieldInit.input_.addEventListener('keyup', (ev) => {
        console.log(ev.currentTarget.value);
        ev.currentTarget.value = ev.currentTarget.value.replace(/[^0-9 \,]/, '')

        const value = ev.currentTarget.value.split(" ").join("");
        const length = value.length;
        if (!length) {
            ev.preventDefault();
            return
        }
        if (ev.keyCode == 8) return
        if (Number(length) % 4 == 0) {
            ev.currentTarget.value += ' '
        }

    })
    const fields = {
        number: numberFieldInit,
        holder: new mdc.textField.MDCTextField(nameField),
        expiryMonth: monthSelect,
        expiryYear: yearSelect,
        cvv: new mdc.textField.MDCTextField(cvvField),
    }

    return {
        element: cont,
        fields,
    }
}





const netBankingMode = () => {
    const banks = {
        "Allahabad Bank": 3001,
        "Andhra Bank": 3002,
        "Andhra Bank Corporate": 3070,
        "Axis Bank": 3003,
        "Axis Bank Corporate": 3071,
        "Bank of Baroda - Corporate": 3060,
        "Bank of Baroda - Retail": 3005,
        "Bank of India": 3006,
        "Bank of Maharashtra": 3007,
        "Canara Bank": 3009,
        "Catholic Syrian Bank": 3010,
        "Central Bank of India": 3011,
        "City Union Bank": 3012,
        "Corporation Bank": 3013,
        "DBS Bank Ltd": 3017,
        "DCB Bank - Corporate": 3062,
        "DCB Bank - Personal": 3018,
        "Dena Bank": 3015,
        "Deutsche Bank": 3016,
        "Dhanlakshmi Bank Corporate": 3072,
        "Dhanlakshmi Bank": 3019,
        "Equitas Small Finance Bank": 3076,
        "Federal Bank": 3020,
        "HDFC Bank": 3021,
        "ICICI Bank": 3022,
        "ICICI Corporate Netbanking": 3073,
        "IDBI Bank": 3023,
        "IDFC Bank": 3024,
        "Indian Bank": 3026,
        "Indian Overseas Bank": 3027,
        "IndusInd Bank": 3028,
        "Jammu and Kashmir Bank": 3029,
        "Karnataka Bank Ltd": 3030,
        "Karur Vysya Bank": 3031,
        "Kotak Mahindra Bank": 3032,
        "Laxmi Vilas Bank - Retail Net Banking": 3033,
        "Oriental Bank of Commerce": 3035,
        "Punjab & Sind Bank": 3037,
        "Punjab National Bank - Corporate": 3065,
        "Punjab National Bank - Retail": 3038,
        "Ratnakar Corporate Banking": 3074,
        "RBL Bank": 3039,
        "Saraswat Bank": 3040,
        "Shamrao Vithal Bank Corporate": 3075,
        "South Indian Bank": 3042,
        "Standard Chartered Bank": 3043,
        "State Bank Of India": 3044,
        "Syndicate Bank": 3050,
        "Tamilnad Mercantile Bank Ltd": 3052,
        "UCO Bank": 3054,
        "Union Bank of India": 3055,
        "United Bank of India": 3056,
        "Vijaya Bank": 3057,
        "Yes Bank Ltd": 3058,

    };
    if (appKeys.getMode() === 'dev') {
        banks['TEST Bank'] = 3333
    };

    const cont = createElement('div', {
        className: 'payment-mode--nb'
    });
    const keys = Object.keys(banks)
    const select = createDialogSelect('netbanking-select', banks);
    const selectInit = new mdc.select.MDCSelect(select);
    select.addEventListener('click', () => {
        const dialog = new mdc.dialog.MDCDialog(document.getElementById('netbanking-dialog'));

        const ul = document.getElementById('bank-list');
        ul.innerHTML = ''
        keys.forEach((bank, index) => {
            const li = createElement('li', {
                className: 'mdc-list-item'
            })
            if (index == 0) {
                li.classList.add('mdc-dialog__button--default')
            }
            li.dataset.bank = bank
            li.dataset.mdcDialogAction = "accept";

            li.setAttribute('role', 'radio');

            li.innerHTML = `
            <span class="mdc-list-item__ripple"></span>
            <span class="mdc-list-item__graphic">
            <div class="mdc-radio">
              <input class="mdc-radio__native-control"
                    type="radio"
                    id="bank-list-radio-item-${index}"
                    name="bank-list-radio-item-group"
                    value="${banks[bank]}">
              <div class="mdc-radio__background">
                <div class="mdc-radio__outer-circle"></div>
                <div class="mdc-radio__inner-circle"></div>
              </div>
            </div>
          </span>
          <label class="mdc-list-item__text" for="bank-list-radio-item-${index}">${bank}</label>
            `
            new mdc.ripple.MDCRipple(li);
            li.addEventListener('click', () => {
                selectInit.value = banks[bank].toString();
                selectInit.selectedText.textContent = bank;
            })
            ul.appendChild(li);
        })
        console.log(dialog)
        const input = document.getElementById('search-bank');
        input.addEventListener('input', (ev) => {
            const value = ev.currentTarget.value.trim().toLowerCase();
            ul.childNodes.forEach(child => {
                if (child.dataset.bank.toLowerCase().indexOf(value) == -1) {
                    child.classList.add('hidden');
                } else {
                    child.classList.remove('hidden');
                }

            })
        })
        dialog.open();
    })
    cont.appendChild(select);

    const fields = {
        code: selectInit
    };

    return {
        element: cont,
        fields,
    }
}



const walletMode = () => {
    const wallets = {
        "FreeCharge": 4001,
        "MobiKwik": 4002,
        "Ola Money": 4003,
        "Reliance Jio Money": 4004,
        "Airtel Money": 4006,
    };

    const cont = createElement('div', {
        className: 'payment-mode--wallet'
    });
    const select = createDialogSelect('wallet-select', wallets);



    const selectInit = new mdc.select.MDCSelect(select);
    select.addEventListener('click', () => {
        const dialog = new mdc.dialog.MDCDialog(document.getElementById('wallet-dialog'));

        const ul = document.getElementById('wallet-list');
        ul.innerHTML = ''
        Object.keys(wallets).forEach((wallet, index) => {
            const li = createElement('li', {
                className: 'mdc-list-item'
            })
            if (index == 0) {
                li.classList.add('mdc-dialog__button--default')

            }
            li.dataset.mdcDialogAction = "accept";

            li.setAttribute('role', 'radio');

            li.innerHTML = `
            <span class="mdc-list-item__ripple"></span>
            <span class="mdc-list-item__graphic">
            <div class="mdc-radio">
              <input class="mdc-radio__native-control"
                    type="radio"
                    id="wallet-list-radio-item-${index}"
                    name="wallet-list-radio-item-group"
                    value="${wallet}">
              <div class="mdc-radio__background">
                <div class="mdc-radio__outer-circle"></div>
                <div class="mdc-radio__inner-circle"></div>
              </div>
            </div>
          </span>
          <label class="mdc-list-item__text" for="wallet-list-radio-item-${index}">${wallet}</label>
            `
            new mdc.ripple.MDCRipple(li);
            li.addEventListener('click', () => {
                console.log(selectInit);

                selectInit.value = wallets[wallet].toString();
                selectInit.selectedText.textContent = wallet;
            })
            ul.appendChild(li);
        })
        console.log(dialog)
        dialog.focusTrap_.options.initialFocusEl = ul.children[0];
        dialog.open();
    });
    cont.appendChild(select);
    cont.appendChild(createElement('div', {
        className: 'mdc-theme--error hidden',
        textContent: 'Please choose an option',
        style: 'font-size:0.75rem',
        id: 'wallet-helper-text',
    }))
    return {
        element: cont,
        fields: {
            code: selectInit
        }
    }
};

const upiMode = () => {
    const cont = createElement('div', {
        className: 'payment-mode--upi'
    });
    const label = createElement('div', {
        className: 'onboarding-content--text mdc-typography--headline6',
        textContent: 'Enter UPI ID'
    })
    const tf = textFieldOutlinedWithoutLabel({
        required: true,
        placeholder: 'MobileNumber@upi'
    });
    cont.appendChild(label);
    cont.appendChild(tf);
    cont.appendChild(textFieldHelper('UPI ID is incorrect'));
    const fields = {
        vpa: new mdc.textField.MDCTextField(tf)
    }
    return {
        element: cont,
        fields,
    }
}

/**
 * user luhn algorithm to validate card number
 * @param {String} serialNumber 
 */
const checkLuhn = (serialNumber) => {
    let totalSum = 0;
    let isSecond = false;
    for (let i = serialNumber.length - 1; i >= 0; i--) {
        if (isSecond) {
            const double = Number(serialNumber[i]) * 2
            let indivialSum;
            if (double > 9) {
                indivialSum = Number(double.toString()[0]) + Number(double.toString()[1]);
            } else {
                indivialSum = double
            }
            totalSum += indivialSum;
            console.log(indivialSum)
        } else {
            totalSum = totalSum + Number(serialNumber[i])
        }
        isSecond = !isSecond
    }
    return totalSum % 10
}

const createContainedButton = (icon, label) => {

    const button = createElement('button', {
        className: 'mdc-button mdc-button--raised'
    });
    button.innerHTML = `<div class="mdc-button__ripple"></div>
    <span class="mdc-button__label">${label}</span>
    <i class="material-icons mdc-button__icon" aria-hidden="true">${icon}</i>`
    new mdc.ripple.MDCRipple(button);
    return button
}

const createRadio = (id, labelText) => {
    const frag = document.createDocumentFragment();

    const radio = createElement('div', {
        className: 'mdc-radio'
    })
    radio.innerHTML = `<input class="mdc-radio__native-control" type="radio" id="${id}" name="radios">
    <div class="mdc-radio__background">
      <div class="mdc-radio__outer-circle"></div>
      <div class="mdc-radio__inner-circle"></div>
    </div>
    <div class="mdc-radio__ripple"></div>`
    frag.appendChild(radio)
    const label = createElement('label', {
        textContent: labelText,
        className: 'full-width'
    });
    label.setAttribute('for', id);
    frag.appendChild(label);
    return frag;
}

const createDialogSelect = (id, data) => {
    const select = createElement('div', {
        className: 'mdc-select mdc-select--outlined mdc-select--no-label mdc-select--required',
        id: id
    });
    select.innerHTML = `<div class="mdc-select__anchor" aria-required="true">
    <span class="mdc-notched-outline">
        <span class="mdc-notched-outline__leading"></span>
        <span class="mdc-notched-outline__trailing"></span>
    </span>
    <span class="mdc-select__selected-text">Choose an option</span>
    <span class="mdc-select__dropdown-icon">
        <svg
            class="mdc-select__dropdown-icon-graphic"
            viewBox="7 10 10 5" focusable="false">
        <polygon
            class="mdc-select__dropdown-icon-inactive"
            stroke="none"
            fill-rule="evenodd"
            points="7 10 12 15 17 10">
        </polygon>
        <polygon
            class="mdc-select__dropdown-icon-active"
            stroke="none"
            fill-rule="evenodd"
            points="7 15 12 10 17 15">
        </polygon>
        </svg>
    </span>
</div>`
    const selectMenu = createElement('div', {
        className: 'mdc-select__menu mdc-menu mdc-menu-surface mdc-menu-surface--fullwidth hidden',
    })
    const ul = createElement('ul', {
        className: 'mdc-list'
    })
    const defaultOption = createElement('li', {
        className: 'mdc-list-item mdc-list-item--disabled mdc-list-item--selected',
        attrs: {
            'aria-selected': 'true'
        }
    })

    defaultOption.innerHTML = `<span class="mdc-list-item__ripple"></span>
    <span class="mdc-list-item__text">Choose an option</span>
    `
    defaultOption.dataset.value = "Choose an option";

    ul.appendChild(defaultOption);

    Object.keys(data).forEach(item => {
        const li = createElement('li', {
            className: 'mdc-list-item'
        })
        li.dataset.value = data[item];

        li.innerHTML = `<span class="mdc-list-item__ripple"></span>
        <span class="mdc-list-item__text">${item}</span>
        `
        ul.appendChild(li)
    });
    selectMenu.appendChild(ul)
    select.appendChild(selectMenu);
    return select;

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
        className: 'image-cont'
    })
    imageCont.style.backgroundImage = `url("${base64}")`

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
            schedule: [{
                endTime: 0,
                startTime: 0,
                name: 'Membership'
            }],
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

        if (new URLSearchParams(window.location.search).get('new_user')) {
            listConnectionNames();
            return
        }

        http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${onboarding_data_save.get().name}&field=roles`).then(response => {
            const phoneNumbers = {}
            const admin = response.roles.admin || [];
            const subs = response.roles.subscription || [];
            const employees = response.roles.employees || [];

            const usersData = [...admin, ...subs, ...employees];
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
                return getAllContacts(response.result.nextPageToken, result, currentEmployees).then(resolve)
            };
            return resolve(result);
        })
    })
}

function listConnectionNames(currentEmployees) {
    const ul = document.getElementById("contacts-list");
    const ulInit = new mdc.list.MDCList(ul);
    const importedNumber = document.querySelector('.imported-number');
    const contactLabel = document.querySelector('.contact-list--label');
    const searchContainer = document.querySelector('.search-bar--container');
    const selectedPeople = document.querySelector('.selected-people');
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
        };

        if (importedNumber) {
            importedNumber.innerHTML = `Imported ${length} contacts`
        }
        if (contactLabel) {
            contactLabel.innerHTML = 'Manager';
        }
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
            if (searchContainer) {
                searchContainer.appendChild(searchBar.root);
            }
        };


        ulInit.foundation.isCheckboxList_ = true;
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
                if (selectedPeople) {
                    selectedPeople.innerHTML = `${Object.keys(selected).length == 0 ? '' : `${Object.keys(selected).length} Contacts selected`}`;
                }
            } else {
                switchControl.disabled = false;
                const selectedContact = JSON.parse(el.dataset.value);
                selectedContact.isAdmin = switchControl.checked;
                selected[el.dataset.name] = selectedContact;
                if (selectedPeople) {
                    selectedPeople.innerHTML = `${Object.keys(selected).length} Contacts selected`;
                }
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
            shareLink = response.shortLink
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
                history.pushState(history.state, null, basePathName + `${window.location.search}#completed`);
                incrementProgress();
                onboardingSucccess(shareLink)

            }).catch(err => {
                nxtButton.removeLoader();
            })
            return
        }
        history.pushState(history.state, null, basePathName + `${window.location.search}#completed`);
        onboardingSucccess(shareLink)
    });
    actionsContainer.appendChild(nxtButton.element);
}



const onboardingSucccess = (shareLink) => {
    const isNewUser = new URLSearchParams(window.location.search).get('new_user');

    journeyHeadline.innerHTML = isNewUser ? 'Account creation successful!' : 'Account updated successful';
    localStorage.setItem("completed", "true")
    journeyContainer.innerHTML = `
    <div class='completion-container'>
    <h1 class='onboarding-headline--secondary mt-0 mb-0'>Congratulations you can now start tracking your employees</h1>

    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
    <a type="button" class="mdc-button mdc-dialog__button mdc-button--raised" data-mdc-dialog-action="close" href="/admin/?new_user=1" style="    width: 200px;
    margin: 0 auto;
    display: flex;
    text-align: center;
    margin-top: 20px;
    margin-bottom: 20px;
    height: 48px;
    font-size: 21px;">
        <div class="mdc-button__ripple"></div>
        <span class="mdc-button__label">Continue</span>
    </a>
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
    actionsContainer.innerHTML = '';
    fbq('trackCustom', 'Onboarding Completed');
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
        value: attrs.value || '',
        placeholder: attrs.placeholder || ''
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
const textFieldHelper = (message) => {
    const div = createElement('div', {
        className: 'mdc-text-field-helper-line',
    })
    div.innerHTML = `<div class="mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg" aria-hidden="true">${message || ''}</div>`
    return div
}
