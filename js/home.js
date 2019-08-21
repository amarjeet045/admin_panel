import {MDCTopAppBar} from '@material/top-app-bar';
import {MDCDrawer} from "@material/drawer";
import * as firebase from "firebase/app";
import { MDCList } from '@material/list/component';
export const home = (auth) => {

    const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    const topAppBarElement = document.querySelector('.mdc-top-app-bar');
    topAppBarElement.classList.remove('hidden');
    const topAppBar = new MDCTopAppBar(topAppBarElement);
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
    photoIcon.src = auth.photoURL;
    photoIcon.addEventListener('click',openProfile)
    appEl.addEventListener('click',closeProfile)
}

const openProfile = (event) => {
    const auth = firebase.auth().currentUser;
    const miniProfileEl = document.getElementById('mini-profile')
    miniProfileEl.classList.remove("hidden")
    miniProfileEl.querySelector('.text-container').innerHTML = `
    <div class='mdc-typography--subtitle2 name-text'>${auth.displayName}</div>
    <div class='mdc-typography--caption email-text'>${auth.email}</div>
    <a href='https://growthfile.com/privacy-policy' target="_blank" class='mdc-typography--subtitle1 mt-10'>Privacy</a>
    `
}
const closeProfile = (e) => {
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