import {
    panel
} from './panel';
import {MDCRipple} from '@material/ripple'
import {MDCTextField} from '@material/textfield'
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
        <div class="mdc-text-field" data-field = 'Name'>
            <input type="text" id="Name" class="mdc-text-field__input" required />
            <div class="mdc-line-ripple"></div>
            </div>
            <p class="mdc-text-field-helper-text mdc-text-field-helper-text--persistent	 mdc-text-field-helper-text--validation-msg" aria-hidden="true">
            * Required
            </p>
    </div>
    <div class="mdc-form-field">
        <label for="first-contact">First Contact</label>
        <div class="mdc-text-field" data-field = 'firstContact'>
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
        <div class="mdc-text-field" data-field = 'secondContact'>
            <input type="number" id="second-contact" class="mdc-text-field__input" required="false" maxlength="10" />
            <div class="mdc-line-ripple"></div>
        </div>
        <p class="mdc-text-field-helper-text mdc-text-field-helper-text--persistent	 mdc-text-field-helper-text--validation-msg" aria-hidden="true">
            * Add Second Contact without country code
        </p>
    </div>
    <div class="mdc-form-field">
        <label for="date-of-establishment">Date of Establishment</label>
        <div class="mdc-text-field" data-field = 'dateOfEstablishment'>
            <input type="date" id="date-of-establishment" class="mdc-text-field__input" />
            <div class="mdc-line-ripple"></div>
        </div>
    </div>
    <div class="mdc-form-field">
        <label for="head-office-location">Head office Location</label>
        <div class="mdc-text-field" data-field = 'headOffice'>
            <input type="text" id="head-office-location" class="mdc-text-field__input" />
            <div class="mdc-line-ripple"></div>
        </div>
    </div>
    <div class="mdc-form-field">
        <label for="">Trial Period</label>
        <div class="mdc-text-field create-trial-end" data-field ='trialPeriodStart'>
            <input type="date" id="trial-start" class="mdc-text-field__input"/>
            <div class="mdc-line-ripple"></div>
        </div>
      
        <span>To</span>
        <div class="mdc-text-field create-trial-end" data-field ='trialPeriodEnd'>
        <input type="date" id="trial-end" class="mdc-text-field__input"/>
        <div class="mdc-line-ripple"></div>
        </div>
       

        </div>
    <div class="mdc-form-field">
        <label for="GST">GST Number</label>
        <div class="mdc-text-field" data-field = 'GST'>
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
    document.querySelector('#trial-start').min = getTodayDate()
    document.querySelector('#trial-end').min = getTodayDate()

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

    cancelRipple['root_'].onclick = function (event) {
        document.getElementById('sidebar').style.display = 'block'

        document.getElementById('app').classList.remove('mdc-layout-grid__cell--span-12')
        document.getElementById('app').classList.add('mdc-layout-grid__cell--span-10')
        document.getElementById('app').innerHTML = ''
        supportUser()
    }
    createRipple['root_'].onclick = function (event) {
        const officeObject = {}
        document.querySelectorAll('.mdc-form-field .mdc-text-field').forEach(function (inputField) {
            if (inputField.dataset.field === 'firstContact' || inputField.dataset.field === 'secondContact') {
                if (inputField.dataset.field === 'secondContact' && inputField.children[0].value === '') {
                    officeObject[inputField.dataset.field] = inputField.children[0].value

                } else {

                    officeObject[inputField.dataset.field] = formatNumber(inputField.children[0].value)
                }
            } else {
                officeObject[inputField.dataset.field] = inputField.children[0].value
            }
        })
        if (officeObject.Name === '' || officeObject.firstContact === '') {
            document.getElementById('form-validation-message').textContent = 'Please Fill All Required Fields'
            return
        }
        if (officeObject.trialPeriodEnd === '' && officeObject.trialPeriodStart) {
            document.getElementById('form-validation-message').textContent = 'Please Add the Trial Period End Date'

            return
        }
        if (!checkNumber(formatNumber(officeObject.firstContact))) {
            document.getElementById('form-validation-message').textContent = 'Please Enter A valid Phone Number'
            return;
        }
        document.getElementById('form-validation-message').innerHTML = loader().outerHTML

        requestCreator('search', officeObject.Name).then(function (event) {
            console.log(event.data)

            if (event.data.indexOf(officeObject.Name) > -1) {

                document.getElementById('form-validation-message').innerHTML = 'Office Name already exist'
                return
            }
            document.getElementById('form-validation-message').innerHTML = ''
            console.log(officeObject)

            requestCreator('createOffice', officeObject).then(function (success) {
                panel(officeObject.Name)
                return
            }).catch(function (error) {
                document.getElementById('form-validation-message').innerHTML = error
            })

        }).catch(console.log)

        //send to api
    }
}

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
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