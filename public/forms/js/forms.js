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
    const form = createElement('div',{
        className:'mdc-form-field'
    })
    const radio = createElement('div',{
        className:'mdc-radio',
        type:'radio',
        id:attr.id,
        name:'radio-set',
        value:attr.value
    })
    radio.innerHTML = `<div class="mdc-radio__background">
    <div class="mdc-radio__outer-circle"></div>
    <div class="mdc-radio__inner-circle"></div>
</div>`
    form.appendChild(radio);
    return form  
}

function createDataList(name,list) {
    const frag = document.createDocumentFragment()
    const input = createElement('input');
    input.setAttribute('list',list);
    input.setAttribute('name',name);
    const dataList = createElement('datalist');
    frag.appendChild(inpu)
    frag.appendChild(dataList);
    return frag;
    
}