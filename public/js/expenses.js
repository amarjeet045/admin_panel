function expenses(office, response) {
  console.log(office);
  console.log(response)
  commonDom.progressBar.close()
  commonDom.drawer.list.selectedIndex = 2;
  const cardTypes = ['payroll', 'reimbursement']


  document.getElementById('app-content').innerHTML = `
    ${cardTypes.map(function(type){
        return `${response[type] ? payrollCard(type,response[type].recipient.assignees) : ''}
        `
    }).join("")}
  `


  cardTypes.forEach(function (type) {
    const el = document.querySelector(`[data-type="${type}"] .mdc-button`);
    console.log(el)
    el.addEventListener('click', function (e) {
      history.pushState({
        view: `${type}View`,
        office: office
      }, `${type} View`, `/?view=${type}View`);

      window[`${type}View`](office)
    });
  })

}

function reimbursementView(office) {
  const templates = ['claim-type', 'km-allowance', 'daily-allowance'];
  const promiseArray = []
  templates.forEach(template => {
    promiseArray.push(http('GET', `/api/search?office=${office || history.state.office}&template=${template}`))
  })
  Promise.all(promiseArray).then(responses => {
    console.log(responses)
    document.getElementById("app-content").innerHTML = `
      ${responses.map((response,index) => {
        
        return `
        ${Object.keys(response).length ? `${basicCards(templates[index],Object.keys(response).length)}` :''}`
    
      }).join("")}
    `
    document.querySelector(`[data-type="claim-type"]`).addEventListener('click', function () {
      updateClaimType(responses[0])
    })
    document.querySelector(`[data-type="km-allowance"]`).addEventListener('click', function () {
      updateClaimType(responses[1])
    })
    document.querySelector(`[data-type="daily-allowance"]`).addEventListener('click', function () {
      updateClaimType(responses[2])
    })
  })
}

function updateClaimType(response) {
  const card = actionCard({
    id: 'claim-type-card',
    title: 'Claim types'
  })
  document.getElementById("app-content").innerHTML = `
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    <div class='mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-6-tablet mdc-layout-grid__cell--span-4-phone'>
         ${card.outerHTML}
    </div>
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    `

  const ul = createElement('ul', {
    className: 'mdc-list demo-list mdc-list--two-line mdc-list--avatar-list'
  })
  Object.keys(response).forEach(key => {

    ul.appendChild(actionListStatusChange({
      primaryText: response[key].attachment.Name.value,
      secondaryText: `Monthly Limit: ${response[key].attachment['Monthly Limit'].value}`,
      status: response[key].status,
      key: key
    }));
  });

  document.querySelector('#claim-type-card .list-section').appendChild(ul)
  const add = document.getElementById('add-assignee-btn')
  setTimeout(() => {
    add.classList.remove('mdc-fab--exited')
  }, 200);
}

function manageRecipients(recipient, type, office) {

  commonDom.progressBar.close();
  document.getElementById('app-content').innerHTML = `<div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    <div class='mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-6-tablet mdc-layout-grid__cell--span-4-phone'>
        ${assigneeCard()}
    </div>
    </div>
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    `;
  const ul = createElement('ul', {
    className: 'mdc-list demo-list mdc-list--two-line mdc-list--avatar-list'
  })
  recipient.assignees.forEach(function (assignee) {
    const li = assigneeLi(assignee)
    li.querySelector('.status-button').addEventListener('click', function () {

      getLocation().then(geopoint => {
        http('PATCH', `/api/activities/share/`, {
          activityId: recipient.activityId,
          share: [assignee],
        }).then(function (response) {
          console.log(response)
          snackBar(`${assignee.phoneNumber} removed from ${type}`)
        }).catch(console.error)
      }).catch(handleLocationError);
    })
    ul.appendChild(li);
  });

  document.querySelector('#recipient-update-card .list-section').appendChild(ul)
  const add = document.getElementById('add-assignee-btn')
  setTimeout(() => {
    add.classList.remove('mdc-fab--exited')
  }, 200)

  add.addEventListener('click', function (event) {
    history.pushState({
      view: 'expenses',
      office: history.state.office
    }, 'expenses', `/?view=addRecipient`);
    add.remove();
    addRecipient('recipient-update-card');
  });
}

