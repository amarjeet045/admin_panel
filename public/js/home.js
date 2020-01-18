window.resizeIframe = function (obj) {
    console.log(obj.style.height)
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
};

window.getIframeFormData = function (body, isCreate) {

    getLocation().then(function (geopoint) {
        body.geopoint = geopoint
        const url = `/api/activities/${isCreate ? 'create':'update'}`;
        const method = isCreate ? 'POST' : 'PATCH'
        http(method, url, body).then(function () {
            showSnacksApiResponse('success')
            history.back();
        }).catch(function (err) {
            showSnacksApiResponse(err.message)
        })
    }).catch(handleLocationError);
}


const initializer = (geopoint) => {
    const auth = firebase.auth().currentUser;

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

function home(office) {

    let url = `/api/myGrowthfile?office=${office}&field=vouchers&field=batched&field=deposits`;

    http('GET', url).then(function (response) {

        const pendingVouchers = getPendingVouchers(response.vouchers)

        commonDom.progressBar.close()
        commonDom.drawer.list.selectedIndex = 0;

        document.getElementById('app-content').innerHTML = `
        
        <div class='payments-container mdc-layout-grid__cell--span-12'>
       
        <div class="mdc-list-group">
        ${pendingVouchers.length ? `
           
            <div class="mdc-form-field voucher-selection-form">
                <h3 class='mdc-typography--headline6 mdc-theme--primary mt-0 mb-0'>Vouchers</h3>
               
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
            if(voucherListInit.selectedIndex.length === voucherListInit.listElements.length) {
                setVoucherBoxState(true,voucherBox)
                return
            }
            if (!voucherListInit.selectedIndex.length) {
                setVoucherBoxState(false,voucherBox)
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
                setVoucherBoxState(true,voucherBox)
             
                selectAllVouchers(voucherListInit)
                return
            }
            setVoucherBoxState(false,voucherBox)
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
                http('POST', `/api/myGrowthfile/batch`, {
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

    }).catch(function (error) {
        if (error.code == 500) {
            initFail()
        };
        console.log(error)
    });
};

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

function setVoucherBoxState(state,voucherBox) {
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
            amount:convertNumberToINR(batch.amount)
        });

        li.addEventListener('click', function () {
            if (!linkedDocs.length) return;
            history.pushState({
                view: 'showVouchers',
                office: office,

            }, 'showVouchers', `/?view=showVouchers`)
            showVouchers(linkedDocs)
        })
        ul.appendChild(li)
    }
    if (batch.linkedDeposits && batch.linkedDeposits.length) {
        const linkedDocs = getLinkedDocuments(batch.linkedDeposits, deposits)
        const li = createLinkedLi({
            name: 'Deposits ' + batch.linkedDeposits.length,
            amount:getTotalAmount(linkedDocs)
        });
        li.addEventListener('click', function () {
            if (!linkedDocs.length) return;
            history.pushState({
                view: 'showDeposits',
                office: office
            }, 'showDeposits', `/?view=showDeposits`)
            showDeposits(linkedDocs)
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

function createBreadCrumb(data) {
    const ul  = createElement('ul',{
        className:'breadcrumb'
    })
    data.forEach((item) =>{
        const li = createElement('li',{
            className:'breadcrumb-li',
            textContent:item.name
        }); 
        
        ul.appendChild(li);
        
        if(item.isCurrent) {
            li.classList.add('mdc-theme--primary')
        }
        else  {
            li.addEventListener('click',function(){
                history.back();
            })    
            const div = createElement('div')
            div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>'
            ul.appendChild(div)
        }
        
    })
    return ul;

}

function showVouchers(vouchers) {
    const appEl = document.getElementById('app-content');
    appEl.innerHTML = ''
    const div = createElement('div',{
        className:'mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-12-desktop'
    })
    div.appendChild(createBreadCrumb([{
        name:'Payments',
        isCurrent:false
    },{
        name:'Vouchers',
        isCurrent:true
    }]))
   
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
                <span class='mdc-theme--primary mdc-typography--headline6 linked-li-amount'>${convertNumberToINR(voucher.amount)}</span>
               
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
    const div = createElement('div',{
        className:'mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-12-desktop'
    })
    div.appendChild(createBreadCrumb([{
        name:'Payments',
        isCurrent:false
    },{
        name:'Deposits',
        isCurrent:true
    }]))
   
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
    const ex = {
        'showVouchers': true,
        'showDeposits': true,
        'home': true
    }
    if (ex[e.state.view]) {
        this.home(e.state.office);
        return;
    }
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
    drawer.list_.listElements[4].querySelector('.mdc-list-item__text').textContent = currentSelectedOffice
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
            drawer.list_.listElements[4].querySelector('.mdc-list-item__text').textContent = currentSelectedOffice
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

    window[viewName](office);

    // const initViews = {        
    //     'home': true,
    // }
    // if (!initViews[viewName]) {
    //     return;
    // };


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
    http('GET', `/api/myGrowthfile?office=${office}&field=office`).then(response => {
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

function help(office) {
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