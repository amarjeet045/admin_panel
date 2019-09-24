import * as firebase from "firebase/app";
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

 

window.addEventListener('load', function () {
    
    console.log("run first")
    firebase.initializeApp(appKeys.getKeys());
    firebase.auth().onAuthStateChanged(function (auth) {
        console.log(auth);

        if (!auth) {
            login();
            // if(parseRedirect('login')) {
            //     return login();
            // }
            // if(parseRedirect('signup')) {
            //     return signUp();
            // }

            // window.location.href = window.location.href+'static/views/home.html'
            return;
        };

        
        if (parseRedirect('email')) {
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

const parseRedirect = (type) => {
    const param = new URLSearchParams(document.location.search.substring(1));
    const email = param.get(type);
    return email
}
