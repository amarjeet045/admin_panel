import * as firebase from "firebase/app";
import "firebase/auth";
import {
    appKeys
} from './env-config';
import {
    login,
    updateAuth
} from "./js/login";
import {
    home
} from "./js/home";

// var appKeys = new AppKeys();
window.addEventListener('load', function () {
    
    firebase.initializeApp(appKeys.getKeys());
    firebase.auth().onAuthStateChanged(function (auth) {
        console.log(auth);
        if (!auth) {
            login();
            return;
        };

        if (parseEmailRedirect()) {
            home();
            return;
        }
        if (auth.email && auth.emailVerified && auth.displayName) {
            home();
            return;
        };
        updateAuth(auth)
    });
})

const parseEmailRedirect = () => {
    const param = new URLSearchParams(document.location.search.substring(1));
    const email = param.get('email');

    return email
}