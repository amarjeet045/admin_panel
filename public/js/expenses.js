function manageUsers(office) {
  let url = `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=roles&field=types`;
  http('GET', url).then(function (response) {
    const data = {
      'region': [],
      'branch': [],
      'department': [],
      'office': ''
    }
    const roles = response.roles
    response.types.forEach(type => {
      if (type.template === 'office') {
        data['office'] = type;
      } else {
        if (data[type.template]) {
          data[type.template].push(type.attachment.Name.value)
        }
      }
    })

    document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone'>
      <div class='mdc-typography--body1'>
        Hi, ${firebase.auth().currentUser.displayName} ... Welcome to Growthfile. As a next step  download the app and do a checkin. Enter your mobile number and OTP to sign into the app.
      </div>
      <div class='download-app-link'>
          <a href="https://apps.apple.com/in/app/growthfile-gps-attendance-app/id1441388774?mt=8" style="display:inline-block;overflow:hidden;background:url(https://linkmaker.itunes.apple.com/en-gb/badge-lrg.svg?releaseDate=2018-12-06&kind=iossoftware&bubble=ios_apps) no-repeat;width:134px;height:40px;"></a>
          <a href='https://play.google.com/store/apps/details?id=com.growthfile.growthfileNew&hl=en_IN&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png' style="width:164px;margin-top:-12px;"/></a>
      </div>
    </div>
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone'>
      <div id='share-widget'></div>
    </div>
    <div class='mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-4-phone'>
      <hr>
    </div>
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
 
  <div class="mdc-menu-surface--anchor flex-fab-cont">
    <div id='add-more--container'></div>
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
  <div class='flex-container'>
    <div class='flex-manage'>
        <div class='search-bar-container'></div>
        <ul class='mdc-list mdc-list--two-line overflow-list' id='search-list'></ul>
    </div>
  </div>

</div>
<div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div id='form-container-employee'></div>
</div>
  `

    const shareEl = document.getElementById("share-widget");
 
    if (!window.isSupport) {
      http('POST', `${appKeys.getBaseUrl()}/api/services/shareLink`, {
        office: office
      }).then(function (response) {
        shareEl.appendChild(shareWidget(response.shortLink, office));
      }).catch(console.error)
    }


    document.querySelector('.search-bar-container').appendChild(searchBar('search'));
    const formContainerEmployee = document.getElementById('form-container-employee');

    const ul = document.getElementById('search-list');
    const subs = {}
    if (roles.subscription) {
      roles.subscription.forEach((item) => {
        if (item.status !== 'CANCELLED') {
          const number = item.attachment['Phone Number'].value;
          if (!subs[number]) {
            subs[number] = [item]
          } else {
            subs[number].push(item)
          }
        }
      })
    }


    if (roles.employee) {
      roles.employee.forEach(item => {
        window.isSupport ? item.canEdit = true : '';

        const cont = actionListStatusChange({
          primaryTextContent: item.attachment['Name'].value || item.attachment['Phone Number'].value,
          secondaryTextContent: 'Employee',
          activity: item
        })
        cont.querySelector('li').addEventListener('click', function () {
          if (window.isSupport) {
            item.canEdit = true
          }

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
      if (window.isSupport) {
        roles.employee[0].canEdit = true
      }
      addView(formContainerEmployee, roles.employee[0], data);
    }
    if (roles.admin) {


      roles.admin.forEach((item) => {
        let el = document.querySelector(`[data-number="${ item.attachment['Phone Number'].value}"]`)
        if (!el) {
          window.isSupport ? item.canEdit = true : '';
          el = actionListStatusChange({
            primaryTextContent: item.attachment['Phone Number'].value,
            secondaryTextContent: 'Admin',
            activity: item
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
        window.isSupport ? subs[number].canEdit = true : ''
        el = actionListStatusChange({
          primaryTextContent: number,
          secondaryTextContent: '',
          activity: subs[number]
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
        if (window.isSupport ? true : sub.canEdit) {
          chip = inputChip(sub.attachment.Template.value)
        } else {
          chip = createChip(sub.attachment.Template.value);
        }

        chip.dataset.activity = JSON.stringify(sub);
        subscriptionCont.appendChild(chip)
      });

      const chipSetInput = new mdc.chips.MDCChipSet(subscriptionCont);
      chipSetInput.listen('MDCChip:trailingIconInteraction', function (e) {
        const chipEl = document.getElementById(e.detail.chipId);
        subscriptionCont.removeChild(chipEl);
        const act = JSON.parse(chipEl.dataset.activity);
        act.status = 'CANCELLED'
        statusChange(act);
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
    const addMore = iconButtonWithLabel('add', 'Add more', 'add-more');
    addMore.classList.add('mdc-button--raised');
    menu.listen('MDCMenu:selected', function (e) {
      http('GET', `/json?action=view-templates&name=${e.detail.item.dataset.name}`).then(template => {
        const formData = template[Object.keys(template)[0]];
        formData.office = office;
        formData.template = formData.name;
        formData.canEdit = true
        formData.share = [];
        formData.isCreate = true
        addView(document.getElementById('form-container-employee'), formData, data);
      })
    })
    addMore.addEventListener('click', function () {
      menu.open = true;
    })
    document.getElementById('add-more--container').appendChild(addMore)
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

function manageDuties(office) {
  let url = `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=roles&field=types`;
  http('GET', url).then(function (response) {
    document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet'>
      <div id='form-container'></div>
    </div>
  `
    getDutyTemplate().then(dutyTemplate => {
      localStorage.setItem('dutyTemplate', JSON.stringify(dutyTemplate))
      const template = dutyTemplate[Object.keys(dutyTemplate)[0]]

      const dutyTypes = response.types.filter((item) => {
        return item.template === 'duty-type'
      })
      const customers = response.types.filter((item) => {
        return item.template === 'customer'
      })
      template.office = office;
      template.share = []
      template.canEdit = true
      template['template'] = template.name
      template.isCreate = true
      const body = {
        employee: response.roles.employee || [],
        dutyTypes: dutyTypes,
        customers: customers
      }
      addView(document.getElementById('form-container'), template, body);
    })
  })


}

const getDutyTemplate = () => {

  // const storedDutyTemplate = JSON.parse(localStorage.getItem('dutyTemplate'));
  // if (storedDutyTemplate) return Promise.resolve(storedDutyTemplate)
  return http('GET', `/json?action=view-templates&name=duty`)

}