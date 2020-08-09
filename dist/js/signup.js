"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
    if (force !== void 0) force = !!force;

    if (this.hasAttribute(name)) {
      if (force) return true;
      this.removeAttribute(name);
      return false;
    }

    if (force === false) return false;
    this.setAttribute(name, "");
    return true;
  };
}

;
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
  firebase.auth().onAuthStateChanged(function (user) {
    // if user is logged out.
    if (user) {
      // history.pushState(history.state, null, basePathName + `#`)
      initJourney();
      return;
    }

    redirect('/');
  });
}); // root element into which view will get updated

var journeyContainer = document.getElementById("journey-container");
var journeyHeadline = document.getElementById('journey-text'); // cta-actions container;

var actionsContainer = document.querySelector('.cta-actions'); // prev button

var journeyPrevBtn = document.getElementById('journey-prev'); // linearProgressBar for onboarding

var journeyBar = new mdc.linearProgress.MDCLinearProgress(document.getElementById('onboarding-progress')); // default path name;

var basePathName = window.location.pathname;
/**
 * On clicking back navigation in browser or previous button,
 * browser history will pop current state &
 * load the prev view
 */

window.addEventListener('popstate', function (ev) {
  if (localStorage.getItem('completed') === "true") {
    for (var i = 0; i < 50; i++) {
      history.pushState(history.state, null, null);
    }

    ;
    localStorage.removeItem("completed");
    redirect("/");
    return;
  }

  ;
  var hash = window.location.hash;
  var fnName = hash.replace('#', '');

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
      redirect('/join');
      break;
  }
});
/**
 *  progress value is set from 0 to 1
 *  there are 6 onboarding steps . so each increment and decrement is updated by 
 *  0.16666666666666666
 */

/**
 * 
 * Increment progress bar by 1/6th
 */

var incrementProgress = function incrementProgress() {
  journeyBar.progress = journeyBar.foundation_.progress_ + 0.16666666666666666;
};
/**
 * 
 * Decrement progress bar by 1/6th
 */


var decrementProgress = function decrementProgress() {
  journeyBar.progress = journeyBar.foundation_.progress_ - 0.16666666666666666;
};

var initJourney = function initJourney() {
  onboarding_data_save.init();
  journeyPrevBtn.addEventListener('click', function (e) {
    history.back();
  });
  firebase.auth().currentUser.getIdTokenResult().then(function (idTokenResult) {
    if (!isAdmin(idTokenResult)) {
      onboarding_data_save.set({
        status: 'PENDING'
      });
      history.pushState(history.state, null, basePathName + "?new_user=1#welcome");
      initFlow();
      return;
    }

    ;
    journeyHeadline.innerHTML = 'How would you like to start';
    var admins = idTokenResult.claims.admin;
    var ul = createElement("ul", {
      className: 'mdc-list existing-companies--list'
    });
    ul.setAttribute('role', 'radiogroup');
    ul.appendChild(officeList('Create a new company', 0));
    ul.appendChild(createElement('div', {
      className: 'onboarding-headline--secondary mb-10 mt-10',
      textContent: 'Modify existing company'
    }));
    admins.forEach(function (admin, index) {
      index++;
      var li = officeList(admin, index);
      ul.appendChild(li);
      ul.appendChild(createElement('li', {
        className: 'mdc-list-divider'
      }));
    });
    var nxtButton = nextButton();
    nxtButton.element.disabled = true;
    var ulInit = new mdc.list.MDCList(ul);
    ulInit.listen('MDCList:action', function (ev) {
      nxtButton.element.disabled = false;
    });
    journeyContainer.innerHTML = '';
    journeyContainer.appendChild(ul);
    nxtButton.element.addEventListener('click', function () {
      var selectedIndex = ulInit.selectedIndex; // create new company list is selected

      if (selectedIndex == 0) {
        history.pushState(history.state, null, basePathName + "?new_user=1#welcome");
        initFlow();
        return;
      }

      ;
      nxtButton.setLoader();
      http('GET', "".concat(appKeys.getBaseUrl(), "/api/myGrowthfile?office=").concat(admins[selectedIndex - 1], "&field=types")).then(function (response) {
        localStorage.removeItem('completed');
        var officeData = response.types.filter(function (type) {
          return type.template === "office";
        })[0];

        if (!officeData) {
          nxtButton.removeLoader();
          ulInit.root_.insertBefore(createElement('div', {
            className: 'list-error',
            textContent: 'Try after some time'
          }), ulInit.listElements[selectedIndex].nextSibling);
          return;
        }

        ;
        var data = {
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
        onboarding_data_save.set({
          status: 'COMPLETED'
        });
        history.pushState(history.state, null, basePathName + "#welcome");
        initFlow();
      }).catch(function (err) {
        nxtButton.removeLoader();
      });
    });
    actionsContainer.appendChild(nxtButton.element);
  }).catch(console.error); // load first view
};

var officeList = function officeList(name, index) {
  var li = createElement('li', {
    className: 'mdc-list-item'
  });
  li.setAttribute('role', 'radio');
  li.setAttribute('aria-checked', 'false');
  li.innerHTML = "<span class=\"mdc-list-item__graphic\">\n    <div class=\"mdc-radio\">\n      <input class=\"mdc-radio__native-control\"\n            type=\"radio\"\n            id=\"list-radio-item-".concat(index, "\"\n            name=\"demo-list-radio-item-group\"\n            value=\"1\">\n      <div class=\"mdc-radio__background\">\n        <div class=\"mdc-radio__outer-circle\"></div>\n        <div class=\"mdc-radio__inner-circle\"></div>\n      </div>\n    </div>\n  </span>\n  <label class=\"mdc-list-item__text\" for=\"demo-list-radio-item-1\">").concat(name, "</label>\n  ");
  new mdc.ripple.MDCRipple(li);
  return li;
};

var nextButton = function nextButton() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Next';

  if (document.getElementById('journey-next')) {
    document.getElementById('journey-next').remove();
  }

  var button = createElement('button', {
    className: 'mdc-button mdc-button--raised',
    id: 'journey-next'
  });
  button.innerHTML = " <div class=\"mdc-button__ripple\"></div>\n        <span class=\"mdc-button__label\">".concat(text, "</span>\n        <div class='straight-loader button hidden'></div>\n        ");
  new mdc.ripple.MDCRipple(button);
  return {
    element: button,
    setLoader: function setLoader() {
      button.style.pointerEvents = 'none';
      button.querySelector('.straight-loader').classList.remove('hidden');
      button.querySelector('.mdc-button__label').classList.add('hidden');
    },
    removeLoader: function removeLoader() {
      button.style.pointerEvents = 'all';
      button.querySelector('.straight-loader').classList.add('hidden');
      button.querySelector('.mdc-button__label').classList.remove('hidden');
    }
  };
};

