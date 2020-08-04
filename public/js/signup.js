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
        case 'completed':
            onboardingSucccess();
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
    journeyPrevBtn.classList.add('hidden')
    journeyHeadline.textContent = 'Welcome to easy tracking! Lets get started. Enter your details';


    const nameField = textFieldOutlined({
        required: true,
        label: 'Name',
        autocomplete: "name",
        value: firebase.auth().currentUser.displayName || ''
    });


    const emailField = textFieldOutlined({
        required: true,
        label: 'Email',
        autocomplete: "email",
        type: 'email',
        value: firebase.auth().currentUser.email || ''

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
            history.pushState(history.state, null, basePathName + `#category`);

        }).catch(function (error) {
            console.log(error)
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
                setHelperInvalid(otherCateogryInput, 'Enter a cateogry')
                return
            }
            setHelperValid(otherCateogryInput);
            selectedCategoryName = otherCateogryInput.value;
        }
        onboarding_data_save.set({
            'category': selectedCategoryName
        })
        officeFlow();
        history.pushState(history.state, null, basePathName + `#office`);
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

function officeFlow() {
    journeyBar.progress = 0.60

    journeyHeadline.innerHTML = 'Tell us more about your company';
    const officeContainer = createElement('div', {
        className: 'office-container'
    })
    const companyName = textFieldOutlined({
        required: true,
        label: 'Name',
        id: 'company-name',
        autocomplete: 'organization'
    })
    const year = textFieldOutlined({
        type: 'number',
        label: 'Established in',
        id: 'year',
        autocomplete: 'bday-year',
        max: new Date().getFullYear(),
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
                logo.value = '';
                //remove image container;
                imageCont.remove();
                //reset companyLogo variable
                companyLogo = null;
            })
            imageCont.appendChild(removeImage)
            logoCont.appendChild(imageCont);
        }).catch(console.error);
    })
    actionCont.appendChild(logoText);
    actionCont.appendChild(logo);
    logoCont.appendChild(actionCont);
    const address = textAreaOutlined({
        required: true,
        label: 'Address',
        autocomplete: 'address-line1',
        id: 'address',
        rows: 4,
        cols: 8
    })
    const pincode = textFieldOutlined({
        required: true,
        type: 'number',
        label: 'PIN code',
        autocomplete: 'postal-code'
    });
    const description = textAreaOutlined({
        label: 'Description',
        rows: 4,
        cols: 8,
        id: 'description'
    })

    const frag = document.createDocumentFragment();
    officeContainer.appendChild(companyName);
    officeContainer.appendChild(textFieldHelper())
    officeContainer.appendChild(year);
    officeContainer.appendChild(textFieldHelper())
    officeContainer.appendChild(logoCont);
    officeContainer.appendChild(address);
    officeContainer.appendChild(textFieldHelper())
    officeContainer.appendChild(pincode);
    officeContainer.appendChild(textFieldHelper())
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
        console.log('typing');
        if (!inputFields.description.value.trim()) {
            inputFields.description.input_.dataset.typed = "no";
        } else {
            inputFields.description.input_.dataset.typed = "yes";
        }
    })
    inputFields.name.input_.addEventListener('input', handleOfficeDescription)
    inputFields.year.input_.addEventListener('input', handleOfficeDescription)
    inputFields.address.input_.addEventListener('input', handleOfficeDescription)

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
            companyLogo,
        }

        nxtButton.setLoader();
        http('POST', `${appKeys.getBaseUrl()}/api/services/office`, Object.assign(onboarding_data_save.get(),officeData))
        .then(function (res) {
            officeData.officeId = res.officeId;
            onboarding_data_save.set(officeData)
        // save officeFlow data

        // set new office created name in local storage. Used in /app 
        localStorage.setItem('selected_office', officeData.name);

        addEmployeesFlow()
        history.pushState(history.state, null, basePathName + '#employees')
      
        // fbq('trackCustom', 'Office Created')
        // analyticsApp.logEvent('office_created', {
        //     location: officeData.registeredOfficeAddress
        // });
        sendAcqusition();
        })
        .catch(function (error) {

            console.log(error);
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
            if(error.message === 'The entered PinCode is not valid') {
                field = inputFields.pincode;
                message = 'PIN code is not correct';
            }

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
    document.body.scrollTop = 0

    // inputFields.name.input_.addEventListener('focus',()=>{
    //     setTimeout(() => {
    //         document.body.scrollTop = 80
    //     }, 600);
    // })
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

const handleOfficeDescription = () => {
    const nameEl = document.querySelector('#company-name input');
    const year = document.querySelector('#year input');
    const address = document.querySelector('#address');
    const description = document.querySelector('#description');
    const category = onboarding_data_save.get().category;
    if (!nameEl.value) return;
    if (description.dataset.typed === "yes") return;
    let string = `${nameEl.value} is ${prefixForVowel(category)} ${category} business ${address.value ? `, based out of  ${address.value}`:''} ${year.value > 0 ? `. They have been providing their services since ${year.value}`:''}`;
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
        console.error(JSON.stringify(error, null, 2));
    });
};

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        //   authorizeButton.style.display = 'none';
        //   signoutButton.style.display = 'block';
        document.getElementById('authorize_button').remove();
        console.log("logged in");
        listConnectionNames();
    } else {
        //   authorizeButton.style.display = 'block';
        //   signoutButton.style.display = 'none';
        console.log("logged out");
    }
}