const assigneeCard = () => {
  return `
  <div class='mdc-card  mdc-card--outlined assignee-card' id='recipient-update-card'>
 <div class="demo-card__primary">
     <div class="card-heading">
         <span class="demo-card__title mdc-typography mdc-typography--headline6"> Manage Recipients</span>
         
      </div>
      <div class='recipients-container'>
        ${cardButton('add-assignee-btn').add('add').outerHTML}
      </div>
 </div>
 <div class="demo-card__primary-action">   
          <div class='list-section'></div>
  </div>
     <div class="mdc-card__actions hidden">
         <div class="mdc-card__action-icons">
         </div>
         <div class="mdc-card__action-buttons">
         
         </div>
       </div>
</div>
</div>
`

}


const assigneeLi = (assignee) => {
  const img = createElement('img', {
    className: 'mdc-list-item__graphic',
    src: assignee.photoURL || '../img/person.png'
  })

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
    textContent: assignee.displayName
  });

  const secondaryText = createElement('span', {
    className: 'mdc-list-item__secondary-text',
    textContent: assignee.email || '-'
  });

  textSpan.appendChild(primaryText)
  textSpan.appendChild(secondaryText);
  li.appendChild(img)
  li.appendChild(textSpan);
  new mdc.ripple.MDCRipple(li)
  container.appendChild(li)
  container.appendChild(createStatusIcon('CONFIRMED'));
  return container;

}


const addRecipient = (id) => {

  const el = document.getElementById(id)
  el.querySelector(".card-heading .demo-card__title").textContent = 'Add Recipients'
  el.querySelector(".card-heading .mdc-typography--subtitle1").textContent = ''
  el.querySelector('.mdc-card__actions').classList.remove('hidden')
  if (!el) return;

  el.querySelector('.demo-card__primary-action').innerHTML = `<div class='recipient-update-container'>
      <div class='mt-10 mb-10'>
          ${textFieldTelephone({id:'recipient-phone'})}
      </div>
  </div>`

  el.querySelector('.mdc-card__action-icons').innerHTML = ''
  const cardButtonContainer = el.querySelector('.mdc-card__action-buttons');

  const cancelBtn = cardButton('close-btn').cancel();
  const saveBtn = cardButton('save-btn').save();

  cancelBtn.addEventListener('click', function () {
    history.back();
  })
  saveBtn.addEventListener('click', function () {
    //send api
  })

  cardButtonContainer.appendChild(cancelBtn)

  const numberField = new mdc.textField.MDCTextField(document.getElementById('recipient-phone'))
  numberField.focus();
  const phoneNumberField = phoneFieldInit(numberField)
  numberField.input_.addEventListener('input', function (e) {
    console.log(e)
    if (!e.target.value) {
      cardButtonContainer.removeChild(saveBtn)
      return;
    };
    if (!document.getElementById('save-btn')) {
      cardButtonContainer.appendChild(saveBtn)
      return;
    }

  })

}




function showRecipientActions() {
  [...document.querySelectorAll('.save')].forEach(function (el) {
    el.classList.remove("hidden")
  })

}


function payrollView(office) {


  const cardTypes = ['employee', 'leave-type'];
  const promiseArray = [];
  cardTypes.forEach(type => {
    promiseArray.push(http('GET', `/api/search?office=${office || history.state.office}&template=${type}`))
  })
  Promise.all(promiseArray).then(responses => {
    console.log(responses);
    commonDom.progressBar.close();
    commonDom.drawer.list.selectedIndex = 2;
    document.getElementById('app-content').innerHTML = `
    ${responses.map((response,index) => {
        return `${Object.keys(response).length ? `${basicCards(cardTypes[index],Object.keys(response).length,cardTypes[index])}` :''}`
    }).join("")}
    `

    document.querySelector(`[data-id="employee"]`).addEventListener('click', function () {
      history.pushState({
        view: 'manageEmployees',
        office: office
      }, 'manageEmployees', '/?view=manageEmployees')
      manageEmployees(office)
    });

    document.querySelector(`[data-id="leave-type"]`).addEventListener('click', function () {
      history.pushState({
        view: 'updateLeaveType',
        office: office
      }, 'updateLeaveType', '/?view=updateLeaveType')
      updateLeaveType(office)
    });

  }).catch(console.error)

}

