function isAdmin(idTokenResult) {
    if (!idTokenResult.claims.hasOwnProperty('admin')) return;
    if (!Array.isArray(idTokenResult.claims.admin)) return;
    if (!idTokenResult.claims.admin.length) return;
    return true;
}
function createOfficeInit(confirmFab) {
    const content = `
    <p>Are you sure you want to  create a new company ?</p>
    <p>Before continuing please agree to Growthfile's privacy policy & terms or use</p>
    <div class='terms-cont'>
        ${createCheckBox('office-checkbox')}
    </div>`
    var dialog = new Dialog(`${placeResult.name} not found`, content).create();
    dialog.buttons_[0].textContent = 'cancel'
    dialog.buttons_[1].textContent = 'create new company';
    dialog.buttons_[1].setAttribute('disabled', 'true')
    dialog.open();

    const form = new mdc.formField.MDCFormField(dialog.content_.querySelector('.mdc-form-field'))
    const chckBox = new mdc.checkbox.MDCCheckbox(dialog.content_.querySelector('.mdc-checkbox'))
    form.input = chckBox;
    form.label_.innerHTML = `I agree to <a href='https://www.growthfile.com/legal.html#privacy-policy'>Privacy Policy</a> &
    <a href='https://www.growthfile.com/legal.html#terms-of-use-user'>Terms of use</a>`

    chckBox.listen('change', function () {
        if (chckBox.checked) {
            dialog.buttons_[1].removeAttribute('disabled')
        } else {
            dialog.buttons_[1].setAttribute('disabled', 'true')
        }
    })

    dialog.listen('MDCDialog:closed', function (dialogEvent) {
        if (dialogEvent.detail.action !== 'accept') {
            confirmFab.classList.remove('mdc-fab--exited')
            return;
        }

        const template = {
            'template': 'office',
            'firstContact': '',
            'secondContact': '',
            'name': placeResult.name,
            'placeId': placeResult.place_id,
            'registeredOfficeAddress': placeResult.formatted_address,
            canEdit:true
        }
        history.pushState(['addView'], null, null);
        addView(document.getElementById('home-login'), template);
    })
}
function sendOfficeData(requestBody) {
    const myNumber = firebase.auth().currentUser.phoneNumber
    getLocation().then(function (geopoint) {
        requestBody.geopoint = geopoint
        http('POST', `${appKeys.getBaseUrl()}/api/services/office`, requestBody).then(function () {
            const fc = requestBody['firstContact'].phoneNumber;
            const sc = requestBody['secondContact'].phoneNumber;
            if(fc === myNumber || sc === myNumber) {
                window.location.reload();
                return;
            }
            try {
                document.getElementById('home-login').innerHTML = `<h3 class='mdc-typography--headline4 mdc-theme--primary'>${requestBody.name} Created</p>`;

            }catch(e){

            }
        }).catch(function(error){
            showSnacksApiResponse(error.message);
        })
    }).catch(handleLocationError);
}
function sendUsersData(formData) {
    getLocation().then(function (geopoint) {
        requestCreator('checkIns', formData, geopoint).then(function (response) {}).catch(console.error);
    }).catch(handleLocationError);
}
function sendSubscriptionData(formData) {
    getLocation().then(function (geopoint) {
        formData.geopoint = geopoint
        http('POST', `${appKeys.getBaseUrl()}/api/services/subscription`, formData).then(function (response) {
            window.location.reload(true)
        }).catch(console.error)
    }).catch(handleLocationError);
}