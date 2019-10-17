const basicCards = (title,id,total) => {
    return `
    <div class="mdc-card expenses-card mdc-layout-grid__cell mdc-card--outlined" data-type="${title}" >
    <div class="demo-card__primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">${title}</span>
            <div class="mdc-typography--subtitle2" style='color:green;'></div>
           
        </div>
        <div class='recipients-container' tabindex="0">
            ${total ? ` <span class='mdc-typography--subtitle2'>Total</span>
            <div class='mdc-typography--headline5'>${total}</div>` :''}
         
        </div>
    </div>

    <div class="mdc-card__actions mdc-card__actions--full-bleed">
    <button class="mdc-button mdc-card__action mdc-card__action--button" id="${id}">
      <span class="mdc-button__label">Manage ${title}</span>
      <i class="material-icons" aria-hidden="true">arrow_forward</i>
    </button>
    
    </div>
</div>
    `
}

const leaveTypeCard = () => {
    return `
    <div class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
    <div class="demo-card__primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">Leave Types</span>
            <div class="mdc-typography--caption">Last updated : 13/12/12 6:00 AM</div>
            <div class="mdc-typography--subtitle2" style='color:green;'>Active leave types : 4</div>
           
        </div>
        <div class='recipients-container' tabindex="0">
          <span class='mdc-typography--subtitle2'>Total</span>
          <div class='mdc-typography--headline5'>5</div>
        </div>
    </div>

    <div class="mdc-card__actions mdc-card__actions--full-bleed">
    <button class="mdc-button mdc-card__action mdc-card__action--button" id='open-leave-type'>
      <span class="mdc-button__label">  leave types</span>
      <i class="material-icons" aria-hidden="true">arrow_forward</i>
    </button>
    
    </div>
</div>
    `
}

const radioList = (attr) => {
    return `<li class="mdc-list-item" role="radio" aria-checked="false">
    <span class="mdc-list-item__graphic">
    <div class="mdc-radio">
      <input class="mdc-radio__native-control"
            type="radio"
            id="list-radio-item-${attr.id}"
            name="demo-list-radio-item-group"
            value="${attr.label}">
      <div class="mdc-radio__background">
        <div class="mdc-radio__outer-circle"></div>
        <div class="mdc-radio__inner-circle"></div>
      </div>
    </div>
  </span>
  <label class="mdc-list-item__text" for="list-radio-item-${attr.id}">${attr.label}</label>
  ${trailingIcon(attr.icon)}
</li>`
}

const trailingIconList = (attr) => {
    return `<li class="mdc-list-item" tabindex="0">
        <span class="mdc-list-item__text">${attr.text}</span>
        ${trailingIcon(attr.icon)}
    </li>`
}

const trailingIcon = (icon = '') => {
    return `<span class="mdc-list-item__meta material-icons" aria-hidden="true">${icon}</span>
    `
}


const reportStatusCard = (heading, status) => {
    const line = document.createElement('p')
    line.className = 'mdc-typography--body1'
    let buttonText = ''
    switch (status) {
        case 'CANCELLED':
            line.textContent = 'Unsubscribed';
            line.classList.add('mdc-theme--error')
            buttonText = 'Subscribe';
            break;
        case 'CONFIRMED':
            line.textContent = 'Subscribed';
            line.classList.add('mdc-theme--success')

            buttonText = 'Unsubscribe';
            break;

        case 'PENDING':
            line.textContent = 'Pending';
            line.classList.add('mdc-theme--warning')
            buttonText = 'Subscribe';
    }

    return `<div class='mdc-card mdc-card--outlined activity-card mdc-layout-grid__cell--span-4'>
        <div class='mdc-card__primary-action'>
            <span class='mdc-typography--headline5'>${heading}</span>
            ${line.outerHTML}
        </div>
        <div class='mdc-card__actions'>
            <div class='mdc-card__action-buttons'>
                <button class='mdc-button mdc-card__action mdc-card__action--button'>
                    ${buttonText}
                </button>
            </div>
        </div>
    </div>`
}

