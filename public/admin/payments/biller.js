const form = document.getElementById('manage-form');
const submitBtn = form.querySelector('.mdc-fab--action[type="submit"]');

const billerName = document.getElementById('name');
const firstContact = document.getElementById('first-contact');
const gst = document.getElementById('gst');
const emailInput = document.getElementById('emails');
const address = document.getElementById('address');

const init = (office, officeId) => {
    const requestParams = getFormRequestParams();
    const formId = getFormId();


    userAdditionComponent({
        input: emailInput,
        officeId
    });
    emailInput.addEventListener('selected', (ev) => {
        emailInput.dataset += emailInput.dataset + ev.detail
    })
    emailInput.addEventListener('removed', (ev) => {

    })

    if (formId) {
        getActivity(formId).then(updateBiller);
        http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${formId}`).then(activity => {
            putActivity(activity).then(updateBiller);
        });
    }

    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const activityBody = new ActivityBody(office,'biller');
        
        activityBody.attachment('Name',billerName.value)
        activityBody.setAttachment('Emails', emailInput.dataset.emails, 'string')
        activityBody.setAttachment('First Contact', firstContact.value, 'phoneNumber')
        activityBody.setAttachment('Biller GST', gst.value, 'string')
        activityBody.setAttachment('Biller Address', address.value, 'string');
        const requestBody = activityBody.get();

        http(requestParams.method, requestParams.url, requestBody).then(res => {
            let message = 'New biller added';
            if (requestParams.method === 'PUT') {
                message = 'Biller updated'
                putActivity(requestBody).then(() => {
                    handleFormButtonSubmitSuccess(submitBtn, message);
                })
                return
            };
            handleFormButtonSubmitSuccess(submitBtn, message);
        }).catch(err => {
            if (err.message === `No subscription found for the template: 'biller' with the office '${office}'`) {
                createSubscription(office, 'biller').then(() => {
                    form.dispatchEvent(new Event('submit', {
                        cancelable: true,
                        bubbles: true
                    }))
                })
                return
            }
            handleFormButtonSubmit(submitBtn, err.message)
        })
    })
}


const updateBiller = (activity) => {
    billerName.value = activity.attachment['Name'].value;
    firstContact.value = activity.attachment['First Contact'].value;
    gst.value = activity.attachment['Biller GST'].value;
    address.value = activity.attachment['Biller Address'].value;
    emailInput.dataset.value = activity.attachment['Emails'].value;

    activity.attachment['Emails'].value.split(",").forEach(email => {
        const chip = createInputChip(email);
    });

}


const emailAdditionComponent = (props) => {
    const {
        input
    } = props;
    
    const anchor = input.parentNode.nextElementSibling;
    const menuEl = anchor.children[0];
    const menu = new mdc.menu.MDCMenu(menuEl);
    const chipSetEl = anchor.nextElementSibling;
    let chipSet;
    if (chipSetEl) {
        chipSet = new mdc.chips.MDCChipSet(chipSetEl);
    }

    initializeSearch(input, (value) => {
        if (!value) return;
        menu.list_.root.innerHTML = ''
        const filteredResults = res.results.filter(user => menu.list_.root.querySelector(`.mdc-chip[data-number="${user.phoneNumber}"]`) ? null : user)
        filteredResults.forEach(user => {
            const li = userMenuLi(user);
            li.dataset.user = JSON.stringify(user);
            menu.list_.root.appendChild(li);
        });
        if (filteredResults.length > 0) {
            // open menu and trasition to increase container height;
            menu.open = true
            anchor.style.height = ((filteredResults.length * 56) + 16) + 'px'
        }
    }, 500);

    /** listens for menu selection event and sends a custom event to handle dataset
     * on search input and appends a chip to the chip set 
     */
    menu.listen('MDCMenu:selected', function (menuEv) {
        const user = JSON.parse(menuEv.detail.item.dataset.user);
        input.dispatchEvent(new CustomEvent('selected', {
            detail: {
                index: menuEv.detail.index,
                item: menuEv.detail.item,
                user,
            },
        }))
        // menu.open = false;
        if (!chipSet) return;

        const chip = createUserChip(user)
        chipSetEl.appendChild(chip);
        chipSet.addChip(chip);
    });
    //set heigh to auto when menu is closed
    menu.listen('MDCMenuSurface:closed', (ev) => {
        anchor.style.height = 'auto'
    })
    /** listens for chip removal event and sends a custom event to handle dataset
     *  on search input
     */
    if (!chipSet) return
    chipSet.listen('MDCChip:trailingIconInteraction', (ev) => {
        const el = document.getElementById(ev.detail.chipId);
        input.dispatchEvent(new CustomEvent('removed', {
            detail: {
                user: {
                    employeeName: el.dataset.name,
                    phoneNumber: el.dataset.number
                }
            },
        }))
    })
    input.addEventListener('keypress',(ev)=>{
        if(ev.which == 13) {

        }
    })
}