function initFlow() {
  journeyBar.progress = 0; // if(new URLSearchParams(window.location.search).get("new_user") ) {
  //     journeyPrevBtn.classList.add('hidden')
  // }
  // else {

  journeyPrevBtn.classList.remove('hidden'); // }

  journeyHeadline.textContent = 'Welcome to easy tracking';
  var secondaryText = createElement('div', {
    className: 'onboarding-headline--secondary',
    textContent: 'Lets get started! Enter your details'
  });
  var nameTitle = createElement('div', {
    className: 'onboarding-content--text',
    textContent: 'Name'
  });
  var emailTitle = createElement('div', {
    className: 'onboarding-content--text mdc-typography--headline6',
    textContent: 'Email'
  });
  var nameField = textFieldOutlinedWithoutLabel({
    required: true,
    autocomplete: "name",
    value: firebase.auth().currentUser.displayName || ''
  });
  var emailField = textFieldOutlinedWithoutLabel({
    required: true,
    autocomplete: "email",
    type: 'email',
    value: firebase.auth().currentUser.email || ''
  });
  var frag = document.createDocumentFragment();
  frag.appendChild(secondaryText);
  frag.appendChild(nameTitle);
  frag.appendChild(nameField);
  frag.appendChild(textFieldHelper());
  frag.appendChild(emailTitle);
  frag.appendChild(emailField);
  frag.appendChild(textFieldHelper());
  var nameFieldInit = new mdc.textField.MDCTextField(nameField);
  var emailFieldInit = new mdc.textField.MDCTextField(emailField);
  var nextBtn = nextButton();
  nextBtn.element.addEventListener('click', function (ev) {
    if (!nameFieldInit.value) {
      setHelperInvalid(nameFieldInit, 'Enter your name');
      return;
    }

    if (!emailFieldInit.value) {
      setHelperInvalid(emailFieldInit, 'Enter your email');
      return;
    }

    setHelperValid(nameFieldInit);
    setHelperValid(emailFieldInit);
    var firstContact = {
      displayName: nameFieldInit.value,
      email: emailFieldInit.value,
      phoneNumber: firebase.auth().currentUser.phoneNumber
    };
    nextBtn.setLoader();
    handleAuthUpdate(firstContact).then(function () {
      onboarding_data_save.set({
        firstContact: firstContact
      });
      history.pushState(history.state, null, basePathName + "".concat(window.location.search, "#category"));
      categoryFlow();
      journeyPrevBtn.classList.remove('hidden');
    }).catch(function (error) {
      nextBtn.removeLoader();
      var message = getEmailErrorMessage(error);

      if (message) {
        setHelperInvalid(emailFieldInit, message);
        return;
      }

      sendErrorLog({
        message: authError.message,
        stack: authError.stack
      });
    });
  });
  journeyContainer.innerHTML = '';
  journeyContainer.appendChild(frag);
  actionsContainer.appendChild(nextBtn.element);
  nameFieldInit.input_.addEventListener('focus', function () {
    setTimeout(function () {
      document.body.scrollTop = 80;
    }, 600);
  });
}

function categoryFlow() {
  journeyBar.progress = 0.40;
  document.body.scrollTop = 0;
  journeyHeadline.innerHTML = 'Choose the category that fits your business best';
  var grid = createElement('div', {
    className: 'mdc-layout-grid'
  });
  var container = createElement('div', {
    className: 'category-container mdc-layout-grid__inner'
  });
  var selectedDiv;
  var otherCateogryInput;
  var nextBtn = nextButton();
  nextBtn.element.disabled = true;
  categoriesDataset().forEach(function (category) {
    var div = createElement('div', {
      className: 'category-box mdc-card mdc-elevation--z4 mdc-layout-grid__cell--span-2-phone mdc-layout-grid__cell'
    });
    div.dataset.name = category.name;
    var svgCont = createElement('div', {
      className: 'cateogry-icon'
    });
    category.icon.then(function (svg) {
      svgCont.innerHTML = svg;
    });
    var text = createElement('div', {
      className: 'category-text',
      textContent: category.name
    });
    div.appendChild(svgCont);
    div.appendChild(text);
    div.addEventListener('click', function (ev) {
      if (selectedDiv) {
        selectedDiv.classList.remove('category-active');
      }

      selectedDiv = div;
      selectedDiv.classList.add('category-active');

      if (document.querySelector('.input-div')) {
        document.querySelector('.input-div').remove();
      }

      ;

      if (category.name === 'Others') {
        var field = categoryInputField(container, '');
        otherCateogryInput = field;
        field.root_.scrollIntoView();
      }

      ;
      nextBtn.element.disabled = false;
    });
    container.appendChild(div);
  });
  grid.appendChild(container);
  nextBtn.element.addEventListener('click', function () {
    var selectedCategoryName = selectedDiv.dataset.name;

    if (selectedCategoryName === 'Others') {
      if (!otherCateogryInput.value) {
        setHelperInvalid(otherCateogryInput, 'Enter a category');
        return;
      }

      setHelperValid(otherCateogryInput);
      selectedCategoryName = otherCateogryInput.value;
    } // onboarding_data_save.set({
    //     'category': selectedCategoryName
    // })


    history.pushState(history.state, null, basePathName + "".concat(window.location.search, "#office"));
    officeFlow(selectedCategoryName);
  });
  actionsContainer.appendChild(nextBtn.element);
  journeyContainer.innerHTML = '';
  journeyContainer.appendChild(grid);

  if (onboarding_data_save.get().category) {
    var el = container.querySelector("[data-name=\"".concat(onboarding_data_save.get().category, "\"]"));

    if (!el) {
      el = container.querySelector("[data-name=\"Others\"]");
      var field = categoryInputField(container, onboarding_data_save.get().category);
      otherCateogryInput = field;
      field.root_.scrollIntoView();
    }

    el.classList.add('category-active');
    selectedDiv = el;
    nextBtn.element.disabled = false;
  }
}

