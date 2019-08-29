


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

const createDynamicLi = (name) => {
  const li = document.createElement('li');
  li.className = 'mdc-list-item'
  li.textContent = name;
  li.dataset.value  = name
  return li
}

const tempUI = (office) => {
  return `<div class='mdc-layout-grid'>


  <div class="mdc-layout-grid__cell">
  <div class="mdc-card">
  <div class="mdc-card__primary-action" id='s'>
    <div class="mdc-card__media-content">PAYROLL</div>
    <p class='mdc-typography--body1'>Double click this</p>
  </div>
  <div class="mdc-card__actions">
  <div class="mdc-card__action-buttons">
    <button class="mdc-button mdc-card__action mdc-card__action--button">
      <span class="mdc-button__label">TRIGGER PAYROLL</span>
    </button>
  
  </div>
  <div class="mdc-card__action-icons">
  <button class="mdc-button mdc-card__action mdc-card__action--button">
    <span class="mdc-button__label">CANCEL PAYROLL</span>
  </button>
  <button class="mdc-button mdc-card__action mdc-card__action--button">
  <span class="mdc-button__label">EDIT</span>
</button>
  </div>
</div>
</div>

 
  </div>
    <p class='mdc-typography--headline6'>
      Office selection is  on left panel for changing office.
    </p>
    <span class='mdc-typography--body1'>
      On changing office the current view is refreshed. Try changing office ( if you have multiple office )
    </span>
    <p class='mdc-typography--headline6'>
     Use this to get the recipient activity which will render above card
    </p>
    <p class='mdc-typography--headline6 mt-0'>
     <code>End point : /api?office='${office}'&template='recipient' (GET)</code> 
    </p>
    <p class='mdc-typography--headline6'>
    Trigger report  : <code>End point : /api/admin/trigger-report> (POST)</code> 

    <pre>
      POST Request : {
        report:'payroll',
        office:'${office}',
        data:'POST data'
      }
      </pre>
    </p>

    <p class='mdc-typography--headline6'>
    Change Status  : <code>End point : /api/admin/status-change> (POST)</code> 

    <pre>
      POST Request : {
        activityId:activityId,
        status:'CANCEL'
        office:${office},
        template:payroll
      }
      </pre>
    </p>


  </div>`
}

export {radioList,trailingIconList,textField,createDynamicLi,tempUI}