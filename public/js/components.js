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

const checkbox = (labelText, id) => {

  const container = createElement('div', {
    className: 'mdc-checkbox'
  })
  const input = `<input type="checkbox"
  class="mdc-checkbox__native-control"
  id="${id}"/>
<div class="mdc-checkbox__background">
<svg class="mdc-checkbox__checkmark"
  viewBox="0 0 24 24">
<path class="mdc-checkbox__checkmark-path"
     fill="none"
     d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
</svg>
<div class="mdc-checkbox__mixedmark"></div>
</div>`
  container.innerHTML = input;

  const checkBoxInit = new mdc.checkbox.MDCCheckbox(container);
  return checkBoxInit;
}

const radio = (label, id) => {
  const container = createElement('div', {
    className: 'mdc-radio',
  })
  container.dataset.id = label;
  const input = `<input class="mdc-radio__native-control" type="radio" id="${id}" name="radio-set" value="${label}">
  <div class="mdc-radio__background">
    <div class="mdc-radio__outer-circle"></div>
    <div class="mdc-radio__inner-circle"></div>
  </div>`
  container.innerHTML = input;
  return container;
  // return new mdc.radio.MDCRadio(container);
}


const searchBar = (id, filters = '') => {
  const container = createElement('div', {
    className: 'search-bar'
  });
  container.innerHTML = textFieldFilledLeadingIcon(id, 'search', 'search');
  console.log(container)
  if (filters) {
    const filterArea = createElement("div", {
      className: 'filter-area'
    })
    filters.forEach((filter, index) => {
      const formField = createElement('div', {
        className: 'mdc-form-field'
      })
      const label = createElement('label', {
        textContent: filter
      })
      label.setAttribute('for', `${filter}-id`);
      const radioBtn = radio(filter, `${filter}-id`)

      formField.appendChild(radioBtn);
      formField.appendChild(label)

      filterArea.appendChild(formField)
    })
    container.appendChild(filterArea);
  }
  return container;
}

const tabBar = (tabs) => {

  const container = createElement('div', {
    className: 'mdc-tab-bar'
  })
  const scroller = createElement('div', {
    className: 'mdc-tab-scroller'
  })
  const area = createElement('div', {
    className: 'mdc-tab-scroller__scroll-area'
  })
  const content = createElement('div', {
    className: 'mdc-tab-scroller__scroll-content'
  })
  tabs.forEach((tab, index) => {
    const button = createElement('button', {
      className: 'mdc-tab',
      role: 'tab',
      'aria-selected': 'true',

    })
    const indicator = createElement('div', {
      className: 'mdc-tab-indicator'
    })
    const underline = createElement('div', {
      className: 'mdc-tab-indicator__content mdc-tab-indicator__content--underline'
    })

    indicator.appendChild(underline)
    const buttonContent = createElement('span', {
      className: 'mdc-tab__content'
    })
    const icon = createElement('span', {
      className: 'mdc-tab__icon material-icons',
      textContent: tab.icon
    })
    const text = createElement('div', {
      className: 'mdc-tab__text-label',
      textContent: tab.label
    })
    const ripple = createElement('div', {
      className: 'mdc-tab__ripple'
    })
    buttonContent.appendChild(icon)
    buttonContent.appendChild(text);
    button.appendChild(buttonContent);
    button.appendChild(indicator);
    button.appendChild(ripple);
    content.appendChild(button)
  })
  area.appendChild(content)
  scroller.appendChild(area);
  container.appendChild(scroller)
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
  const el = document.getElementById("snackbar-container")
  el.innerHTML = '';
  el.appendChild(container)
  const sb = new mdc.snackbar.MDCSnackbar(container);
  return sb;

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
          ${typeof content === 'String' ? content : content.outerHTML}
      </div>
    </div>
  </div>
  <div class="mdc-dialog__scrim"></div>`
  const el = document.getElementById('dialog-container');
  el.innerHTML = '';
  el.appendChild(container);
  const dialog = new mdc.dialog.MDCDialog(container);
  return dialog;
}

const alertDialog = (title, content) => {


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
        ${content}
    </div>
    <footer class="mdc-dialog__actions">
    <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="no">
      <span class="mdc-button__label">CANCEL</span>
    </button>
    <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes">
      <span class="mdc-button__label">Okay</span>
    </button>
    </footer> 
  </div>
</div>
<div class="mdc-dialog__scrim"></div>`
  const el = document.getElementById('dialog-container');
  el.innerHTML = '';
  el.appendChild(container);
  const dialog = new mdc.dialog.MDCDialog(container);
  return dialog;

}


const actionList = (primaryTextContent, secondaryTextContent, status) => {

  const container = createElement('div', {
    className: 'actionable-list-container'
  });

  const li = createElement('li', {
    className: 'mdc-list-item'
  });

  const textSpan = createElement('span', {
    className: 'mdc-list-item__text'
  });

  const primaryText = createElement('span', {
    className: 'mdc-list-item__primary-text',
    textContent: primaryTextContent
  });

  const secondaryText = createElement('span', {
    className: 'mdc-list-item__secondary-text',
    textContent: secondaryTextContent
  });

  textSpan.appendChild(primaryText)
  textSpan.appendChild(secondaryText);
  li.appendChild(textSpan);
  new mdc.ripple.MDCRipple(li)


  container.appendChild(li)
  container.appendChild(createStatusIcon(status));
  return container;

}