var categoryInputField = function categoryInputField(container, inputValue) {
  var inputDiv = createElement('div', {
    className: 'input-div mt-10 mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-12-desktop'
  });
  var inputField = textFieldOutlined({
    type: 'text',
    required: true,
    value: inputValue,
    label: 'Enter your cateogry',
    id: 'other-category-input'
  });
  inputDiv.appendChild(inputField);
  inputDiv.appendChild(textFieldHelper());
  container.appendChild(inputDiv);
  return new mdc.textField.MDCTextField(inputField);
};

var categoriesDataset = function categoriesDataset() {
  var categories = [{
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
  }];
  return categories;
};

var svgLoader = function svgLoader(source) {
  return new Promise(function (resolve, reject) {
    if (!window.fetch) {
      var request = new XMLHttpRequest();
      request.open('GET', source);
      request.setRequestHeader('Content-Type', 'image/svg+xml');

      request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
          resolve(request.responseText);
          return;
        }
      };

      request.send();
      return;
    }

    fetch(source, {
      headers: new Headers({
        'content-type': 'image/svg+xml',
        mode: 'no-cors'
      }),
      method: 'GET'
    }).then(function (response) {
      return response.text();
    }).then(resolve);
  });
};

function officeFlow() {
  var category = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : onboarding_data_save.get().category;
  journeyBar.progress = 0.60;
  journeyHeadline.innerHTML = 'Tell us about your company';
  var officeContainer = createElement('div', {
    className: 'office-container'
  });
  var savedData = onboarding_data_save.get();
  var companyName = textFieldOutlinedWithoutLabel({
    required: true,
    id: 'company-name',
    autocomplete: 'organization',
    value: savedData.name || ''
  });
  var year = textFieldOutlined({
    type: 'number',
    label: 'Year',
    id: 'year',
    autocomplete: 'bday-year',
    max: new Date().getFullYear(),
    value: savedData.yearOfEstablishment || '',
    min: 1
  });
  var logoCont = createElement('div', {
    className: 'logo-container'
  });
  var actionCont = createElement('div');
  var logoText = createElement('div', {
    className: 'logo-text',
    textContent: 'Company logo'
  });
  var logo = createElement('input', {
    type: 'file',
    accept: 'image/*'
  });
  var companyLogo; // open file explorer and get image

  logo.addEventListener('change', function (ev) {
    getImageBase64(ev).then(function (base64) {
      companyLogo = base64;

      if (document.querySelector('.image-cont')) {
        document.querySelector('.image-cont').remove();
      }

      logoCont.appendChild(createImage(companyLogo, logo, companyLogo));
    }).catch(console.error);
  });
  actionCont.appendChild(logoText);
  actionCont.appendChild(logo);
  logoCont.appendChild(actionCont);

  if (savedData.companyLogo) {
    companyLogo = savedData.companyLogo;
    logoCont.appendChild(createImage(companyLogo, logo, companyLogo));
  }

  ;
  var address = textAreaOutlined({
    required: true,
    label: 'Address',
    autocomplete: 'address-line1',
    id: 'address',
    rows: 2,
    value: savedData.registeredOfficeAddress || '',
    cols: 8
  });
  var pincode = textFieldOutlinedWithoutLabel({
    required: true,
    type: 'number',
    label: 'PIN code',
    autocomplete: 'postal-code',
    value: savedData.pincode || ''
  });
  var description = textAreaOutlined({
    label: 'Description',
    rows: 4,
    cols: 8,
    id: 'description',
    value: savedData.description || ''
  });
  var frag = document.createDocumentFragment();
  officeContainer.appendChild(createElement('div', {
    className: 'onboarding-content--text mdc-typography--headline6',
    textContent: "Company name"
  }));
  officeContainer.appendChild(companyName);
  officeContainer.appendChild(textFieldHelper());
  officeContainer.appendChild(createElement('div', {
    className: 'onboarding-content--text mdc-typography--headline6',
    textContent: "When was your company established ?"
  }));
  officeContainer.appendChild(year);
  officeContainer.appendChild(textFieldHelper());
  officeContainer.appendChild(logoCont);
  officeContainer.appendChild(createElement('div', {
    className: 'onboarding-content--text mdc-typography--headline6',
    textContent: "Company's address"
  }));
  officeContainer.appendChild(address);
  officeContainer.appendChild(textFieldHelper());
  officeContainer.appendChild(createElement('div', {
    className: 'onboarding-content--text mdc-typography--headline6',
    textContent: "PIN code"
  }));
  officeContainer.appendChild(pincode);
  officeContainer.appendChild(textFieldHelper());
  officeContainer.appendChild(createElement('div', {
    className: 'onboarding-content--text mdc-typography--headline6',
    textContent: "Description"
  }));
  officeContainer.appendChild(description);
  officeContainer.appendChild(textFieldHelper());
  frag.appendChild(officeContainer);
  var inputFields = {
    name: new mdc.textField.MDCTextField(companyName),
    address: new mdc.textField.MDCTextField(address),
    year: new mdc.textField.MDCTextField(year),
    pincode: new mdc.textField.MDCTextField(pincode),
    description: new mdc.textField.MDCTextField(description)
  };
  /**
   * handle listeners for name,year & Address field to autofill description;
   * 
   */

  inputFields.description.input_.addEventListener('input', function () {
    if (!inputFields.description.value.trim()) {
      inputFields.description.input_.dataset.typed = "no";
    } else {
      inputFields.description.input_.dataset.typed = "yes";
    }
  });
  [inputFields.name.input_, inputFields.year.input_, inputFields.address.input_].forEach(function (el) {
    el.addEventListener('input', function (ev) {
      handleOfficeDescription(category);
    });
  });
  var nxtButton = nextButton();
  nxtButton.element.addEventListener('click', function () {
    if (!inputFields.name.value) {
      setHelperInvalid(inputFields.name, 'Enter your company name');
      return;
    }

    ;

    if (!inputFields.address.value) {
      setHelperInvalid(inputFields.address, 'Enter your company address');
      return;
    }

    ;

    if (!isValidPincode(inputFields.pincode.value)) {
      setHelperInvalid(inputFields.pincode, 'Enter correct PIN code');
      return;
    }

    ;

    if (inputFields.year.value && !isValidYear(inputFields.year.value)) {
      setHelperInvalid(inputFields.year, 'Enter correct year');
      return;
    }

    var officeData = {
      name: inputFields.name.value,
      registeredOfficeAddress: inputFields.address.value,
      pincode: inputFields.pincode.value,
      description: inputFields.description.value,
      yearOfEstablishment: inputFields.year.value,
      companyLogo: companyLogo || "",
      category: category,
      template: 'office'
    };

    if (!shouldProcessRequest(savedData, officeData)) {
      handleOfficeRequestSuccess(officeData);
      return;
    }

    var officeRequest = createRequestBodyForOffice(officeData);
    nxtButton.setLoader();
    sendOfficeRequest(officeRequest).then(function (res) {
      if (res.officeId) {
        officeData.officeId = res.officeId;
      }

      handleOfficeRequestSuccess(officeData);
      fbq('trackCustom', 'Office Created');
      sendAcqusition();
    }).catch(function (error) {
      nxtButton.removeLoader();
      var field;
      var message;

      if (error.message === "Office with the name '".concat(officeData.name, "' already exists")) {
        field = inputFields.name;
        message = "".concat(officeData.name, " already exists. Choose a differnt company name");
      }

      if (error.message === "Invalid registered address: '".concat(officeData.registeredOfficeAddress, "'")) {
        field = inputFields.address;
        message = "Enter a valid company address";
      }

      if (error.message === 'Pincode is not valid') {
        field = inputFields.pincode;
        message = 'PIN code is not correct';
      }

      ;

      if (field) {
        setHelperInvalid(field, message);
        return;
      }

      ;
      sendErrorLog({
        message: error.message,
        stack: error.stack
      });
    });
  });
  journeyContainer.innerHTML = '';
  journeyContainer.appendChild(frag);
  actionsContainer.appendChild(nxtButton.element);
  document.body.scrollTop = 0;
}

