function users(office) {

  http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=roles`).then(response => {

    console.log(office);
    console.log(response);
    commonDom.progressBar.close();
    document.getElementById('app-content').innerHTML = ''

    const array = [{
      name: 'Duty',
      total: 0,
      view: 'manageDuty',
      data: response.roles.employee || [],
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
        updateState({
          view: type.view,
          office: office,
          name: type.name
        }, type.data, office);


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

  initializeSearch(function (value) {
    searchSubscription(value)
  })
  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('subscription')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'subscription')
  });
}

function searchSubscription(inputValue) {
  let selectedRadio = document.getElementById('search-subscription').dataset.selectedRadio;

  [...document.querySelectorAll('.subscription-card')].forEach((el) => {

    if (selectedRadio === 'Phone Number') {
      selectedRadio = 'phoneNumber'
    }
    if (el.dataset[selectedRadio].toLowerCase().indexOf(inputValue) > -1) {
      el.classList.remove("hidden")
    } else {
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

function manageAdmins(data, office) {

  const filters = ['Phone Number'];

  document.getElementById('app-content').innerHTML = `
    <div class='action-container mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-8-tablet  mdc-layout-grid__cell--span-4-phone'>
      ${iconButtonWithLabel('arrow_downward','Download sample','download-sample').outerHTML}
      ${uploadButton('upload-sample').outerHTML}
      ${iconButtonWithLabel('add','Create','create-new').outerHTML}
    </div>
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
      <div class='search-bar-container'></div>
      <ul class='mdc-list mdc-list--two-line address-list-container' id='admin-list'></ul>
    </div>
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
      <div id='form-container'></div>
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
  document.getElementById('create-new').addEventListener('click', function () {
    loadForm(formContainer, {
      template: 'admin',
      office: office
    }, true)
  })
  if (data.length) {
    loadForm(formContainer, data[0]);
  }
  adminList.selectedIndex = 0;
  initializeSearch(function (value) {
    searchAdmin(value)
  })

  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('admin')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'admin')
  });

}


const assigneeLiBatch = (attr, time) => {
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
    textContent: attr.displayName || attr.phoneNumber
  });

  const secondaryText = createElement('span', {
    className: 'mdc-list-item__secondary-text',
    textContent: attr.displayName ? attr.phoneNumber : ''
  });

  const meta = createElement('span', {
    className: 'mdc-list-item__meta'
  })
  meta.appendChild(createElement('span', {
    className: 'mdc-typography--caption',
    textContent: time
  }))
  textSpan.appendChild(primaryText)
  textSpan.appendChild(secondaryText);
  li.appendChild(img)
  li.appendChild(textSpan);
  li.appendChild(meta);
  new mdc.ripple.MDCRipple(li)

  return li

}



const assigneeLi = (assignee, withAction = true) => {
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
  if (!withAction) {
    return li
  }
  container.appendChild(li)
  container.appendChild(createStatusIcon('CONFIRMED'));
  return container;

}


function manageEmployees(data, office) {


  const filters = ['Employee Code', 'Name', 'Phone Number'];

  document.getElementById('app-content').innerHTML = `
    <div class='action-container mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-8-tablet  mdc-layout-grid__cell--span-4-phone'>
      ${iconButtonWithLabel('arrow_downward','Download sample','download-sample').outerHTML}
      ${uploadButton('upload-sample').outerHTML}
      ${iconButtonWithLabel('add','Create','create-new').outerHTML}
    </div>
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
    <div class='search-bar-container'></div>
    <ul class='mdc-list mdc-list--two-line address-list-container' id='employee-list'>
        
    </ul>
  </div>
  </div>
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div id='form-container'></div>
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
  data.forEach(item => {
    const cont = actionListStatusChange({
      primaryText: `${item.attachment['Name'].value} (${item.attachment['Employee Contact'].value})`,
      secondaryText: item.attachment['Employee Code'].value,
      status: item.status,
      key: item.activityId
    })

    cont.dataset.number = item.attachment['Phone Number'].value
    cont.dataset.name = item.attachment['Name'].value
    cont.dataset.code = item.attachment['Employee Code'].value
    ul.append(cont);
  });

  const employeeList = new mdc.list.MDCList(ul)
  employeeList.singleSelection = true;
  const formContainer = document.getElementById('form-container');

  employeeList.listen('MDCList:action', function (e) {

    loadForm(formContainer, data[e.detail.index]);
  })

  if (data.length) {
    loadForm(formContainer, data[0]);
  }
  employeeList.selectedIndex = 0;
  initializeSearch(function (value) {
    searchEmployee(value);
  })

  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('employee')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'employee')
  });

  document.getElementById('create-new').addEventListener('click', function () {
    loadForm(formContainer, {
      template: 'employee',
      office: office
    }, true);
  })
}



const initializeSearch = (callback) => {
  const search = new mdc.textField.MDCTextField(document.querySelector('.search-bar .mdc-text-field'));
  search.root_.addEventListener('input', function (event) {
    callback(event.target.value.toLowerCase())
  });
}

const searchAdmin = (inputValue) => {

  [...document.querySelectorAll('[data-number]')].forEach((el) => {
    if (el.dataset.number.indexOf(inputValue) > -1) {
      el.classList.remove('hidden')
    } else {
      el.classList.add('hidden')
    }
  })

}

const mapEmployeeLiDataset = (selectedRadio) => {
  if (selectedRadio === 'Name') {
    return 'name'
  }
  if (selectedRadio === 'Employee Code') {
    return 'code'
  }
  if (selectedRadio === 'Phone Number') {
    return 'number'
  }
}

const searchEmployee = (inputValue) => {
  const selectedRadio = document.getElementById('search-employee').dataset.selectedRadio;
  console.log(selectedRadio);
  [...document.querySelectorAll('[data-number]')].forEach((el) => {
    if (el.dataset[mapEmployeeLiDataset(selectedRadio)].toLowerCase().indexOf(inputValue) > -1) {
      el.classList.remove('hidden')
    } else {
      el.classList.add('hidden')
    }
  })


}

function manageDuty(employees, office) {
  document.getElementById('app-content').innerHTML = `
  <div class='action-container mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-8-tablet  mdc-layout-grid__cell--span-4-phone'>
      ${iconButtonWithLabel('arrow_downward','Download sample','download-sample').outerHTML}
      ${uploadButton('upload-sample').outerHTML}
    </div>
  <div class='mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet'>
    <div id='form-container'></div>
  </div>
`

  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('duty')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'duty')
  });

  Promise.all([http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=locations&field=types`), http('GET', `/json?action=view-templates&name=duty`)]).then(response => {
    const meta = response[0]
    const dutyTemplate = response[1];

    const dutyTypes = meta.types.filter((item) => {
      return item.template === 'duty-type'
    })
    const customers = meta.locations.filter((item) => {
      return item.template === 'customer'
    })
    const template = dutyTemplate[Object.keys(dutyTemplate)[0]];
    template.office = office;
    template.share = []
    template['template'] = template.name

    const body = {
      template: template,
      employee: employees,
      dutyTypes: dutyTypes,
      customers: customers

    }
    loadForm(document.getElementById('form-container'), {
      template: 'duty',
      office: office,
      data: body
    }, false);

  })

}