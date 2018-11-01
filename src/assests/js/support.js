import {
    panel
} from './panel';
import {
    MDCRipple
} from '@material/ripple'
import {
    MDCTextField
} from '@material/textfield'
import {
    showHeaderDefault,
    drawer
} from '../templates/templates';

import {
    requestCreator
} from './services';


function supportUser() {
    // if(localStorage.getItem('selectedOffice')) {
    //     panel(localStorage.getItem('selectedOffice'))
    //     return
    // }
    showHeaderDefault('support');
    drawer('support');
}

function newOfficeForm() {

    const form = `<div class="mdc-card office-creation-card">
    <div class="mdc-form-field">
        <label for="Name">Office Name</label>
        <div class="mdc-text-field">
            <input type="text" id="office" class="mdc-text-field__input" required />
            <div class="mdc-line-ripple"></div>
            </div>
            <p class="mdc-text-field-helper-text mdc-text-field-helper-text--persistent	 mdc-text-field-helper-text--validation-msg" aria-hidden="true">
            * Required
            </p>
    </div>
    <div class="mdc-form-field">
        <label for="first-contact">First Contact</label>
        <div class="mdc-text-field">
            <input type="number" id="first-contact" class="mdc-text-field__input" required maxlength="10"/>
            <div class="mdc-line-ripple"></div>
        </div>
        <div class="mdc-text-field-helper-text mdc-text-field-helper-text--persistent	 mdc-text-field-helper-text--validation-msg" aria-hidden="true">
            * Required
            <div style="margin-left:3px"> * Add first contact without country code</p>
        </div>
    </div>
    <div class="mdc-form-field">
        <label for="second-contact">Second Contact</label>
        <div class="mdc-text-field">
            <input type="number" class="mdc-text-field__input" id="second-contact" required="false" maxlength="10" />
            <div class="mdc-line-ripple"></div>
        </div>
        <p class="mdc-text-field-helper-text mdc-text-field-helper-text--persistent	 mdc-text-field-helper-text--validation-msg" aria-hidden="true">
            * Add Second Contact without country code
        </p>
    </div>
    <div class="mdc-form-field">
        <label for="date-of-establishment">Date of Establishment</label>
        <div class="mdc-text-field">
            <input type="date" id = 'establishment-startTime' class="mdc-text-field__input" />
            <div class="mdc-line-ripple"></div>
        </div>
    </div>

    <div class="mdc-form-field">
        <label for="head-office-location">Head office Location</label>
        <div class="mdc-text-field">
            <input type="text" id="head-office-location" class="mdc-text-field__input" />
            <div class="mdc-line-ripple"></div>
        </div>
    </div>

    <div class="mdc-form-field">
        
    <label for="">Trial Period</label>

    <div class="mdc-text-field">
        <input type="date" id="trial-start" class="mdc-text-field__input"/>
        <div class="mdc-line-ripple"></div>
    </div>
      
    <span> To </span>
        <div class="mdc-text-field">
        <input type="date" id="trial-end" class="mdc-text-field__input"/>
        <div class="mdc-line-ripple"></div>
        </div>
    </div>

    <div class="mdc-form-field">
        <label for="GST">GST Number</label>
        <div class="mdc-text-field">
            <input type="text" id="GST" class="mdc-text-field__input" min="15"/>
            <div class="mdc-line-ripple gst"></div>
        </div>
    </div>

    <p id="form-validation-message"></p>
    <button class="mdc-button mdc-card__action mdc-card__action--button  form-create" title="Create" >Create</button>
    <button class="mdc-button mdc-card__action mdc-card__action--button  form-cancel" title="Cancel" >Cancel</button>

  </div>
</div>`


    document.querySelector('#app').innerHTML = form
    document.querySelector('#trial-start').value = getTodayDate()

    const createRipple = new MDCRipple(document.querySelector('.form-create'))
    const cancelRipple = new MDCRipple(document.querySelector('.form-cancel'))
    document.querySelectorAll('.mdc-text-field').forEach(function (field) {
        const tf = new MDCTextField(field)
    })

    document.getElementById('first-contact').oninput = function () {
        if (this.value.length > this.maxLength) {
            console.log(this.maxLength)
            this.value = this.value.slice(0, this.maxLength)
        }
    }
    document.getElementById('second-contact').oninput = function () {
        if (this.value.length > this.maxLength) {
            console.log(this)
            this.value = this.value.slice(0, this.maxLength)
        }
    }

    // add autocomplete for head office location

    let input = document.getElementById('head-office-location')
    const options = {
        componentRestrictions: {
            country: "in"
        }
    }
    let autocomplete = new google.maps.places.Autocomplete(input, options);
    initializeAutocompleteGoogle(autocomplete, document.getElementById('head-office-location'))


    cancelRipple['root_'].onclick = function (event) {
        document.getElementById('sidebar').style.display = 'block'

        document.getElementById('app').classList.remove('mdc-layout-grid__cell--span-12')
        document.getElementById('app').classList.add('mdc-layout-grid__cell--span-10')
        document.getElementById('app').innerHTML = ''
        supportUser()
    }

    createRipple['root_'].onclick = function (event) {

        const officeObject = {
            template: "office",
            office: '',
            venue: [{
                "venueDescriptor": "Head Office",
                "location": "",
                "address": "",
                "geopoint": {
                    "latitude": '',
                    "longitude": ''
                }
            }],
            schedule: [{
                    "name": "Date Of Establishment",
                    "startTime": document.getElementById('establishment-startTime'),
                    "endTime": ""
                },
                {
                    "name": "Trial Period",
                    "startTime": "",
                    "endTime": ""
                }
            ],
            share:[],
            attachment: {
                "Name": {
                    "value": '',
                    "type": "string"
                },
                "GST Number": {
                    "value": document.getElementById("GST").value,
                    "type": "string"
                },
                "First Contact": {
                    "value": "",
                    "type": 'phoneNumber'
                },
                "Second Contact": {
                    "value":'',
                    "type": "phoneNumber"
                }
            }
        }

        const firstContact = document.getElementById('first-contact').value
        const secondContact = document.getElementById('second-contact').value
        const office = document.getElementById('office').value
        const trialStart = document.getElementById('trial-start')
        const trialEnd = document.getElementById('trial-end')
        const headOfficeInput = document.getElementById('head-office-location')
        const headOffice = headOfficeInput.dataset
        const establishment = document.getElementById('establishment-startTime')
        // required
        if (firstContact === '' || office === '') {
            formError('First Please all the required fields')
            return
        }

        if (!checkNumber(formatNumber(firstContact))) {
            formError('Please Enter A valid First Contact Phone Number')
            return;
        }
        if(secondContact){
            if(!checkNumber(formatNumber(secondContact))) {
                formError('Please Enter A valid Second Contact Phone Number')
                return
            }

            officeObject.attachment['Second Contact'].value = formatNumber(secondContact)
        
        }

        officeObject.attachment['First Contact'].value = formatNumber(firstContact)


        // date
        if (Date.parse(trialStart.value) > Date.parse(trialEnd.value)) {
            formError("Trial Period's End Time cannot be less than Start Time")
            return
        }
        officeObject.schedule.forEach(function (key) {

            if (key.name === 'Trial Period') {

                key.startTime = Date.parse(trialStart.value) || ''
                key.endTime = Date.parse(trialEnd.value) || ''
            }
            if (key.name === "Date Of Establishment") {
                key.startTime = Date.parse(establishment.value)
            }

        })

        officeObject.venue[0].location = headOffice.location || ''
        officeObject.venue[0].address = headOffice.address || ''
        officeObject.venue[0].geopoint['latitude'] = parseFloat(headOffice.lat) || ''
        officeObject.venue[0].geopoint['longitude'] = parseFloat(headOffice.lng) || ''

        officeObject.office = office

        //validate for existing office 
        document.getElementById('form-validation-message').innerHTML = loader().outerHTML
        requestCreator('search', {office:office}).then(function (event) {
            console.log(event)
            existingOfficeSuccess(event.data.data, officeObject)
        }, function (error) {
            formError(error)
        })
    }
}

