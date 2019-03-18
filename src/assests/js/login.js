import {panel} from './panel';
import {credentials} from './utils';
function initApp() {
    firebase.auth().onAuthStateChanged(handleLoggedIn,handleAuthError)  
}
function handleLoggedIn(auth) {
    if (!auth) {
        document.getElementById('root').classList.add('hidden')
        handleLoggedOut()
        return;
    }; 
    
    document.getElementById('root').classList.remove('hidden')
    document.getElementById('firebaseui-auth-container').style.display = 'none';
    auth.getIdTokenResult().then(function(cred){

        if(!credentials.valid(cred)) {
            const message = 'You are not authorized To use this panel';
            signOutUser(message);
            return;
        }
        panel(cred)
    }).catch(console.log);
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
                defaultNationalNumber: '',
            }
        ],
        tosUrl: '<your-tos-url>',
        privacyPolicyUrl: '<your-privacy-policy-url>'
      };
      
    // try {
        let ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start("#firebaseui-auth-container", uiConfig)
    // }
    // catch(e) {
    //     new firebaseui.auth.AuthUI(firebase.auth()).start("#firebaseui-auth-container", uiConfig)
    //     console.log(e)
    // }
    
}


function signOutUser(message){
    firebase.auth().signOut().then(function(){
        signOutSuccess(message)
    },signOutError)
}

function signOutSuccess(message) {
    const parent = document.getElementById('app');
    parent.innerHTML = ''
    if(message) {
        parent.textContent = message;
    }
}

function signOutError(error) {
    console.log(error)
}

export {
    initApp,signOutUser
}
