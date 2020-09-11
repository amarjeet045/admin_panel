const productSearch = document.getElementById('product-search');
const productList = document.getElementById('product-list');
const productRate = document.getElementById('product-rate')
const productQuantity = document.getElementById('product-quantity')

const dutyStartDate = document.getElementById('duty-start-date')
const dutyEndDate = document.getElementById('duty-end-date')
const dutyStartTime = document.getElementById('duty-start-time')
const dutyEndTime = document.getElementById('duty-end-time')

const employeeSearch = document.getElementById('employee-search')
const supervisorSearch = document.getElementById('supervisor-search')

const formHeading = document.getElementById('form-heading');
const form = document.getElementById('manage-form');

const init = (office, officeId) => {

    // check if we have activity id in url. 
    // if activity id is  found, then udpate the form else create

    const dutyLocation = new URLSearchParams(window.location.search).get('location');
    const formId = getFormId();
    const requestParams = getFormRequestParams();
    if (!dutyLocation) {
        window.alert("No location found");
        return
    }

    /** manage start and end date */
    dutyStartDate.addEventListener('change', (evt) => {
        dutyEndDate.value = evt.target.value;
        dutyEndDate.min = evt.target.value;
    })
    dutyStartTime.addEventListener('change', (evt) => {
        dutyEndTime.value = evt.target.value;
        dutyEndTime.min = evt.target.value;
    })
    if (formId) {
        document.getElementById('form-heading').innerHTML = 'Update Duty'
        getActivity(formId).then(activity => {
            if (activity) {
                updateDuty(activity)
            }
            http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${formId}/`).then(res => {
                putActivity(res).then(updateDuty);
            })
        });
    }
    else {
        const hours = new Date().getHours();
        const minutes = new Date().getMinutes();
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const date = new Date().getDate();
        dutyStartDate.value = `${year}-${month < 10 ?'0':''}${month}-${date < 10 ? '0':''}${date}`
        dutyStartTime.value = `${hours < 10 ? '0':''}${hours}:${minutes < 10 ? '0' :''}${minutes}`
    }

    dutyStartDate.dispatchEvent(new Event('change', {
        'bubbles': true
    }))
    dutyStartTime.dispatchEvent(new Event('change', {
        'bubbles': true
    }));


    
    

    /** manage employee and supervisor */
    [employeeSearch, supervisorSearch].forEach(input => {
        const menuEl = input.parentNode.nextElementSibling;
        const chipSetEl = menuEl.nextElementSibling;
        const menu = new mdc.menu.MDCMenu(menuEl);
        const chipSet = new mdc.chips.MDCChipSet(chipSetEl);

        initializeSearch(input, (value) => {
            if(!value) return;
            let query;
            if (Number(value)) {
                query = 'phoneNumber=' + encodeURIComponent(value)
            } else {
                query = 'employeeName=' + encodeURIComponent(value)
            }

            getUsersDetails(`${appKeys.getBaseUrl()}/api/office/${officeId}/user?${query}&limit=5`).then(res => {
                menu.list_.root.innerHTML = ''
                const filteredResults = res.results.filter(user => menu.list_.root.querySelector(`[data-chip-number="${user.phoneNumber}"]`) ? null : user)
                filteredResults.forEach(user => {
                    const li = userMenuLi(user);
                    li.dataset.user = JSON.stringify(user);
                    menu.list_.root.appendChild(li);
                });
                if (filteredResults.length > 0) {
                    menu.open = true
                }
            })
        }, 1000);
        menu.listen('MDCMenu:selected', function (event) {
            const user = JSON.parse(event.detail.item.dataset.user)
            if (input === supervisorSearch) {
                input.dataset.number = user.phoneNumber
                input.value = user.phoneNumber
            } else {
                input.dataset.number += user.phoneNumber + ',';
                input.value = ''

            }
            const chip = createUserChip(user)
            chip.dataset.chipNumber = user.phoneNumber;
            chipSetEl.appendChild(chip);
            chipSet.addChip(chip);

            menu.open = false;
        })
        chipSet.listen('MDCChip:removal', function (event) {
            chipSetEl.removeChild(event.detail.root);
        });
    })


    const productMenu = new mdc.menu.MDCMenu(document.getElementById('product-menu'))
    /**  manage products */
    getProductList({
        officeId,
        loadOnce: true
    }, (products) => {

        initializeSearch(productSearch, function (value) {
            const tx = window.database.transaction("types");
            const store = tx.objectStore("types");
            const index = store.index("search_key_name");
            const matchedProducts = []
            index.openCursor(IDBKeyRange.bound(value.toLowerCase(), value.toLowerCase() + '\uFFFF')).onsuccess = function (ev) {
                const cursor = ev.target.result;
                if (!cursor) return;
                matchedProducts.push(cursor.value)
                cursor.continue();
            }
            tx.oncomplete = function () {
                productList.innerHTML = '';
                matchedProducts.filter(product => document.getElementById(product.id) ? null : product).forEach(product => {
                    productList.appendChild(productMenuLi(product))
                });
                if (matchedProducts.length > 0) {
                    productMenu.open = true;
                }
            }
        }, 1000);
    });

    productMenu.listen('MDCMenu:selected', function (event) {
        const product = JSON.parse(event.detail.item.dataset.product);
        menu.open = false;
        productSearch.value = '';
        appendProductCard(product)

    });


    form.addEventListener('submit', (ev) => {

        ev.preventDefault();


        ev.submitter.classList.add('active')

        const activityBody = createActivityBody();
        activityBody.setOffice(office)
        activityBody.setActivityId(formId)
        activityBody.setTemplate('duty')
        activityBody.setSchedule([{
            startTime: moment(`${dutyStartDate.value}T${dutyStartTime.value}`).valueOf(),
            endTime: moment(`${dutyEndDate.value}T${dutyEndTime.value}`).valueOf(),
            name: 'Duty'
        }])

        activityBody.setAttachment('Location', dutyLocation, 'string');
        const selectedProducts = [...document.querySelectorAll('.add-product-card.selected-product')].map(el => {
            if (el.dataset.name) {
                return {
                    name: el.dataset.name,
                    rate: Number(el.querySelector('.product-rate input').value),
                    quantity: Number(el.querySelector('.product-quantity input').value)
                };
            };
        })

        activityBody.setAttachment('Products', selectedProducts, 'product');
        activityBody.setAttachment('Supervisor', supervisorSearch.dataset.number, 'phoneNumber');
        activityBody.setAttachment('Include', employeeSearch.dataset.number, 'string')
        activityBody.setAttachment('Date', moment(dutyStartDate.value).format('Do MMM YYYY'), 'string')
        const requestBody = activityBody.get();
        console.log(requestBody)



        http(requestParams.method, requestParams.url, requestBody).then(res => {
            let message = 'Duty updated'
            if(requestParams.method === 'PUT') {
                message = 'Duty created'
            }
            handleFormButtonSubmit(ev.submitter, message);
        }).catch(err => {
            handleFormButtonSubmit(ev.submitter, err.message)
        });
    })
}


const createProductOption = (product) => {
    const li = createElement('li', {
        className: 'mdc-list-item'
    })

    li.dataset.value = product.name;
    li.dataset.product = JSON.stringify(product);
    li.innerHTML = `  <span class="mdc-list-item__ripple"></span>
    <span class="mdc-list-item__text">${product.name}</span>`
    return li;
}


const userMenuLi = (user) => {
    const li = createElement('li', {
        className: 'mdc-list-item',
        attrs: {
            role: 'menuitem'
        }
    })

    const img = createElement('img', {
        className: 'mdc-list-item__graphic',
        src: user.photoURL
    })
    const span = createElement('span', {
        textContent: user.employeeName || user.displayName || user.phoneNumber,
        className: 'mdc-list-item__text'
    })
    li.appendChild(img)
    li.appendChild(span)
    new mdc.ripple.MDCRipple(li);
    return li
}

const productMenuLi = (product) => {
    const li = createElement('li', {
        className: 'mdc-list-item',
        attrs: {
            role: 'menuitem'
        }
    })
    li.dataset.product = JSON.stringify(product)
    const span = createElement('span', {
        textContent: product.name,
        className: 'mdc-list-item__text'
    })
    li.appendChild(span)
    new mdc.ripple.MDCRipple(li);
    return li
}


const appendProductCard = (product) => {
    const node = document.getElementById('clone-node').cloneNode(true);
    node.id = product.id;
    node.dataset.name = product.name;
    node.querySelector('.product-name-heading').textContent = product.name
    productRate.value = productQuantity.value = '';
    node.classList.remove('hidden')
    node.classList.add('selected-product')
    document.querySelector('.product-manage').appendChild(node)
}



const updateDuty = (duty) => {
    dutyStartDate.value = moment(duty.schedule[0].startTime.value).format('YYYY-MM-DD')
    dutyStartTime.value = moment(duty.schedule[0].startTime.value).format('HH:mm')

    dutyEndDate.value = moment(duty.schedule[0].endTime.value).format('YYYY-MM-DD')
    dutyEndTime.value = moment(duty.schedule[0].endTime.value).format('HH:mm');

    const supervisorNumber = duty.attachment['Supervisor'].value;
    const employeeNumbers = duty.attachment['Include'].value
    supervisorSearch.value = supervisorNumber.phoneNumber;
    supervisorSearch.dataset.number = supervisorNumber.phoneNumber

    employeeSearch.dataset.number = employeeNumbers;
    if(duty.assignees) {
        duty.assignees.forEach(assignee => {
            const chip = createUserChip(assignee);
            if (assignee.phoneNumber === supervisorNumber) {
                document.getElementById('supervisor-chipset').appendChild(chip);
            } else {
                document.getElementById('employee-chipset').appendChild(chip);
            }
        })
    }

    duty.attachment['Products'].value.forEach(product => {
        if(product.name) {
            appendProductCard(product)
        }
    })
}