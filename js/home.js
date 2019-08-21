import {MDCTopAppBar} from '@material/top-app-bar';
import {MDCDrawer} from "@material/drawer";
import * as firebase from "firebase/app";

import { MDCRipple } from '@material/ripple/component';


export const home = (auth) => {
    
    const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    const topAppBarElement = document.querySelector('.mdc-top-app-bar');
    const topAppBar = new MDCTopAppBar(topAppBarElement);
    showTopAppBar(topAppBar);

    const signOutBtn = new MDCRipple(document.getElementById('sign-out'));
    signOutBtn.root_.addEventListener('click',function(){
       signOut(topAppBar)
    });

    const appEl =  document.getElementById('app')
    topAppBar.setScrollTarget(appEl);
    appEl.innerHTML = ''
    topAppBar.listen('MDCTopAppBar:nav', () => {
        drawer.open = !drawer.open;
    });
    drawer.list.listen('MDCList:action',function(event){
        drawer.open = !drawer.open;
        handleDrawerListClick(event,drawer.list)
    })
    const photoIcon = topAppBar.iconRipples_[0].root_
    photoIcon.src = auth.photoURL || './img/person.png';
    photoIcon.addEventListener('click',openProfile)
    appEl.addEventListener('click',closeProfile)
}

const showTopAppBar = (topAppBar) => {
    topAppBar.root_.classList.remove('hidden')
}
const hideTopAppBar = (topAppBar) => {
    topAppBar.root_.classList.add('hidden')
}


const openProfile = (event) => {
    const auth = firebase.auth().currentUser;
    const miniProfileEl = document.getElementById('mini-profile')
    miniProfileEl.classList.remove("hidden")
    miniProfileEl.querySelector('img').src = auth.photoURL || './img/person.png'
    miniProfileEl.querySelector('.text-container').innerHTML = `
    <div class='mdc-typography--subtitle2 name-text'>${auth.displayName}</div>
    <div class='mdc-typography--caption email-text'>${auth.email}</div>
    <a href='https://growthfile.com/privacy-policy' target="_blank" class='mdc-typography--subtitle1 mt-10'>Privacy</a>
    `   
}
export const closeProfile = (e) => {
    console.log(e)
    const miniProfileEl = document.getElementById('mini-profile')
    miniProfileEl.classList.add('hidden')
    
}

const handleDrawerListClick = (event,drawerList) => {
    const selectedView = drawerList.listElements[event.detail.index].dataset.value
    console.log(selectedView);
    const appEl = document.getElementById('app')
    appEl.innerHTML = ''
}
export const signOut = (topAppBar) => {
    
    firebase.auth().signOut().then(function(){
        if(topAppBar) {
            hideTopAppBar(topAppBar)
            closeProfile();
        }
    }).catch(console.log)
}