let isNewUser;
let drawer
const initializer = (geopoint) => {
    if(!window.commonDom) {
        window.commonDom = {}
    }
    const auth = firebase.auth().currentUser;
    auth.getIdToken(true)
    // history.pushState(null, null, null)
    const linearProgress = new mdc.linearProgress.MDCLinearProgress(document.querySelector('.mdc-linear-progress'));
    linearProgress.open();
    commonDom.progressBar = linearProgress;
    auth.getIdTokenResult().then(idTokenResult => {
        linearProgress.close();
        window.commonDom.support = idTokenResult.claims.support;

        window.recaptchaVerifier = null;
        document.body.classList.add('payment-portal-body');
        drawer = new mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
        commonDom.drawer = drawer;
        const topAppBarElement = document.querySelector('.mdc-top-app-bar');
        const topAppBar = new mdc.topAppBar.MDCTopAppBar(topAppBarElement);
        showTopAppBar(topAppBar);
        handleDrawerView(topAppBar, drawer)
        window.addEventListener('resize', function (event) {
            handleDrawerView(topAppBar, drawer);
        })

        const appEl = document.getElementById('app')
        appEl.innerHTML = `<div id='app-content'></div>`


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

        if (idTokenResult.claims.support) {
            window.isSupport = true
            searchOfficeForSupport(geopoint)
            return
        }
        window.isSupport = false
        const param = new URLSearchParams(window.location.search)
        if (param.get("u") === '1') {
            isNewUser = true;
        }
        return handleAdmin(geopoint, idTokenResult.claims.admin)
    }).catch(function (err) {
        sendErrorLog({
            message: err.message,
            stack: err.stack
        })
    });
}


const handleAdmin = (geopoint, offices) => {

    document.getElementById('app-content').classList.add('mdc-layout-grid__inner')
    document.getElementById('app-content').innerHTML = ''
    commonDom.drawer.root_.classList.remove("hidden")
    handleOfficeSetting(offices, commonDom.drawer, geopoint);
}

const searchOfficeForSupport = (geopoint) => {
    http('GET', '/json?action=office-list').then(officeNames => {


        const appEl = document.getElementById('app-content');

        appEl.innerHTML = `
    <div class='support-search-container'>
        <div class='search-bar mdc-layout-grid__cell'>
            ${textField({
                label:'Search office',
                id:'search-office',
            })}
        </div>
        <ul class='mdc-list hidden' id='office-list-support'>
            ${officeNames.names.map(name=>{
                return `<li class='mdc-list-item' data-name="${name}">${name}</li>`
            }).join("")}
        </ul>
    </div>
    `

        const searchField = new mdc.textField.MDCTextField(document.getElementById('search-office'));
        const list = new mdc.list.MDCList(document.getElementById('office-list-support'));
        list.listen('MDCList:action', function (event) {
            const selectedOffice = officeNames.names[event.detail.index];

            handleAdmin(geopoint, [selectedOffice])

        })
        searchField.input_.addEventListener('input', function (event) {
            const value = event.target.value.toLowerCase();
            if (!value.trim()) return
            list.root_.classList.remove('hidden');

            list.listElements.forEach(el => {
                if (el.dataset.name.toLowerCase().indexOf(value) > -1) {
                    el.classList.remove('hidden')
                } else {
                    el.classList.add('hidden')
                }
            })

        })
    })

}




const handleOfficeSetting = (offices, drawer, geopoint) => {
    renderOfficesInDrawer(offices);
    const drawerHeader = document.querySelector('.mdc-drawer__header');
    const officeList = new mdc.list.MDCList(document.getElementById('office-list'));
    officeList.singleSelection = true;

    const param = new URLSearchParams(window.location.search);
    if (isNewUser || param.get('action') === 'add-users') {
        const index = offices.indexOf(localStorage.getItem('selected_office'));
        officeList.selectedIndex = index
    } else {
        officeList.selectedIndex = 0;
    }

    setOfficesInDrawer(officeList, drawer, offices);
    drawerHeader.classList.remove("hidden")
    drawer.list.listen('MDCList:action', function (event) {
        if (document.body.offsetWidth < 1040) {
            drawer.open = !drawer.open;
        };
        changeView(getCurrentViewName(drawer), getCurrentActionName(drawer), offices[officeList.selectedIndex], drawer.list.selectedIndex)
    });


    history.pushState({
        view: 'Users',
        action: getCurrentActionName(drawer),
        office: offices[officeList.selectedIndex]
    }, 'users', `?view=Users${isNewUser ? '&u=1' : ''}`);

    // clearBreadCrumbs()
    // updateBreadCrumb('Users')
    // commonDom.drawer.list.selectedIndex = 0;
    // window['users'](offices[officeList.selectedIndex]);
    changeView(history.state.view, history.state.action, history.state.office, drawer.list.selectedIndex);
    // if (!history.state) {
    // }


    // let url = `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${offices[officeList.selectedIndex]}&field=roles&field=types`;
    // http('GET', url).then(function (response) {
    // return changeView(history.state.view, history.state.office, drawer.list.selectedIndex, response);
    // if (getUsersCount(response.roles).totalUsers < 20) {
    //     redirectToShare(drawer, response)
    //     return
    // }
    // })
}