function existingOfficeSuccess(result, officeObject) {
    if (result.indexOf(officeObject.office) > -1) {
        formError(`${officeObject.office} Already Exist`)
    } else {
        officeObject.attachment.Name.value = officeObject.office
        requestCreator('createOffice', officeObject).then(function (success) {
            officeCreationSucess(officeObject.office)
        }, function (error) {
            formError(error)
        })
    }
}

function officeCreationSucess() {
    panel(office)
    return
}

function formError(error) {

    console.log(error)
    document.getElementById('form-validation-message').innerHTML = error
}


String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}

function initializeAutocompleteGoogle(autocomplete, input) {


    autocomplete.addListener('place_changed', function () {
        let place = autocomplete.getPlace();

        if (!place.geometry) {
            console.log("empty location")
            input.dataset.location = input.value
            input.dataset.address = ''
            input.dataset.lat = ''
            input.dataset.lng = ''
            return
        }
        //  document.getElementById('location--container').style.marginTop = '0px'

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        input.dataset.location = place.name
        input.dataset.address = address
        input.dataset.lat = place.geometry.location.lat()
        input.dataset.lng = place.geometry.location.lng()

    })
}


function getTodayDate() {
    const today = new Date().toLocaleDateString()
    const split = today.split("/")
    return split[2] + '-' + split[0] + '-' + split[1]
    // return today
}

function checkNumber(number) {
    const expression = /^\+[1-9]\d{11,14}$/
    return expression.test(number)
}

function formatNumber(numberString) {
    let number = numberString;
    if (number.substring(0, 2) === '91') {
        number = '+' + number
    } else if (number.substring(0, 3) !== '+91') {
        number = '+91' + number
    }

    return number
}

function loader(nameClass) {
    const div = document.createElement('div')
    div.className = 'loader ' + nameClass
    return div
}




export {
    supportUser,
    newOfficeForm
}