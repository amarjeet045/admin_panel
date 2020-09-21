/** Base class for generating activity body
 * public methods are added for setting activity body's fields
 * Rest of the template classes inherits from this base class
 */
class ActivityBody {
    #body = {
        attachment:{},
        venue:[],
        schedule:[],
        office:'',
        activityId:'',
        template:'',
        share:[],
        geopoint:{
            latitude:0,
            longitude:0
        }
    }
    constructor(office){
        this.office = office;
        this.#body.office = office;
    }
    set share(shareArray) {
        this.#body.share = shareArray
    }
    set venue(venue) {
        this.#body.venue = venue
    }
    set activityId(id) {
        this.#body.activityId = id
    }
    set schedule(schedule) {
        this.#body.schedule = schedule;
    }
    set template(template) {
        this.#body.template = template
    }

    setAttachment(key,value,type) {
        this.#body.attachment[key] = {
            value,
            type
        }
    }

    get create() {
        return this.#body
    }
}

class Biller extends ActivityBody {
    constructor(office) {
        super(office)
        this.template = 'biller'
    }

    set name(value){
        this.setAttachment('Name',value,'string');
    }
    set gst(value) {
        this.setAttachment('Biller GST',value,'string');
       
    }
    set address(value) {
        this.setAttachment('Biller Address',value,'string');
    }
    set firstContact(value) {
        this.setAttachment('First Contact',value,'string');
    }
    set emails(value) {
        this.setAttachment('Emails',value,'string');
    }
}

class Employee extends ActivityBody {
    constructor(office) {
        super(office)
        this.template = 'employee'
    }
    set name(value) {
        this.setAttachment('Name',value,'string');
    }
    set designation(value) {
        this.setAttachment('Designation',value,'string')
    }
    set phoneNumber(value) {
        this.setAttachment('Phone Number',value,'phoneNumber')
    }
    set supervisor(value) {
        this.setAttachment('First Supervisor',value,'phoneNumber')
    }
    set employeeCode(value) {
        this.setAttachment('Employee Code',value,'string')
    }
}

class Duty extends ActivityBody {
    constructor(office) {
        super(office)
        this.template = 'duty'
    }
    set location(value) {
        this.setAttachment('Location',value,'string');
    }
    set products(value) {
        this.setAttachment('Products',value,'product')
    }
    set suervisor(value) {
        this.setAttachment('Supervisor',value,'phoneNumber')
    }
    set include(value) {
        this.setAttachment('Include',value,'string')
    }
    set date(value) {
        this.setAttachment('Date',value,'Do MMM YYYY')
    }
}

class Product extends ActivityBody {
    constructor(office) {
        super(office)
        this.template = 'product'
    }
    set name(value) {
        this.setAttachment('Name',value,'string');
    }
    set brand(value) {
        this.setAttachment('Brand',value,'string')
    }
    set productDescription(value) {
        this.setAttachment('Product Description',value,'string')
    }
    set unitValue(value) {
        this.setAttachment('Unit Value (excluding GST)',value,'string')
    }
   
}