const reportTriggerCard = () => {
    return `<div class='mdc-card mdc-card--outlined activity-card  mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4-tablet mdc-layout-grid__cell--span-4-phone'>
    <div class='mdc-card__primary-action'>
        <span class='mdc-typography--headline5'>Trigger Payroll Report</span>
        <div class='mt-10'>
          
        </div>
    </div>
    <div class='mdc-card__actions'>
        <div class='mdc-card__action-buttons'>
            <button class='mdc-button mdc-card__action mdc-card__action--button'>
                Trigger
            </button>
        </div>
    </div>
</div>`
}

{/* <div class='heading-action-container'>
<div class='overlapped-images-container'>
    ${assignees.map(function(assignee,index){
        return `
        ${index < 3 ?`<img src=${assignee.photoURL || './img/person.png'} class='mdc-chip__icon  overlapped-avatar-images'>` :''}
       `
    }).join("")}
</div>
</div> */}

function payrollCard(type) {
    return `
    <div data-type="${type}" id='${type}-card' class="mdc-card payroll-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
        <div class="demo-card__primary">
            <div class="card-heading">
                <span class="demo-card__title mdc-typography mdc-typography--headline6">${type}</span>
                </div>
              
        </div>
    <div class="mdc-card__actions mdc-card__actions--full-bleed">
        <button class="mdc-button mdc-card__action mdc-card__action--button" data-type="manage-${type}">
        <span class="mdc-button__label">Manage ${type}</span>
        <i class="material-icons" aria-hidden="true">arrow_forward</i>
        </button>
    </div>
    <div class="mdc-card__actions mdc-card__actions--full-bleed">
        <button class="mdc-button mdc-card__action mdc-card__action--button" data-type="manage-${type}-recipients">
        <span class="mdc-button__label">Manage Recipients</span>
        <i class="material-icons" aria-hidden="true">arrow_forward</i>
        </button>
    </div>
    </div>
    `
};

{
    /* <div class="demo-card__primary-action">   
                 ${createPaymentSnapshot(data)}
            </div> */
}

/** generate dom for showing common count **/

function countLabel(label, count) {
    const container = createElement('div', {
        className: 'count-type'
    })
    const labelEl = createElement('span', {
        className: 'mdc-typography--subtitle2 count-label',
        textContent: label
    })
    const countEl = createElement('div', {
        className: 'mdc-typography--headline5 count-value',
        textContent: count
    })
    container.appendChild(labelEl)
    container.appendChild(countEl)
    return container;
}
const convertNumberToINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount)
}

const createPaymentSnapshot = (data) => {
    return `<ul class="mdc-list demo-list mdc-list--two-line" style="
    padding-bottom: 0px;">
${data.map(function(value){
    return `<li data-status="${value.status}" class="mdc-list-item  tabindex="0">
        <span class="mdc-list-item__text">
            <span class="mdc-list-item__primary-text">${value.label} ${convertNumberToINR(value.amount)}</span>
            <span class="mdc-list-item__secondary-text">
                <span> 
                    <i class='material-icons'>people</i>
                    ${value.employees}
                </span>
              <span> 
                    <i class='material-icons'>today</i>
                        ${value.date}
                </span>
            </span>
           
        </span>
        <button class='mdc-button'>
            <span class='mdc-button__label'>
                ${value.buttonText}
            </span>
        </button>
        
    `
}).join("")}
</ul>`

}

const faButton = (id = '', icon) => {
    const button = createElement('button', {
        className: 'mdc-fab mdc-theme--primary-bg',
        'aria-label': 'add',
        id: id
    })
    const span = createElement('span', {
        className: 'mdc-fab__icon material-icons mdc-theme--on-primary',
        textContent: icon
    })
    button.appendChild(span)
    return {
        normal: function () {
            return button
        },
        mini: function () {
            button.classList.add('mdc-fab--mini')
            return button;
        }
    }

}

const cardButton = (id) => {
    const button = createElement('button', {
        className: 'mdc-button mdc-card__action mdc-card__action--button',
        id: id
    })
    const span = createElement('span', {
        className: 'mdc-button__label'
    })
    button.appendChild(span);
    return {
        cancel: function () {
            span.textContent = 'CANCEL';
            return button;
        },
        save: function (label) {
            span.textContent = 'SAVE';
            button.classList.add('mdc-button--raised');
            return button;
        },
        add: function (icon) {
            const addButton = faButton(id, icon).mini()
            addButton.classList.add('mdc-fab--exited')
            return addButton
        }

    }
}