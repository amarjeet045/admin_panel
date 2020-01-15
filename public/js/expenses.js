function expenses(office) {
  http('GET', `/api/myGrowthfile?office=${office}&field=roles`).then(response => {
    console.log(office);
    console.log(response);
    commonDom.progressBar.close();
    document.getElementById('app-content').innerHTML = ''
    commonDom.drawer.list.selectedIndex = 2;
    const array = [{
      name: 'Duty',
      total: 0,
      view: 'manageDuty',
      data: response.roles.employees || [],

    }];
    array.push({
      name: 'Subscriptions',
      total: response.roles.subscription ? response.roles.subscription.length : '',
      view: 'manageSubscriptions',
      data: response.roles.subscription || []
    });
    array.push({
      name: 'Employee',
      total: response.roles.employee ? response.roles.employee.length : '',
      view: 'manageEmployees',
      data: response.roles.employee || []
    })
    array.push({
      name: 'Admins',
      total: response.roles.admin ? response.roles.admin.length : '',
      view: 'manageAdmins',
      data: response.roles.admin || []
    });

    array.forEach(function (type) {
      const card = basicCards(type.name, '', type.total);
      card.addEventListener('click', function () {
        history.pushState({
          view: type.view,
          office: office
        }, type.view, `/?view=${type.view}`)
        window[type.view](type.data, office)
      })
      document.getElementById('app-content').appendChild(card);
    })
  });
}


