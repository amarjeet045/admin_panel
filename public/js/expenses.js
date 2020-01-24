function users(office) {

  document.getElementById('app-content').innerHTML = ''
  http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=roles`).then(response => {
    console.log(office);
    console.log(response);

    manageUsers(response.roles, office)
  });
}

function manageUsers(roles, office) {

  document.getElementById('app-content').innerHTML = `
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div class='flex-container'>
    <div class='flex-manage'>
        <div class='search-bar-container'></div>
        <ul class='mdc-list mdc-list--two-line overflow-list' id='search-list'></ul>
    </div>
    <div class="mdc-menu-surface--anchor flex-fab-cont">
        ${faButton('create-new', 'add').normal().outerHTML}
        <div class="mdc-menu mdc-menu-surface" id='create-menu'>
          <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
            <li class="mdc-list-item" role="menuitem" data-name="branch">
              <span class="mdc-list-item__text">Branch</span>
            </li>
            <li class="mdc-list-item" role="menuitem" data-name="customer">
              <span class="mdc-list-item__text">Customer</span>
            </li>
          </ul>
        </div>
    </div>
  </div>
</div>
<div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div id='form-container'></div>
</div>
  `


  document.querySelector('.search-bar-container').appendChild(searchBar('search'));



  const ul = document.getElementById('search-list');
  const subs = {}
  roles.subscription.forEach((item) => {
    const number = item.attachment['Phone Number'].value;
    if (!subs[number]) {
      subs[number] = [item];
    } else {
      subs[number].push(item)
    }
  })
  roles.employee.forEach(item => {
    const cont = actionListStatusChange({
      primaryText: `${item.attachment['Name'].value} (Employee)`,
      secondaryText: item.attachment['Phone Number'].value,
      status: item.status,
      key: item.activityId
    })
    cont.classList.add("mdc-card",'mdc-card--outlined');
    cont.dataset.number = item.attachment['Phone Number'].value
    cont.dataset.name = item.attachment['Name'].value
    cont.dataset.code = item.attachment['Employee Code'].value
    if(subs[item.attachment['Phone Number'].value]) {
      const subscriptionCont = createElement('div', {
        className: 'mdc-chip-set'
      })
      subs[item.attachment['Phone Number'].value].forEach((sub) => {
        const chip = inputChip(sub.attachment.Template.value)
        subscriptionCont.appendChild(chip)
      })
      cont.appendChild(subscriptionCont)
    }

    ul.append(cont);
  });

  roles.admin.forEach((item) => {
    const cont = actionListStatusChange({
      primaryText: `Admin : ${item.attachment['Phone Number'].value}`,
      secondaryText: '',
      status: item.status,
      key: item.activityId
    })
    cont.classList.add("mdc-card",'mdc-card--outlined');
    cont.dataset.number = item.attachment['Phone Number'].value
    cont.dataset.name = `Admin : ${item.attachment['Phone Number'].value}`
    ul.append(cont);
  });

  const list = new mdc.list.MDCList(ul)
  list.singleSelection = true;
  list.selectedIndex = 0;
  const formContainer = document.getElementById('form-container');

  list.listen('MDCList:action', function (e) {

    loadForm(formContainer, data[e.detail.index]);
  })

  // if (locations.length) {
  //   const event = new CustomEvent('MDCList:action',{
  //     detail:{index:0}
  //   });
  //   list.root_.dispatchEvent(event)
  // }

  initializeSearch(function (value) {
    searchEmployee(value);
  })


  document.getElementById('create-new').addEventListener('click', function () {
    loadForm(formContainer, {
      template: 'employee',
      office: office
    }, true);
  })
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



const initializeSearch = (callback) => {
  const search = new mdc.textField.MDCTextField(document.querySelector('.search-bar .mdc-text-field'));
  search.root_.addEventListener('input', function (event) {
    callback(event.target.value.toLowerCase())
  });
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
  const selectedRadio = document.getElementById('search').dataset.selectedRadio;
  console.log(selectedRadio);
  [...document.querySelectorAll('[data-number]')].forEach((el) => {
    if (el.dataset.number.toLowerCase().indexOf(inputValue) > -1 || el.dataset.name.toLowerCase().indexOf(inputValue) > -1) {
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