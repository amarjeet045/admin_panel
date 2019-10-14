function createElement(tagName, attrs) {
  const el = document.createElement(tagName)
  if (attrs) {
    Object.keys(attrs).forEach(function (attr) {
      el[attr] = attrs[attr]
    })
  }
  return el;
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
const textFieldTelephone = (attr) => {
  return `<div class="mdc-text-field mdc-text-field--outlined mdc-text-field--no-label" id=${attr.id}>
    <input class="mdc-text-field__input" id="text-field-hero-input" type='tel' value="${attr.value || ''}" required autocomplete=${attr.autocomplete}>
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      <div class="mdc-notched-outline__trailing"></div>
    </div>
  </div>`
}

const textFieldFilled = (attr) => {
  return `<div class="mdc-text-field" id=${attr.id}>
    <input class="mdc-text-field__input" id="text-field-hero-input" value="${attr.value|| ''}" type=${attr.type} autocomplete>
    <div class="mdc-line-ripple"></div>
    <label for="text-field-hero-input" class="mdc-floating-label">${attr.label}</label>
  </div>`
}
const textFieldFilledLeadingIcon = (id = '', icon, label) => {
  return `<div class="mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon" id='${id}'>
  <i class="material-icons mdc-text-field__icon">${icon}</i>
  <input class="mdc-text-field__input" id="text-field-hero-input">
  <div class="mdc-notched-outline">
    <div class="mdc-notched-outline__leading"></div>
    <div class="mdc-notched-outline__notch">
      <label for="text-field-hero-input" class="mdc-floating-label">${label}</label>
    </div>
    <div class="mdc-notched-outline__trailing"></div>
  </div>
  </div>`
}

const headerButton = (label, id = '') => {
  const button = createElement('button', {
    className: 'mdc-button mdc-top-app-bar__action-item',
    id: id
  })
  const span = createElement('span', {
    className: 'mdc-button__label',
    textContent: label
  })
  button.appendChild(span);
  return button;
}



const searchBar = (id) => {
  const container = createElement('div', {
    className: 'search-bar'
  });
  container.innerHTML = textFieldFilledLeadingIcon(id, 'search', 'search');
  console.log(container)
  return container;
}


const actionCard = (attr) => {
  const card = createElement("div", {
    className: 'mdc-card mdc-card--outlined',
    id: attr.id
  });
  const headerContainer = createElement("div", {
    className: 'demo-card__primary'
  })
  const cardHeading = createElement('div', {
    className: 'card-heading'
  })
  const cardHeadingTitle = createElement('span', {
    className: 'emo-card__title mdc-typography mdc-typography--headline6',
    textContent: attr.title
  })
  const cardHeadingAction = createElement('div', {
    className: 'heading-action-container'
  })
  cardHeadingAction.appendChild(cardButton('add-assignee-btn').add('add'));
  cardHeading.appendChild(cardHeadingTitle)
  headerContainer.appendChild(cardHeading);
  headerContainer.appendChild(cardHeadingAction);

  card.appendChild(headerContainer)

  const primaryAction = createElement('div', {
    className: 'demo-card__primary-action'
  })
  const listSection = createElement('div', {
    className: 'list-section'
  })
  primaryAction.appendChild(listSection)
  card.appendChild(primaryAction);

  return card;

}

const snackBar = (labelText, buttonText) => {

  const container = createElement('div', {
    className: 'mdc-snackbar'
  })
  const surface = createElement('div', {
    className: 'mdc-snackbar__surface'
  })
  const label = createElement('div', {
    className: 'mdc-snackbar__label',
    role: 'status',
    'aria-live': 'polite',
    textContent: labelText
  })
  const actions = createElement('div', {
    className: 'mdc-snackbar__actions'
  })
  const button = createElement('button', {
    type: 'button',
    className: 'mdc-button mdc-snackbar__action',
    textContent: buttonText
  })
  actions.appendChild(button)
  surface.appendChild(label)
  surface.appendChild(actions)
  container.appendChild(surface)
  return container;

}

const simpleDialog = (title, content) => {

  const container = createElement('div', {
    className: 'mdc-dialog',
    role: 'alertdialog',
    'aria-modal': "true",
    'aria-labelledby': title,
    'aria-describedby': "my-dialog-content"
  });
  
  container.innerHTML = `<div class="mdc-dialog__container">
  <div class="mdc-dialog__surface">
    <h2 class="mdc-dialog__title" id="dialog-title">${title}</h2>
    <div class="mdc-dialog__content" id="dialog-content">
        ${content};
    </div>
  </div>
</div>
<div class="mdc-dialog__scrim"></div>`

  const dialog = new mdc.dialog.MDCDialog(container);
  return dialog;
}

const alertDialog = (title,content) => {
  const container = createElement('div', {
    className: 'mdc-dialog',
    role: 'alertdialog',
    'aria-modal': "true",
    'aria-labelledby': title,
    'aria-describedby': "my-dialog-content"
  });
  
  container.innerHTML = `<div class="mdc-dialog__container">
  <div class="mdc-dialog__surface">
    <h2 class="mdc-dialog__title" id="dialog-title">${title}</h2>
    <div class="mdc-dialog__content" id="dialog-content">
        ${content};
    </div>
    <footer class="mdc-dialog__actions">
    <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="no">
      <span class="mdc-button__label">No</span>
    </button>
    <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes">
      <span class="mdc-button__label">Yes</span>
    </button>
    </footer> 
  </div>
</div>
<div class="mdc-dialog__scrim"></div>`

}