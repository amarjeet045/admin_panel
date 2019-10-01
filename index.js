import firebase from "firebase/app";
import "firebase/auth";
import {
    appKeys
} from './env-config';
import {
    login,
    updateAuth
} from './js/login';
import {
    initializer
} from './js/home';


window.addEventListener('load', function () {

    firebase.initializeApp(appKeys.getKeys());
    firebase.auth().onAuthStateChanged(function (auth) {

        if (!auth) {
            if (parseRedirect('redirect_to') === 'LOGIN') {
                login();
                return;
            };
            return redirect('/static/home.html');
        }

        if (auth.email && auth.emailVerified && auth.displayName) {
            auth.getIdTokenResult().then((idTokenResult) => {
                if (idTokenResult.claims.hasOwnProperty('admin') && idTokenResult.claims.admin.length) {
                    if(parseRedirect('redirect_to') === 'LOGIN') {
                        history.pushState(null,null,window.location.pathname);
                    }
                    return initializer(auth)
                }
                redirect('/signup.html');
            });
            return;
        };

        updateAuth(auth);
    });
});


const redirect = (pathname) => {
    window.location = window.location.origin + pathname;
}
const parseRedirect = (type) => {
    const param = new URLSearchParams(document.location.search.substring(1));
    return param.get(type);
}
