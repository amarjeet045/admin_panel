function createElement(tagName, attrs) {
    const el = document.createElement(tagName)
    if (attrs) {
        Object.keys(attrs).forEach(function (attr) {
            el[attr] = attrs[attr]
        })
    }
    return el;
}


/**
 * 
 * @param {String} name 
 * name of the json file to read
 */
const readJson = (name) => {
    return new Promise((resolve, reject) => {
        fetch(`./${name}.json`).then(response => {
            return response.json();
        }).then(resolve).catch(reject)
    })
}

const getRequestBodyFromJson = (json, dataObject, isCreate) => {
    if (isCreate) {

        return {
            attachment: json.attachment,
            venue: json.venue,
            schedule: json.schedule,
            share: [],
            template: json.name,
            office: dataObject.office

        }
    }
    return dataObject;
}

function fillFormInputs(dataObject) {
    const isInput = {
        'string': true,
        'number': true,
        'amount': true,
        'date': true
    }

    for (key in dataObject.attachment) {
        if (isInput[dataObject.attachment[key].type]) {
            document.querySelector(`[data-field="${key}"]`).value = dataObject.attachment[key].value
        }
    }
}

function textField(attr) {
    const div = createElement('div', {
        className: `mdc-text-field mdc-text-field--outlined full-width ${attr.leadingIcon ? 'mdc-text-field--with-leading-icon' :''} ${attr.trailingIcon ? 'mdc-text-field--with-trailing-icon' :''} ${attr.disabled ? 'mdc-text-field--disabled' :''}`,
        id: attr.id
    })
    div.innerHTML = `${attr.leadingIcon ? `<i class="material-icons mdc-text-field__icon" tabindex="0" role="button">${attr.leadingIcon}</i>`:''}
    <input autocomplete=${attr.autocomplete ? attr.autocomplete : 'off'} type="${attr.type || 'text'}" class="mdc-text-field__input" value="${attr.value || ''}"  required="${attr.required || 'false'}" ${attr.disabled ? 'disabled':''} >
    ${attr.trailingIcon ? `<i class="material-icons mdc-text-field__icon" tabindex="0" role="button">${attr.trailingIcon}</i>` :''}
    
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      <div class="mdc-notched-outline__notch">
        <label  class="mdc-floating-label">${attr.label}</label>
      </div>
      <div class="mdc-notched-outline__trailing"></div>
    </div>`
    return div;
}


function createRadios(attr) {
    const form = createElement('div', {
        className: 'mdc-form-field'
    })
    const radio = createElement('div', {
        className: 'mdc-radio',
        type: 'radio',
        id: attr.id,
        name: 'radio-set',
        value: attr.value
    })
    radio.innerHTML = `<div class="mdc-radio__background">
    <div class="mdc-radio__outer-circle"></div>
    <div class="mdc-radio__inner-circle"></div>
</div>`
    form.appendChild(radio);
    return form
}

function createDataList(name, list) {
    const frag = document.createDocumentFragment()
    const input = createElement('input');
    input.setAttribute('list', list);
    input.setAttribute('name', name);
    const dataList = createElement('datalist');
    frag.appendChild(inpu)
    frag.appendChild(dataList);
    return frag;

}


function checkboxLi(label, id, value) {
    const li = createElement('li', {
        className: 'mdc-list-item'
    })
    li.setAttribute('role', 'checkbox')
    li.setAttribute('aria-checked', 'false');
    li.innerHTML = ` <span class="mdc-list-item__graphic">
    <div class="mdc-checkbox">
      <input type="checkbox"
              class="mdc-checkbox__native-control"
              id="checkbox-item-${id}" value="${value}" />
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
  <span class='mdc-list-item__text' for="checkbox-item-${id}">
    <span class='mdc-list-item__primary-text'>${label}</span>
    <span class='mdc-list-item__secondary-text mdc-theme--primary'>${value}</span>
  </span>`
    return li;
}