function redirectToShare(drawer, response) {
    drawer.list.selectedIndex = 0
    // history.pushState({
    //     view: 'settings',
    //     office: history.state.office
    // }, 'settings', `?view=Settings${isNewUser ? '&u=1' : ''}`)
    updateBreadCrumb('Users')
    updateState({
        office: history.state.office,
        view: 'Users',
        action: 'manageUsers'
    }, history.state.office, response)
}

function manageInvoices() {
    const el = document.getElementById('app-content');
    el.innerHTML = ''
    const cont = createElement('div', {
        className: 'coming--soon-container mdc-layout-grid__cell--span-12'
    })

    const img = createElement('img', {
        src: '../img/coming-soon.svg',
    })
    const div = createElement('div', {
        className: 'mdc-typography--headline4 bold text-center mt-20',
        textContent: "Coming soon"
    })
    cont.appendChild(img)
    cont.appendChild(div)

    el.appendChild(cont)
}

function managePayments(office, res) {
    const el = document.getElementById('app-content');
    el.innerHTML = ''
    const cont = createElement('div', {
        className: 'coming--soon-container mdc-layout-grid__cell--span-12'
    })

    const img = createElement('img', {
        src: '../img/coming-soon.svg',
    })
    const div = createElement('div', {
        className: 'mdc-typography--headline4 bold text-center mt-20',
        textContent: "Coming soon"
    })
    cont.appendChild(img)
    cont.appendChild(div)

    el.appendChild(cont)

    // document.getElementById('app-content').innerHTML = '';
    // if (res) {
    //     return showPaymentView(office, res)
    // }
    // let url = `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=vouchers&field=batched&field=deposits&field=roles`;
    // http('GET', url).then(function (response) {
    //     showPaymentView(office, response)
    // }).catch(function (error) {
    //     if (error.code == 500) {
    //         initFail()
    //     };
    //     console.log(error)
    // });
};


