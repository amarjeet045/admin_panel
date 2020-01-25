const itis = {}


function createDate(dateObject) {
    console.log(dateObject)
    let month = dateObject.getMonth() + 1;
    let date = dateObject.getDate()
    if (month < 10) {
        month = '0' + month
    }
    if (date < 10) {
        date = '0' + date
    };

    return `${dateObject.getFullYear()}-${month}-${date}`
}

function reports(office) {

    const appContent = document.getElementById('app-content');
    appContent.innerHTML = ''
    http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=recipients`).then(response => {
        console.log(response);
        response.recipients.forEach(function (recipient) {
            if (recipient.office !== office) return;
            const card = createReportCard(recipient);
            const chipSetInputEl = card.querySelector('.mdc-chip-set--input.update-existing');
            const currentNumbers = []

            if (recipient.report !== 'footprints') {

                const triggerBtn = iconButtonWithLabel('play', 'Trigger ' + recipient.report);
                triggerBtn.addEventListener('click', function () {
                    triggerReportDialog(recipient)
                });
                card.querySelector('.trigger-report').appendChild(triggerBtn)
            }

            recipient.include.forEach(function (assignee) {
                currentNumbers.push(assignee.phoneNumber)
                let chip;
                if (recipient.include.length == 1) {
                    chip = filterChip(assignee.displayName || assignee.phoneNumber, assignee.photoURL || './img/person.png', true)
                } else {
                    chip = userChip(assignee.displayName || assignee.phoneNumber, assignee.photoURL || './img/person.png', true);
                }
                chip.dataset.number = assignee.phoneNumber;
                chipSetInputEl.appendChild(chip);
            });

            const chipSetInput = new mdc.chips.MDCChipSet(chipSetInputEl);
            chipSetInput.listen('MDCChip:trailingIconInteraction', function (e) {

                const el = document.getElementById(event.detail.chipId)
                const selectedNumber = el.dataset.number;
                const index = currentNumbers.indexOf(selectedNumber);

                if (index > -1) {
                    currentNumbers.splice(index, 1)
                }
                chipSetInputEl.removeChild(el);

                disableDomComponent(card.querySelector('.include-list'))
                card.querySelector('.mdc-fab').classList.add('hidden')
                share(recipient.activityId, currentNumbers).then(function () {
                   
                        reports(office);

                }).catch(function () {
                    card.querySelector('.mdc-fab').classList.remove('hidden')
                    enableDomComponent(card.querySelector('.include-list'))
                })
            });

            card.querySelector('.mdc-fab').addEventListener('click', function (e) {
                addNewIncludes(card, recipient, office)
                card.querySelector(".mdc-fab").classList.add('hidden')
                return
            })
            appContent.appendChild(card);
        });
    });
}

const addNewIncludes = (card, recipient, office) => {
    card.querySelector('.add-new-include').classList.remove('hidden');
    disableDomComponent(card.querySelector('.include-list'))
    card.querySelector('.add-new-include').innerHTML = `${textFieldTelephoneWithHelper({placeholder:'phone number'}).outerHTML}
   
    <div class="mdc-chip-set mdc-chip-set--input add-new pt-10" role="grid"></div>
    `
    const field = new mdc.textField.MDCTextField(card.querySelector('.mdc-text-field'));
    const phoneInit = phoneFieldInit(field);
    const chipSetInputEl = card.querySelector('.mdc-chip-set--input.add-new');
    const newIncludes = []

    field.input_.addEventListener('keydown', function (event) {
        if (event.keyCode === 13 || event.keyCode == 32) {
            if (!phoneInit.isValidNumber()) {
                setHelperInvalid(field, 'Enter a valid phone number')
                return;
            }
            setHelperValid(field)
            const number = phoneInit.getNumber(intlTelInputUtils.numberFormat.E164)
            const chip = inputChip(number, 'person')
            chip.dataset.newNumber = number
            chipSetInputEl.appendChild(chip);
            chipSetInput.addChip(chip)
            field.value = '';
            saveBtn.classList.remove('hidden')
            newIncludes.push(number)
        }
    })
    field.focus();
    const chipSetInput = new mdc.chips.MDCChipSet(chipSetInputEl);
    chipSetInput.listen('MDCChip:trailingIconInteraction', function (e) {
        console.log(e)
        console.log(chipSetInputEl.children)
        const el = document.getElementById(event.detail.chipId)
        const index = newIncludes.indexOf(el.dataset.newNumber);
        if (index > -1) {
            newIncludes.splice(index, 1)
        }
        chipSetInputEl.removeChild(document.getElementById(event.detail.chipId));
        console.log(newIncludes)
        if (newIncludes.length) {
            saveBtn.classList.remove('hidden')
        } else {
            saveBtn.classList.add('hidden')
        }
    });
    const cardAction = card.querySelector('.mdc-card__actions')
    cardAction.classList.remove("hidden")
    const cancelBtn = cardButton().cancel()
    const saveBtn = cardButton().save();
    saveBtn.classList.add('hidden')
    cancelBtn.addEventListener('click', function () {
        cardAction.innerHTML = ''
        cardAction.classList.add('hidden');
        card.querySelector('.add-new-include').classList.add('hidden');
        enableDomComponent(card.querySelector('.include-list'))
        card.querySelector(".mdc-fab").classList.remove("hidden");
    })
    saveBtn.addEventListener('click', function () {

        const numbers = []
        recipient.include.forEach((item) => {
            numbers.push(item.phoneNumber)
        })
        const phoneNumbers = [...numbers, ...newIncludes]
        console.log(phoneNumbers)
        disableDomComponent(card.querySelector('.add-new-include'))
        share(recipient.activityId, phoneNumbers).then(function () {
            setTimeout(() => {
                reports(office);
            }, 1000);

        }).catch(function () {
            enableDomComponent(card.querySelector('.add-new-include'))
        })
    })
    cardAction.appendChild(cancelBtn);
    cardAction.appendChild(saveBtn);

}


const triggerReportDialog = (recipient) => {
    const div = createElement('div', {
        className: 'middle report-dialog',
        style: 'width:100%'
    })
    div.innerHTML = `${textFieldFilled({
        required: true,
        value: createDate(new Date()),
        type: 'date',
        label:'Choose date'
    })}`


    const dialog = new Dialog(recipient.report + ' Report', div).create()
    dialog.open();
    dialog.buttons_[0].textContent = 'cancel'
    dialog.buttons_[1].textContent = 'Trigger';
    const fieldInit = new mdc.textField.MDCTextField(dialog.content_.querySelector('.mdc-text-field'));
    dialog.listen('MDCDialog:closed', function (event) {
        if (event.detail.action !== 'accept') return;

        http('POST', `${appKeys.getBaseUrl()}/api/admin/trigger-report`, {
            office: recipient.office,
            report: recipient.report,
            endTime: fieldInit.value,
            startTime: fieldInit.value
        }).then(function () {
            showSnacksApiResponse(`${recipient.report} triggered`);
        }).catch(function (err) {
            showSnacksApiResponse(err)
        })
    })
}

function addAssignee(card, includeNumbers, recipient) {
    const contactField = textFieldRemovable('tel', '', 'phone number')
    console.log(contactField)
    card.appendChild(contactField);

    const field = new mdc.textField.MDCTextField(contactField.querySelector('.mdc-text-field'));
    const initField = phoneFieldInit(field);
    if (!itis[card.dataset.type]) {
        itis[card.dataset.type] = [initField]

    } else {
        itis[card.dataset.type].push(initField)
    }

    const remove = contactField.querySelector('.mdc-icon-button');
    remove.addEventListener('click', function () {
        contactField.remove();
        if (!card.querySelector('.add-assignee-cont').children.length) {
            card.querySelector(".mdc-card__actions").classList.add('hidden');
            return;
        }
    });
    card.querySelector('.add-assignee-cont').appendChild(contactField);
    field.focus()
    card.querySelector(".mdc-card__actions").classList.remove('hidden');

}



function createReportCard(recipient) {
    const card = createElement('div', {
        className: 'mdc-card report-card mdc-layout-grid__cell mdc-card--outlined'
    })
    card.dataset.type = recipient.report;
    card.innerHTML = `
    <div class="demo-card__primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">${recipient.report}</span>
            <div class="mdc-typography--subtitle2">${recipient.cc}</div>
        </div>
        <div class='recipients-container'>
            <div class='trigger-report'></div>
        </div>
    </div>
    <div class='mdc-card__primary'>
        <div class='add-new-include hidden'>
           
        </div>
        <div class='include-list'>
            <div class="mdc-chip-set mdc-chip-set--input update-existing" role="grid"></div>
        </div> 
        <div class='action-cont'>
            ${faButton('', 'person_add').mini().outerHTML}
        </div>
    </div>

    <div class="mdc-card__actions hidden">
       
    </div>
   `
    return card;
};


const disableDomComponent = (el) => {
    el.classList.add('disable-element')

}

const enableDomComponent = (el) => {
    el.classList.remove('disable-element')
}