;

var sendOfficeRequest = function sendOfficeRequest(officeRequest, retry) {
  return new Promise(function (resolve, reject) {
    if (officeRequest.method === 'PUT') {
      http(officeRequest.method, officeRequest.endpoint, officeRequest.data).then(resolve).catch(function (err) {
        if (err.message !== "unauthorized") return reject(err);
        retry++;

        if (retry > 3) {
          return reject(err);
        }

        setTimeout(function () {
          return sendOfficeRequest(officeRequest, retry).then(resolve).catch(reject);
        }, 1000);
      });
      return;
    }

    http(officeRequest.method, officeRequest.endpoint, officeRequest.data).then(resolve).catch(reject);
  });
};

var handleOfficeRequestSuccess = function handleOfficeRequestSuccess(officeData) {
  onboarding_data_save.set({
    'category': officeData.category
  });
  onboarding_data_save.set(officeData);
  history.pushState(history.state, null, basePathName + "".concat(window.location.search, "#employees"));
  addEmployeesFlow();
};
/**
 * Check if office request body has any changes
 * @param {object} savedData 
 * @param {object} officeData 
 * @returns {Boolean} match
 */


var shouldProcessRequest = function shouldProcessRequest(savedData, officeData) {
  var match = false;
  Object.keys(officeData).forEach(function (key) {
    if (officeData[key] !== savedData[key]) {
      match = true;
    }
  });
  return match;
};

var createImage = function createImage(base64, inputFile, companyLogo) {
  var imageCont = createElement('div', {
    className: 'image-cont'
  });
  imageCont.style.backgroundImage = "url(\"".concat(base64, "\")");
  var removeImage = createElement('i', {
    className: 'material-icons remove',
    textContent: 'delete'
  }); //remove image

  removeImage.addEventListener('click', function () {
    //reset logo
    inputFile.value = ''; //remove image container;

    imageCont.remove(); //reset companyLogo variable

    companyLogo = null;
  });
  imageCont.appendChild(removeImage);
  return imageCont;
};
/**
 * creates request for creating/updating an office
 * @param {object} officeData 
 * @returns {object} req
 */


var createRequestBodyForOffice = function createRequestBodyForOffice(officeData) {
  var url = "".concat(appKeys.getBaseUrl(), "/api/services/office");
  var savedData = onboarding_data_save.get();
  var req = {
    endpoint: url,
    data: '',
    method: 'POST'
  };

  if (onboarding_data_save.get().name === officeData.name) {
    url = "".concat(appKeys.getBaseUrl(), "/api/activities/update");
    var template = {
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
    };
    req.endpoint = url;
    req.data = template;
    req.method = 'PUT';
    return req;
  }

  ;
  officeData.firstContact = savedData.firstContact;
  req.data = officeData;
  return req;
};
/**
 * Checks for a valid PIN code. should be 6 digits number only
 * @param {string} pincode 
 * @returns {Boolean} 
 */


var isValidPincode = function isValidPincode(pincode) {
  return /^[1-9][0-9]{5}$/.test(Number(pincode));
};
/**
 * Checks if year is valid . should be number only
 * @param {string} pincode 
 * @returns {Boolean} 
 */


