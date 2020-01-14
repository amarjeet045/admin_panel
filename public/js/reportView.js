const itis = {}

function reportView(office) {
    commonDom.progressBar.close()
    commonDom.drawer.list.selectedIndex = 1;
    const appContent = document.getElementById('app-content');
    appContent.innerHTML = ''
    const includeNumbers = []
    http('GET', `/api/myGrowthfile?office=${office}&field=recipients`).then(response => {
        console.log(response);
        response.recipients.forEach(function (recipient) {
            const card = createReportCard(recipient);

            recipient.include.forEach(function (assignee) {
                const li = assigneeLi(assignee)
                includeNumbers.push(assignee.phoneNumber)
                card.querySelector('ul').appendChild(li)
                li.querySelector('.mdc-icon-button').addEventListener('click', function () {
                    console.log(includeNumbers);
                    
                    getLocation().then(geopoint => {
                        http('PATCH', `/api/activities/share/`, {
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
            card.querySelector('.recipients-container .mdc-fab').addEventListener('click', function () {
                history.pushState({
                    view: 'addAssignee',
                    office: office
                }, `Add Recipient View`, `/?view=addAssignee`);
                addAssignee(card, includeNumbers, recipient)
            })
            appContent.appendChild(card);
            card.querySelector(`[data-state="save"]`).addEventListener('click', function () {

               itis[recipient.report].forEach(function(iti){
                    if(iti.isValidNumber()) {
                        const value = iti.getNumber(intlTelInputUtils.numberFormat.E164);
                        includeNumbers.push(value);
                    }
                    else {

                    }
                });

                getLocation().then(geopoint => {
                    http('PATCH', `/api/activities/share/`, {
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



function addAssignee(card, includeNumbers, recipient) {
    const contactField = textFieldRemovable('tel', '', 'phone number')
    console.log(contactField)
    card.appendChild(contactField);

    const field = new mdc.textField.MDCTextField(contactField.querySelector('.mdc-text-field'));
    const initField = phoneFieldInit(field);
    if(!itis[card.dataset.type]) {
        itis[card.dataset.type] = [initField]
        
    }
    else {
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
    debugger;
    const index = includeNumbers.indexOf(number);
    console.log('remove ', index)
    if (index > -1) {
        includeNumbers.splice(index, 1)
    }
    debugger;
    return includeNumbers;
}

function createReportCard(recipient, total) {
    const card = createElement('div', {
        className: 'mdc-card expenses-card mdc-layout-grid__cell mdc-layout-grid__cell--span-8-tablet  mdc-layout-grid__cell--span-12-desktop  mdc-card--outlined'
    })
    card.dataset.type = recipient.report;
    card.innerHTML = `
    <div class="demo-card__primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">${recipient.report}</span>
            <div class="mdc-typography--subtitle2">${recipient.cc}</div>
        </div>
        <div class='recipients-container'>
            ${cardButton().add('add').outerHTML}
      </div>
    </div>
    <div class='include-list pt-10'>
        <ul class='mdc-list demo-list mdc-list--two-line mdc-list--avatar-list'>
        </ul>
    </div> 
    <div class='add-assignee-cont'>
    </div>
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