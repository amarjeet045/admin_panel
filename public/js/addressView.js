function locations(office) {
  http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=locations`).then(response => {
    document.getElementById('app-content').innerHTML = ''
    const branches = response.locations.filter((item) => {
      return item.template === 'branch'
    })
    const customers = response.locations.filter((item) => {
      return item.template === 'customer' && item.location && item.address
    })


    const address_cards = []
    if (branches.length) {
      address_cards.push({
        name: 'Branches',
        total: branches.length,
        view: 'manageBranches',
        data: branches || []
      })
    }
    if (customers.length) {
      address_cards.push({
        name: 'Customers',
        total: customers.length,
        view: 'manageCustomers',
        data: customers || []
      })
    }
    address_cards.forEach((type)=>{
      const card = basicCards(type.name,'',type.total);
      card.addEventListener('click',function(){
        updateState({
          view: type.view,
          office: office,
          name: type.name
        }, type.data, office)
      })
      document.getElementById('app-content').appendChild(card)

    })

  });


};


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

function manageBranches(branches,office) {

  document.getElementById('app-content').innerHTML = `
    <div class='action-container mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-8-tablet  mdc-layout-grid__cell--span-4-phone'>
      ${iconButtonWithLabel('arrow_downward','Download sample','download-sample').outerHTML}
      ${uploadButton('upload-sample').outerHTML}
      ${iconButtonWithLabel('add','Create','create-new').outerHTML}
    </div>
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
    <div class='search-bar-container'></div>
    <ul class='mdc-list mdc-list--two-line address-list-container' id='branch-list'>
        
    </ul>
  </div>
  </div>
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div id='form-container'></div>
  </div>
  `


  document.querySelector('.search-bar-container').appendChild(searchBar('search-branch'));

 

  const ul = document.getElementById('branch-list');
  branches.forEach(branch => {
    const cont = actionListStatusChange({
      primaryText: branch.location,
      secondaryText: branch.address,
      status: branch.status,
      key: branch.activityId
    })

    cont.querySelector('li').dataset.address = branch.address
    cont.querySelector('li').dataset.location = branch.location
    ul.append(cont);
  });

  const branchList = new mdc.list.MDCList(ul)
  branchList.singleSelection = true;
  const formContainer = document.getElementById('form-container');

  branchList.listen('MDCList:action', function (e) {

    loadForm(formContainer, branches[e.detail.index]);
  })

  if (branches.length) {
    loadForm(formContainer, branches[0]);
  }
  branchList.selectedIndex = 0;
  initializeSearch(function (value) {
    searchAddress(value,branchList);
  })

  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('branch')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'branch')
  });

  document.getElementById('create-new').addEventListener('click', function () {
    loadForm(formContainer, {
      template: 'branch',
      office: office
    }, true);
  })
}

function manageCustomers(customers,office) {

  document.getElementById('app-content').innerHTML = `
    <div class='action-container mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-8-tablet  mdc-layout-grid__cell--span-4-phone'>
      ${iconButtonWithLabel('arrow_downward','Download sample','download-sample').outerHTML}
      ${uploadButton('upload-sample').outerHTML}
      ${iconButtonWithLabel('add','Create','create-new').outerHTML}
    </div>
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
    <div class='search-bar-container'></div>
    <ul class='mdc-list mdc-list--two-line address-list-container' id='customer-list'>
        
    </ul>
  </div>
  </div>
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div id='form-container'></div>
  </div>
  `


  document.querySelector('.search-bar-container').appendChild(searchBar('search-customer'));

 

  const ul = document.getElementById('customer-list');
  customers.forEach(customer => {
    const cont = actionListStatusChange({
      primaryText: customer.location,
      secondaryText: customer.address,
      status: customer.status,
      key: customer.activityId
    })

    cont.querySelector('li').dataset.address = customer.address
    cont.querySelector('li').dataset.location = customer.location
    ul.append(cont);
  });

  const customerList = new mdc.list.MDCList(ul)
  customerList.singleSelection = true;
  const formContainer = document.getElementById('form-container');

  customerList.listen('MDCList:action', function (e) {

    addView(formContainer, customers[e.detail.index]);
  })

  if (customers.length) {
    addView(formContainer, customers[0]);
  }
  customerList.selectedIndex = 0;
  initializeSearch(function (value) {
    searchAddress(value,customerList);
  })

  document.getElementById('download-sample').addEventListener('click', function () {
    downloadSample('customer')
  });
  document.getElementById('upload-sample').addEventListener('change', function (event) {
    uploadSheet(event, 'customer')
  });

  document.getElementById('create-new').addEventListener('click', function () {
    http('GET', `/json?action=view-templates&name=${template}`).then(template => {

      addView(formContainer,template[Object.keys(template)[0]]);

    })
  })
}



const searchAddress = (inputValue,branchList) => {
  branchList.listElements.forEach((el)=>{
    if (el.dataset.address.toLowerCase().indexOf(inputValue) > -1 || el.dataset.location.toLowerCase().indexOf(inputValue) > -1) {
      el.classList.remove('hidden')
    } else {
      el.classList.add('hidden')
    }
  })
}

