window.resizeIframe = function (obj) {
    console.log(obj.style.height)
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
};

window.getIframeFormData = function (body) {
    const location = require("./core").getLocation;
    location().then(function (geopoint) {
        body.geopoint = geopoint
        console.log(body)

    }).catch(function (error) {
        console.log(error)
    });
}

window.commonDom = {}

const initializer = (auth, geopoint) => {

    const linearProgress = new mdc.linearProgress.MDCLinearProgress(document.querySelector('.mdc-linear-progress'));
    linearProgress.open();
    commonDom.progressBar = linearProgress;
    auth.getIdTokenResult().then(idTokenResult => {
        linearProgress.close();
        window.recaptchaVerifier = null;
        document.body.classList.add('payment-portal-body');
        const drawer = new mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
        drawer.root_.classList.remove("hidden")
        commonDom.drawer = drawer;
        const topAppBarElement = document.querySelector('.mdc-top-app-bar');
        const topAppBar = new mdc.topAppBar.MDCTopAppBar(topAppBarElement);
        showTopAppBar(topAppBar);
        handleDrawerView(topAppBar, drawer)
        window.addEventListener('resize', function (event) {
            handleDrawerView(topAppBar, drawer);
        })

        const appEl = document.getElementById('app')
        appEl.classList.add('mdc-layout-grid', 'mdc-top-app-bar--fixed-adjust');
        appEl.innerHTML = `<div class='mdc-layout-grid__inner' id='app-content'>
    </div>`
        handleOfficeSetting(idTokenResult.claims.admin, drawer, geopoint);

        const signOutBtn = new mdc.ripple.MDCRipple(document.getElementById('sign-out'));
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
        document.querySelector('.mdc-drawer-app-content').addEventListener('click', closeProfile);
    });
}

const handleOfficeSetting = (offices, drawer, geopoint) => {
    renderOfficesInDrawer(offices);
    const drawerHeader = document.querySelector('.mdc-drawer__header');
    const officeList = new mdc.list.MDCList(document.getElementById('office-list'));
    officeList.singleSelection = true;
    officeList.selectedIndex = history.state ? offices.indexOf(history.state.office) : 0;
    setOfficesInDrawer(officeList, drawer, offices);

    drawerHeader.classList.remove("hidden")


    drawer.list.listen('MDCList:action', function (event) {
        if (document.body.offsetWidth < 1040) {
            drawer.open = !drawer.open;
        };

        changeView(getCurrentViewName(drawer), offices[officeList.selectedIndex], geopoint)
    });



    if (!history.state) {
        history.pushState({
            view: 'home',
            office: offices[officeList.selectedIndex]
        }, 'home', `/?view=home`);
    }

    changeView(history.state.view, history.state.office, geopoint);

}