const showPaymentView = (office, response) => {
    if (!response.vouchers.length && !response.batches.length && !response.deposits.length) {
        document.getElementById('app-content').innerHTML = `<h3 class='mdc-typography--headline4 mdc-layout-grid__cell--span-12'>No payments found</h3>`
        return
    }
    commonDom.progressBar.close();
    const pendingVouchers = getPendingVouchers(response.vouchers)
    document.getElementById('app-content').innerHTML = `

    <div class='payments-container mdc-layout-grid__cell--span-12'>

    <div class="mdc-list-group">
    ${pendingVouchers.length ? `

        <div class="mdc-form-field voucher-selection-form">

            <div class="mdc-checkbox" id='voucher-box'>
                <input type="checkbox"
                    class="mdc-checkbox__native-control"
                    id="voucher-selection"/>
                <div class="mdc-checkbox__background">
                    <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                        <path class="mdc-checkbox__checkmark-path"
                            fill="none"
                            d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                    </svg>
                <div class="mdc-checkbox__mixedmark"></div>
                </div>
                <div class="mdc-checkbox__ripple"></div>
                </div>
                <div class='mdc-menu-surface--anchor'>
                    <i class='material-icons' for="voucher-selection" id='voucher-icon'>keyboard_arrow_down</i>
                    <div class="mdc-menu mdc-menu-surface" id='voucher-menu'>
                        <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
                            <li class="mdc-list-item" role="menuitem">
                                <span class="mdc-list-item__text">All</span>
                            </li>
                            <li class="mdc-list-item" role="menuitem">
                            <span class="mdc-list-item__text">None</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class='pay-now hidden'>
                    <button class='mdc-button mdc-button--raised full-width'>Pay</button>
                </div>
        </div>
        <ul id='voucher-list' class='mdc-list demo-list mdc-list--two-line mdc-list--avatar-list' role='group' aria-label="payments with checkbox">
            ${pendingVouchers.map(voucher => {
                return `${voucherList(voucher)}`
            }).join("")}
         </ul>
    `:''}
</div>
    <div class='batch-container mt-20'>
        ${response.batches.length ? `
            <div class='batch-cards mdc-layout-grid__inner' id='batch-container'></div>
        `:''}
    </div>
    </div>
  </div>
  `;


    const batchCont = document.getElementById('batch-container');
    const sortBatches = response.batches.sort((a, b) => {
        return b.updatedAt - a.updatedAt
    })
    sortBatches.forEach(function (batch) {
        batchCont.appendChild(batchCard(batch, response.vouchers, response.deposits, office));
    })



    const voucherListEl = document.getElementById('voucher-list');
    if (!voucherListEl) return;
    const voucherBox = new mdc.checkbox.MDCCheckbox(document.getElementById("voucher-box"));
    voucherListInit = new mdc.list.MDCList(voucherListEl);
    voucherListInit.listen('MDCList:action', function (evt) {
        toggleElement(voucherListInit.selectedIndex.length, document.querySelector('.pay-now'));
        if (voucherListInit.selectedIndex.length === voucherListInit.listElements.length) {
            setVoucherBoxState(true, voucherBox)
            return
        }
        if (!voucherListInit.selectedIndex.length) {
            setVoucherBoxState(false, voucherBox)
            return;
        }
        voucherBox.indeterminate = true;
    });

    voucherBox.nativeControl_.addEventListener('change', function () {
        if (voucherBox.checked) {
            selectAllVouchers(voucherListInit)
            return
        }
        unselectAllVouchers(voucherListInit)
    })
    const voucherMenu = new mdc.menu.MDCMenu(document.getElementById('voucher-menu'));
    document.getElementById('voucher-icon').addEventListener('click', function () {
        voucherMenu.open = true;
    })
    voucherMenu.listen('MDCMenu:selected', function (event) {

        if (event.detail.index == 0) {
            setVoucherBoxState(true, voucherBox)

            selectAllVouchers(voucherListInit)
            return
        }
        setVoucherBoxState(false, voucherBox)
        unselectAllVouchers(voucherListInit)

    })

    document.querySelector('.pay-now .mdc-button').addEventListener('click', function () {
        const vouchersId = [];
        voucherListInit.selectedIndex.forEach((index) => {
            vouchersId.push({
                voucherId: pendingVouchers[index].id
            })
        })


        getLocation().then(geopoint => {
            http('POST', `${appKeys.getBaseUrl()}/api/myGrowthfile/batch`, {
                office: office,
                vouchers: vouchersId,
                geopoint: geopoint
            }).then(function () {
                home(office);
            }).catch(function (err) {
                showSnacksApiResponse(err.message)
            })

        }).catch(handleLocationError)

    })

}

function addVoucherId(vouchers, liIndex, ids) {
    const voucherId = vouchers[liIndex].id
    const index = ids.indexOf(voucherId)
    if (index > -1) {
        ids.splice(index, 1)
    } else {
        ids.push(vouchers[liIndex].id);
    }
}

function selectAllVouchers(voucherListInit) {
    const si = []
    voucherListInit.listElements.forEach((el, index) => {
        si.push(index)
    })
    voucherListInit.foundation_.setSelectedIndex(si);
    toggleElement(true, document.querySelector('.pay-now'))
}

function unselectAllVouchers(voucherListInit) {
    voucherListInit.foundation_.setSelectedIndex([]);
    toggleElement(false, document.querySelector('.pay-now'))

}

