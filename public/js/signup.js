window.addEventListener('load', function () {
    const appKeys = new AppKeys();

    firebase.initializeApp(appKeys.getKeys());
    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            this.window.location.href = this.window.location.origin;
            return;
        }
        const auth = firebase.auth().currentUser;
        this.document.getElementById('log-out-btn').addEventListener('click', signOut);

        const inputs = {};
        [].map.call(document.querySelectorAll('.mdc-text-field'), function (el) {
            const textField = new mdc.textField.MDCTextField(el);
            inputs[el.id] = textField;
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

    });
})



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



//TODO :
// add meta in payments selection: amount ,id cycle,payable days , to
// configure assignee in expenses
// payment methods - > ifsc,bank account ,recipient
// add meta - > field in list 
// duty allocation