function home(office, response) {
    console.log(response)
    console.log(office)

    commonDom.progressBar.close()
    commonDom.drawer.list.selectedIndex = 0;
    
    document.getElementById('app-content').innerHTML = `
    
    <div class='payments-container mdc-layout-grid__cell--span-12'>
    <div style='width:100%'>
    <div class='pay-now hidden'>
        <button class='mdc-button mdc-button--raised full-width'>Pay</button>
    </div>
    </div>
    <div class="mdc-list-group" id='payment-content'>
        ${response.pendingPayments.length ? `
            <div class='collapse-header'>
                <h3 class='mdc-typography--headline6 mdc-theme--primary'>Pending payments</h3>
                <i class='material-icons collapse-list-icon' data-type="pending-payment-list">keyboard_arrow_down</i>
            </div>
            <ul id='pending-payment-list' class='mdc-list demo-list mdc-list--two-line mdc-list--avatar-list' role='group' aria-label="payments with checkbox">
                ${response.pendingPayments.map(payment => {
                    return `${paymentList(payment)}`
                }).join("")}
             </ul>
        `:''}
        
        ${response.pendingDeposits.length ? `
            <div class='collapse-header'>
                <h3 class='mdc-typography--headline6 mdc-theme--primary'>Pending deposits</h3>
                <i class='material-icons collapse-list-icon' data-type="pending-deposit-list">keyboard_arrow_down</i>
            </div>
            <ul id='pending-deposit-list' class='mdc-list demo-list mdc-list--two-line mdc-list--avatar-list' role='group' aria-label='payments with checkbox'>
                ${response.pendingDeposits.map(deposit => {
                    return `${depositList(deposit)}`
                }).join("")}
                
            </ul>
        `:''}
        ${response.previousDeposits.length ? `
            <div class='collapse-header'>
                <h3 class='mdc-typography--headline6 mdc-theme--primary'>Previous deposits</h3>
                <i class='material-icons collpase-list-icon' data-type="previous-deposit-list">keyboard_arrow_down</i>
            </div>
            <ul id='previous-deposit-list' class='mdc-list demo-list mdc-list--two-line mdc-list--avatar-list' role='group' aria-label='payments with checkbox'>
                ${response.pendingDeposits.map(deposit => {
                    return `${depositList(deposit)}`
                }).join("")}
            </ul>
        `:''}
    </div>
    </div>
  </div>
  `;


    [...document.querySelectorAll('.collapse-list-icon')].forEach(el => {

        el.addEventListener('click',function(){
            const id = el.dataset.type
            const listEl = document.getElementById(id)
            if(listEl.classList.contains('hidden')) {
                listEl.classList.remove('hidden');
                el.textContent = 'keyboard_arrow_down'   
            }
            else {
                listEl.classList.add('hidden')
                el.textContent = 'keyboard_arrow_up'   
            }
        })
    });

    const ids = [];
    payrollListInit = new mdc.list.MDCList(document.getElementById('pending-payment-list'));
    payrollListInit.listen('MDCList:action', function (evt) {
        const paymentId = response.pendingPayments[evt.detail.index].paymentId
        const index = ids.indexOf(paymentId)
        if (index > -1) {
            ids.splice(index, 1)
        } else {
            ids.push(response.pendingPayments[evt.detail.index].paymentId);
        }
        toggleElement(payrollListInit.selectedIndex.length,document.querySelector('.pay-now'));
        console.log(ids)
    });


    document.querySelector('.pay-now .mdc-button').addEventListener('click', function () {
        http('GET', `/api/search?office=${history.state.office}&template=office`).then(officeDocument => {
            console.log(officeDocument);
            const officeKey = Object.keys(officeDocument);
            getLocation().then(geopoint => {
                http('POST', `/api/payments/select`, {
                    officeId: officeDocument[officeKey].officeId,
                    payments: ids,
                    geopoint: geopoint
                }).catch(console.error)
            }).catch(handleLocationError)
        }).catch(console.error)
    })
};


const toggleElement = (state,el) => {
    console.log(state)
    if (state) {
        el.classList.remove('hidden')
        return;
    }
    el.classList.add('hidden')
}


window.onpopstate = function (e) {
    this.console.log(e)
    changeView(e.state.view, e.state.office);
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
    let currentSelectedOffice = offices[officeList.selectedIndex];

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

        if (currentSelectedOffice !== offices[event.detail.index]) {
            changeView(getCurrentViewName(drawer), offices[event.detail.index])
            currentSelectedOffice = offices[event.detail.index]
            drawer.open = false;
        }

    })
}

const changeView = (viewName, office, geopoint) => {
    commonDom.progressBar.open();

    if (history.state.view === viewName) {
        history.replaceState({
            view: viewName,
            office: office
        }, viewName, `/?view=${viewName}`)
    } else {
        history.pushState({
            view: viewName,
            office: office
        }, viewName, `/?view=${viewName}`)
    };

    const initViews = {
        'bankDetails': true,
        'home': true,
        'expenses': true
    }
    if (!initViews[viewName]) {
        window[viewName](office);
        return;
    }

    let url = `/api/myGrowthfile?office=${office}`;
    if (geopoint) {
        url = `${url}&latitude=${geopoint.latitude}&longitude=${geopoint.longitude}`
    }

    http('GET', url).then(function (response) {
        sessionStorage.setItem('serverTime', response.timestamp - Date.now());
        window[viewName](office, response);
    }).catch(function (error) {
        if (error.code == 500) {
            initFail()
        };
        console.log(error)
    });
}


