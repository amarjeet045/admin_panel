import {
    MDCRipple
} from "@material/ripple";
import {
    MDCTextField
} from "@material/textfield";


export function createElement(tagName, attrs) {
    const el = document.createElement(tagName)
    if (attrs) {
        Object.keys(attrs).forEach(function (attr) {
            el[attr] = attrs[attr]
        })
    }
    return el;
}

export const assigneeCard = (assignees) => {
    return `
    <div class='mdc-card  mdc-card--outlined assignee-card' id='recipient-update-card'>
   <div class="demo-card__primary">
       <div class="card-heading">
           <span class="demo-card__title mdc-typography mdc-typography--headline6"> Manage Recipients</span>
            <div class='mdc-typography--subtitle1'>primary@gmail.com</div>
        </div>
   </div>
   <div class="demo-card__primary-action">   
     <div class='list-section'>
        <ul class='mdc-list demo-list mdc-list--two-line mdc-list--avatar-list' id='report-recipient-list'>
            ${assignees.map(function(assignee){
                return `<li class="mdc-list-item" tabindex="0">
                <img class="mdc-list-item__graphic" aria-hidden="true" src="${assignee.photoURL}">
                <span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">${assignee.displayName || assignee.phoneNumber}</span>
                <span class="mdc-list-item__secondary-text">${assignee.email ? `${assignee.email} ${assignee.emailVerified ? 'Verified' :'Not verified'}` : `-`}</span>
                </span>
                <span class="mdc-list-item__meta material-icons" aria-hidden="true">edit</span>
                </li>`
            }).join("")}
            <li class='mdc-list-divider'></li>
        </ul>
     </div>
       <button class="mdc-fab mdc-fab--exited mdc-fab--mini" aria-label="add">
            <span class="mdc-fab__icon material-icons">add</span>
        </button>
        <div class='add-cont'></div>
       </div>

   <div class="mdc-card__actions hidden">
   <div class="mdc-card__action-buttons"  id='remove'>
   <button class="mdc-button mdc-card__action mdc-card__action--button">
        <i class="material-icons mdc-button__icon">delete</i>
        <span class="mdc-button__label">remove</span>
    </button>
</div>

  <div class="mdc-card__action-buttons">
  <button class="mdc-button mdc-card__action mdc-card__action--button" id='cancel'>
  <span class="mdc-button__label">cancel</span>
</button>
    <button class="mdc-button mdc-card__action mdc-card__action--button mdc-button--raised hidden save" id='save'>
      <span class="mdc-button__label">save</span>
    </button>
  </div>
</div>
</div>`

}
export const assigneeCardWithCheckBox = (assignees) => {
return ` <div class='mdc-card  mdc-card--outlined assignee-card' id='recipient-update-card-2'>
<div class="demo-card__primary">
    <div class="card-heading">
        <span class="demo-card__title mdc-typography mdc-typography--headline6"> Manage Recipients</span>
         <div class='mdc-typography--subtitle1'>primary@gmail.com</div>
     </div>
</div>
<div class="demo-card__primary-action">   
  <div class='list-section'>
  <div>
  <div class="mdc-checkbox" id='all-check'>
    <input type="checkbox"
           class="mdc-checkbox__native-control"
           id="checkbox-1"/>
    <div class="mdc-checkbox__background">
      <svg class="mdc-checkbox__checkmark"
           viewBox="0 0 24 24">
        <path class="mdc-checkbox__checkmark-path"
              fill="none"
              d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
      </svg>
      <div class="mdc-checkbox__mixedmark"></div>
    </div>
  </div>
  <button class="mdc-button mdc-card__action mdc-card__action--button hidden" id='checkbox-delete'>
     <i class="material-icons mdc-button__icon">delete</i>
     <span class="mdc-button__label">remove</span>
 </button>
 </div>

     <ul class='mdc-list demo-list mdc-list--two-line mdc-list--avatar-list' id='report-recipient-list-2'>
     <li class='mdc-list-divider'></li>
        ${assignees.map(function(assignee){
                return `
                <div class='checkbox-custom-container'>
                <div class="mdc-checkbox">
            <input type="checkbox"
                   class="mdc-checkbox__native-control"
                   id="checkbox-1"/>
            <div class="mdc-checkbox__background">
              <svg class="mdc-checkbox__checkmark"
                   viewBox="0 0 24 24">
                <path class="mdc-checkbox__checkmark-path"
                      fill="none"
                      d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
              </svg>
              <div class="mdc-checkbox__mixedmark"></div>
            </div>
          </div>
                
                
                <li class="mdc-list-item" tabindex="0">
                <img class="mdc-list-item__graphic" aria-hidden="true" src="${assignee.photoURL}">
                <span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">${assignee.displayName || assignee.phoneNumber}</span>
                <span class="mdc-list-item__secondary-text">${assignee.email ? `${assignee.email} ${assignee.emailVerified ? 'Verified' :'Not verified'}` : `-`}</span>
                </span>
               
                </li>
                </div>`    
            }).join("")}
         <li class='mdc-list-divider'></li>
     </ul>
  </div>
    <button class="mdc-fab mdc-fab--exited mdc-fab--mini" aria-label="add" id='mdc-fab-2'>
         <span class="mdc-fab__icon material-icons">add</span>
     </button>
     <div class='add-cont'></div>
    </div>

<div class="mdc-card__actions hidden">
<div class="mdc-card__action-buttons"  id='remove'>

</div>

<div class="mdc-card__action-buttons">
<button class="mdc-button mdc-card__action mdc-card__action--button" id='cancel'>
<span class="mdc-button__label">cancel</span>
</button>
 <button class="mdc-button mdc-card__action mdc-card__action--button mdc-button--raised hidden save" id='save'>
   <span class="mdc-button__label">save</span>
 </button>
</div>
</div>
</div>`
}