const getAllContacts = (pageToken, result = {
    data: {},
    indexes: []
}) => {
    return new Promise((resolve, reject) => {


        if (localStorage.getItem('contacts')) {
            return resolve(JSON.parse(localStorage.getItem('contacts')))
        }
        gapi.client.people.people.connections.list({
            'resourceName': 'people/me',
            'pageSize': 100,
            'personFields': 'names,emailAddresses,phoneNumbers,photos',
            pageToken: pageToken || ''
        }).then(response => {
            var connections = response.result.connections;

            if (connections.length > 0) {
                for (i = 0; i < connections.length; i++) {
                    var person = connections[i];
                    if (person.names && person.names.length > 0 && person.phoneNumbers && person.phoneNumbers.length > 0) {
                        if (person.phoneNumbers[0].canonicalForm) {
                            const key = `${person.phoneNumbers[0].canonicalForm}${person.names[0].displayName.toLowerCase()}`
                            result.data[key] = {
                                displayName: person.names[0].displayName,
                                phoneNumber: person.phoneNumbers[0].canonicalForm,
                                photoURL: person.photos[0].url || './img/person.png'
                            }
                            result.indexes.push(key)

                        }
                    }
                }
            };

            if (response.result.nextPageToken && Object.keys(result).length < response.result.totalItems) {
                return getAllContacts(response.result.nextPageToken, result).then(resolve)
            };
            return resolve(result);
        })
    })
}

function listConnectionNames() {
    const ul = document.getElementById("contacts-list");
    const ulInit = new mdc.list.MDCList(ul);
    const selected = {}
    getAllContacts().then(contactData => {
        localStorage.setItem('contacts', JSON.stringify(contactData));
        const length = contactData.indexes.length;
        document.querySelector('.imported-number').innerHTML = `Imported ${length} contacts`
        document.querySelector('.contact-list--label').innerHTML = 'Manager';
        if (length >= 10) {
            const searchBar = new mdc.textField.MDCTextField(textFieldOutlined({
                label: 'Search your contacts'
            }));

            searchBar.input_.addEventListener('input', () => {
                searchDebounce(function () {
                    console.log("run input")
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
                    if (matchFound > 10) {
                        document.querySelector('.next-contacts--container').innerHTML = `Showing 10 out of ${matchFound} results`
                    }
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
            console.log(ev.detail);
            console.log(ulInit)
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
            onboarding_data_save.set({users:selected})
            console.log(selected);
        })
    })
}

const appendContacts = () => {

    const li = userList(contactData.data[item], index);
    const switchControl = new mdc.switchControl.MDCSwitch(li.querySelector('.mdc-switch'));

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
    journeyHeadline.innerHTML = 'Add your employees using any one of these methods.';
    // 1. Load the JavaScript client library.
    gapi.load('client', start);

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
    authorize.addEventListener('click', () => {
        gapi.auth2.getAuthInstance().signIn();
    })

    authorizeContainer.appendChild(authorize);
    authorizeContainer.appendChild(text);

    const employeesContainer = createElement('div', {
        className: 'employees-container'
    })

    const selectionContainer = createElement('div', {
        className: 'user-selection'
    })
    const nextSelection = createElement('div', {
        className: 'next-contacts--container'
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
    selectionContainer.appendChild(nextSelection);

    const shareContainer = createElement('div', {
        className: 'share-container'
    })
    shareContainer.appendChild(shareWidget('https://growthfile.page.link/naxz'))
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
            Object.keys(selectedUsers).forEach(user=>{
                array.push(selectedUsers[user])
            })
            http('POST', `${appKeys.getBaseUrl()}/api/services/addUsers`, {office:onboarding_data_save.get().name,users:array}).then(res=>{
                nxtButton.removeLoader();
                onboardingSucccess()
                history.pushState(history.state,null,basePathName+'#completed');

            }).catch(err=>{
            })
            return
        }
        onboardingSucccess()
    });
    actionsContainer.appendChild(nxtButton.element);
}

const onboardingSucccess = () => {
    journeyBar.progress = 1
    journeyHeadline.innerHTML = 'Account creation successful! You can now start tracking your employees with OnDuty.';
    journeyContainer.innerHTML = `<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>`
    // waitTillCustomClaimsUpdate(onboarding_data_save.get().name,function(){
    //     console.log('claim updated')
    // })
}


const onboarding_data_save = function () {
    return {
        init: function () {
            const saved = this.get();
            if(!saved) {
                localStorage.setItem('onboarding_data', JSON.stringify({}))
                return
            }
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
        id: attrs.id || ''
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
        <span class="mdc-floating-label">${attrs.label}</span>
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
    label.innerHTML = `<span class="mdc-notched-outline">
    <span class="mdc-notched-outline__leading"></span>
    <span class="mdc-notched-outline__notch">
      <span class="mdc-floating-label">${attr.label}</span>
    </span>
    <span class="mdc-notched-outline__trailing"></span>
</span>
<span class="mdc-text-field__resizer">
    <textarea class="mdc-text-field__input" rows="${attr.rows}" cols="${attr.cols}" aria-label="Label" id="${attr.id || ''}" ${attr.required ? 'required':''} ${attr.autocomplete ? `autocomplete = ${attr.autocomplete}`:''}></textarea>
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