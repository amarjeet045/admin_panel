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

function home(office) {

    let url = `/api/myGrowthfile?office=${office}&field=vouchers&field=batched&field=deposits`;

    http('GET', url).then(function (response) {

        const pendingVouchers = getPendingVouchers(response.vouchers)

        commonDom.progressBar.close()
        commonDom.drawer.list.selectedIndex = 0;

        document.getElementById('app-content').innerHTML = `
        
        <div class='payments-container mdc-layout-grid__cell--span-12'>
        <div style='width:100%'>
        <div class='pay-now hidden'>
            <button class='mdc-button mdc-button--raised full-width'>Pay</button>
        </div>
        </div>
        <div class='batch-container'>
            ${response.batches.length ? `
                <h3 class='mdc-typography--headline6 mdc-theme--primary'>Batches</h3>
                <div class='batch-cards mdc-layout-grid__inner' id='batch-container'></div>
            `:''};
        </div>
        
        <div class="mdc-list-group">
            ${pendingVouchers.length ? `
                <div class='collapse-header'>
                    <h3 class='mdc-typography--headline6 mdc-theme--primary'>Vouchers</h3>
                    <i class='material-icons collapse-list-icon' data-type="voucher-list">keyboard_arrow_down</i>
                </div>
                <ul id='voucher-list' class='mdc-list demo-list mdc-list--two-line mdc-list--avatar-list' role='group' aria-label="payments with checkbox">
                    ${pendingVouchers.map(voucher => {
                        return `${voucherList(voucher)}`
                    }).join("")}
                 </ul>
            `:''}
        </div>
        </div>
      </div>
      `;
        const batchCont = document.getElementById('batch-container')
        response.batches.forEach(function (batch) {
            batchCont.appendChild(batchCard(batch, response.vouchers, response.deposits, office));
        })

        const ids = [];
        const voucherListEl = document.getElementById('voucher-list');
        if (!voucherListEl) return;

        voucherListInit = new mdc.list.MDCList(voucherListEl);
        voucherListInit.listen('MDCList:action', function (evt) {
            const voucherId = response.vouchers[evt.detail.index].id
            const index = ids.indexOf(voucherId)
            if (index > -1) {
                ids.splice(index, 1)
            } else {
                ids.push(response.vouchers[evt.detail.index].id);
            }
            toggleElement(voucherListInit.selectedIndex.length, document.querySelector('.pay-now'));
            console.log(ids)
        });


        document.querySelector('.pay-now .mdc-button').addEventListener('click', function () {
            const vouchersId = [];
            ids.forEach(function (id) {
                vouchersId.push({
                    voucherId: id
                })
            });

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

const batchCard = (batch, vouchers, deposits, office) => {
    const card = createElement('div', {
        className: 'mdc-card mdc-card--outlined batch-card mdc-layout-grid__cell',
    });
    card.innerHTML = ` 
    <div class='inline-flex mdc-theme--primary mdc-typography--headline6'>
        ${batch.office ? `<p>${batch.office}</p>`:''}
        <div class='amount'>
            ${batch.amount ? `<p>${convertNumberToINR(batch.amount)}</p>`:''}
        </div>
    </div>
    ${batch.phoneNumber ? `<p>Phone number : ${batch.phoneNumber}</p>`:''}
    ${batch.createdAt ? `<p >Created On: ${showDate(batch.createdAt)}</p>`:''}
    ${batch.bankAccount ? `<p>Bank Account : ${batch.bankAccount}</p>` :''} 
    ${batch.ifsc ? `<p>IFSC : ${batch.ifsc}</p>` :''}
    ${batch.updatedAt ? `<p class='mdc-typography--caption'>Last Updated : ${showDate(batch.updatedAt)}</p>`:''}
    ${batch.receivedAmount ? `<p>Recived Amount : ${batch.receivedAmount}</p>`:''} 

    `
    const ul = createElement('ul', {
        className: 'mdc-list mdc-list--two-line'
    })

    if (batch.linkedVouchers.length) {

        const linkedDocs = getLinkedDocuments(batch.linkedVouchers, vouchers)

        const li = createLinkedLi({
            name: 'Vouchers',
            linkedIds: batch.linkedVouchers,
            data: linkedDocs
        });
        li.addEventListener('click', function () {
            history.pushState({
                view: 'showVouchers',
                office: office
            }, 'showVouchers', `/?view=showVouchers`)
            showVouchers(linkedDocs)
        })
        ul.appendChild(li)
    }
    if (batch.linkedDeposits && batch.linkedDeposits.length) {
        const linkedDocs = getLinkedDocuments(batch.linkedDeposits, deposits)
        const li = createLinkedLi({
            name: 'Deposits',
            linkedIds: batch.linkedDeposits,
            data: linkedDocs
        });
        li.addEventListener('click', function () {
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
    li.innerHTML = `<span class="mdc-list-item__text">
        <span class="mdc-list-item__primary-text">${attr.name}</span>
        <span class="mdc-list-item__secondary-text">Amount : ${getTotalAmount(attr.data)}</span>
  </span>
  <span class='mdc-list-item__meta'>
    <span class='mdc-theme--primary mdc-typography--headline6'>${attr.linkedIds.length}</span>
  </span>
  `
    return li;
}



function getTotalAmount(data) {
    let total = 0;
    data.forEach(function (item) {
        total += item.amount
    })
    return convertNumberToINR(total)
}

function getPendingVouchers(vouchers) {
    return vouchers.filter((item) => {
        return !vouchers.batchId
    })
}

function showVouchers(vouchers) {
    const appEl = document.getElementById('app-el');
    const ul = createElement('ul', {
        className: 'mdc-list mdc-list--two-line'
    })
    vouchers.forEach((voucher) => {
        const li = createElement('li', {
            className: 'mdc-list-item__meta'
        })
        li.innerHTML = ` 
        <span class="mdc-list-item__text">
          <span class="mdc-list-item__primary-text mdc-theme--primary">${voucher.type}</span>
          <span class="mdc-list-item__secondary-text">${voucher.roleDoc.attachment.Name.value || voucher.roleDoc.attachment['Phone Number'].value}</span>
        </span>
        <span class='mdc-list-item__meta'>
          <span class='mdc-theme--primary mdc-typography--headline6'>${convertNumberToINR(voucher.amount)}</span>
          <p class='mt-10'>${voucher.cycleStart} - ${voucher.cycleEnd}</p>
        </span>`
        new mdc.ripple.MDCRipple(li)
        ul.appendChild(li);
    });
    appEl.appendChild(ul);
}

function showDeposits(deposits) {
    const appEl = document.getElementById('app-el');
    const ul = createElement('ul', {
        className: 'mdc-list mdc-list--two-line'
    })
    deposits.forEach((deposit) => {
        const li = createElement('li', {
            className: 'mdc-list-item__meta',
            style: 'height:auto;padding-bottom: 10px'
        })

        li.innerHTML = ` 
        <span class="mdc-list-item__text">
          <span class="mdc-list-item__primary-text mdc-theme--primary">${deposit.event}</span>
          <span class="mdc-list-item__secondary-text">${deposit.phoneNumber}</span>
            ${deposit.bankAccount ? `<span class="mdc-list-item__secondary-text">
                Bank Account : ${deposit.bankAccount}
            </span>` :''}
            ${deposit.ifsc ?` <span class="mdc-list-item__secondary-text">
                IFSC : ${deposit.ifsc}
            </span>`:''}
        </span>
        <span class='mdc-list-item__meta'>
          <span class='mdc-theme--primary mdc-typography--headline6'>${convertNumberToINR(deposit.amount)}</span>
          <p class='mt-10'>${showDate(deposit.paymentTime)}</p>
        </span>`
        new mdc.ripple.MDCRipple(li)
        ul.appendChild(li);
    });
    appEl.appendChild(ul);

}


const toggleElement = (state, el) => {
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