var isValidYear = function isValidYear(year) {
  return /^\d+$/.test(year);
};

var handleOfficeDescription = function handleOfficeDescription(category) {
  var nameEl = document.querySelector('#company-name input');
  var year = document.querySelector('#year input');
  var address = document.querySelector('#address');
  var description = document.querySelector('#description');
  new mdc.textField.MDCTextField(description.parentNode.parentNode);
  if (!nameEl.value) return;
  if (description.dataset.typed === "yes") return;
  var string = "".concat(nameEl.value, " is ").concat(prefixForVowel(category), " ").concat(category, " company ").concat(address.value ? ", based out of  ".concat(address.value) : '', " ").concat(year.value > 0 ? ". They have been in business since ".concat(year.value) : '');
  description.value = string;
};
/**
 *  returns a/an if a string first character is a vowel
 * @param {string} string
 * @returns {string} a/an
 */


var prefixForVowel = function prefixForVowel(string) {
  var firstChar = string.charAt(0); //vowel regex test

  if (!/A|a|E|e|I|i|O|o|U|u/i.test(firstChar)) {
    return 'a';
  }

  return 'an';
};

var start = function start() {
  // 2. Initialize the JavaScript client library.
  gapi.client.init({
    'apiKey': appKeys.getKeys().apiKey,
    // clientId and scope are optional if auth is not required.
    'clientId': appKeys.getGoogleClientId(),
    'discoveryDocs': ["https://www.googleapis.com/discovery/v1/apis/people/v1/rest"],
    'scope': 'https://www.googleapis.com/auth/contacts.readonly'
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus); // Handle the initial sign-in state.

    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  }, function (error) {
    var el = document.getElementById('authorize-error');

    if (error.details === "Cookies are not enabled in current environment.") {
      el.innerHTML = 'Google contacts will not work when cookies are disabled. If you are in incognito , Please leave it.';
      return;
    }

    el.innerHTML = error.details;
  });
};

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    document.getElementById('authorize_button').remove();
    document.getElementById('onboarding-headline-contacts').remove();

    if (new URLSearchParams(window.location.search).get('new_user')) {
      listConnectionNames();
      return;
    }

    http('GET', "".concat(appKeys.getBaseUrl(), "/api/myGrowthfile?office=").concat(onboarding_data_save.get().name, "&field=roles")).then(function (response) {
      var phoneNumbers = {};
      var admin = response.roles.admin || [];
      var subs = response.roles.subscription || [];
      var employees = response.roles.employees || [];
      var usersData = [].concat(_toConsumableArray(admin), _toConsumableArray(subs), _toConsumableArray(employees));
      usersData.forEach(function (data) {
        phoneNumbers[data.attachment['Phone Number'].value] = {
          phoneNumber: data.attachment['Phone Number'].value,
          displayName: '',
          photo: '',
          isAdmin: data.template === "admin" ? true : false
        };
      });
      listConnectionNames(phoneNumbers);
    }).catch(function (err) {
      listConnectionNames();
    });
  } else {
    //   authorizeButton.style.display = 'block';
    //   signoutButton.style.display = 'none';
    console.log("logged out");
  }
}

var getAllContacts = function getAllContacts(pageToken, result, currentEmployees) {
  return new Promise(function (resolve, reject) {
    // if (localStorage.getItem('contacts')) {
    //     return resolve(JSON.parse(localStorage.getItem('contacts')))
    // }
    gapi.client.people.people.connections.list({
      'resourceName': 'people/me',
      'pageSize': 100,
      'personFields': 'names,emailAddresses,phoneNumbers,photos',
      pageToken: pageToken || ''
    }).then(function (response) {
      var connections = response.result.connections;
      if (!connections.length) return resolve(result);
      connections.forEach(function (person) {
        if (person.names && person.names.length > 0 && person.phoneNumbers && person.phoneNumbers.length > 0 && person.phoneNumbers[0].canonicalForm) {
          if (currentEmployees && currentEmployees[person.phoneNumbers[0].canonicalForm]) return;
          var key = "".concat(person.phoneNumbers[0].canonicalForm).concat(person.names[0].displayName.toLowerCase());
          result.data[key] = {
            displayName: person.names[0].displayName,
            phoneNumber: person.phoneNumbers[0].canonicalForm,
            photoURL: person.photos[0].url || './img/person.png'
          };
          result.indexes.push(key);
        }
      });

      if (response.result.nextPageToken) {
        return getAllContacts(response.result.nextPageToken, result, currentEmployees).then(resolve);
      }

      ;
      return resolve(result);
    });
  });
};