const createStatusIcon = (status) => {
  let btn;
  if (status === 'CANCELLED') {
    btn = createElement('button', {
      className: 'mdc-icon-button material-icons status-button',
      textContent: 'check',
    })
    btn.dataset.status = 'CONFIRMED'
  }
  if (status === 'CONFIRMED') {
    btn = createElement('button', {
      className: 'mdc-icon-button material-icons mdc-theme--error status-button',
      textContent: 'delete',

    })
    btn.dataset.status = 'CANCELLED'
  }
  if (status === 'PENDING') {
    btn = createElement('button', {
      className: 'mdc-icon-button material-icons mdc-theme--success status-button',
      textContent: 'check',

    })
    btn.dataset.status = 'CONFIRMED'
  }
  return btn;
}

const paymentList = (pay) => {
  return `<li class="mdc-list-item" role="checkbox" aria-checked="false" style='height: auto;
    padding-bottom: 10px;padding-left: 0px;
    padding-right: 0px;'>
    <span class="mdc-list-item__graphic">
      <div class="mdc-checkbox">
        <input type="checkbox"
                class="mdc-checkbox__native-control"
                id="demo-list-checkbox-item-1"  />
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
    </span>
    <img class='mdc-list-item__graphic' src='${pay.photoURL || './img/person.png'}'>
    <span class="mdc-list-item__text">
    <span class="mdc-list-item__primary-text mdc-theme--primary">${pay.type}</span>
    <span class="mdc-list-item__secondary-text">${new Date(pay.createdAt)}

    <br>
    <span>${pay.summary || pay.paymentId}</span>
    <span>Cycle date${pay.cycleStartDate || pay.cycleEndDate}</span>
    </span>
  </span>
  <span class='mdc-list-item__meta text-center'>
  <span style='font-size:22px;' class='mdc-theme--primary'>${convertNumberToINR(pay.amount)}
  <br>
  
  </span>

  </span>

  </li>`


}

const depositList = (deposit) => {
  return `<li class="mdc-list-item" role="checkbox" aria-checked="false" style='height: auto;
  padding-bottom: 10px;padding-left: 0px;
  padding-right: 0px;'>
  <span class="mdc-list-item__graphic">
    <div class="mdc-checkbox">
      <input type="checkbox"
              class="mdc-checkbox__native-control"
              id="demo-list-checkbox-item-1"  />
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
  </span>

  <span class="mdc-list-item__text">
  <span class="mdc-list-item__primary-text mdc-theme--primary">Creator ${deposit.createdBy}</span>
  <span class="mdc-list-item__secondary-text">${new Date(deposit.createdOn)}

  <br>
  <span>${deposit.lastUpdated ? `Last Updated ${deposit.lastUpdated}` :''}</span>
  <span>${deposit.status ? `Status ${deposit.status}` :''}</span>
  </span>
</span>
<span class='mdc-list-item__meta text-center'>
<span style='font-size:22px;' class='mdc-theme--primary'>${convertNumberToINR(deposit.totalAmount)}
<br>

</span>

</span>

</li>`
}


const button = (label, id = '') => {
  const button = createElement('button', {
    className: 'mdc-button',
    id: id
  })
  const span = createElement('span', {
    className: 'mdc-button-label',
    textContent: label
  })
  button.appendChild(span)
  new mdc.ripple.MDCRipple(button);
  return button;
}

const primaryButton = (label, id) => {
  const buttonEl = button(label, id)
  buttonEl.classList.add('mdc-button--raised');
  return buttonEl;
}


const uploadButton = (id) => {

  const button = iconButtonWithLabel('arrow_upward', 'Upload sheet', id);

  const input = createElement('input', {
    type: 'file',
    accept: ".csv,.xlsx,.xls",
    'data-maxsize': "2M",
    className: 'overlay-text',
  })
  button.appendChild(input)
  return button;
}

const iconButton = (icon, id) => {
  const button = createElement('button', {
    className: 'mdc-icon-button material-icons',
    textContent: icon,
    id: id
  })
  new mdc.ripple.MDCRipple(button);
  return button;
}

const iconButtonWithLabel = (icon, label, id) => {
  const button = createElement('button', {
    className: 'mdc-button mdc-button--icon',
    id: id
  })
  const iconEl = createElement('i', {
    className: 'material-icons',
    textContent: icon
  })
  const span = createElement('span', {
    className: 'mdc-button-label',
    textContent: label
  })
  button.appendChild(iconEl)
  button.appendChild(span);
  new mdc.ripple.MDCRipple(button);
  return button;
}



const handleDragOver = (evt) => {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}