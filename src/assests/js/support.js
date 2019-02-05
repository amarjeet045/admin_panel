import {MDCRipple
} from '@material/ripple';
import {
    MDCTextField
} from '@material/textfield'

import {
    MDCNotchedOutline
} from '@material/notched-outline';
import {
    MDCMenu
} from '@material/menu';

import {
    requestCreator
} from './services';
import {MDCFloatingLabel} from '@material/floating-label';

function supportUser() {
    initCreateButton();
    initOfficeSearch();
}

function initCreateButton() {

    const button = new MDCRipple(document.getElementById('create-office-button'))
    console.log(button);
    button['root_'].addEventListener('click', function () {
        const menu = new MDCMenu(document.querySelector('#create-office-menu'));
        for (let index = 0; index < menu.items.length; index++) {
            menu.items[index].onclick = function () {
                if (!index) return newOfficeForm();
                return batchUploadDocs();
            }
        }
        menu.open = !menu.open;

    })

}

function newOfficeForm() {
    if (document.querySelector('.office-creation-card')) return;

    const card = document.createElement('div')
    card.className = 'mdc-card office-creation-card'
    const formAttrs = [{
            id: 'office-name',
            type: 'text',
            required: true,

        },
        {
            id: 'first-contact',
            type: 'text',
            required: true,

        },
        {
            id: 'second-contact',
            type: 'text',

        },
        {
            id: 'date-of-establishment',
            type: 'date',
        },
        {
            id: 'head-office-location',
            type: 'text',
        },
        {
            id: 'trial-start',
            type: 'date',
        },
        {
            id: 'trial-end',
            type: 'date',
        },
        {
            id: 'GST-number',
            type: 'text',
        }
    ]

    for (let index = 0; index < formAttrs.length; index++) {

        const textField = document.createElement('div')
        textField.className = 'mdc-text-field mdc-text-field--outlined';
        const input = document.createElement('input');
        input.type = formAttrs[index].type;
        input.id = formAttrs[index].id;
        
        input.className = 'mdc-text-field__input'
        input.required = formAttrs[index].required

        const notchedOutline = document.createElement('div');
        notchedOutline.className = 'mdc-notched-outline text-field-notched';

        const notchedOutlineLeading = document.createElement('div');
        notchedOutlineLeading.className = 'mdc-notched-outline__leading';

        const notchedOutlineNotch = document.createElement('div');
        notchedOutlineNotch.className = 'mdc-notched-outline__notch';

        const label = document.createElement('label');
        label.className = 'mdc-floating-label';
        let labelText = '';
        if(formAttrs[index].type === 'text') {
            label.textContent = formAttrs[index].id.split('-').forEach(function (name) {
                labelText += name.charAt(0).toUpperCase() + name.slice(1) + ' '
            })
            label.textContent = labelText;
            label.htmlFor = formAttrs[index].id
            notchedOutlineNotch.appendChild(label);    
        }
        
        const notchedOutlineTrailing = document.createElement('div');
        notchedOutlineTrailing.className = 'mdc-notched-outline__trailing';

        notchedOutline.appendChild(notchedOutlineLeading);
        notchedOutline.appendChild(notchedOutlineNotch);
        notchedOutline.appendChild(notchedOutlineTrailing);

        textField.appendChild(input);
        textField.appendChild(notchedOutline);
        card.appendChild(textField);
        console.log(textField)
    };
    document.querySelector('.mdc-layout-grid__cell--span-9').appendChild(card);

    const textFields = [].map.call(document.querySelectorAll('.mdc-text-field--outlined'), function (el) {
                return new MDCTextField(el);
    })

    const notched = [].map.call(document.querySelectorAll('.mdc-notched-outline'), function (el) {
        return new MDCNotchedOutline(el);
    })

    const label = [].map.call(document.querySelectorAll('.mdc-floating-label'),function(el){
        return new MDCFloatingLabel(el);
    })

}

function batchUploadDocs() {

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
    return
}

function formError(error) {

    console.log(error)
    document.getElementById('form-validation-message').innerHTML = error
}

function initOfficeSearch() {
    const input = document.getElementById('search-input')
    input.addEventListener('keyup', function (e) {
        if (e.keyCode == 13) {
            if (e.target.value) {

                requestCreator('search', {
                    office: e.target.value
                }).then(function (event) {
                    if (event.data.data.length == 0) {
                        textField['root_'].children[0].value = ''

                        textField['root_'].children[0].placeholder = 'No Office found'
                        return
                    }
                    document.querySelector('#app').appendChild(MdcList(event.data.data))
                }).catch(function (error) {
                    textField['root_'].children[0].placeholder = error
                })
            } else {
                input.placeholder = 'Please Enter a valid office Name'
            }
        }
    })

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
