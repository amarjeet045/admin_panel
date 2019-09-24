import firebase from "firebase/app";
import "firebase/auth";
import {
    appKeys
} from '../env-config';
import {
    login,
    updateAuth
} from "./js/login";
import {
    home, expenses
} from "./js/home";
import {signUp} from './js/signup';

window.addEventListener('load', function () {
    
    
    console.log("run first")
    firebase.initializeApp(appKeys.getKeys());
    firebase.auth().onAuthStateChanged(function (auth) {
        console.log(auth);
        if (!auth) {
            login();
            return;
        };
        console.log(auth);
        if (auth.email && auth.emailVerified && auth.displayName) {
            
            auth.getIdTokenResult().then((idTokenResult) => {
                if(idTokenResult.claims.hasOwnProperty('admin') && idTokenResult.claims.admin.length) return home(auth);
                signUp(auth)
            });
            return;
        };
        updateAuth(auth)
    });
})

const parseRedirect = (type) => {
    const param = new URLSearchParams(document.location.search.substring(1));
    const email = param.get(type);
    return email
}
