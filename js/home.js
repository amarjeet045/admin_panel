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
    createDynamicLi,
    tempUI
} from './utils';
import {
    MDCRipple
} from '@material/ripple/component';
import {MDCDataTable} from '@material/data-table';

const homeView = (office) => {
    document.getElementById('app').innerHTML = office
}
const expenses = (office) => {
    document.getElementById('app').innerHTML = tempUI(office);
    document.getElementById('s').ondblclick = function(){
        document.getElementById('app').innerHTML = `
        <div class='mdc-layout-grid'>

        ${panel()}
        <p class='mdc-typography'>Bulk upload api</p>
        <div class="mdc-layout-grid__inner">
      
        <div class="mdc-layout-grid__cell--span-3">
        <button class="mdc-button mdc-button--raised">
            <span class="mdc-button__label">ADD NEW EMPLOYEES</span>
        </button>
        </div>
        <div class="mdc-layout-grid__cell--span-3">
        <button class="mdc-button">
            <span class="mdc-button__label">DOWNLOAD SAMPLE</span>
        </button>
        </div>
        <div class="mdc-layout-grid__cell--span-6">
            <div class='search-bar'>
                ${textField({label:'Search Employee',type:'text',id:'search'})}  
            </div>
            <p class='mdc-typography'>Search api <code>/api?office=${office}&query={employeeContact || employeeName} (GET)</code></p>

        </div>

        <div class="mdc-layout-grid__cell--span-12">
            <p class='mdc-typography'>Render table from employee activity taken from search api</p>
            ${table()}
        </div>
        </div>
    </div>
        `
        const t = new MDCTextField(document.getElementById('search'))
        const dataTable = new MDCDataTable(document.querySelector('.mdc-data-table'));
        document.getElementById('click-row').onclick = function(){
            document.querySelector('.b3id-timeline-view-section').classList.add('expanded')
        }
        document.getElementById('c').onclick = function(){
            document.querySelector('.b3id-timeline-view-section').classList.remove('expanded')
            document.querySelector('.b3id-timeline-view-section').classList.add('collapsed')

        }
    }

}