function initFail() {
    document.getElementById("app-content").innerHTML = `
<div class='mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4 text-center'>
<h3 class='mdc-typography--headline5 mdc-theme--error'>An error occured. Please try after sometime</h3>
</div>

`
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
const closeProfile = (e) => {

    const miniProfileEl = document.getElementById('mini-profile')
    miniProfileEl.classList.add('hidden')

}


function bankDetails(office, response) {
    commonDom.progressBar.close();
    commonDom.drawer.list_.selectedIndex = 1;

    document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell'>
    ${response.paymentMethods.map(function(method){
        return `<div class="mdc-card  mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
    
        <div class="demo-card__primary full-pad">
            <div class="card-heading">
                <span class="demo-card__title mdc-typography mdc-typography--headline6">Bank transfer</span>
                <div class="mdc-typography--caption">Virtual bank Account : ${method.bankAccount}}</div>
                <div class="mdc-typography--caption mdc-theme--primary">IFSC : ${method.ifsc}</div>
            </div>
        </div>
    </div>
        </div>`
    }).join("")}
    </div>
    `
}

function businessProfile(office) {
    http('GET', `/api/search?office=${office}&template=office`).then(response => {
        console.log(response);
        const key = Object.keys(response)[0];
        commonDom.progressBar.close();
        commonDom.drawer.list_.selectedIndex = 4;

        document.getElementById('app-content').innerHTML = `
            <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    
            <div class="mdc-card expenses-card mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone mdc-card--outlined">
            <div class="demo-card__primary">
                <div class="card-heading">
                    <span class="demo-card__title mdc-typography mdc-typography--headline6">${office}</span>
                </div>
                <div class='recipients-container' tabindex="0">
                    ${response[key].attachment['Company Logo'].value ? `<img style='width:40px;height:40px'border-radius:50%;' src ='${response[key].attachment['Company Logo'].value}>` : `<i class='material-icons'>business</i>`}
                </div>
            </div>
            <div class='demo-card__secondary mdc-typography mdc-typography--body2' style='padding:20px;padding-top:0px;'>
            <ul class='mdc-list'>
                <li class='mdc-list-item' style='padding-left:0px;'>
                    <span class='mdc-list-item__graphic material-icons'>location_on</span>
                    ${response[key].attachment['Registered Office Address'].value}
                </li>
                <li class='mdc-list-item' style='padding-left:0px;'>
                    <span class='mdc-list-item__graphic material-icons'>phone</span>
                    ${response[key].attachment['First Contact'].value} (First Contact)
                </li>

                ${response[key].attachment['Second Contact'].value ? `
                <li class='mdc-list-item' style='padding-left:0px;'>
                <span class='mdc-list-item__graphic material-icons'>phone</span>
                ${response[key].attachment['Second Contact'].value} (Second Contact) 
                </li>` :''}

               
            <li class='mdc-list-divider'></li>
            </ul>
          
            <div class='mdc-typography--body1'>
               ${response[key].attachment['Short Description'].value}
            </div>
            </div>
            <div class="mdc-card__actions mdc-card__actions--full-bleed">
            <button class="mdc-button mdc-card__action mdc-card__action--button" id='open-leave-type'>
              <span class="mdc-button__label">Manage ${office} </span>
              <i class="material-icons" aria-hidden="true">arrow_forward</i>
            </button>
            
            </div>
        </div>
            </div>
            </div>
            <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
           
            `
    }).catch(console.error)


}

function help(office){
    commonDom.progressBar.close();
    commonDom.drawer.list_.selectedIndex = 5;
    const auth = firebase.auth().currentUser;
    document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    <div class='mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-6-tablet mdc-layout-grid__cell--span-4-phone'>
    <div class='mdc-form-field help-form'>
    
    <div class='mb-10'>
        ${textFieldFilled({id:'name-contact',label:'Name',type:'text',value:auth.displayName})}
    </div>
    <div class='mb-10'>
        ${textFieldFilled({id:'email-contact',label:'Email',type:'email',value:auth.email})}
    </div>
    <div class='mb-10'>
        <div class="mdc-text-field mdc-text-field--textarea" id='enquiry-contact'>
            <textarea id="textarea" class="mdc-text-field__input" rows="5" cols="40"></textarea>
            <div class="mdc-notched-outline">
            <div class="mdc-notched-outline__leading"></div>
            <div class="mdc-notched-outline__notch">
                <label for="textarea" class="mdc-floating-label">Description</label>
            </div>
            <div class="mdc-notched-outline__trailing"></div>
            </div>
        </div>
    </div>
    <button class='mdc-button mdc-button--raised middle' id='submit-help'>
        <span class='mdc-button--label'>SUBMIT</span>
    </button>
    </div>
    </div>
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
   
    `
    const nameField = new mdc.textField.MDCTextField(document.getElementById('name-contact'))
    const emailContact = new mdc.textField.MDCTextField(document.getElementById('email-contact'))
    const enquiry = new mdc.textField.MDCTextField(document.getElementById('enquiry-contact'))
    const submit = new mdc.ripple.MDCRipple(document.getElementById('submit-help'))
}