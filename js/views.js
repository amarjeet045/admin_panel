
function createElement(tagName,attrs) {
    const el = document.createElement(tagName)
    if(attrs) {
        Object.keys(attrs).forEach(function(attr){
            el[attr] = attrs[attr]
        })
    }
    return el;
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

const textField = (attr) => {
    return `<div class="mdc-text-field mdc-text-field--outlined" id=${attr.id}>
    <input class="mdc-text-field__input" id="text-field-hero-input" type=${attr.type ? attr.type:'number'} required autocomplete=${attr.autocomplete}>
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      <div class="mdc-notched-outline__notch">
        <label for="text-field-hero-input" class="mdc-floating-label">${attr.label}</label>
      </div>
      <div class="mdc-notched-outline__trailing"></div>
    </div>
  </div>`
}
export const textFieldTelephone = (attr) => {
    return `<div class="mdc-text-field mdc-text-field--outlined mdc-text-field--no-label" id=${attr.id}>
    <input class="mdc-text-field__input" id="text-field-hero-input" type='tel' required autocomplete=${attr.autocomplete}>
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      <div class="mdc-notched-outline__trailing"></div>
    </div>
  </div>`
}

export const textFieldFilled = (attr) => {
    return `<div class="mdc-text-field" id=${attr.id}>
    <input class="mdc-text-field__input" id="text-field-hero-input" type=${attr.type} autocomplete>
    <div class="mdc-line-ripple"></div>
    <label for="text-field-hero-input" class="mdc-floating-label">${attr.label}</label>
  </div>`
}
const createDynamicLi = (name) => {
    const li = document.createElement('li');
    li.className = 'mdc-list-item'
    li.textContent = name;
    li.dataset.value = name
    return li
}

export const expenseCard = (name) => {
    return `<div class='mdc-card mdc-card--outlined activity-card  mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4-tablet mdc-layout-grid__cell--span-4-phone'>
        <div class='mdc-card__primary-action'>

            <span class='mdc-typography--headline5'>${name}</span>
        </div>
        <div class='mdc-card__actions'>
            <div class='mdc-card__action-buttons'>
                <button class='mdc-button mdc-card__action mdc-card__action--button'>
                    Manage
                </button>
            </div>
        </div>
    </div>`
}


export const activityCard = (name) => {
    return `<div class='mdc-card mdc-card--outlined activity-card  mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4-tablet mdc-layout-grid__cell--span-4-phone'>
        <div class='mdc-card__primary-action'>
            <span class='mdc-typography--headline5'>${name}</span>
        </div>
        <div class='mdc-card__actions'>
            <div class='mdc-card__action-buttons'>
                <button class='mdc-button mdc-card__action mdc-card__action--button'>
                    Manage
                </button>
            </div>
        </div>
    </div>`
}

export const reportStatusCard = (heading, status) => {
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

export const reportTriggerCard = () => {
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

function BreadCrumbs() {
    return `<nav>
    <div class="nav-wrapper">
      <div class="mdc-layout-grid--span-8" id='breadcrumb-container'>
      </div>
    </div>
  </nav>`
}
BreadCrumbs.prototype.getParent = function () {
    return document.getElementById('breadcrumb-container');
}
BreadCrumbs.prototype.addCrumb = function (name) {
    const crumb = document.createElement('a')
    crumb.classList.add('breadcrumb')
    crumb.textContent = name
    this.getParent.appendChild(crumb);
}
BreadCrumbs.prototype.clearAll = function () {
    this.getParent.innerHTML = '';
}

export function payrollCard(paymentData,employeeCount,employees) {
    return `
    
    <div class="mdc-card  mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
             <div class="demo-card__primary">
                 <div class="card-heading">
                     <span class="demo-card__title mdc-typography mdc-typography--headline5">Payroll</span>
                 </div>
                 <div class="count-container">
                     ${countLabel('Total Employees',employeeCount).outerHTML}
                 </div>
             </div>
             <div class="mdc-card__primary-action demo-card__primary-action" tabindex="0">
             <div class='payment-snapshot'>
             ${paymentData.map(function(data){
                 return `${createPaymentSnapshot(data).outerHTML}`
                }).join("")}
                
                </div>
            </div>
           
         </div>`
}

{/* <div class="mdc-card__actions mdc-card__actions--full-bleed">
<button class="mdc-button mdc-card__action mdc-card__action--button">
    <span class="mdc-button__label">Manage Payroll</span>
    <i class="material-icons" aria-hidden="true">arrow_forward</i>
</button>
</div> */}

/** generate dom for showing common count **/

export function countLabel(label, count) {
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
const convertNumberToINR = (amount)=>{
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR'
}).format(amount)
}

export function createPaymentSnapshot(data) {
   
    const container = createElement('div', {
        className: 'payment-status'
    })
    const heading = createElement('div', {
        className: 'mdc-typography--headline6 payment-status-heading',
        textContent: `${data.label} : ${convertNumberToINR(data.amount)}`
    });
    if(data.label === 'PENDING') {
        heading.classList.add('pending-payment-headline')
    }
    const iconContainer = createElement('div',{
        className:'icon-container'
    })
    iconContainer.appendChild(iconInline('people',data.employees))
    if(data.status !== 'PENDING') {
        iconContainer.appendChild(iconInline('today',data.date))
    }
    container.appendChild(heading)
    container.appendChild(iconContainer);

    const button = createElement('button',{className:'mdc-button'}) 
    if(data.label === 'PENDING') {
        button.classList.add('mdc-button--raised')
        button.appendChild(createElement('span',{className:'mdc-button__label',textContent:'pay now'}))
        button.appendChild(createElement('i',{className:'material-icons mdc-button__icon',textContent:'arrow_forward'}))
        container.appendChild(button)
    }
    if(data.label === 'This month') {
        button.appendChild(createElement('span',{className:'mdc-button__label',textContent:'manage payroll'}))
        button.appendChild(createElement('i',{className:'material-icons mdc-button__icon',textContent:'arrow_forward'}))

        container.appendChild(button)
    }
    return container;
}

const iconInline = (name,value) => {
const span = createElement('span',{className:'inline-icon'})
const icon = createElement('i',{
    className:'material-icons',
    textContent:name
})
span.appendChild(icon)
const text = document.createDocumentFragment();
text.textContent  = value;
span.appendChild(text);

return span;
}


export {
    radioList,
    trailingIconList,
    textField,
    createDynamicLi,
    BreadCrumbs
}