function expenses(office) {
  http('GET', `/api/myGrowthfile?office=${office}&field=roles`).then(response => {
    console.log(office);
    console.log(response);
    commonDom.progressBar.close();
    document.getElementById('app-content').innerHTML = ''
    commonDom.drawer.list.selectedIndex = 2;
    // {
    //   name: 'Duty',
    //   total: 0,
    //   view: 'manageDuty',
    //   data: response.roles.employees || [],

    // }
    const array = [];
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
  const filters = ['Phone Number', 'Template'];


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

  document.querySelector('.search-bar-container').appendChild(searchBar('search-subscription', filters));
  const radios = {}
  filters.forEach((filter, index) => {
    const radio = new mdc.radio.MDCRadio(document.querySelector(`[data-id="${filter}"]`));
    if (index == 0) {
      radio.checked = true;
      document.getElementById('search-subscription').dataset.selectedRadio = radio.value;
    }
    radio.root_.addEventListener('click', function () {
      console.log(radio)
      document.getElementById('search-subscription').dataset.selectedRadio = radio.value;
    })
    radios[filter] = radio;
  });


  data.forEach((item) => {
    const card = subscriptionCard(item);
    const ul = card.querySelector('ul');
    ul.appendChild(actionListStatusChange({
      primaryText: item.attachment.Template.value,
      secondaryText: '',
      status: item.status,
      key: item.activityId
    }))
    card.appendChild(ul)
    document.getElementById('sub-card').appendChild(card);
  })


  initializeSubscriptionSearch(data, radios);
  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('subscription')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'subscription')
  });
}
const initializeSubscriptionSearch = (subscriptions, radios) => {
  const search = new mdc.textField.MDCTextField(document.getElementById('search-subscription'))
  console.log(radios)
  search.root_.addEventListener('input', function (event) {
    searchSubscription(event)
  });
}

function searchSubscription(event) {
  const inputValue = event.target.value.toLowerCase();
  let selectedRadio = document.getElementById('search-subscription').dataset.selectedRadio;

  [...document.querySelectorAll('.subscription-card')].forEach((el)=>{
    
    if(selectedRadio === 'Phone Number') {
      selectedRadio = 'phoneNumber'
    }

    if(el.dataset[selectedRadio].toLowerCase().indexOf(inputValue) > -1 ){
        el.classList.remove("hidden")
    }
    else {
      el.classList.add("hidden")
    }
    
  })
}

const subscriptionCard = (item) => {
  const card = createElement('div', {
    className: 'mdc-card subscription-card mdc-layout-grid__cell mdc-card--outlined'
  })
  card.innerHTML = `<div class="demo-card__primary">
  <div class="card-heading">
      <span class="demo-card__title mdc-typography mdc-typography--headline6">${item.attachment['Phone Number'].value}</span>   
  </div>
  </div>
  <ul class='mdc-list  address-list-container'></ul>
`
   
   card.dataset['phoneNumber'] = item.attachment['Phone Number'].value;
   card.dataset['Template'] = item.attachment['Template'].value
  return card;
}

function manageAdmins(data) {

  const filters = ['Phone Number'];

  document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
    <div class='search-bar-container'></div>
    
    <div class='action-header mt-10 mb-10'>
      <div class='action-container'>
        ${iconButtonWithLabel('arrow_downward','Download sample','download-sample').outerHTML}
        ${uploadButton('upload-sample').outerHTML}
      </div>
  
    </div>
    <ul class='mdc-list mdc-list--two-line address-list-container' id='admin-list'>
        
    </ul>
  </div>
  </div>
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div id='form-container'>
  </div>
  </div>
  `


  document.querySelector('.search-bar-container').appendChild(searchBar('search-admin', filters));

  const radios = {}
  filters.forEach((filter, index) => {
    const radio = new mdc.radio.MDCRadio(document.querySelector(`[data-id="${filter}"]`));
    if (index == 0) {
      radio.checked = true;
      document.getElementById('search-admin').dataset.selectedRadio = radio.value;
    }
    radio.root_.addEventListener('click', function () {
      console.log(radio)
      document.getElementById('search-admin').dataset.selectedRadio = radio.value;
    })
    radios[filter] = radio;
  });

  const ul = document.getElementById('admin-list');
  data.forEach((item) => {
    const cont = actionListStatusChange({
      primaryText: item.attachment['Phone Number'].value,
      secondaryText: '',
      status: item.status,
      key: item.activityId
    })
    cont.dataset.number = item.attachment['Phone Number'].value
    ul.append(cont);

  })


  const adminList = new mdc.list.MDCList(ul)
  adminList.sinleSelection = true;
  const formContainer = document.getElementById('form-container');
  adminList.listen('MDCList:action', function (event) {
    loadForm(formContainer, data[event.detail.index])
  })

  if (data.length) {
    loadForm(formContainer, data[0]);
  }
  adminList.selectedIndex = 0;
  initializeAdminSearch(data, radios, adminList);
  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('admin')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'admin')
  });

}


const assigneeLiBatch = (attr,time) => {
  const img = createElement('img', {
    className: 'mdc-list-item__graphic',
    src: attr.photoURL || '../img/person.png'
  })

  const li = createElement('li', {
    className: 'mdc-list-item pl-0 pr-0'
  });

  const textSpan = createElement('span', {
    className: 'mdc-list-item__text'
  });

  const primaryText = createElement('span', {
    className: 'mdc-list-item__primary-text',
    textContent: attr.displayName  || attr.phoneNumber
  });

  const secondaryText = createElement('span', {
    className: 'mdc-list-item__secondary-text',
    textContent: attr.displayName ? attr.phoneNumber : ''
  });

  const meta = createElement('span',{
    className:'mdc-list-item__meta'
  })
  meta.appendChild(createElement('span',{
    className:'mdc-typography--caption',
    textContent:time
  }))
  textSpan.appendChild(primaryText)
  textSpan.appendChild(secondaryText);
  li.appendChild(img)
  li.appendChild(textSpan);
  li.appendChild(meta);
  new mdc.ripple.MDCRipple(li)
  
  return li

}



const assigneeLi = (assignee,withAction = true) => {
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
  if(!withAction) {
    return li
  }
  container.appendChild(li)
  container.appendChild(createStatusIcon('CONFIRMED'));
  return container;

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


const initializeAdminSearch = (data, radios, adminList) => {
  const search = new mdc.textField.MDCTextField(document.getElementById('search-admin'))
  console.log(radios)
  search.root_.addEventListener('input', function (event) {
    searchAdmin(event, adminList)
  });
};

const searchAdmin = (event, adminList) => {
  const inputValue = event.target.value.toLowerCase();

  [...document.querySelectorAll('[data-number]')].forEach((el) => {
    if (el.dataset.number.indexOf(inputValue) > -1) {
      el.classList.remove('hidden')
    } else {
      el.classList.add('hidden')
    }
  })

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
    http('GET', `/json?action=view-templates&name=duty`, null, true).then(template => {

      const body = {
        template: template[Object.keys(template)[0]],
        employees: employees,
        dutyTypes: dutyTypes,
        customers: customers

      }
      loadForm(document.getElementById('form-container'),
        body, true);
    })

  })
}