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

const initializer = (auth) => {
    
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
        handleOfficeSetting(idTokenResult.claims.admin, drawer);

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

const handleOfficeSetting = (offices, drawer) => {
    renderOfficesInDrawer(offices);
    const drawerHeader = document.querySelector('.mdc-drawer__header');
    const officeList = new mdc.list.MDCList(document.getElementById('office-list'));
    setOfficesInDrawer(officeList, drawer, offices);

    drawerHeader.classList.remove("hidden")


    drawer.list.listen('MDCList:action', function (event) {
        if (document.body.offsetWidth < 1040) {
            drawer.open = !drawer.open;
        };

        changeView(getCurrentViewName(drawer), offices[officeList.selectedIndex])
    });



    if (!history.state) {
        history.pushState({
            view: 'home',
            office: offices[officeList.selectedIndex]
        }, 'home', `/?view=home`);
    }

    changeView(history.state.view, history.state.office);

}

function home(office, response) {
    console.log(response)
    console.log(office)
    const payments = [{
        amount: "₹400",
        id: '#1anslkdas-129390123',
        date: '22 Sep',
        summary: 'Rewarded as part of google scratch pay card from google pay',
        to: 'Company or individual Name',
        photoURL: '../img/person.png'
    }, {
        amount: "₹300",
        id: '#1anslkdas-129390123',
        date: '22 Sep',
        summary: 'Rewarded as part of google scratch pay card from google pay',
        to: 'Company or individual Name',
        photoURL: '../img/person.png'
    }, {
        amount: '₹100',
        id: '#1anslkdas-129390123',
        date: '22 Sep',
        summary: 'Rewarded as part of google scratch pay card from google pay',
        to: 'Company or individual Name',
        photoURL: '../img/person.png'
    }, {
        amount: '₹900',
        id: '#1anslkdas-129390123',
        date: '22 Sep',
        summary: 'Rewarded as part of google scratch pay card from google pay',
        to: 'Company or individual Name',
        photoURL: '../img/person.png'
    }]


    console.log('home');
    commonDom.progressBar.close()
    commonDom.drawer.list.selectedIndex = 0;
    document.getElementById('app-content').innerHTML = `
    <div class='payment-container mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet'>

    <div class="mdc-form-field payment-form">
    <div class='select-all-checkbox mdc-menu-surface--anchor' id='payment-select-all'>
    
    <div class="mdc-checkbox">
    <input type="checkbox" id="my-checkbox" class="mdc-checkbox__native-control"/>
    <div class="mdc-checkbox__background">
    <svg class="mdc-checkbox__checkmark"
    viewBox="0 0 24 24">
    <path class="mdc-checkbox__checkmark-path"
    fill="none"
    d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
    </svg>
    <div class="mdc-checkbox__mixedmark"></div>
    </div>
    </div>
    <i class='material-icons' style='margin-left:-10px;'>arrow_drop_down</i>
    <div class="mdc-menu mdc-menu-surface">
    <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
      <li class="mdc-list-item" role="menuitem" data-type='payroll'>
        <span class="mdc-list-item__text">Payroll</span>
      </li>
      <li class="mdc-list-item" role="menuitem" data-type='reimbursements'>
        <span class="mdc-list-item__text">Reimbursements</span>
      </li>
    </ul>
  </div>
 
      </div>
    <label for="my-checkbox" class='mdc-typography--headline6 mdc-theme--primary'>Payments</label>
    <div class='pay-now hidden' style='margin-left:auto;'>
    <button class='mdc-button mdc-button--raised'>Pay</button>
  </div>
  </div>
    <div class='payments-container'>
    
    
    
    <div class="mdc-list-group">
   
   
    <ul class="mdc-list demo-list mdc-list--two-line mdc-list--avatar-list" role="group" aria-label="List with checkbox items" id='pay'>
            ${payments.map(function(pay){
                        return `<li class="mdc-list-item" role="checkbox" aria-checked="false" style='height: auto;
                        padding-bottom: 10px;'>
                        <span class="mdc-list-item__graphic">
                          <div class="mdc-checkbox">
                            <input type="checkbox"
                                    class="mdc-checkbox__native-control"
                                    id="demo-list-checkbox-item-1"  />
                            <div class="mdc-checkbox__background">
                              <svg class="mdc-checkbox__checkmark"
                                    viewBox="0 0 24 24">
                                <path class="mdc-checkbox__checkmark-path"
                                      fill="none"
                                      d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                              </svg>
                              <div class="mdc-checkbox__mixedmark"></div>
                            </div>
                          </div>
                        </span>
                        <img class='mdc-list-item__graphic' src='${pay.photoURL}'>
                        <span class="mdc-list-item__text">
                        <span class="mdc-list-item__primary-text">${pay.to}</span>
                        <span class="mdc-list-item__secondary-text">${pay.date}
                        <br>
                        <span>${pay.summary}</span>
                        </span>
                      </span>
                      <span class='mdc-list-item__meta text-center'>
                      <span style='font-size:22px;' class='mdc-theme--primary'>${pay.amount}</span>
                      </span>

                      </li>`
            }).join("")}
            <li class='mdc-list-divider'></li>
    </ul>
   
 
    <ul class="mdc-list demo-list mdc-list--two-line mdc-list--avatar-list" role="group" aria-label="List with checkbox items" id='reim'>
            ${payments.map(function(pay){
                        return `<li class="mdc-list-item" role="checkbox" aria-checked="false" style='height: auto;
                        padding-bottom: 10px;'>
                        <span class="mdc-list-item__graphic">
                          <div class="mdc-checkbox">
                            <input type="checkbox"
                                    class="mdc-checkbox__native-control"
                                    id="demo-list-checkbox-item-1"  />
                            <div class="mdc-checkbox__background">
                              <svg class="mdc-checkbox__checkmark"
                                    viewBox="0 0 24 24">
                                <path class="mdc-checkbox__checkmark-path"
                                      fill="none"
                                      d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                              </svg>
                              <div class="mdc-checkbox__mixedmark"></div>
                            </div>
                          </div>
                        </span>
                        <img class='mdc-list-item__graphic' src='${pay.photoURL}'>
                        <span class="mdc-list-item__text">
                        <span class="mdc-list-item__primary-text">${pay.to}</span>
                        <span class="mdc-list-item__secondary-text">${pay.date}
                        <br>
                        <span>${pay.summary}</span>
                        </span>
                      </span>
                      <span class='mdc-list-item__meta text-center'>
                      <span style='font-size:22px;' class='mdc-theme--primary'>${pay.amount}</span>
                      <div class='mdc-typography--subtitle2' style='color:black;'>Breakfast</div>
                      </span>
                      </li>`
            }).join("")}
    </ul>
    </div>
    </div>
  </div>
  `;

    const menu = new mdc.menu.MDCMenu(document.querySelector('.mdc-menu'));
    menu.listen('MDCMenu:selected', function (evt) {
        console.log(evt.detail)

    })
    document.querySelector('#payment-select-all i').addEventListener('click', function () {
        menu.open = true;
        console.log(menu)
        menu.root_.classList.add('select-all-menu-open')
    })

    const payrollList = new mdc.list.MDCList(document.getElementById('pay'))
    const reimList = new mdc.list.MDCList(document.getElementById('reim'))

    payrollList.listen('MDCList:action', function (evt) {
        console.log(evt)
        togglePayButton(payrollList.selectedIndex.length);
    })
    reimList.listen('MDCList:action', function (evt) {
        togglePayButton(reimList.selectedIndex.length);
    })

    const selectAll = new mdc.checkbox.MDCCheckbox(document.querySelector('#payment-select-all .mdc-checkbox'))
    console.log(selectAll)

    selectAll.listen('change', function (evt) {
        console.log(evt);
        if (selectAll.checked) {
            list.selectedIndex = [0, 1, 2, 3]
        } else {
            list.selectedIndex = []
        };
        togglePayButton(list.selectedIndex.length);
    });

    selectAll.handleChange_();
};


const togglePayButton = (state) => {
    if (state) {
        document.querySelector('.pay-now').classList.remove('hidden')
        return;
    }
    document.querySelector('.pay-now').classList.add('hidden')
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

        if (offices[currentSelectedIndex] !== offices[event.detail.index]) {
            changeView(getCurrentViewName(drawer), offices[event.detail.index])
        }

    })
}

