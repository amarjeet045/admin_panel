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
  const container = createElement('search-bar');
  container.appendChild(textFieldFilledLeadingIcon(id, 'search', 'search'));
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
  cardHeading.appendChild(cardHeadingAction);
  headerContainer.appendChild(cardHeading);

  card.appendChild(headerContainer)


  const primaryAction = createElement('div',{className:'demo-card__primary-action'})
  card.appendChild(primaryAction);

  return card;

}