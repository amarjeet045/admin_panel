function isAdmin(idTokenResult) {
    if (!idTokenResult.claims.hasOwnProperty('admin')) return;
    if (!Array.isArray(idTokenResult.claims.admin)) return;
    if (!idTokenResult.claims.admin.length) return;
    return true;
}

function createOfficeInit(geolocation) {
    const template = {
        'template': 'office',
        'firstContact': '',
        'secondContact': '',
        'name': '',
        'placeId': '',
        'registeredOfficeAddress': '',
        canEdit: true
    }
    history.pushState(['addView'], null, null);
    addView(document.getElementById('home-login'), template);

}

function sendOfficeData(requestBody) {

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'address': requestBody.registeredOfficeAddress
    }, function (geocodeResults, status) {
        if (status == 'OK' && geocodeResults.length) {
            requestBody.placeId = geocodeResults[0].place_id
            const myNumber = firebase.auth().currentUser.phoneNumber
            getLocation().then(function (geopoint) {
                requestBody.geopoint = geopoint
                http('POST', `${appKeys.getBaseUrl()}/api/services/office`, requestBody).then(function () {
                    fbq('trackCustom', 'Office Created')
                    analyticsApp.logEvent('office_created', {
                        item_location_id: requestBody.placeId,
                    })

                    const fc = requestBody['firstContact'].phoneNumber;
                    const sc = requestBody['secondContact'].phoneNumber;
                    if (fc === myNumber || sc === myNumber) {
                        window.location.reload();
                        return;
                    }
                    try {
                        document.getElementById('home-login').innerHTML = `<h3 class='mdc-typography--headline4 mdc-theme--primary'>${requestBody.name} Created</p>`;

                    } catch (e) {

                    }
                }).catch(function (error) {
                    showSnacksApiResponse(error.message);
                })
            }).catch(handleLocationError);
            return
        }
    })

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