const panel = () => {
    return `<div class="b3id-timeline-view-section b3-timeline-view-section last-item b3-component-group-no-title b3id-section b3-section flyout toplevel collapsed"
    tabindex="0" data-ui-reference="3023" data-sub-component-group-class="childSectionId-8976697432725106034"
    data-ui-reference-list="[2006, 3031, 6102]" data-ui-type="7" data-was-visible="true">
    <div class="b3-section-outer-content b3id-section-outer-content" data-was-visible="true"
        style="top: 1px; height: auto;">
        <div class="b3-section-header-container" data-was-visible="true"><span
                class="b3id-section-close b3-section-close goog-control" tabindex="0" role="button" aria-label="Close"
                style="user-select: none;"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px"
                    viewBox="0 0 24 24" id='c'>
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
                    </path>
                    <path d="M0 0h24v24H0z" fill="none"></path>
                </svg></span></div>
        <div class="b3id-section-content-container b3-section-inner-content" data-was-visible="true">
            <div class="b3id-timeline-view-simple-form b3-timeline-view-simple-form b3id-simple-form b3-simple-form"
                data-ui-reference="2006" data-component-name="SIMPLE_FORM" data-label="">
                <div class="b3id-form-header b3-form-header b3id-simple-form-form-header with-no-content"
                    data-id="-5201488696692163999" data-ui-reference="2006"></div>
                <div class="b3id-form-field b3-simple-form-form-field">
                    <div class="b3id-simple-form-field b3-simple-form-field b3id-form-field-field">
                        <div
                            class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-field-info-message b3-field-info-message">
                      
                            <div class="b3id-info-message-html b3-info-message-html b3-info-message-image-message">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="b3id-form-field b3-simple-form-form-field">
                    <div class="b3id-sub-form b3id-form-field-sub-form b3-form-field-sub-form"
                        data-ui-reference="26595">
                        <div class="b3id-form-header b3-form-header b3id-sub-form-form-header with-no-content"
                            data-id="-7994200650037573178" data-ui-reference="26595"></div>
                        <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                            <div
                                class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-field-info-message b3-field-info-message">
                                <div class="b3id-info-message-html b3-info-message-html"><span>Oct 31, 2018, 8:02
                                        AM</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="b3id-table b3-table" data-ui-reference="3031">
                <table class="b3id-widget-table b3-widget-table">
                    <tbody>
                        <tr class="b3id-widget-table-header-row b3-widget-table-header-row" data-ui-reference="48086"
                            data-row-type="2">
                            <th class="b3id-widget-table-header-cell b3-widget-table-header-cell b3-widget-table-cell-text"
                                role="gridcell" tabindex="0" data-ui-reference="89045" scope="col">
                                <div class="b3id-cell-container b3-cell-container">
                                    <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                        <div
                                            class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-table-info-message">
                                            <div class="b3id-info-message-html b3-info-message-html"><span>Item</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th class="b3id-widget-table-header-cell b3-widget-table-header-cell b3-widget-table-cell-numeric"
                                role="gridcell" tabindex="0" data-ui-reference="93141" scope="col">
                                <div class="b3id-cell-container b3-cell-container">
                                    <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                        <div
                                            class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-table-info-message">
                                            <div class="b3id-info-message-html b3-info-message-html"><span>Price
                                                    (INR)</span></div>
                                        </div>
                                    </div>
                                </div>
                            </th>
                        </tr>
                        <tr class="b3id-widget-table-data-row b3-widget-table-data-row" role="row"
                            data-ui-reference="52182" data-row-type="1">
                            <td class="b3id-widget-table-data-cell b3-widget-table-data-cell b3-widget-table-cell-text"
                                role="gridcell" tabindex="0" data-ui-reference="97237">
                                <div class="b3id-cell-container b3-cell-container">
                                    <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                        <div
                                            class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-table-info-message">
                                            <div class="b3id-info-message-html b3-info-message-html">
                                          </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="b3id-widget-table-data-cell b3-widget-table-data-cell b3-widget-table-cell-numeric"
                                role="gridcell" tabindex="0" data-ui-reference="101333">
                                <div class="b3id-cell-container b3-cell-container">
                                    <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                        <div
                                            class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-table-info-message">
                                            <div class="b3id-info-message-html b3-info-message-html">
                                                <span>₹340.00</span></div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr class="b3id-widget-table-data-row b3-widget-table-data-row b3-receipt-total-row" role="row"
                            data-ui-reference="56278" data-row-type="1">
                            <td class="b3id-widget-table-data-cell b3-widget-table-data-cell b3-widget-table-cell-text"
                                role="gridcell" tabindex="0" data-ui-reference="105429">
                                <div class="b3id-cell-container b3-cell-container">
                                    <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                        <div
                                            class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-table-info-message">
                                            <div class="b3id-info-message-html b3-info-message-html"><span>Total</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="b3id-widget-table-data-cell b3-widget-table-data-cell b3-widget-table-cell-numeric"
                                role="gridcell" tabindex="0" data-ui-reference="109525">
                                <div class="b3id-cell-container b3-cell-container">
                                    <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                        <div
                                            class="b3id-info-message-component b3-info-message-component b3-info-message-emphasis b3id-table-info-message">
                                            <div class="b3id-info-message-html b3-info-message-html"><span>₹0.00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="b3id-timeline-view-simple-form b3-timeline-view-simple-form b3id-simple-form b3-simple-form"
                data-ui-reference="6102" data-component-name="SIMPLE_FORM" data-label="">
                <div class="b3id-form-header b3-form-header b3id-simple-form-form-header with-no-content"
                    data-id="-7085739701070148207" data-ui-reference="6102"></div>
                <div class="b3id-form-field b3-simple-form-form-field">
                    <div class="b3id-sub-form b3id-form-field-sub-form b3-form-field-sub-form"
                        data-ui-reference="30691">
                        <div class="b3id-form-header b3-form-header b3id-sub-form-form-header with-no-content"
                            data-id="-1766474237790175733" data-ui-reference="30691"></div>
                        <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                            <div
                                class="b3id-info-message-component b3-info-message-component b3-info-message-emphasis b3id-field-info-message b3-field-info-message">
                                <div class="b3id-info-message-html b3-info-message-html"><span>Payment method</span>
                                </div>
                            </div>
                        </div>
                        <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                            <div
                                class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-field-info-message b3-field-info-message">
                                <div class="b3id-info-message-html b3-info-message-html">
                                    <span>Mastercard •••• 1120</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="b3id-form-field b3-simple-form-form-field">
                    <div class="b3id-sub-form b3id-form-field-sub-form b3-form-field-sub-form"
                        data-ui-reference="34787">
                        <div class="b3id-form-header b3-form-header b3id-sub-form-form-header with-no-content"
                            data-id="2225647067834427065" data-ui-reference="34787"></div>
                        <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                            <div
                                class="b3id-info-message-component b3-info-message-component b3-info-message-emphasis b3id-field-info-message b3-field-info-message">
                                <div class="b3id-info-message-html b3-info-message-html"><span>Transaction ID</span>
                                </div>
                            </div>
                        </div>
                        <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                            <div
                                class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-field-info-message b3-field-info-message">
                                <div class="b3id-info-message-html b3-info-message-html">
                                    <span>GPA.3330-7017-8943-85753..0</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="b3id-form-field b3-simple-form-form-field">
                    <div class="b3id-sub-form b3id-form-field-sub-form b3-form-field-sub-form"
                        data-ui-reference="26582">
                        <div class="b3id-form-header b3-form-header b3id-sub-form-form-header with-no-content"
                            data-id="-3920504449100019210" data-ui-reference="26582"></div>
                        <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                            <div
                                class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-field-info-message b3-field-info-message">
                                <div class="b3id-info-message-html b3-info-message-html"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="b3id-page-overlay-spinner b3-page-overlay-spinner " style="display: none;">
            <div class="b3id-page-overlay b3-page-overlay"></div>
            <div class="b3id-spinner-section b3-spinner-section">
                <div class="b3-quantum-spinner"></div>
                <div class="b3-spinner-message b3-quantum-spinner-message"></div>
            </div>
        </div>
    </div>
</div>`
}