function radioLi(label,id,value) {
    const li = createElement('li', {
        className: 'mdc-list-item'
    })
    li.setAttribute('role', 'radio')
    li.setAttribute('aria-checked', 'false');
    li.innerHTML = `
    <span class="mdc-list-item__graphic">
      <div class="mdc-radio">
        <input class="mdc-radio__native-control"
              type="radio"
              id="radio-${id}"
              name="demo-list-radio-item-group"
              value="1">
        <div class="mdc-radio__background">
          <div class="mdc-radio__outer-circle"></div>
          <div class="mdc-radio__inner-circle"></div>
        </div>
      </div>
    </span>
    <span class='mdc-list-item__text' for="radio-${id}">
        <span class='mdc-list-item__primary-text'>${label}</span>
        <span class='mdc-list-item__secondary-text mdc-theme--primary'>${value}</span>
    </span>
  </li>`
  return li
}

const phoneFieldInit = (input, dropEl) => {

    return intlTelInput(input, {
        initialCountry: "IN",
        formatOnDisplay: false,
        separateDialCode: true,
        dropdownContainer: dropEl
    });
};

function setHelperInvalid(field, shouldShake = true) {
    field.focus();
    field.foundation_.setValid(false);
    field.foundation_.adapter_.shakeLabel(shouldShake);
}

function setHelperValid(field) {
    field.focus();
    field.foundation_.setValid(true);
}


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

function createTime(dateObject) {
    let hours = dateObject.getHours();
    let minutes = dateObject.getMinutes();
    if (minutes < 10) {
        minutes = '0' + minutes
    }
    return `${hours}:${minutes}`
}

function initializeDates(subscriptionTemplate, defaultDateString, defaultTimeString) {

    subscriptionTemplate.schedule.forEach(function (schedule) {
        let scheduleName;
        if(schedule.hasOwnProperty('name')) {
            scheduleName = schedule.name
        }
        else {
            scheduleName = schedule
        }
        const startfield = document.querySelector(`[data-name="${scheduleName} start date"]`);
        const endField = document.querySelector(`[data-name="${scheduleName} end date"]`);
        const startTime = document.querySelector(`[data-name="${scheduleName} start time"]`)
        const endTime = document.querySelector(`[data-name="${scheduleName} end time"]`)
        if(schedule.hasOwnProperty('name')) {
            startfield.value = createDate(new Date(schedule.startTime))
            endField.value = createDate(new Date(schedule.endTime))
            if (startTime && endTime) {
               startTime.value = createTime(new Date(schedule.startTime))
               endTime.value = createTime(new Date(schedule.endTime))
            }
        }
        else {
            startfield.value = endField.value = endField.min = defaultDateString
            if (startTime && endTime) {
                startTime.value = endTime.value = endTime.min = defaultTimeString
            }
        }
        
        startfield.addEventListener('change', function (evt) {
            endField.value = evt.target.value
            endField.min = evt.target.value
        });
        
    });
}


function getNewSchedule(subscriptionTemplate) {
    const newSchedules = []
    let index = 0;
    let isScheduleValid = false;
    const length = subscriptionTemplate.schedule.length;
    for (index; index < length; index++) {
        const name = subscriptionTemplate.schedule[index]

        const startDate = document.querySelector(`[data-name="${name} start date"]`).value;
        const endDate = document.querySelector(`[data-name="${name} end date"]`).value;
        if (!startDate) {
            parent.snacks(name + ' start date cannot be blank')
            break;
        }
        if (!endDate) {
            parent.snacks(name + ' end date cannot be blank')
            break;
        }
        const startDate_UTS = Date.parse(startDate);
        const endDate_UTS = Date.parse(endDate)
        if (startDate_UTS > endDate_UTS) {
            parent.snacks('start date in ' + name + ' cannot be greater than end date');
            break;
        }
        isScheduleValid = true;
        newSchedules.push({
            name: name,
            startTime: startDate_UTS,
            endTime: endDate_UTS,
        })
    }
    if (isScheduleValid) return newSchedules;

    return;

}