/** callback is used because activity returned by this function needs to update dom 2 times */
const getCompanyDetails = (officeId, onSuccess, onError) => {
    getActivity(officeId).then(record=>{
        if (record) {
            onSuccess(record);
        };
        http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${officeId}/`).then(officeActivity => {
            putActivity(officeActivity).then(onSuccess);
        }).catch(onError)
    })
}

const getActivity = (activityId) => {
    return new Promise((resolve,reject)=>{
        const tx = window.database.transaction("activities");
        const store = tx.objectStore("activities");
        store.get(activityId).onsuccess = function(e) {
            return resolve(e.target.result)
        }        
    })
}

const putActivity = (activity) => {
    return new Promise((resolve,reject)=>{
        const tx = window.database.transaction("activities","readwrite");
        const store = tx.objectStore("activities");
        store.put(activity).onsuccess = function() {
            return resolve(activity)
        }        
    })
}

const handleProfileDetails = (officeId) => {
    getCompanyDetails(officeId, updateCompanyProfile, console.error)
}

const updateCompanyProfile = (activity) => {
    const companyLogo = document.getElementById('company-logo')
    const companyName = document.getElementById('company-name')
    const companyAddress = document.getElementById('company-address');

    const companyDescription = document.getElementById('company-description');
    const companyCategory = document.getElementById('company-category');
    if (activity.attachment['Company Logo'].value) {
        companyLogo.src = activity.attachment['Company Logo'].value;
    }
    companyName.textContent = activity.attachment['Name'].value;
    companyAddress.textContent = activity.attachment['Registered Office Address'].value;
    companyDescription.textContent = activity.attachment['Description'].value;
    companyCategory.textContent = activity.attachment['Category'] ? activity.attachment['Category'].value : '';


}



/**
 * format string to INR 
 * @param {string} money 
 * @returns {string} 
 */
const formatMoney = (money) => {
    const number = Number(money.split(',').join(''))
    return number.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
    })
}




const emptyCard = (text) => {
    const div = createElement('div', {
        className: 'mdc-card mdc-card--outlined  empty-card'
    })

    div.innerHTML = `<span class='text-cont'>
    <i class='material-icons'>info</i>
    ${text}
    </span>`
    return div;
}

const openProfileBox = (event) => {
    event.stopPropagation();
    document.querySelector('.user-profile--logo').classList.add('focused')

    const el = document.querySelector('.profile-box');
    if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
    } else {
        closeProfileBox()
    };
    const name = firebase.auth().currentUser.displayName;
    const email = firebase.auth().currentUser.email;
    const photo = firebase.auth().currentUser.photoURL;

    if (photo) {
        document.getElementById('auth-image').src = photo;
    }
    document.getElementById('auth-name').textContent = name;
    document.getElementById('auth-email').textContent = email;

}

const closeProfileBox = () => {
    const el = document.querySelector('.profile-box');
    document.querySelector('.user-profile--logo').classList.remove('focused')
    el.classList.add('hidden');
}

const handleFormButtonSubmit = (button, text) => {
    button.classList.remove('active');
    if(text){
        showSnacksApiResponse(text);
    }
}

const handleFormButtonSubmitSuccess = (button,text) => {
    handleFormButtonSubmit(button,text);
    setTimeout(()=>{
        window.history.back();
    },1000)
}


const getFormId = () => {
    const search = new URLSearchParams(window.location.search);
    return search.get('id');
}


const getFormRequestParams = () => {
    const id = getFormId();
    return {
        method:id ? 'PUT' : 'POST',
        url:id ? `${appKeys.getBaseUrl()}/api/activities/update` : `${appKeys.getBaseUrl()}/api/activities/create`
    }
}


/** Debouncing utils */

let timerId = null;
const debounce  = (func,delay,value) => {
    clearTimeout(timerId);
    timerId = setTimeout(function(){
        func(value);
    },delay);
}

const initializeSearch = (input,callback,delay) => {
    ['change','input'].forEach(eventType=>{
        input.addEventListener(eventType,(ev)=>{
            const value = ev.currentTarget.value.trim().toLowerCase();
            debounce(callback,delay,value)
        })
    })
}


const validatePhonNumber = (iti) => {
    var error = iti.getValidationError();
    const result = {
        message:'',
        isValid:false
    }
    if (error !== 0) {
        result.message = getPhoneFieldErrorMessage(error)
        return result
    }
    if (!iti.isValidNumber()) {
        result.message = 'Invalid number. Please check again';
        return result
    };
    result.isValid = true;
    return result;
}




const createSubscription = (office, subscriptionName) => {
    const requestBody = {
        attachment: {
            'Phone Number': {
                type: 'phoneNumber',
                value: firebase.auth().currentUser.phoneNumber
            },
            'Template': {
                type: 'string',
                value: subscriptionName
            }
        },
        office: office,
        share: [],
        venue: [],
        schedule: [],
        geopoint: {
            latitude: 0,
            longitude: 0
        },
        template: 'subscription'
    }
    return http('POST', `${appKeys.getBaseUrl()}/api/activities/create`, requestBody)
}

const formatCreatedTime = (timestamp) => {
    if (!timestamp) return ''
    return moment(timestamp).calendar(null, {
        sameDay: 'hh:mm A',
        lastDay: '[Yesterday]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastWeek: 'DD/MM/YY',
        sameElse: 'DD/MM/YY'
    })
}

const formatDutyTime = (timestamp) => {
    return moment(timestamp).calendar(null, {
        sameDay: 'hh:mm A',
        lastDay: '[Yesterday] hh:mm A',
        nextDay: '[Tomorrow] hh:mm A',
        nextWeek: 'dddd',
        lastWeek: 'DD/MM/YY',
        sameElse: 'DD/MM/YY'
    })
}

const toggleFabList = (parentButton) => {
    parentButton.querySelector('.mdc-fab__icon').classList.toggle('is-active');
    if(document.getElementById('drawer-scrim')) {
        document.getElementById('drawer-scrim').classList.toggle('block')
    }
    document.querySelectorAll('.fabs .fab').forEach(el=>{
        el.classList.toggle('is-visible');
    })
}



const createInputChip = (name) => {
    const chip = createElement('div', {
        className: 'mdc-chip',
        attrs: {
            role: 'row'
        },
    })
    
    chip.innerHTML = `<div class="mdc-chip__ripple"></div>
    <span role="gridcell">
      <span role="button" tabindex="0" class="mdc-chip__primary-action">
        <span class="mdc-chip__text">${name}</span>
      </span>
    </span>
    <span role="gridcell">
    <i class="material-icons mdc-chip-trailing-action mdc-chip__icon mdc-chip__icon--trailing" tabindex="-1" role="button">cancel</i>
  </span>`
    return chip;
}


