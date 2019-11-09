function initSignUp() {
    const auth = firebase.auth().currentUser;
    const inputs = {};
    [].map.call(document.querySelectorAll('.mdc-text-field'), function (el) {
        const textField = new mdc.textField.MDCTextField(el);
        inputs[el.id] = textField;
        console.log(el.querySelector('input').type)
        if (el.querySelector('input').type === 'tel') {
            const phoneField = phoneFieldInit(textField)

        }
    })
    console.log(inputs)
    const checkbox = new mdc.checkbox.MDCCheckbox(document.getElementById('admin-checkbox'))
    checkbox.listen('change', function (event) {
        if (checkbox.checked) {
            inputs['company-admin-1-name'].value = auth.displayName;
            inputs['company-admin-1-email'].value = auth.email;
            inputs['company-admin-1-phonenumber'].value = auth.phoneNumber;
        } else {
            inputs['company-admin-1-name'].value = inputs['company-admin-1-email'].value = inputs['company-admin-1-phonenumber'].value = "";
    
        }
    })
    initAddressField(inputs['company-location'])
}



const initAddressField = (textField) => {

    const autocomplete = new google.maps.places.Autocomplete(textField.input_);
    console.log(autocomplete)
    google.maps.event.addListener(autocomplete, 'place_changed', function (event) {
        const place = autocomplete.getPlace();
        console.log(place)
        textField.root_.dataset.latitude = place.geometry.location.lat();
        textField.root_.dataset.longitude = place.geometry.location.lng();
        textField.root_.dataset.location = place.name;
        textField.root_.dataset.address = place.formatted_address;
    });
}