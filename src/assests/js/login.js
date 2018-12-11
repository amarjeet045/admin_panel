import {adminUser} from './admin';
import {supportUser} from './support';

function initApp() {
    firebase.auth().onAuthStateChanged(handleLoggedIn,handleAuthError)  
}


function handleLoggedIn(auth) {
    if (!auth) {
        document.getElementById('root').classList.add('hidden')
        handleLoggedOut()
        return;
    } 

    document.getElementById('profile--image').src = firebase.auth().currentUser.photoURL
    document.getElementById('root').classList.remove('hidden')
    auth.getIdTokenResult().then(identifyUserType).catch(console.log);

    

}
function handleAuthError(error){
    console.log(error)
}

function handleLoggedOut() {
    var uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            handleLoggedIn(authResult.user);
            return
          },
        },
        signInFlow: 'popup',
        signInOptions: [
            {

                // Leave the lines as is for the providers you want to offer your users.
                provider : firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                recaptchaParameters: {
                    type: 'image', // 'audio'
                    size: 'normal', // 'invisible' or 'compact'
                    badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
                },
                defaultCountry: 'IN',
                defaultNationalNumber: '+919999288921',
            }
        ],
        tosUrl: '<your-tos-url>',
        privacyPolicyUrl: '<your-privacy-policy-url>'
      };
      
    try {
        const ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start("#firebaseui-auth-container", uiConfig)

    }
    catch(e) {
        ui.start("#firebaseui-auth-container", uiConfig)
        console.log(e)
    }
    
}

function identifyUserType(tokenResult){
    
    document.getElementById('app').style.width = '75.8vw';

    if(!!tokenResult.claims.admin) {
        if(Array.isArray(tokenResult.claims.admin) && tokenResult.claims.admin.length > 0) {
          
            adminUser(tokenResult.claims.admin);

            return
        }

        signOutUser()
        return
    }

    // if(tokenResult.claims.support) {
    //     requestCreator('fetchServerTime',{device:'123'}).then(function(success){
    //         supportUser()
    //     }).catch(function(error){
    //         console.log(error)
    //     })
    //     return
    // }

    document.getElementById('not-autorized-message').classList.remove('hidden')
    setTimeout(function(){
        document.getElementById('not-autorized-message').classList.add('hidden')
        signOutUser()
    },3000)
}
function signOutUser(){
   
    firebase.auth().signOut().then(signOutSuccess,signOutError)
}

function signOutSuccess() {
    document.getElementById('app').innerHTML = ''
}

function signOutError(error) {
    console.log(error)
}

export {
    initApp,signOutUser
}