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



function emailUpdate(email, callback) {
    firebase.auth().currentUser.updateEmail(email).then(function () {
        emailVerification(callback);
    }).catch(function (error) {
        if (error.code === 'auth/requires-recent-login') return
        showSnacksApiResponse(getEmailErrorMessage(error))
    })
}

function emailVerification(callback) {

    firebase.auth().currentUser.sendEmailVerification().then(function () {
        commonDom.progressBar.close();
        callback()
    }).catch(function (error) {
        if (error.code === 'auth/requires-recent-login') return
        showSnacksApiResponse(getEmailErrorMessage(error))
    })
}




function sendOfficeData(requestBody) {
    linearProgress = commonDom.progressBar;
    const auth = firebase.auth().currentUser;

    const officeBody = requestBody.office;
    officeBody.name = ''
    getLocation().then(function (geopoint) {
        officeBody.geopoint = geopoint
        return http('POST', `${appKeys.getBaseUrl()}/api/services/office`, officeBody).then(function () {
            // fbq('trackCustom', 'Office Created')
            // analyticsApp.logEvent('office_created', {
            //     location: officeBody.registeredOfficeAddress
            // })
            // try {
            //     handleAuthUpdate(requestBody.auth);
            // } catch (e) {

            // }
            // firebase.auth().currentUser.getIdTokenResult().then((idTokenResult) => {
            //     console.log(idTokenResult)
            // });
            
            // firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
            //     // Send token to your backend via HTTPS
            //     // ...
            //     console.log(idToken)
            // }).catch(function (error) {
            //     // Handle error
            //     console.error()
            // });
        }).catch(function (error) {
            toggleForm(error.message)
            // showSnacksApiResponse(error.message);
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