function listConnectionNames(currentEmployees) {
  var ul = document.getElementById("contacts-list");
  var ulInit = new mdc.list.MDCList(ul);
  var importedNumber = document.querySelector('.imported-number');
  var contactLabel = document.querySelector('.contact-list--label');
  var searchContainer = document.querySelector('.search-bar--container');
  var selectedPeople = document.querySelector('.selected-people');
  var selected = {};
  getAllContacts(null, {
    data: {},
    indexes: []
  }, currentEmployees).then(function (contactData) {
    // localStorage.setItem('contacts', JSON.stringify(contactData));
    var length = contactData.indexes.length;

    if (!length) {
      document.getElementById('authorize-error').innerHTML = 'No Contacts found !. Use share link to invite your employees';
      return;
    }

    ;

    if (importedNumber) {
      importedNumber.innerHTML = "Imported ".concat(length, " contacts");
    }

    if (contactLabel) {
      contactLabel.innerHTML = 'Manager';
    }

    if (length >= 10) {
      var searchBar = new mdc.textField.MDCTextField(textFieldOutlined({
        label: 'Search your contacts'
      }));
      searchBar.input_.addEventListener('input', function () {
        searchDebounce(function () {
          var value = searchBar.value.toLowerCase();
          var matchFound = 0;
          var frag = document.createDocumentFragment();
          contactData.indexes.forEach(function (item, index) {
            if (item.indexOf(value) > -1) {
              matchFound++;

              if (matchFound < 10) {
                var li = userList(contactData.data[item], index);
                var switchControl = new mdc.switchControl.MDCSwitch(li.querySelector('.mdc-switch'));

                if (selected[item]) {
                  li.querySelector('.mdc-checkbox__native-control').checked = true;
                  li.setAttribute('aria-checked', "true");
                  li.setAttribute('tabindex', "0");
                  switchControl.checked = true;
                }

                frag.appendChild(li);
                li.querySelector('span:nth-child(3)').innerHTML = "<img src='".concat(contactData.data[item].photoURL, "' data-name=\"").concat(contactData.data[item].displayName, "\" class='contact-photo' onerror=\"contactImageError(this);\"></img>");
              }

              ;
            }
          });
          ul.innerHTML = '';
          ul.appendChild(frag);
        }, 1000);
      });

      if (searchContainer) {
        searchContainer.appendChild(searchBar.root_);
      }
    }

    ;
    ulInit.foundation_.isCheckboxList_ = true;

    for (var i = 0; i < 5; i++) {
      var element = contactData.indexes[i];
      var li = userList(contactData.data[element], i);
      var switchControl = new mdc.switchControl.MDCSwitch(li.querySelector('.mdc-switch'));
      switchControl.disabled = true;
      ul.appendChild(li);
      li.querySelector('span:nth-child(3)').innerHTML = "<img src='".concat(contactData.data[element].photoURL, "' data-name=\"").concat(contactData.data[element].displayName, "\" class='contact-photo' onerror=\"contactImageError(this);\"></img>");
    }

    ulInit.listen('MDCList:action', function (ev) {
      var el = ulInit.listElements[ev.detail.index];
      var switchControl = new mdc.switchControl.MDCSwitch(el.querySelector('.mdc-switch'));

      if (ulInit.selectedIndex.indexOf(ev.detail.index) == -1) {
        switchControl.disabled = true;
        switchControl.checked = false;
        delete selected[el.dataset.name];

        if (selectedPeople) {
          selectedPeople.innerHTML = "".concat(Object.keys(selected).length == 0 ? '' : "".concat(Object.keys(selected).length, " Contacts selected"));
        }
      } else {
        switchControl.disabled = false;
        var selectedContact = JSON.parse(el.dataset.value);
        selectedContact.isAdmin = switchControl.checked;
        selected[el.dataset.name] = selectedContact;

        if (selectedPeople) {
          selectedPeople.innerHTML = "".concat(Object.keys(selected).length, " Contacts selected");
        }
      }

      onboarding_data_save.set({
        users: selected
      });
    });
  });
}

var timerId;

var searchDebounce = function searchDebounce(func, delay) {
  clearTimeout(timerId);
  timerId = setTimeout(func, delay);
};

function contactImageError(image) {
  var tag = createElement('span');
  tag.dataset.letters = image.dataset.name.charAt(0);
  image.parentNode.replaceChild(tag, image);
  image.onerror = "";
  image.remove();
  return true;
}

var userList = function userList(contact, index) {
  var li = createElement('li', {
    className: 'mdc-list-item'
  });
  li.dataset.name = "".concat(contact.phoneNumber).concat(contact.displayName.toLowerCase());
  li.dataset.value = JSON.stringify(contact);
  li.setAttribute('role', 'checkbox');
  li.setAttribute('tabindex', "-1");
  li.setAttribute('aria-checked', "false");
  li.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n      <span class=\"mdc-list-item__graphic\">\n        <div class=\"mdc-checkbox\">\n            <input type=\"checkbox\"\n                    class=\"mdc-checkbox__native-control\"\n                    id=\"contact-list-checkbox-item-".concat(index, "\"  />\n            <div class=\"mdc-checkbox__background\">\n                <svg class=\"mdc-checkbox__checkmark\"\n                        viewBox=\"0 0 24 24\">\n                    <path class=\"mdc-checkbox__checkmark-path\"\n                        fill=\"none\"\n                        d=\"M1.73,12.91 8.1,19.28 22.79,4.59\"/>\n                </svg>\n                <div class=\"mdc-checkbox__mixedmark\"></div>\n            </div>\n        </div>\n    </span>\n\n    <span class=\"mdc-list-item__graphic\">\n     \n    </span>\n    <label class=\"mdc-list-item__text\" for=\"contact-list-checkbox-item-").concat(index, "\">\n        <span class=\"mdc-list-item__primary-text\">").concat(contact.displayName, "</span>\n        <span class=\"mdc-list-item__secondary-text\">").concat(contact.phoneNumber, "</span>\n    </label>\n    <span class='mdc-list-item__meta'>\n        <div class=\"mdc-switch\">\n            <div class=\"mdc-switch__track\"></div>\n            <div class=\"mdc-switch__thumb-underlay\">\n                <div class=\"mdc-switch__thumb\"></div>\n                <input type=\"checkbox\" id=\"basic-switch-").concat(index, "\" class=\"mdc-switch__native-control\" role=\"switch\" aria-checked=\"false\">\n            </div>\n        </div>\n    </span>\n      ");
  return li;
};