const changeView = (viewName, office) => {
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


    getLocation().then(geopoint => {
        http('GET', `/api/myGrowthfile?office=${office}&latitude=${geopoint.latitude}&longitude=${geopoint.longitude}`).then(function (response) {
            sessionStorage.setItem('serverTime',response.timestamp - Date.now());
            window[viewName](office, response);

        }).catch(function (error) {

            if (error.code == 500) {
                initFail()
            };
        });
    }).catch(error => {

        handleLocationError(error)
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
        return `<div class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
    
        <div class="demo-card__primary">
            <div class="card-heading">
                <span class="demo-card__title mdc-typography mdc-typography--headline6">Bank Account : ${method.bankAccount}</span>
                <div class="mdc-typography--caption mdc-theme--primary">IFSC : ${method.ifsc}</div>
            </div>
        </div>
    
        <div class="mdc-card__actions mdc-card__actions--full-bleed">
        <button class="mdc-button mdc-card__action mdc-card__action--button">
          <span class="mdc-button__label">Manage </span>
          <i class="material-icons" aria-hidden="true">arrow_forward</i>
        </button>
        </div>
    </div>
        </div>`
    }).join("")}
    </div>


    `
}

function businessProfile(office) {

    commonDom.progressBar.close();
    commonDom.drawer.list_.selectedIndex = 1;

    document.getElementById('app-content').innerHTML = `
        <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>

        <div class="mdc-card expenses-card mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone mdc-card--outlined">
        <div class="demo-card__primary">
            <div class="card-heading">
                <span class="demo-card__title mdc-typography mdc-typography--headline6">Puja Capital</span>
            </div>
            <div class='recipients-container' tabindex="0">
                <img src='../img/icon.png' style='width:40px;height:40px'border-radius:50%;'>
            </div>
        </div>
        <div class='demo-card__secondary mdc-typography mdc-typography--body2' style='padding:20px;padding-top:0px;'>
        <ul class='mdc-list'>
            <li class='mdc-list-item' style='padding-left:0px;'>
                <span class='mdc-list-item__graphic material-icons'>location_on</span>
                Nehru place ,new delhi , india 110085
            </li>
            <li class='mdc-list-item' style='padding-left:0px;'>
                <span class='mdc-list-item__graphic material-icons'>phone</span>
                    +919999288921 (First supervisor)
            </li>
            <li class='mdc-list-item' style='padding-left:0px;'>
            <span class='mdc-list-item__graphic material-icons'>phone</span>
                +919999288921  (Second supervisor)
        </li>
        <li class='mdc-list-divider'></li>
        </ul>
      
        <div class='mdc-typography--body1'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque quis risus tempor, accumsan ante venenatis, vestibulum neque. Nam volutpat dolor cursus diam lobortis, eget aliquet ligula bibendum
        </div>
        </div>
        <div class="mdc-card__actions mdc-card__actions--full-bleed">
        <button class="mdc-button mdc-card__action mdc-card__action--button" id='open-leave-type'>
          <span class="mdc-button__label">Manage Puja Capital </span>
          <i class="material-icons" aria-hidden="true">arrow_forward</i>
        </button>
        
        </div>
    </div>
        </div>
        </div>
        <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
       
        `

}