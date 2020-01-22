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
            if(recipient.office !== office) return;
            const card = createReportCard(recipient);
            const includeNumbers = []
            if (recipient.report !== 'footprints') {

                const triggerBtn = iconButtonWithLabel('play', 'Trigger ' + recipient.report);
                triggerBtn.addEventListener('click', function () {
                    triggerReportDialog(recipient)
                });

                card.querySelector('.trigger-report').appendChild(triggerBtn)
                
            }
            recipient.include.forEach(function (assignee) {
                const li = assigneeLi(assignee)
                includeNumbers.push(assignee.phoneNumber)
                card.querySelector('ul').appendChild(li)
                li.querySelector('.mdc-icon-button').addEventListener('click', function () {

                    getLocation().then(geopoint => {
                        http('PATCH', `${appKeys.getBaseUrl()}/api/activities/share/`, {
                            activityId: recipient.recipientId,
                            share: removeAssignee(includeNumbers, assignee.phoneNumber),
                            geopoint: geopoint
                        }).then(function (response) {
                            console.log(response)
                            showSnacksApiResponse(`${assignee.phoneNumber} removed`)
                            li.remove();
                        }).catch(function (err) {
                            showSnacksApiResponse(err.message)
                        })
                    }).catch(handleLocationError);
                })
            })
            card.querySelector('.mdc-fab').addEventListener('click', function () {
                history.pushState({
                    view: 'addAssignee',
                    office: office
                }, `Add Recipient View`, `/?view=addAssignee`);
                addAssignee(card, includeNumbers, recipient)
            })
            appContent.appendChild(card);
            card.querySelector(`[data-state="save"]`).addEventListener('click', function () {

                itis[recipient.report].forEach(function (iti) {
                    if (iti.isValidNumber()) {
                        const value = iti.getNumber(intlTelInputUtils.numberFormat.E164);
                        includeNumbers.push(value);
                    } else {

                    }
                });

                getLocation().then(geopoint => {
                    http('PATCH', `${appKeys.getBaseUrl()}/api/activities/share/`, {
                        activityId: recipient.recipientId,
                        share: includeNumbers,
                        geopoint: geopoint
                    }).then(function (response) {
                        console.log(response)
                        showSnacksApiResponse(`New number added`)
                        card.querySelector('.add-assignee-cont').innerHTML = '';
                        card.querySelector(".mdc-card__actions").classList.add('hidden');
                    }).catch(function (err) {
                        showSnacksApiResponse(err.message)
                    })
                }).catch(handleLocationError);
            })
            card.querySelector(`[data-state="cancel"]`).addEventListener('click', function () {
                card.querySelector('.add-assignee-cont').innerHTML = '';
                card.querySelector(".mdc-card__actions").classList.add('hidden');

            });
        });
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
    dialog.buttons_[1].textContent = 'Trigger';
    const fieldInit = new mdc.textField.MDCTextField(dialog.content_.querySelector('.mdc-text-field'));
    dialog.listen('MDCDialog:closed', function (event) {
        if (event.detail.action !== 'accept') return;

        http('POST', `${appKeys.getBaseUrl()}/api/admin/trigger-report`, {
            office: recipient.office,
            report: recipient.report,
            endTime:fieldInit.value,
            startTime:fieldInit.value
        }).then(function(){
            showSnacksApiResponse(`${recipient.report} triggered`);
        }).catch(function(err){
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

function removeAssignee(includeNumbers, number) {
    const index = includeNumbers.indexOf(number);
    console.log('remove ', index)
    if (index > -1) {
        includeNumbers.splice(index, 1)
    }
    return includeNumbers;
}

function createReportCard(recipient) {
    const card = createElement('div', {
        className: 'mdc-card report-card mdc-layout-grid__cell mdc-layout-grid__cell--span-8-tablet  mdc-layout-grid__cell--span-12-desktop  mdc-card--outlined'
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
    <div class='include-list pt-10'>
        <ul class='mdc-list demo-list mdc-list--two-line mdc-list--avatar-list'>
        </ul>
    </div> 
    <div class='add-assignee-cont'>
    </div>
    ${cardButton().add('add').outerHTML}
    <div class="mdc-card__actions  hidden">
    <button class="mdc-button mdc-card__action mdc-card__action--button" data-state="cancel">
        <span class="mdc-button__label">Cancel</span>
    </button>
    <button class="mdc-button mdc-card__action mdc-card__action--button mdc-button--raised" data-state="save">
        <span class="mdc-button__label">Save</span>
    </button>
    </div>
   `
    return card;
};