export const leaveTypeCard = (leaveTypes) => {
    return `
    <div class='mdc-card  mdc-card--outlined assignee-card' id='leave-update-card'>
   <div class="demo-card__primary">
       <div class="card-heading">
           <span class="demo-card__title mdc-typography mdc-typography--headline6">Leave types</span>
       </div>
   </div>
   <div class="demo-card__primary-action">   
     <div class='list-section'>
        <ul class='mdc-list demo-list mdc-list--two-line' id='leave-type-list'>
            ${leaveTypes.map(function(type){
                return `<li class="mdc-list-item" tabindex="0">
             
                <span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">${type.name}</span>
                <span class="mdc-list-item__secondary-text">Annual limit ${type.limit}</span>
                </span>
                <span class="mdc-list-item__meta material-icons" aria-hidden="true">edit</span>
                </li>`
            }).join("")}
            <li class='mdc-list-divider'></li>
        </ul>
     </div>
       <button class="mdc-fab mdc-fab--exited mdc-fab--mini" aria-label="add">
            <span class="mdc-fab__icon material-icons">add</span>
        </button>
        <div class='add-cont'></div>
       </div>

   <div class="mdc-card__actions hidden">
   <div class="mdc-card__action-buttons"  id='remove'>
   <button class="mdc-button mdc-card__action mdc-card__action--button">
        <i class="material-icons mdc-button__icon">delete</i>
        <span class="mdc-button__label">remove</span>
    </button>
</div>

  <div class="mdc-card__action-buttons">
  <button class="mdc-button mdc-card__action mdc-card__action--button" id='cancel'>
  <span class="mdc-button__label">cancel</span>
</button>
    <button class="mdc-button mdc-card__action mdc-card__action--button mdc-button--raised hidden save" id='save'>
      <span class="mdc-button__label">save</span>
    </button>
  </div>
</div>
</div>`
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
    const div = createElement('div', {
        className: 'mdc-text-field mdc-text-field--outlined',
        id: attr.id
    })
    div.innerHTML = `
    <input class="mdc-text-field__input" id="text-field-hero-input"  type=${attr.type ? attr.type:'number'} required autocomplete=${attr.autocomplete}>
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      <div class="mdc-notched-outline__notch">
      ${attr.label ? `<label for="text-field-hero-input" class="mdc-floating-label">${attr.label}</label>` :'' }
      </div>
      <div class="mdc-notched-outline__trailing"></div>
    </div>
  `
    return div
}
export const textFieldTelephone = (attr) => {
    return `<div class="mdc-text-field mdc-text-field--outlined mdc-text-field--no-label" id=${attr.id}>
    <input class="mdc-text-field__input" id="text-field-hero-input" type='tel' value="${attr.value || ''}" required autocomplete=${attr.autocomplete}>
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      <div class="mdc-notched-outline__trailing"></div>
    </div>
  </div>`
}

export const textFieldFilled = (attr) => {
    return `<div class="mdc-text-field" id=${attr.id}>
    <input class="mdc-text-field__input" id="text-field-hero-input" value="${attr.value|| ''}" type=${attr.type} autocomplete>
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

export function payrollCard(type, data, assignees) {

    return `
    
    <div data-type="${type}" id='${type}-card' class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
        <div class="demo-card__primary">
            <div class="card-heading">
                <span class="demo-card__title mdc-typography mdc-typography--headline6">${type}</span>
            </div>
            <div class='recipients-container' tabindex="0">
                <div class='mdc-typography--subtitle2'>Recipients</div>
                <div class='overlapped-images-container'>
                    ${assignees.map(function(assignee){
                        return `<img src=${assignee.photoURL} class='mdc-chip__icon  overlapped-avatar-images'>`
                    }).join("")}
                </div>
            </div>
        </div>
        <div class="demo-card__primary-action">   
             ${createPaymentSnapshot(data)}
        </div>
    </div>

    `
}

export const employeeCard = (data) => {
    return `<div data-type="employee" id='employee-card' class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
    <div class="demo-card__primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">Employees</span>
        </div>
   
    </div>
    <div class="demo-card__primary-action">   
         ${createEmployeeSnapshot(data)}
    </div>
</div>`
}

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
const convertNumberToINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount)
}

export const  createPaymentSnapshot = (data) => {
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


 const createEmployeeSnapshot = (data) => {
return `<ul class="mdc-list demo-list mdc-list--two-line" style="
padding-bottom: 0px;">

 <li class="mdc-list-item  tabindex="0">
    <span class="mdc-list-item__text">
        <span class="mdc-list-item__primary-text">Total Employees : 400</span>
        <span class="mdc-list-item__secondary-text"  style='color:green'>
            Active yesterday : 300
        </span>
    </span>
    <button class='mdc-button mdc-button--raised'>
        <span class='mdc-button__label'>
           Manage
        </span>
    </button>
    </li>

    <li class="mdc-list-item  tabindex="0">
    <span class="mdc-list-item__text">
        <span class="mdc-list-item__primary-text">Payroll Report</span>
        <span class="mdc-list-item__secondary-text">
        <span>
        <i class='material-icons'>access_time</i>
        <input type="date" id='time' autofocus style="
        border: 0px;
        font-size: 14px;" max="2019-09-19" value="2019-09-19">
        </span>
        </span>
    </span>
    <button class='mdc-button hidden' id='generate'>
        <span class='mdc-button__label'>
           Generate
        </span>
    </button>
    </li>
</ul>`
}
const iconInline = (name, value) => {
    const p = createElement('p', {
        className: 'meta-counts',
        textContent: name
    })
    return p;
}




export {
    radioList,
    trailingIconList,
    textField,
    createDynamicLi,
    BreadCrumbs
}