const  table = () =>{
    return `
  <div class="mdc-data-table" style='width:100%'>
    <table class="mdc-data-table__table" aria-label="Dessert calories">
      <thead>
        <tr class="mdc-data-table__header-row">
          <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Dessert</th>
          <th class="mdc-data-table__header-cell mdc-data-table__header-cell--numeric" role="columnheader" scope="col">Carbs (g)</th>
          <th class="mdc-data-table__header-cell mdc-data-table__header-cell--numeric" role="columnheader" scope="col">Protein (g)</th>
          <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Comments</th>
        </tr>
      </thead>
      <tbody class="mdc-data-table__content">
        <tr class="mdc-data-table__row">
          <td class="mdc-data-table__cell" id='click-row'>USER1 <strong>( Click here  to edit employee)</strong> </td>
          <td class="mdc-data-table__cell mdc-data-table__cell--numeric">24</td>
          <td class="mdc-data-table__cell mdc-data-table__cell--numeric">4.0</td>
          <td class="mdc-data-table__cell">Super tasty</td>
        </tr>
        <tr class="mdc-data-table__row">
          <td class="mdc-data-table__cell">USER 2</td>
          <td class="mdc-data-table__cell mdc-data-table__cell--numeric">37</td>
          <td class="mdc-data-table__cell mdc-data-table__cell--numeric">4.33333333333</td>
          <td class="mdc-data-table__cell">I like ice cream more</td>
        </tr>
        <tr class="mdc-data-table__row">
          <td class="mdc-data-table__cell">USER 3</td>
          <td class="mdc-data-table__cell mdc-data-table__cell--numeric">24</td>
          <td class="mdc-data-table__cell mdc-data-table__cell--numeric">6.0</td>
          <td class="mdc-data-table__cell">New filing flavor</td>
        </tr>
      </tbody>
    </table>
  </div>
  
    `
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
        if(userType === 'normal') {
            handleOfficeSetting([], drawer)
            return;
        }
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