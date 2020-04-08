function isAdmin(idTokenResult) {
    if (!idTokenResult.claims.hasOwnProperty('admin')) return;
    if (!Array.isArray(idTokenResult.claims.admin)) return;
    if (!idTokenResult.claims.admin.length) return;
    return true;
}

function createOfficeInit(geolocation) {

    const auth = firebase.auth().currentUser;
    const authProps = {
        displayName: auth.displayName,
        phoneNumber: auth.phoneNumber,
        email: auth.email
    }

    const template = {
        'template': 'office',
        'firstContact': authProps,
        'name': '',
        'registeredOfficeAddress': '',
        'canEdit': true
    }
    history.pushState(['addView'], null, null);
    addView(document.getElementById('home-login'), template, authProps);

}

function handleAuthUpdate(authProps) {
    const auth = firebase.auth().currentUser;
    if (auth.displayName && auth.email) return;

    if (!auth.displayName) {
        auth.updateProfile({
            displayName: authProps.displayName
        }).then(console.log).catch(console.error)
    }
    if (!auth.email) {
        emailUpdate(authProps.email, function () {
            console.log('succesfully updated email')
        })
    }
}



function sendOfficeData(requestBody) {
    const auth = firebase.auth().currentUser;
    handleAuthUpdate(requestBody.auth);
    const officeBody = requestBody.office;
    getLocation().then(function (geopoint) {
        officeBody.geopoint = geopoint
        return http('POST', `${appKeys.getBaseUrl()}/api/services/office`, officeBody).then(function () {
            fbq('trackCustom', 'Office Created')
            analyticsApp.logEvent('office_created', {
                location: officeBody.registeredOfficeAddress
            })
            return http('POST', `${appKeys.getBaseUrl()}/api/services/subscription`, {
                "share": [{
                    phoneNumber: auth.phoneNumber,
                    displayName: requestBody.auth.displayName,
                    email: requestBody.auth.email
                }],
                "template": "subscription",
                "office": officeBody.name,
                geopoint:geopoint
            })
        }).then(function () {
            window.location.reload();
        }).catch(function (error) {
            showSnacksApiResponse(error.message);
        });
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