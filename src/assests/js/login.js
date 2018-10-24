import {adminUser} from './admin';
import {supportUser} from './support';
import {requestCreator} from './services'

function initApp() {
    firebase.auth().onAuthStateChanged(handleLoggedIn,handleAuthError)  
}


function handleLoggedIn(auth) {
    if (!auth) {
        document.getElementById('app-header').classList.add('hidden')
        handleLoggedOut()
        return
    } 
    requestCreator('now','123zxv').then(function(event){
        console.log(event)
    }).catch(console.log)
    auth.getIdTokenResult().then(identifyUserType).catch(console.log)
    
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
    console.log(tokenResult)
    document.getElementById('account-circle-header').src = firebase.auth().currentUser.photoURL || 'https://i0.wp.com/ebus.ca/wp-content/uploads/2017/08/profile-placeholder.jpg?ssl=1'

    if(!!tokenResult.claims.admin) {
        if(Array.isArray(tokenResult.claims.admin) && tokenResult.claims.admin.length > 0) {
            adminUser(tokenResult.claims.admin)
            return
        }
        signOutUser()
        return
    }
    if(tokenResult.claims.support) {
        supportUser()
        return

    }

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
    document.getElementById('sidebar').innerHTML = ''
}

function signOutError(error) {
    console.log(error)
}

export {
    initApp,signOutUser
}