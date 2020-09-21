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
    const phoneNumberInit = new mdc.textField.MDCTextField(document.getElementById('phone-field-mdc-primary'));


    const iti = phoneFieldInit(phoneNumberInit)

    emailAdditionComponent({
        input: emailInput,
        officeId
    });
    emailInput.addEventListener('selected', (ev) => {
        emailInput.dataset.emails += ev.detail.email+','
    })
    emailInput.addEventListener('removed', (ev) => {
        const split = emailInput.dataset.emails.split(",");
        const index = split.indexOf(ev.detail.email);
        split.splice(index,1);
        const string = split.join(",")
        emailInput.dataset.emails = string;
    });

    if (formId) {
        getActivity(formId).then(updateBiller);
        http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${formId}`).then(activity => {
            putActivity(activity).then(updateBiller);
        });
    }

    form.addEventListener('submit', (ev) => {
        ev.preventDefault();

        const phoneNumberValidation = validatePhonNumber(iti);

        if(!phoneNumberValidation.isValid) {
            setHelperInvalid(phoneNumberInit, phoneNumberValidation.message);
            return
        }
        ev.submitter.classList.add('active')
        const activityBody = new Biller(office);
        activityBody.name = billerName.value;
        activityBody.emails = emailInput.dataset.emails;
        activityBody.firstContact = firstContact.value;
        activityBody.gst = gst.value;
        activityBody.address = address.value;

        const requestBody = activityBody.create;

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
    let chipSet = new mdc.chips.MDCChipSet(chipSetEl);

    initializeSearch(input, (value) => {
        if (!value || !validateEmail(value)) return;
        menu.list_.root.innerHTML = ''

        const li = emailMenuLi(value);
        menu.list_.root.appendChild(li);
        // open menu and trasition to increase container height;
        menu.open = true
        anchor.style.height = ((56) + 16) + 'px'
        setTimeout(() => {
            input.focus()
        }, 500)
    }, 500);

    /** listens for menu selection event and sends a custom event to handle dataset
     * on search input and appends a chip to the chip set 
     */
    menu.listen('MDCMenu:selected', function (menuEv) {
        const email = menuEv.detail.item.dataset.email
        input.dispatchEvent(new CustomEvent('selected', {
            detail: {
                index: menuEv.detail.index,
                item: menuEv.detail.item,
                email
            },
        }))
        // menu.open = false;

        const chip = createEmailChip(email)
        chipSetEl.appendChild(chip);
        chipSet.addChip(chip);
        input.value = ''
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
                email: el.dataset.email
            },
        }))
    })
    input.addEventListener('keypress', (ev) => {
        if (ev.which == 13) {
            const chip = createEmailChip(ev.target.value)
            chipSetEl.appendChild(chip);
            chipSet.addChip(chip);
            ev.preventDefault();
            menu.open = false;
            input.dispatchEvent(new CustomEvent('selected', {
                detail: {
                    email:ev.currentTarget.value
                },
            }))
            input.value = ''
        }
    })
}

const emailMenuLi = (email) => {
    const li = createElement('li', {
        className: 'mdc-list-item',
        attrs: {
            role: 'menuitem'
        }
    })
    li.dataset.email = email;
    const span = createElement('span', {
        textContent: email,
        className: 'mdc-list-item__text'
    })
    li.appendChild(span)
    new mdc.ripple.MDCRipple(li);
    return li
}

const createEmailChip = (email) => {
    const chip = createElement('div', {
        className: 'mdc-chip',
        attrs: {
            role: 'row'
        },
    })

    chip.dataset.email = email

    chip.innerHTML = `<div class="mdc-chip__ripple"></div>
    <img class="mdc-chip__icon mdc-chip__icon--leading" src="../../img/person.png">
    <span role="gridcell">
      <span role="button" tabindex="0" class="mdc-chip__primary-action">
        <span class="mdc-chip__text">${email}</span>
      </span>
    </span>
    <span role="gridcell">
    <i class="material-icons mdc-chip-trailing-action mdc-chip__icon mdc-chip__icon--trailing" tabindex="-1" role="button">cancel</i>
  </span> 
   
    `
    return chip;
}

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}