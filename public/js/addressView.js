function locations(office) {

  http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=locations&field=types`).then(response => {
    document.getElementById('app-content').innerHTML = ''
    const customerTypes = response.types.filter((item)=>{
      return item.template === 'customer-type'
    })
    manageAddress(response.locations,customerTypes || [], office)
  });
};


function manageAddress(locations, customerTypes, office) {
  document.getElementById('app-content').innerHTML = `
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
    <div class='flex-container'>
      <div class='flex-manage'>
          <div class='search-bar-container'></div>
          <ul class='mdc-list mdc-list--two-line overflow-list' id='branch-list'></ul>
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


  document.querySelector('.search-bar-container').appendChild(searchBar('search-branch'));



  const ul = document.getElementById('branch-list');
  locations.forEach(location => {


    const cont = actionListStatusChange({
      primaryText: location.activityName,
      secondaryText: location.venue[0].address,
      status: location.status,
      key: location.activityId
    })

    cont.querySelector('li').dataset.address = location.venue[0].address
    cont.querySelector('li').dataset.location = location.venue[0].location
    cont.querySelector('li').dataset.name = location.activityName
    ul.append(cont);

  });

  const list = new mdc.list.MDCList(ul);
  list.singleSelection = true;
  list.selectedIndex = 0;
  const formContainer = document.getElementById('form-container');

  list.listen('MDCList:action', function (e) {
    const formData = locations[e.detail.index]
    if(locations[e.detail.index].template === 'customer') {
      formData.customerTypes = customerTypes
    }
    addView(formContainer, formData);
  })

  if (locations.length) {
    const event = new CustomEvent('MDCList:action',{
      detail:{index:0}
    });
    list.root_.dispatchEvent(event)
  }

  initializeSearch(function (value) {
    searchAddress(value, list);
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
          const vd = formData.venue[0]
          formData.venue = [{
            'venueDescriptor': vd,
            'address': '',
            'location': '',
            'geopoint': geopoint
          }]
          if(formData.template === 'customer') {
            formData.customerTypes = customerTypes;
          }
          formData.isCreate = true
          addView(formContainer, formData);
        })
      })
    })
  })
}

const actionListStatusChange = (attr) => {
  const list = actionList(attr.primaryText, attr.secondaryText, attr.status);
  list.querySelector('.mdc-list-item').dataset.key = attr.key

  const btn = list.querySelector('.status-button')

  btn.addEventListener('click', function () {
    getLocation().then(geopoint => {
      http('PATCH', `${appKeys.getBaseUrl()}/api/activities/change-status`, {
        activityId: attr.key,
        status: btn.dataset.status,
        geopoint: geopoint
      }).then(statusChangeResponse => {
        console.log(statusChangeResponse);
        showSnacksApiResponse(`Success`)
      }).catch(function (err) {
        showSnacksApiResponse(err.message)
      })

    }).catch(handleLocationError)
  });
  return list;
}




const searchAddress = (inputValue, branchList) => {
  branchList.listElements.forEach((el) => {
    if (el.dataset.address.toLowerCase().indexOf(inputValue) > -1 || el.dataset.location.toLowerCase().indexOf(inputValue) > -1 || el.dataset.name.toLowerCase().indexOf(inputValue) > -1) {
      el.classList.remove('hidden')
    } else {
      el.classList.add('hidden')
    }
  })
}