function setVoucherBoxState(state, voucherBox) {
    voucherBox.indeterminate = false;
    voucherBox.checked = state

}
const batchCard = (batch, vouchers, deposits, office) => {
    const card = createElement('div', {
        className: 'mdc-card mdc-card--outlined batch-card mdc-layout-grid__cell',
    });

    const creatorUl = createElement('ul', {
        className: 'mdc-list  mdc-list--two-line mdc-list--avatar-list pt-0 pb-0',
        style: 'border-top:0px;padding-bottom:0px'
    })

    const creatorLi = assigneeLiBatch({
        photoURL: batch.photoURL,
        displayName: batch.displayName,
        phoneNumber: batch.phoneNumber
    }, moment().calendar(batch.createdAt))

    creatorUl.appendChild(creatorLi)
    card.appendChild(creatorUl);
    const details = createElement('div')
    details.innerHTML = `
     <span>Transfer to : </span>
       <div style='margin-left:20px'>
            ${batch.bankAccount ? `<p>A/C No : ${batch.bankAccount}</p>` :''}
            ${batch.ifsc ? `<p>IFSC Code : ${batch.ifsc}</p>` :''}
       </div>

    `
    card.appendChild(details);

    const ul = createElement('ul', {
        className: 'mdc-list total-vouchers-deposits'
    })

    if (batch.linkedVouchers.length) {

        const linkedDocs = getLinkedDocuments(batch.linkedVouchers, vouchers)

        const li = createLinkedLi({
            name: 'Vouchers : ' + batch.linkedVouchers.length,
            amount: convertNumberToINR(batch.amount)
        });

        li.addEventListener('click', function () {
            if (!linkedDocs.length) return;
            updateState({
                office: office,
                action: 'showVouchers',
                view: 'Vouchers'
            }, linkedDocs)

        })
        ul.appendChild(li)
    }
    if (batch.linkedDeposits && batch.linkedDeposits.length) {
        const linkedDocs = getLinkedDocuments(batch.linkedDeposits, deposits)
        const li = createLinkedLi({
            name: 'Deposits ' + batch.linkedDeposits.length,
            amount: getTotalAmount(linkedDocs)
        });
        li.addEventListener('click', function () {
            if (!linkedDocs.length) return;
            updateState({
                office: office,
                action: 'showDeposits',
                view: 'Deposits'
            }, linkedDocs)

        })
        ul.appendChild(li)
    }
    card.appendChild(ul);
    return card;
}

function getLinkedDocuments(ids, data) {
    const array = []
    ids.forEach((id) => {
        data.forEach((item) => {
            if (item.id === id) {
                array.push(item)
            }
        })
    })
    return array;
}

function createLinkedLi(attr) {
    const li = createElement('li', {
        className: 'mdc-list-item'
    })
    li.innerHTML = `
    <span>${attr.name}</span>
    <span class='mdc-list-item__meta'>
        <span class='mdc-theme--primary linked-li-amount'>${attr.amount}</span>
    </span>`
    return li;
};

function getTotalAmount(data) {
    let total = 0;
    data.forEach(function (item) {
        total += Number(item.amount)
    })
    return convertNumberToINR(total)
}

function getPendingVouchers(vouchers) {
    return vouchers.filter((item) => {
        return !item.batchId
    })
}





function showVouchers(vouchers) {
    const appEl = document.getElementById('app-content');
    appEl.innerHTML = ''
    const div = createElement('div', {
        className: 'mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-12-desktop'
    })

    const ul = createElement('ul', {
        className: 'mdc-list mdc-list--two-line mdc-list--avatar-list',
        id: 'voucher-list'
    })
    vouchers.forEach((voucher) => {
        const li = createElement('li', {
            className: 'mdc-list-item pl-0 pr-0',
            style: 'height:auto;'
        })
        li.innerHTML = `
            <img class='mdc-list-item__graphic' src=${voucher.photoURL || './img/person.png' } >
            <span class="mdc-list-item__text">
                <span class="mdc-list-item__primary-text">${voucher.displayName || voucher.phoneNumber || ''}</span>
                <span class="mdc-list-item__secondary-text mdc-typography--caption">${voucher.type}</span>
                <p class='mt-0 mb-0 mdc-typography--caption'>${voucher.cycleStart} - ${voucher.cycleEnd}</p>
            </span>
            <span class='mdc-list-item__meta'>
                <span class='mdc-theme--primary mdc-typography--headline6 linked-li-amount'>${voucher.amount  ? convertNumberToINR(voucher.amount) : ''}</span>

            </span>`
        new mdc.ripple.MDCRipple(li)
        ul.appendChild(li);
        ul.appendChild(createElement('li', {
            className: 'mdc-list-divider'
        }))
    });

    div.appendChild(ul)
    appEl.appendChild(div);
}

