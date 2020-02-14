function users(office) {

  document.getElementById('app-content').innerHTML = ''
  http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=roles&field=types`).then(response => {
   
   
    console.log(office);
    console.log(response);
    const data = {
      'region': [],
      'branch': [],
      'department': []
    }
    response.types.forEach(type => {
      if (data[type.template]) {
        data[type.template].push(type.attachment.Name.value)
      }
    })
    manageUsers(response.roles, data, office)
  });
}

function manageUsers(roles, data, office) {

  document.getElementById('app-content').innerHTML = `
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div id='share-widget'></div>
  <div class='flex-container'>
    <div class='flex-manage'>
        <div class='search-bar-container'></div>
        <ul class='mdc-list mdc-list--two-line overflow-list' id='search-list'></ul>
    </div>
    <div class="mdc-menu-surface--anchor flex-fab-cont">
        ${faButton('create-new', 'add').normal().outerHTML}
        <div class="mdc-menu mdc-menu-surface" id='create-menu'>
          <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
            <li class="mdc-list-item" role="menuitem" data-name="employee">
              <span class="mdc-list-item__text">Employee</span>
            </li>
            <li class="mdc-list-item" role="menuitem" data-name="admin">
              <span class="mdc-list-item__text">Admin</span>
            </li>
          </ul>
        </div>
    </div>
  </div>
</div>
<div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div id='form-container-employee'></div>
</div>
  `

  const shareEl = document.getElementById("share-widget");
  createDynamiclink(`?action=get-subscription&office=${office}`).then(function(link){
    shareEl.appendChild(shareWidget(link,office));
  })

  document.querySelector('.search-bar-container').appendChild(searchBar('search'));


  const formContainerEmployee = document.getElementById('form-container-employee');

  const ul = document.getElementById('search-list');
  const subs = {}
  roles.subscription.forEach((item) => {
    if (item.status !== 'CANCELLED') {
      const number = item.attachment['Phone Number'].value;
      if (!subs[number]) {
        subs[number] = [item]
      } else {
        subs[number].push(item)
      }
    }
  });

  if (roles.employee) {
    roles.employee.forEach(item => {
      const cont = actionListStatusChange({
        primaryTextContent: item.attachment['Name'].value || item.attachment['Phone Number'].value,
        secondaryTextContent: 'Employee',
        status: item.status,
        key: item.activityId,
        canEdit: item.canEdit
      })
      cont.querySelector('li').addEventListener('click', function () {
        addView(formContainerEmployee, item, data);
      })
      cont.classList.add("mdc-card", 'mdc-card--outlined');
      cont.dataset.number = item.attachment['Phone Number'].value
      cont.dataset.name = item.attachment['Name'].value
      cont.dataset.code = item.attachment['Employee Code'].value
      const subscriptionCont = createElement('div', {
        className: 'subscription-container mdc-chip-set'
      })


      cont.appendChild(subscriptionCont)
      ul.append(cont);
    });
    addView(formContainerEmployee, roles.employee[0], data);
  }
  if (roles.admin) {


    roles.admin.forEach((item) => {
      let el = document.querySelector(`[data-number="${ item.attachment['Phone Number'].value}"]`)
      if (!el) {
        el = actionListStatusChange({
          primaryTextContent: item.attachment['Phone Number'].value,
          secondaryTextContent: 'Admin',
          status: item.status,
          key: item.activityId,
          canEdit: item.canEdit
        })

        el.classList.add("mdc-card", 'mdc-card--outlined');
        el.dataset.number = item.attachment['Phone Number'].value
        el.dataset.name = item.attachment['Phone Number'].value
        const subscriptionCont = createElement('div', {
          className: 'subscription-container mdc-chip-set'
        })
        el.appendChild(subscriptionCont)
        ul.append(el);
        return;
      }

      const secondaryText = el.querySelector('.mdc-list-item__secondary-text')
      secondaryText.textContent += ' & Admin'
    });
  }
  Object.keys(subs).forEach(number => {
    let el = document.querySelector(`[data-number="${number}"]`)

    // if (!el) return;
    if (!el) {
      el = actionListStatusChange({
        primaryTextContent: number,
        secondaryTextContent: '',
      })
      el.classList.add("mdc-card", 'mdc-card--outlined');
      el.dataset.number = number
      el.dataset.name = number;
      const subscriptionCont = createElement('div', {
        className: 'subscription-container mdc-chip-set'
      })
      el.appendChild(subscriptionCont);
      ul.appendChild(el);
    }

    const subscriptionCont = el.querySelector('.subscription-container');
    subs[number].forEach((sub) => {
      let chip;
      if (sub.canEdit) {
        chip = inputChip(sub.attachment.Template.value)
      } else {
        chip = createChip(sub.attachment.Template.value);
      }

      chip.dataset.activityId = sub.activityId;
      subscriptionCont.appendChild(chip)
    });

    const chipSetInput = new mdc.chips.MDCChipSet(subscriptionCont);
    chipSetInput.listen('MDCChip:trailingIconInteraction', function (e) {
      const chipEl = document.getElementById(e.detail.chipId);
      subscriptionCont.removeChild(chipEl);
      statusChange(chipEl.dataset.activityId, 'CANCELLED');
    });


  })

  const list = new mdc.list.MDCList(ul)
  list.singleSelection = true;
  list.selectedIndex = 0;


  initializeSearch(function (value) {
    document.getElementById('search-list').scrollTop = 0;
    searchEmployee(value);
  })
  const menu = new mdc.menu.MDCMenu(document.getElementById('create-menu'));

  document.getElementById('create-new').addEventListener('click', function () {
    menu.open = true;
    menu.listen('MDCMenu:selected', function (e) {

      http('GET', `/json?action=view-templates&name=${e.detail.item.dataset.name}`).then(template => {
        const formData = template[Object.keys(template)[0]];
        getLocation().then((geopoint) => {
          formData.office = office;
          formData.template = formData.name;
          formData.canEdit = true
          const vd = formData.venue[0]
          formData.venue = [{
            'venueDescriptor': vd,
            'address': '',
            'location': '',
            'geopoint': geopoint
          }]

          formData.isCreate = true
          addView(formContainer, formData, data);
        })
      })
    })
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
  search.input_.addEventListener('input', function (event) {

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
    template.canEdit = true
    template['template'] = template.name

    const body = {

      employee: employees,
      dutyTypes: dutyTypes,
      customers: customers
    }


    addView(document.getElementById('form-container'), template, body);

  })

}