function manageSubscriptions(data) {
  console.log(data);
  const filters = ['Phone Number'];
  const subscriptions = {}
  data.forEach(function (sub) {
    if (!subscriptions[sub.attachment['Phone Number'].value]) {
      subscriptions[sub.attachment['Phone Number'].value] = [sub]
    } else {
      subscriptions[sub.attachment['Phone Number'].value].push(sub)
    }
  });
  document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet'>
      <div class='search-bar-container'></div> 
      <div class='action-header mt-10 mb-10'>
        <div class='action-container'>
          ${iconButtonWithLabel('arrow_downward','Download sample','download-sample').outerHTML}
          ${uploadButton('upload-sample').outerHTML}
        </div>    
      </div>
      <div id='sub-card'></div>
    </div>
  `;

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

  console.log(subscriptions);

  Object.keys(subscriptions).forEach(function (key) {
    const card = subscriptionCard(key);
    const ul = card.querySelector('ul');
    subscriptions[key].forEach(function (sub) {
      const li = actionListStatusChange({
        primaryText: sub.attachment.Template.value,
        secondaryText: '',
        status: sub.status,
        key: sub.activityId
      })
      ul.appendChild(li);
    })
    document.getElementById('sub-card').appendChild(card)
  });

  initializeSubscriptionSearch(subscriptions, radios, document.getElementById('sub-card'));
  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('subscription')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'subscription')
  });
}
const initializeSubscriptionSearch = (subscriptions, radios, el) => {
  const search = new mdc.textField.MDCTextField(document.getElementById('search-employee'))
  console.log(radios)
  search.root_.addEventListener('input', function (event) {
    searchSubscription(event, subscriptions, el)
  });
}

function searchSubscription(event, subscriptions, el) {
  const inputValue = event.target.value.toLowerCase();
  removeChildren(el);
  let selectedObject = {};

  Object.keys(subscriptions).forEach(key => {
    if (key.toLowerCase().indexOf(inputValue) > -1) {
      selectedObject[key] = subscriptions[key];
    }
  });

  Object.keys(selectedObject).forEach(function (key) {
    const card = subscriptionCard(key);
    const ul = card.querySelector('ul');
    selectedObject[key].forEach(function (sub) {
      const li = actionListStatusChange({
        primaryText: sub.attachment.Template.value,
        secondaryText: '',
        status: sub.status,
        key: sub.activityId
      })
      ul.appendChild(li);
    })

    document.getElementById('sub-card').appendChild(card)
  })

}

const subscriptionCard = (name) => {
  const card = createElement('div', {
    className: 'mdc-card expenses-card mdc-layout-grid__cell mdc-card--outlined'
  })
  card.innerHTML = `<div class="demo-card__primary">
  <div class="card-heading">
      <span class="demo-card__title mdc-typography mdc-typography--headline6">${name}</span>   
  </div>
  </div>
  <ul class='mdc-list  address-list-container'></ul>
`
  return card;
}

function manageAdmins(data) {

}


function addDutyAllocation(dutyResponse) {
  const filters = ['Name', 'location', 'address']
  document.getElementById('app-content').innerHTML = `
<div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div class='search-bar-container'></div>    
  <div class='action-header mt-10 mb-10'>
    <div class='action-container'>
      ${iconButton('arrow_downward','download-sample')}
      ${iconButton('arrow_upward','upload-sample')}
    </div>
    <h3 class="mdc-list-group__subheader mdc-typography--headline5">Duties</h3>

  <button class="mdc-fab mdc-fab--mini mdc-theme--primary-bg" aria-label="add" id='add-duty'>
       <span class="mdc-fab__icon material-icons mdc-theme--on-primary">add</span>
  </button>
</div>
  <ul class='mdc-list mdc-list--two-line address-list-container' id='duty-list'></ul>
  </div>
</div>
<div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4  mdc-layout-grid__cell--order-1'>

<div id='form-container'></div>
</div>
`
  document.querySelector('.search-bar-container').appendChild(searchBar('search-duties', filters))
  // const selectedRadio 
  const radios = {}
  filters.forEach((filter, index) => {
    const radio = new mdc.radio.MDCRadio(document.querySelector(`[data-id="${filter}"]`));
    if (index == 0) {
      radio.checked = true;
      document.getElementById('search-duties').dataset.selectedRadio = radio.value;
    }
    radio.root_.addEventListener('click', function () {
      console.log(radio)
      document.getElementById('search-duties').dataset.selectedRadio = radio.value;
    })
    radios[filter] = radio;
  });

  const ul = document.getElementById('duty-list');
  Object.keys(dutyResponse).forEach(key => {
    ul.append(actionListStatusChange({
      primaryText: dutyResponse[key].attachment.Name.value,
      secondaryText: dutyResponse[key].venue[0].address,
      status: dutyResponse[key].status,
      key: key
    }));
  });

  const dutyList = new mdc.list.MDCList(document.getElementById('duty-list'))
  dutyList.selectedIndex = 0;
  formContainer.innerHTML = `<iframe src='../forms/duty/' class='iframe-form'></iframe>`
  dutyList.listen('MDCList:action', function (evt) {
    commonDom.progressBar.open();
    formContainer.innerHTML = `<iframe src='../forms/duty/' class='iframe-form'></iframe>`
  });

  initializeAddressSearch(dutyResponse, radios, dutyList);
  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('duty')
  });

  document.getElementById('upload-sample').addEventListener('click', function () {
    uploadSheet('duty')
  });

  document.getElementById('add-duty').addEventListener('click', function () {
    employeeList.selectedIndex = '';
    loadEmployeeForm('');
  })
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
    textContent: assignee.displayName || assignee.phoneNumber
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


function payrollView(office) {

  commonDom.progressBar.close();
  commonDom.drawer.list.selectedIndex = 2;
  document.getElementById('app-content').innerHTML = `
    ${basicCards('Employees','manage-employee-btn')} ${basicCards('Leave types','manage-leavetype-btn')}
    `

  document.getElementById('manage-employee-btn').addEventListener('click', function () {
    history.pushState({
      view: 'manageEmployees',
      office: office
    }, 'manageEmployees', '/?view=manageEmployees')
    manageEmployees(office)
  });

  document.getElementById('manage-leavetype-btn').addEventListener('click', function () {
    history.pushState({
      view: 'updateLeaveType',
      office: office
    }, 'updateLeaveType', '/?view=updateLeaveType')
    updateLeaveType(office)
  });



}

function manageEmployees(data) {

  const employees = {};
  data.forEach(function (emp) {
    employees[emp.attachment['Phone Number'].value] = emp
  })

  const filters = ['Employee Code', 'Name', 'Employee Contact'];

  document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
    <div class='search-bar-container'></div>
    
    <div class='action-header mt-10 mb-10'>
      <div class='action-container'>
        ${iconButtonWithLabel('arrow_downward','Download sample','download-sample').outerHTML}
        ${uploadButton('upload-sample').outerHTML}
      </div>
  
    </div>
    <ul class='mdc-list mdc-list--two-line address-list-container' id='employee-list'>
        
    </ul>
  </div>
  </div>
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div id='form-container'>
  </div>
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
  Object.keys(employees).forEach(key => {
    const cont = actionListStatusChange({
      primaryText: `${employees[key].attachment['Name'].value} (${employees[key].attachment['Employee Contact'].value})`,
      secondaryText: employees[key].attachment['Employee Code'].value,
      status: employees[key].status,
      key: employees[key].activityId
    })

    cont.dataset.number = key
    ul.append(cont);
  });

  const employeeList = new mdc.list.MDCList(ul)
  employeeList.sinleSelection = true;
  const formContainer = document.getElementById('form-container');

  [...document.querySelectorAll('.actionable-list-container')].forEach(function (el) {
    el.addEventListener('click', function () {
      loadForm(formContainer, employees[el.dataset.number]);
    })
  })
  if (data.length) {
    loadForm(formContainer, data[0]);
  }
  employeeList.selectedIndex = 0;
  initializeEmployeeSearch(employees, radios, employeeList);
  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('employee')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'employee')
  });

}



const initializeEmployeeSearch = (response, radios, employeeList) => {
  const search = new mdc.textField.MDCTextField(document.getElementById('search-employee'))
  console.log(radios)
  search.root_.addEventListener('input', function (event) {
    searchEmployee(event, response, employeeList)
  });
};

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
    const li = actionListStatusChange({
      primaryText: `${selectedObject[key].attachment['Name'].value} (${selectedObject[key].attachment['Employee Contact'].value})`,
      secondaryText: `${selectedObject[key].attachment['Employee Code'].value}`,
      status: selectedObject[key].status,
      key: selectedObject[key].activityId
    })
    li.dataset.number = key
    employeeList.root_.appendChild(li);
  });
  const formContainer = document.getElementById('form-container');
  [...document.querySelectorAll('.actionable-list-container')].forEach(function (el) {
    el.addEventListener('click', function () {
      loadForm(formContainer, data[el.dataset.number]);
    })
  })
}

function manageDuty(employees, office) {
  document.getElementById('app-content').innerHTML = `
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div class='search-bar-container hidden'></div>
  
  <div class='action-header mt-10 mb-10'>
    <div class='action-container'>
      ${iconButtonWithLabel('arrow_downward','Download sample','download-sample').outerHTML}
      ${uploadButton('upload-sample').outerHTML}
    </div>
  </div>
  
</div>
</div>
<div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
<div id='form-container'>
</div>
</div>`

  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('duty')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'duty')
  });

  http('GET', `/api/myGrowthfile?office=${office}&field=locations&field=types`).then(response => {
    const dutyTypes = response.types.filter((item) => {
      return item.template === 'duty-type'
    })
    const customers = response.locations.filter((item) => {
      return item.template === 'customer'
    })
    loadForm(document.getElementById('form-container'), {
      employees: employees,
      dutyTypes: dutyTypes,
      customers: customers
    }, true);
  })
}