function showDeposits(deposits) {
    const appEl = document.getElementById('app-content');
    appEl.innerHTML = ''
    const div = createElement('div', {
        className: 'mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-12-desktop'
    })

    const ul = createElement('ul', {
        className: 'mdc-list mdc-list--two-line mdc-list--avatar-list mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-12-desktop',
        id: 'voucher-list'
    })

    deposits.forEach((deposit) => {
        const li = createElement('li', {
            className: 'mdc-list-item pl-0 pr-0',
            style: 'height:auto;'
        })
        li.innerHTML = `
            <img class='mdc-list-item__graphic' src="${deposit.photoURL || './img/person.png'}">
            <span class="mdc-list-item__text">
                <span class="mdc-list-item__primary-text">${deposit.displayName || deposit.phoneNumber || ''}</span>
                ${deposit.paymentTime ? `<span class="mdc-list-item__secondary-text mdc-typography--caption">${moment(Date.parse(deposit.paymentTime)).calendar()}</span>` :''}
            </span>
            <span class='mdc-list-item__meta'>
                <span class='mdc-theme--primary mdc-typography--headline6 linked-li-amount'>${convertNumberToINR(deposit.amount)}</span>

            </span>`
        new mdc.ripple.MDCRipple(li)
        ul.appendChild(li);
        ul.appendChild(createElement('li', {
            className: 'mdc-list-divider'
        }))
    });
    div.appendChild(ul)
    appEl.appendChild(div);

}


const toggleElement = (state, el) => {

    if (state) {
        el.classList.remove('hidden')
        return;
    }
    el.classList.add('hidden')
}

window.onpopstate = function (e) {
    this.console.log(e)
    if (!e.state) return;
    if (!e.state.view) return;

    changeView(e.state.view, e.state.action, e.state.office, e.state.tabindex);
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
    if (window.isSupport) {

        const icon = officeList.listElements[0].querySelector(".mdc-list-item__meta")
        icon.textContent = 'clear'
        icon.addEventListener('click', function () {
            window.location.reload();
        })
        return
    }


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
            currentSelectedOffice = offices[event.detail.index]
            changeView(getCurrentViewName(drawer), getCurrentActionName(drawer), currentSelectedOffice, drawer.list.selectedIndex)
            drawer.open = false;
        }
    })
}





const changeView = (view, action, office, tabindex) => {

    if (history.state.view === view) {
        history.replaceState({
            view: view,
            office: office,
            tabindex: tabindex,
            action: action
        }, view, `?view=${view}${isNewUser ? '&u=1' : ''}`)
    } else {
        history.pushState({
            view: view,
            office: office,
            tabindex: tabindex,
            action: action
        }, view, `?view=${view}${isNewUser ? '&u=1' : ''}`)
    };

    clearBreadCrumbs()
    updateBreadCrumb(view)
    drawer.list.selectedIndex = tabindex;
    window[action](office);
}



function initFail() {
    document.getElementById("app-content").innerHTML = `
<div class='mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4 text-center'>
<h3 class='mdc-typography--headline5 mdc-theme--error'>An error occured. Please try after sometime</h3>
</div>

`
}
const getCurrentViewName = (drawer) => {
    return drawer.list.listElements[drawer.list.selectedIndex].dataset.view
}
const getCurrentActionName = (drawer) => {
    return drawer.list.listElements[drawer.list.selectedIndex].dataset.action
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
    if (miniProfileEl.classList.contains('hidden')) {

        miniProfileEl.classList.remove("hidden")
        miniProfileEl.querySelector('img').src = auth.photoURL || './img/person.png'
        miniProfileEl.querySelector('.text-container').innerHTML = `
        <div class='mdc-typography--subtitle1 name-text'>${auth.displayName}</div>
        <div class='mdc-typography--subtitle2 email-text'>${auth.email}</div>
        `
    } else {
        miniProfileEl.classList.add("hidden")
    }
}

