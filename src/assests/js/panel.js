import {
    MDCRipple
} from '@material/ripple';

import {
    MDCMenu
} from '@material/menu';
import{MDCTextField} from '@material/textfield';
import {MDCTextFieldHelperText} from '@material/textfield/helper-text';
import {
    requestCreator
} from './services';
import { request } from 'https';


export function supportUser() {
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
        
                return batchUploadDocs();
            }
        }
        menu.open = !menu.open;

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

function initializeAutocompleteGoogle(request) {
    let input = document.getElementById('head-office-location')
    const options = {
        componentRestrictions: {
            country: "in"
        }
    }
    let autocomplete = new google.maps.places.Autocomplete(input, options);

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


        request.venue[0].location = place.name
        request.venue[0].address = address
        request.venue[0].geopoint.latitude = place.geometry.location.lat()
        request.venue[0].geopoint.longitude = place.geometry.location.lng()
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