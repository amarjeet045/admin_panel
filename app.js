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
    home, expenses
} from "./js/home";

 

window.addEventListener('load', function () {
    
    console.log("run first")
    firebase.initializeApp(appKeys.getKeys());
    firebase.auth().onAuthStateChanged(function (auth) {
        console.log(auth);

        if (!auth) {
            login();
            return;
        };
        
        if (parseEmailRedirect()) {
            console.log("parse email")
            home(auth);
            return;
        }
        if (auth.email && auth.emailVerified && auth.displayName) {
            home(auth);
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

