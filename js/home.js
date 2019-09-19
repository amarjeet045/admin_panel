import {
    MDCTopAppBar
} from '@material/top-app-bar';
import {
    MDCDrawer
} from "@material/drawer";

import * as firebase from "firebase/app";
import {
    MDCList
} from '@material/list';
import * as view from './views';
import {
    MDCRipple
} from '@material/ripple/component';

const homeView = (office) => {
    document.getElementById('app-content').innerHTML = office
}






window.resizeIframe = function (obj) {
    console.log(obj.style.height)
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}


const changeView = (viewName, office) => {
   const viewFunction = require(`./${viewName}`)
   viewFunction[viewName](office)

}



const handleOfficeSetting = (offices, drawer) => {
    renderOfficesInDrawer(offices);
    const drawerHeader = document.querySelector('.mdc-drawer__header');
    const officeList = new MDCList(document.getElementById('office-list'));
    setOfficesInDrawer(officeList, drawer, offices);

    drawerHeader.classList.remove("hidden")
    drawer.list.listen('MDCList:action', function (event) {
        if (document.body.offsetWidth < 1040) {
            drawer.open = !drawer.open;
        }
        changeView(getCurrentViewName(drawer), offices[officeList.selectedIndex])
    })

    homeView(offices[officeList.selectedIndex])
}

export const home = (auth) => {
    window.recaptchaVerifier = null;
     const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    drawer.root_.classList.remove("hidden")
    const topAppBarElement = document.querySelector('.mdc-top-app-bar');
    const topAppBar = new MDCTopAppBar(topAppBarElement);
    showTopAppBar(topAppBar);
    handleDrawerView(topAppBar, drawer)

    window.addEventListener('resize', function (event) {
        handleDrawerView(topAppBar, drawer)
    })

    const appEl = document.getElementById('app')
    appEl.classList.add('mdc-layout-grid', 'mdc-top-app-bar--fixed-adjust');
    appEl.innerHTML = `<div class='mdc-layout-grid__inner' id='app-content'>
    </div>`
    auth.getIdTokenResult().then((idTokenResult) => {

        handleOfficeSetting(idTokenResult.claims.admin, drawer)
    }).catch(console.error)

    const signOutBtn = new MDCRipple(document.getElementById('sign-out'));
    console.log(signOutBtn);

    signOutBtn.root_.addEventListener('click', function () {
        signOut(topAppBar, drawer)
    });



    topAppBar.setScrollTarget(appEl);

    topAppBar.listen('MDCTopAppBar:nav', () => {
        drawer.open = !drawer.open;
    });

    const photoButton = document.getElementById('profile-button')
    photoButton.querySelector('img').src = auth.photoURL || './img/person.png';
    photoButton.addEventListener('click', openProfile)
    appEl.addEventListener('click', closeProfile)

}

const getUserType = (claims) => {
    if (claims.support) return 'support';
    if (claims.admin && claims.admin.length) return 'admin'
    return 'normal'
}

const renderOfficesInDrawer = (offices) => {

    const drawerHeader = document.querySelector('.mdc-drawer__header ')
    drawerHeader.innerHTML = `  
             <ul class="mdc-list" role="radiogroup" id='office-list'>
                
             ${offices.map((office,idx) => {
              
                 return `${view.radioList({
                    label:office,
                    id:idx,
                    icon: ''
                })}`
       
                }).join("")}
                <li class='mdc-list-divider'></li>
            </ul>`
}

const setOfficesInDrawer = (officeList, drawer, offices) => {
    officeList.singleSelection = true;
    officeList.selectedIndex = 0;
    console.log(officeList.selectedIndex)
    let isVisible = false;

    officeList.listElements.forEach((el, index) => {
        if (index !== officeList.selectedIndex) {
            minimizeList(index, el);
        } else {
            el.querySelector(".mdc-list-item__meta").textContent = 'keyboard_arrow_down'
        };
    });
    if (officeList.listElements.length == 1) return;
    const currentSelectedIndex = officeList.selectedIndex;

    officeList.listen('MDCList:action', function (event) {
        isVisible = !isVisible

        officeList.listElements.forEach((el, index) => {
            if (isVisible) {
                expandList(index, el)
                if (index !== officeList.selectedIndex) {
                    el.querySelector(".mdc-list-item__meta").textContent = ''
                }
            } else {
                if (index !== officeList.selectedIndex) {
                    minimizeList(index, el);
                } else {
                    el.querySelector(".mdc-list-item__meta").textContent = 'keyboard_arrow_down'
                }
            }
        });
        console.log(isVisible)
        if (offices[currentSelectedIndex] !== offices[event.detail.index]) {
            changeView(getCurrentViewName(drawer), offices[event.detail.index])
        }


    })
}

const getCurrentViewName = (drawer) => {
    return drawer.list.listElements[drawer.list.selectedIndex].dataset.value
}

const expandList = (index, el) => {
    document.querySelector('.drawer-bottom').classList.add('drawer-bottom-relative')
    el.classList.remove('hidden')
}


const minimizeList = (index, el) => {
    document.querySelector('.drawer-bottom').classList.remove('drawer-bottom-relative')
    el.classList.add('hidden')
    el.querySelector(".mdc-list-item__meta").textContent = ''
}

const showTopAppBar = (topAppBar) => {
    topAppBar.root_.classList.remove('hidden')
}
const hideTopAppBar = (topAppBar) => {
    topAppBar.root_.classList.add('hidden')
}


const handleDrawerView = (topAppBar, drawer) => {
    const width = document.body.offsetWidth
    if (width > 1040) {
        topAppBar.navIcon_.classList.add('hidden')
        drawer.root_.classList.remove('mdc-drawer--modal');
        if (drawer.foundation_.isOpen()) {
            drawer.open = false;
        };
        return
    }
    topAppBar.navIcon_.classList.remove('hidden')
    drawer.root_.classList.add('mdc-drawer--modal');
}

const openProfile = (event) => {
    const auth = firebase.auth().currentUser;
    const miniProfileEl = document.getElementById('mini-profile')
    miniProfileEl.classList.remove("hidden")
    miniProfileEl.querySelector('img').src = auth.photoURL || './img/person.png'
    miniProfileEl.querySelector('.text-container').innerHTML = `
    <div class='mdc-typography--subtitle1 name-text'>${auth.displayName}</div>
    <div class='mdc-typography--subtitle2 email-text'>${auth.email}</div>
    `
}
export const closeProfile = (e) => {
    const miniProfileEl = document.getElementById('mini-profile')
    miniProfileEl.classList.add('hidden')

}

export const signOut = (topAppBar, drawer) => {

    firebase.auth().signOut().then(function () {
        if (topAppBar && drawer) {
            document.getElementById('app').classList.remove('mdc-top-app-bar--fixed-adjust')
            drawer.root_.classList.add('mdc-drawer--modal');
            hideTopAppBar(topAppBar)
            drawer.root_.classList.add("hidden")
            drawer.open = false;
            closeProfile();
        }
    }).catch(console.log)
}