function manageEmployees(office) {
  http('GET', `/api/search?office=${office || history.state.office}&template=employee`).then(response => {

    commonDom.progressBar.close();
    commonDom.drawer.list_.selectedIndex = 2;
    const filters = ['Employee Code', 'Name', 'Employee Contact'];

    document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
    <div class='search-bar-container'>

    </div>
    
    <div class='action-header'>
    <h3 class="mdc-list-group__subheader mdc-typography--headline5">Employees</h3>
    <button class="mdc-fab mdc-fab--mini mdc-theme--primary-bg" aria-label="add" id='add-emp'>
        <span class="mdc-fab__icon material-icons mdc-theme--on-primary">add</span>
    </button>
    </div>
    <ul class='mdc-list mdc-list--two-line address-list-container' id='employee-list'>
      
    </ul>
  </div>
  </div>
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  </div>
  `
    document.querySelector('.search-bar-container').appendChild(searchBar('search-employee', filters));

    const radios = {}
    filters.forEach((filter, index) => {
      const radio = new mdc.radio.MDCRadio(document.querySelector(`[data-id="${filter}"]`));
      if (index == 0) {
        radio.checked = true;
        document.getElementById('search-employee').dataset.selectedRadio = radio.value;
      }
      radio.root_.addEventListener('click', function () {
        console.log(radio)
        document.getElementById('search-employee').dataset.selectedRadio = radio.value;
      })
      radios[filter] = radio;
    });

    const ul = document.getElementById('employee-list');
    Object.keys(response).forEach(key => {

      ul.append(actionListStatusChange({
        primaryText: `${response[key].attachment['Name'].value} (${response[key].attachment['Employee Contact'].value})`,
        secondaryText: response[key].attachment['Employee Code'].value,
        status: response[key].status,
        key: key
      }));
    });

    const employeeList = new mdc.list.MDCList(document.getElementById('employee-list'))
    employeeList.selectedIndex = 0;
  
    initializeEmployeeSearch(response, radios, employeeList);
  }).catch(console.error)
}

const initializeEmployeeSearch = (response, radios, employeeList) => {
  const search = new mdc.textField.MDCTextField(document.getElementById('search-employee'))
  console.log(radios)
  search.root_.addEventListener('input', function (event) {
    searchEmployee(event, response, employeeList)
  });
}
const searchEmployee = (event, data, employeeList) => {
  const inputValue = event.target.value.toLowerCase();
  const selectedRadio = document.getElementById('search-employee').dataset.selectedRadio;
  removeChildren(employeeList.root_);
  let selectedObject = {};
  Object.keys(data).forEach(key => {
    if (String(data[key].attachment[selectedRadio].value).toLowerCase().indexOf(inputValue) > -1) {
      selectedObject[key] = data[key];
    }
  })
  

  console.log(Object.keys(selectedObject).length);
  Object.keys(selectedObject).forEach(key => {

    employeeList.root_.appendChild(actionListStatusChange({
        primaryText: `${selectedObject[key].attachment['Name'].value} (${selectedObject[key].attachment['Employee Contact'].value})`,
        secondaryText: `${selectedObject[key].attachment['Employee Code'].value}`,
        status: selectedObject[key].status,
        key: key
    }));
  })
}



function updateLeaveType(office) {
  http('GET', `/api/search?office=${office || history.state.office}&temlate=leave-type`).then(response => {
    console.log(response);

    commonDom.progressBar.close();
    commonDom.drawer.list_.selectedIndex = 2;

    const card = actionCard({
      id: 'leave-type-card',
      title: 'Leave type'
    })
    document.getElementById("app-content").innerHTML = `
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    <div class='mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-6-tablet mdc-layout-grid__cell--span-4-phone'>
         ${card.outerHTML}
    </div>
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    `

    const ul = createElement('ul', {
      className: 'mdc-list demo-list mdc-list--two-line mdc-list--avatar-list'
    })
    leaeTypes.forEach(key => {
      ul.appendChild(actionListStatusChange({
        primaryText: response[key].attachment.Name.value,
        secondaryText: `Annual Limit ${response[key].attachment.Limit.value}`,
        status: response[key].status,
        key: key
      }));
    });

    document.querySelector('#leave-type-card .list-section').appendChild(ul)
    const add = document.getElementById('add-assignee-btn')
    setTimeout(() => {
      add.classList.remove('mdc-fab--exited')
    }, 200);
    add.addEventListener('click', function () {
      // addLeaveType()
    })
  }).catch(console.error)

}


const addLeaveType = (id) => {
  const el = document.getElementById(id)
  el.classList.add("iframe-card");
  el.innerHTML = `<iframe src="./forms/leave-type/" id='iframe'></iframe>`
  document.getElementById('iframe').addEventListener('load', function (evt) {
    document.getElementById('iframe').contentWindow.init();
    history.pushState({
      view: 'expenses',
      office: history.state.office
    }, 'expenses', `/?view=addLeaveType`)
    window.resizeIframe(document.getElementById('iframe'));
  })
}