function addEmployeesFlow() {
  journeyBar.progress = 0.80;
  journeyHeadline.innerHTML = 'Add employees by using any one of these methods'; // 1. Load the JavaScript client library.

  gapi.load('client', start);
  var secondaryTextContacts = createElement('div', {
    className: 'onboarding-headline--secondary',
    id: 'onboarding-headline-contacts',
    textContent: 'Import from Google contacts'
  });
  var authorizeContainer = createElement('div', {
    className: 'import-cont'
  });
  var text = createElement('h2');
  text.innerHTML = "<span  class=\"line-center\">Or</span>";
  var authorize = createElement('button', {
    className: 'mdc-button mdc-button--raised',
    id: 'authorize_button',
    textContent: 'Import from Google contacts'
  });
  var authorizeError = createElement('div', {
    className: 'mdc-theme--error authorize-failed',
    id: 'authorize-error'
  });
  authorize.addEventListener('click', function () {
    gapi.auth2.getAuthInstance().signIn();
  });
  authorizeContainer.appendChild(secondaryTextContacts);
  authorizeContainer.appendChild(authorize);
  authorizeContainer.appendChild(authorizeError);
  var employeesContainer = createElement('div', {
    className: 'employees-container'
  });
  var selectionContainer = createElement('div', {
    className: 'user-selection'
  });
  var importedText = createElement('div', {
    className: 'imported-number'
  });
  var selectedPeople = createElement('div', {
    className: 'selected-people mdc-typography--headline5'
  });
  var searchCont = createElement('div', {
    className: 'search-bar--container'
  });
  var contactListLabel = createElement('div', {
    className: 'contact-list--label mdc-typography--headline6'
  });
  var ul = createElement('ul', {
    className: 'mdc-list mdc-list--two-line mdc-list--avatar-list',
    id: 'contacts-list'
  });
  ul.setAttribute('aria-label', 'List with checkbox items');
  ul.setAttribute('role', 'group');
  selectionContainer.appendChild(selectedPeople);
  selectionContainer.appendChild(searchCont);
  selectionContainer.appendChild(contactListLabel);
  selectionContainer.appendChild(ul);
  selectionContainer.appendChild(importedText);
  var shareContainer = createElement('div', {
    className: 'share-container'
  });
  var officeName = onboarding_data_save.get().name;
  var loader = createElement('div', {
    className: 'straight-loader'
  });
  shareContainer.appendChild(loader);
  var shareLink;
  waitTillCustomClaimsUpdate(officeName, function () {
    getShareLink(onboarding_data_save.get().name).then(function (response) {
      var secondaryTextShareLink = createElement('div', {
        className: 'onboarding-headline--secondary',
        textContent: 'Invite employees by sharing this download link with them.'
      });
      shareLink = response.shortLink;
      loader.remove();
      shareContainer.appendChild(text);
      shareContainer.appendChild(secondaryTextShareLink);
      shareContainer.appendChild(shareWidget(shareLink));
    }).catch(console.error);
  });
  employeesContainer.appendChild(selectionContainer);
  employeesContainer.appendChild(authorizeContainer);
  employeesContainer.appendChild(shareContainer);
  journeyContainer.innerHTML = '';
  journeyContainer.appendChild(employeesContainer);
  var nxtButton = nextButton();
  nxtButton.element.addEventListener('click', function () {
    var selectedUsers = onboarding_data_save.get().users;

    if (selectedUsers && Object.keys(selectedUsers).length > 0) {
      nxtButton.setLoader();
      var array = [];
      Object.keys(selectedUsers).forEach(function (user) {
        array.push(selectedUsers[user]);
      });
      http('POST', "".concat(appKeys.getBaseUrl(), "/api/services/addUsers"), {
        office: onboarding_data_save.get().name,
        users: array
      }).then(function (res) {
        nxtButton.removeLoader();
        history.pushState(history.state, null, basePathName + "".concat(window.location.search, "#completed"));
        onboardingSucccess(shareLink);
      }).catch(function (err) {
        nxtButton.removeLoader();
      });
      return;
    }

    history.pushState(history.state, null, basePathName + "".concat(window.location.search, "#completed"));
    onboardingSucccess(shareLink);
  });
  actionsContainer.appendChild(nxtButton.element);
}
/**
 * Gets the share link for and office. 
 * Retries 3 times if link fails to fetch
 * @param {string} office 
 * @param {string} retry 
 */


var getShareLink = function getShareLink(office) {
  return new Promise(function (resolve, reject) {
    http('POST', "".concat(appKeys.getBaseUrl(), "/api/services/shareLink"), {
      office: office
    }).then(resolve).catch(reject);
  });
};

var onboardingSucccess = function onboardingSucccess(shareLink) {
  var isNewUser = new URLSearchParams(window.location.search).get('new_user');
  fbq('trackCustom', 'Onboarding Completed');
  journeyBar.progress = 1;
  journeyHeadline.innerHTML = isNewUser ? 'Account creation successful!' : 'Account updated successful';
  localStorage.setItem("completed", "true");
  journeyContainer.innerHTML = "\n    <div class='completion-container'>\n    <h1 class='onboarding-headline--secondary mt-0 mb-0'>Congratulations you can now start tracking your employees</h1>\n    <svg class=\"checkmark\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 52 52\"><circle class=\"checkmark__circle\" cx=\"26\" cy=\"26\" r=\"25\" fill=\"none\"/><path class=\"checkmark__check\" fill=\"none\" d=\"M14.1 27.2l7.1 7.2 16.7-16.8\"/></svg>\n        <p class='mdc-typography--headline5 text-center mb-0 mt-0' style='padding-top:10px;border-top:1px solid #ccc'>Download the app and try it</p>\n        <div class=\"full-width\">\n          <div style=\"width: 300px;display: block;margin: 0 auto;\">\n            <div style=\"width: 100%;display: inline-flex;align-items: center;\">\n              <div class=\"play-store\">\n                <a\n                  href=\"https://play.google.com/store/apps/details?id=com.growthfile.growthfileNew&amp;pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1\"><img\n                    alt=\"Get it on Google Play\"\n                    src=\"https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png\"></a>\n              </div>\n              <div class=\"app-store full-width\">\n                <a href=\"https://apps.apple.com/in/app/growthfile-gps-attendance-app/id1441388774?mt=8\"\n                  style=\"display:inline-block;overflow:hidden;background:url(https://linkmaker.itunes.apple.com/en-gb/badge-lrg.svg?releaseDate=2018-12-06&amp;kind=iossoftware&amp;bubble=ios_apps) no-repeat;width:135px;height:40px;\"></a>\n              </div>\n            </div>\n          </div>\n      </div>\n      ".concat(shareLink ? " <div class='share-container'>\n          <h2><span class=\"line-center\">Or</span></h2>\n          <p class='mt-10 mb-0 mdc-typography--headline6 text-center'>Invite employees by sharing this download link with them.</p>\n            ".concat(shareWidget(shareLink).outerHTML, "\n      </div>") : '', "\n    </div>");
  actionsContainer.innerHTML = '';
};

