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
    http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=recipients&field=roles`).then(response => {
        console.log(response);
        const searchData = {}
        if (response.roles.employee) {

            response.roles.employee.forEach(employee => {

                const displayName = employee.attachment['Name'].value;
                const phoneNumber = employee.attachment['Phone Number'].value
                const key = phoneNumber + displayName.toLowerCase().split(" ").join("");

                searchData[key] = {
                    displayName: displayName,
                    phoneNumber: phoneNumber
                }


            })
        }
        if (response.roles.admin) {

            response.roles.admin.forEach(admin => {
                const phoneNumber = admin.attachment['Phone Number'].value
                if (!searchData[phoneNumber]) {
                    searchData[phoneNumber] = {
                        phoneNumber: phoneNumber
                    }
                }

            })
        }
        if (response.roles.subscription) {

            response.roles.subscription.forEach(subscription => {
                const phoneNumber = subscription.attachment['Phone Number'].value
                if (!searchData[phoneNumber]) {
                    searchData[phoneNumber] = {
                        phoneNumber: phoneNumber
                    };
                }
            });
        }

        response.recipients.forEach(function (recipient) {
            if (recipient.office !== office) return;
            const card = createReportCard(recipient);
            const chipSetInputEl = card.querySelector('.mdc-chip-set--input.update-existing');
            const currentNumbers = []

            if (recipient.report !== 'footprints') {
                card.querySelector('.trigger-report-link').addEventListener('click', function (e) {
                    e.preventDefault();
                    triggerReportDialog(recipient)
                })
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
                    setTimeout(() => {
                        reports(office);

                    }, 4000);

                }).catch(function () {
                    card.querySelector('.mdc-fab').classList.remove('hidden')
                    enableDomComponent(card.querySelector('.include-list'))
                })
            });

            card.querySelector('.mdc-fab').addEventListener('click', function (e) {

                addNewIncludes(card, recipient, office, searchData)
                card.querySelector(".mdc-fab").classList.add('hidden')
                return
            })
            appContent.appendChild(card);
        });
    });
}

const createIncludeEdit = (phoneNumberValue) => {

    return `
   <div class='include-edit-container'>
        <div class='mt-10 phone-cont'>
            ${textFieldTelephoneWithHelper({value:phoneNumberValue || ''}).outerHTML}
        </div>
        <div class='email-cont'>
            ${textField({id:'email',type:'email',label:'Email'})}
            <div class="mdc-text-field-helper-line">
                <div class="mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg"></div>
            </div>
        </div>
    </div>
    `
}

const addNewIncludes = (card, recipient, office, searchData) => {
    const includeCont = card.querySelector('.add-new-include')
    includeCont.classList.remove('hidden');
    card.querySelector('.include-list').classList.add("hidden")
    const keys = Object.keys(searchData);
    includeCont.innerHTML = `${textField({label:'search',leadingIcon:'search'})}
    <ul class='mdc-list' style='max-height:96px;overflow-y:auto;'></ul>
    `
    const field = new mdc.textField.MDCTextField(card.querySelector('.mdc-text-field'));
    const ul = new mdc.list.MDCList(card.querySelector('.add-new-include ul'));
    const cardAction = card.querySelector('.mdc-card__actions')
    cardAction.classList.remove("hidden")
    field.input_.addEventListener('input', function (event) {
        const value = event.target.value.toLowerCase().trim();
        if (!value) return;
        if (includeCont.querySelector('.email-cont')) {
            includeCont.querySelector('.email-cont').remove();
        }
        ul.root_.innerHTML = '';


        keys.forEach(key => {
            const identifier = key
            if (key.indexOf(value) > -1) {

                const li = createElement('li', {
                    className: 'mdc-list-item',
                    textContent: searchData[identifier].displayName ? searchData[identifier].displayName : searchData[identifier].phoneNumber
                })

                li.addEventListener('click', function () {
                    ul.root_.innerHTML = ``

                    field.value = searchData[identifier].displayName;
                    const div = createElement('div', {
                        className: 'email-cont'
                    })
                    div.innerHTML = `${textField({label:'Email',type:'email'})}<div class="mdc-text-field-helper-line">
                    <div class="mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg"></div>
                  </div>`
                    includeCont.appendChild(div)
                    const emailField = new mdc.textField.MDCTextField(includeCont.querySelector('.email-cont .mdc-text-field'));
                    console.log(emailField)
                    if (card.querySelector('.mdc-card__actions button[data-state="save"]')) {
                        card.querySelector('.mdc-card__actions button[data-state="save"]').remove();
                    }

                    const saveBtn = cardButton().save();
                    saveBtn.addEventListener('click', function () {

                        if (!emailField.value) {
                            setHelperInvalid(emailField, 'Please enter an email address');
                            return;
                        }



                        setHelperValid(emailField);
                        const numbers = []
                        let found = false;
                        for (let item of recipient.include) {
                            if (item.phoneNumber === searchData[identifier].phoneNumber) {
                                found = true
                                showSnacksApiResponse('This number already receives ' + recipient.report + ' report');
                                break;
                            }
                            numbers.push(item.phoneNumber)
                        }
                        if (found) return;

                        numbers.push(searchData[identifier].phoneNumber);
                        share(recipient.activityId, numbers).then(function () {
                            return http('POST', `${appKeys.getBaseUrl()}/update-auth`, {
                                phoneNumber: searchData[identifier].phoneNumber,
                                email: emailField.value,
                                displayName: searchData[identifier].displayName
                            })
                        }).then(function () {
                            setTimeout(() => {
                                reports(office);
                            }, 3000);
                        }).catch(function () {
                            reports(office);
                        })
                    });
                    cardAction.appendChild(saveBtn);
                });
                ul.root_.appendChild(li)
                return
            }
        })
        if (!ul.listElements.length) {

            console.log("not found");
            const li = createElement('li', {
                className: 'mdc-list-item',
                textContent: `Not result found. Add "${value}" ? `
            })
            li.addEventListener('click', function () {
                includeCont.innerHTML = createIncludeEdit();
                const emailField = new mdc.textField.MDCTextField(includeCont.querySelector('.email-cont .mdc-text-field'));
                const numberField = new mdc.textField.MDCTextField(includeCont.querySelector('.phone-cont .mdc-text-field'))
                const iti = phoneFieldInit(numberField);

                if (card.querySelector('.mdc-card__actions button[data-state="save"]')) {
                    card.querySelector('.mdc-card__actions button[data-state="save"]').remove();
                }

                const saveBtn = cardButton().save();
                saveBtn.addEventListener('click', function () {

                    if (!emailField.value) {
                        setHelperInvalid(emailField, 'Please enter an email address');
                        return;
                    }

                    setHelperValid(emailField);
                    if(!iti.isValidNumber()) {
                        setHelperInvalid(numberField, 'Please enter a valid phone number');
                        return;
                    }
                    const number = iti.getNumber(intlTelInputUtils.numberFormat.E164)
                    setHelperValid(numberField);

                    const numbers = []
                    let found = false;
                    for (let item of recipient.include) {
                        if (item.phoneNumber === number) {
                            found = true
                            showSnacksApiResponse('This number already receives ' + recipient.report + ' report');
                            break;
                        }
                        numbers.push(item.phoneNumber)
                    }
                    if (found) return;

                    numbers.push(number);
                    share(recipient.activityId, numbers).then(function () {
                        return http('POST', `${appKeys.getBaseUrl()}/update-auth`, {
                            phoneNumber: number,
                            email: emailField.value,
                            displayName: ''
                        })
                    }).then(function () {
                        setTimeout(() => {
                            reports(office);
                        }, 3000);
                    }).catch(function () {
                        reports(office);
                    })
                });
                cardAction.appendChild(saveBtn);
            })

            ul.root_.appendChild(li)

            return

        }
    });


    field.focus();


    card.querySelector('.mdc-card__actions button[data-state="cancel"]').addEventListener('click', function () {

        cardAction.classList.add('hidden');
        includeCont.classList.add('hidden');
        card.querySelector(".mdc-fab").classList.remove("hidden");
        card.querySelector('.include-list').classList.remove("hidden")
    });

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
    dialog.buttons_[1].textContent = 'SEND';
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
        ${recipient.report !== 'footprints' ? ` <a class="demo-card__title mdc-typography mdc-typography--headline6 trigger-report-link" href="#">${recipient.report}</a> <div class="mdc-typography--caption">click to get ${recipient.report}</div>` : `<div class="demo-card__title mdc-typography mdc-typography--headline6">${recipient.report}</div>`}
        
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
       ${cardButton().cancel().outerHTML}

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