function bankDetails(office, response) {

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



function bulk(office) {
    const appEl = document.getElementById('app-content')
    http('GET', '/json?action=get-template-names').then(function (templateNames) {
        appEl.innerHTML = `
        <div class='mdc-layout-grid__cell--span-4-desktop mdc-layout-grid__cell--span-2-tablet'></div>
        <div class="mdc-layout-grid__cell">
                <div class="mdc-select" id='select-template'>
        <div class="mdc-select__anchor demo-width-class">
            <i class="mdc-select__dropdown-icon"></i>
            <div class="mdc-select__selected-text"></div>
            <span class="mdc-floating-label">Choose</span>
            <div class="mdc-line-ripple"></div>
        </div>

        <div class="mdc-select__menu mdc-menu mdc-menu-surface demo-width-class">
            <ul class="mdc-list">
                ${templateNames.map((name,index)=>{
                    return `<li class="mdc-list-item" data-value=${name}>
                    ${name}
                  </li>`
                }).join("")}
            </ul>

        </div>
        </div>
        <div class='template-button-container'></div>
      </div>
      <div class='mdc-layout-grid__cell--span-4-desktop mdc-layout-grid__cell--span-2-tablet'></div>

      `;




        const buttonContainer = document.querySelector('.template-button-container')
        const select = new mdc.select.MDCSelect(document.getElementById('select-template'));
        select.listen('MDCSelect:change', function (evt) {
            if (!buttonContainer) return
            buttonContainer.innerHTML = ''
            const download = button('Download Sample');
            const upload = uploadButton('Upload sheet')
            download.classList.add('mdc-button--raised', 'mt-10')
            upload.classList.add('mdc-button--raised')
            download.addEventListener('click', function () {
                downloadSample(evt.detail.value)
            })
            upload.addEventListener('change', function (event) {
                uploadSheet(event, evt.detail.value)
            })

            const text = createElement("p", {
                className: 'text-center mdc-typography--subtitle1 mt-10 mb-10',
                textContent: 'or'
            })
            buttonContainer.appendChild(download)
            buttonContainer.appendChild(text)
            buttonContainer.appendChild(upload);
        })

    }).catch(console.error)

}

const searchTemplate = (value, list) => {
    list.listElements.forEach((el) => {
        if (el.querySelector('input').value.toLowerCase().indexOf(value) > -1) {
            el.classList.remove('hidden')
        } else {
            el.classList.add('hidden')
        }
    })
}

const getTotalRolesCount = (roles) => {
    const subscriptions = roles.subscription ? roles.subscription.length : 0;
    const employees = roles.employee ? roles.employee.length : 0;
    return subscriptions + employees;
}

function manageSettings(office) {
    const appEl = document.getElementById('app-content')
    appEl.innerHTML = ''
    let url = `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=roles&field=types&field=recipients`;
    http('GET', url).then(function (response) {
        appEl.innerHTML = ''
        if (response.roles.subscription) {
            userState.setUserSubscriptions(response.roles.subscription, firebase.auth().currentUser.phoneNumber)
        }
        // const allUsers = getUsersCount(response.roles)
        // const usersCard = basicCards('Users', {
        //     total: allUsers.totalUsers,
        //     active: allUsers.activeUsers,
        //     icon: 'group'
        // })
        // usersCard.addEventListener('click', function () {
        //     updateState({
        //         view: 'users',
        //         name: 'Users',
        //         office: office
        //     }, office, response)
        // })

        const bulkCard = card('Upload', {
            icon: 'cloud_upload'
        });
        bulkCard.addEventListener('click', function () {
            updateState({
                action: 'bulk',
                view: 'Upload',
                office: office
            }, office)
        })


        // appEl.appendChild(usersCard)
        if (response.recipients.length) {
            const reportCard = basicCards('Reports', {
                total: response.recipients.length,
                active: getActiveCount(response.recipients),
                icon: 'cloud_download'
            })
            reportCard.addEventListener('click', function () {
                updateState({
                    action: 'loadReports',
                    view: 'Reports',
                    office: office
                }, office, response)
            })
            appEl.appendChild(reportCard)
        }
        appEl.appendChild(bulkCard)

        // const dutyCard = basicCards('Duty', {
        //     total: '-',
        //     active: '-',
        //     icon: 'assignment'
        // })

        // dutyCard.addEventListener('click', function () {
        //     updateState({
        //         view: 'manageDuty',
        //         name: 'Duty',
        //         office: office
        //     }, office, response)
        // })

        const typeCard = loadTypes(office, response)
        appEl.appendChild(typeCard.customerCard)
        appEl.appendChild(typeCard.branchCard)
        appEl.appendChild(typeCard.productCard);
        // appEl.appendChild(dutyCard);
        appEl.appendChild(typeCard.officeCard)
        appEl.appendChild(typeCard.others)
    })
}


function contactUs() {
    const appEl = document.getElementById('app-content')
    appEl.innerHTML = ''

    const el = document.getElementById('app-content');
    el.innerHTML = ''
    const cont = createElement('div', {
        className: 'coming--soon-container mdc-layout-grid__cell--span-12'
    })

    const img = createElement('img', {
        src: '../img/contact-us.svg',
    })
    const emailbtn = createMailShareWidget();
    emailbtn.querySelector('.mdc-button').href = `mailto:?to=${encodeURIComponent('help@growthfile.com')}`
    emailbtn.querySelector('.mdc-button__label').textContent = 'Mail us'
    const div = createElement('div', {
        className: 'mdc-typography--headline4 bold text-center mt-20',
    })
    div.appendChild(emailbtn);

    cont.appendChild(img)
    cont.appendChild(div)

    el.appendChild(cont)

}