var onboarding_data_save = function () {
  return {
    init: function init() {
      localStorage.setItem('onboarding_data', JSON.stringify({}));
    },
    get: function get() {
      return JSON.parse(localStorage.getItem('onboarding_data'));
    },
    set: function set(data) {
      var storedData = this.get();

      _extends(storedData, data);

      localStorage.setItem('onboarding_data', JSON.stringify(storedData));
    },
    clear: function clear() {
      localStorage.removeItem('onboarding_data');
    }
  };
}();

var handleAuthUpdate = function handleAuthUpdate(authProps) {
  return new Promise(function (resolve, reject) {
    var auth = firebase.auth().currentUser;
    var nameProm = auth.displayName === authProps.displayName ? Promise.resolve() : auth.updateProfile({
      displayName: authProps.displayName
    });
    nameProm.then(function () {
      console.log('name updated');
      if (auth.email === authProps.email) return Promise.resolve();
      console.log('adding email...');
      return firebase.auth().currentUser.updateEmail(authProps.email);
    }).then(function () {
      if (auth.emailVerified) return Promise.resolve();
      console.log('sending verification email...');
      return firebase.auth().currentUser.sendEmailVerification();
    }).then(resolve).catch(function (authError) {
      console.log(authError);
      authError.type = 'auth';
      if (authError.code === 'auth/requires-recent-login') return resolve();
      reject(authError);
    });
  });
};
/**
 *  Returns base mdc text field component without init
 * @param {object} attr 
 * @returns HTMLElement
 */


var textField = function textField(attr) {
  var label = createElement('label', {
    className: 'mdc-text-field'
  });
  label.innerHTML = "<span class=\"mdc-text-field__ripple\"></span>\n    <input class=\"mdc-text-field__input\" type=\"".concat(attr.type || 'text', "\" autocomplete=").concat(attr.autocomplete ? attr.autocomplete : 'off', " ").concat(attr.required ? 'required' : '', "  ").concat(attr.disabled ? 'disabled' : '', " ").concat(attr.readonly ? 'readonly' : '', ">\n    <span class=\"mdc-floating-label\">").concat(attr.label, "</span>\n    <span class=\"mdc-line-ripple\"></span>");
  return label;
};
/**
 * creates MDCTextFielled filled
 * @param {object} attr 
 * @returns {MDCTextField} 
 */


var textFieldFilled = function textFieldFilled(attr) {
  var tf = textField(attr);
  tf.classList.add('mdc-text-field--filled');
  return tf;
};
/**
 * creates MDCTextFielled outlined with label
 * @param {object} attr 
 * @returns {MDCTextField} 
 */


var textFieldOutlined = function textFieldOutlined(attrs) {
  var label = createElement('label', {
    className: 'mdc-text-field mdc-text-field--outlined',
    id: attrs.id || ''
  });

  if (attrs.value) {
    label.classList.add('mdc-text-field--label-floating');
  }

  var input = createElement('input', {
    className: 'mdc-text-field__input',
    value: attrs.value || ''
  });
  Object.keys(attrs).forEach(function (attr) {
    if (attr === 'label' || attr === 'id') return;

    if (attr === 'required' || attr === 'disabled') {
      input[attr] = attrs[attr];
      return;
    }

    input.setAttribute(attr, attrs[attr]);
  });
  label.innerHTML = "".concat(input.outerHTML, "\n    <span class=\"mdc-notched-outline\">\n      <span class=\"mdc-notched-outline__leading\"></span>\n      <span class=\"mdc-notched-outline__notch\">\n        <span class=\"mdc-floating-label ").concat(attrs.value ? 'mdc-floating-label--float-above' : '', "\">").concat(attrs.label, "</span>\n      </span>\n      <span class=\"mdc-notched-outline__trailing\"></span>\n    </span>");
  return label;
};
/**
 * creates MDCTextFielled outlined without label
 * @param {object} attr 
 * @returns {MDCTextField} 
 */


var textFieldOutlinedWithoutLabel = function textFieldOutlinedWithoutLabel(attr) {
  var outlinedField = textFieldOutlined(attr);
  outlinedField.querySelector('.mdc-notched-outline__notch').remove();
  outlinedField.classList.add('mdc-text-field--no-label');
  return outlinedField;
};

var textAreaOutlined = function textAreaOutlined(attr) {
  var label = createElement('label', {
    className: 'mdc-text-field mdc-text-field--outlined mdc-text-field--textarea'
  });

  if (attr.value) {
    label.classList.add('mdc-text-field--label-floating');
  }

  label.innerHTML = "<span class=\"mdc-notched-outline\">\n    <span class=\"mdc-notched-outline__leading\"></span>\n    <span class=\"mdc-notched-outline__notch\">\n      <span class=\"mdc-floating-label ".concat(attr.value ? 'mdc-floating-label--float-above' : '', "\">").concat(attr.label, "</span>\n    </span>\n    <span class=\"mdc-notched-outline__trailing\"></span>\n</span>\n<span class=\"mdc-text-field__resizer\">\n    <textarea class=\"mdc-text-field__input\" rows=\"").concat(attr.rows, "\" cols=\"").concat(attr.cols, "\" aria-label=\"Label\" id=\"").concat(attr.id || '', "\" ").concat(attr.required ? 'required' : '', " ").concat(attr.autocomplete ? "autocomplete = ".concat(attr.autocomplete) : '', ">").concat(attr.value || '', "</textarea>\n</span>");
  return label;
};
/**
 * creates hellper text for textfield
 * @returns {HTMLElement}
 */


var textFieldHelper = function textFieldHelper() {
  var div = createElement('div', {
    className: 'mdc-text-field-helper-line'
  });
  div.innerHTML = "<div class=\"mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg\" aria-hidden=\"true\"></div>";
  return div;
};