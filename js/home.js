import {
    MDCTopAppBar
} from '@material/top-app-bar';
import {
    MDCDrawer
} from "@material/drawer";
import {
    MDCTextField
} from "@material/textfield";

import * as firebase from "firebase/app";
import {
    MDCList
} from '@material/list';
import {
    radioList,
    textField,
    createDynamicLi
} from './utils';
import {
    MDCRipple
} from '@material/ripple/component';


const homeView = (office) => {
    document.getElementById('app').innerHTML = office
}
const expenses = (office) => {
    document.getElementById('app').innerHTML = office
}
const changeView = (viewName, office) => {
    switch (viewName) {
        case 'Expenses':
            expenses(office)
            break;
        default:
            homeView(office)
            break;
    }
}

const handleOfficeSetting = (offices, drawer) => {
    renderOfficesInDrawer(offices);
    const drawerHeader = document.querySelector('.mdc-drawer__header');
    const officeList = new MDCList(document.getElementById('office-list'));
    setOfficesInDrawer(officeList, drawer, offices);
    drawerHeader.classList.remove("hidden")
    drawer.list.listen('MDCList:action', function (event) {
        if (screen.width <= 1040) {
            drawer.open = !drawer.open;
        }
        changeView(getCurrentViewName(drawer), offices[officeList.selectedIndex])
    })
    homeView(offices[officeList.selectedIndex])
}

export const home = (auth) => {

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

    auth.getIdTokenResult().then((idTokenResult) => {

        let userType = getUserType(idTokenResult.claims)
        if (userType === 'support') {
            const allOffices = ['1', '2', '3']
            appEl.innerHTML = `
            <div class='pt-10'>
            ${textField({id:'search-office',label:'Search office',type:'text'})}
            <ul class='mdc-list' id='office-search-list'></ul>
            </div>
            `
            const searchField = new MDCTextField(document.getElementById('search-office'))
            searchField.foundation_.activateFocus();
            const officeSearchList = new MDCList(document.getElementById('office-search-list'))
            const searchAbleArray = []
            officeSearchList.listen('MDCList:action', function (event) {
                console.log(event)
                handleOfficeSetting([searchAbleArray[event.detail.index]], drawer);
                changeView(getCurrentViewName(drawer), searchAbleArray[event.detail.index])

            })

            searchField.input_.addEventListener('input', function (evt) {

                officeSearchList.root_.innerHTML = ''
                // allOffices.forEach(function(officename) {
                const index = allOffices.indexOf(evt.target.value)
                console.log(index)
                if (index > -1) {
                    officeSearchList.root_.appendChild(createDynamicLi(allOffices[index]))
                    searchAbleArray.push(allOffices[index])
                }

                // })
            })
            return
        }
        handleOfficeSetting(idTokenResult.claims.admin, drawer)
    }).catch(console.error)

    const signOutBtn = new MDCRipple(document.getElementById('sign-out'));
    console.log(signOutBtn);

    signOutBtn.root_.addEventListener('click', function () {
        signOut(topAppBar, drawer)
    });


    appEl.classList.add('mdc-top-app-bar--fixed-adjust')

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
              
                 return `${radioList({
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

    officeList.listen('MDCList:action', function (event) {
        isVisible = !isVisible

        officeList.listElements.forEach((el, index) => {
            if (isVisible) {
                expandList(index, el)
            } else {
                if (index !== officeList.selectedIndex) {
                    minimizeList(index, el);
                } else {
                    el.querySelector(".mdc-list-item__meta").textContent = 'keyboard_arrow_down'
                }
            }
        });
        changeView(getCurrentViewName(drawer), offices[event.detail.index])
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

    if (screen.width >= 1040) {
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
    console.log(e)
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