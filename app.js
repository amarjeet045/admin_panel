import * as firebase from "firebase/app";
import "firebase/auth";
import {config} from './env';


window.addEventListener('load', function () {
    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged(function (auth) {
        console.log(auth);
        if (!auth) {
            
            return;
        };
        
    });
})