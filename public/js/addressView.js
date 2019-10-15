function addressView(office) {

  commonDom.progressBar.close();
  commonDom.drawer.list.selectedIndex = 3;
  document.getElementById('app-content').innerHTML = `${branchCard()}${customerCard()}`;

  document.getElementById('branch-card').addEventListener('click', function () {

    history.pushState({
      view: 'branches',
      office: office
    }, 'openBranches', '/?view=branches')

    branches()

  })
  document.getElementById('customer-card').addEventListener('click', function () {
    history.pushState({
      view: 'customers',
      office: office
    }, 'customers', '/?view=customers')
    customers();
  })

};

const branchCard = () => {
  return `<div id='branch-card' class="mdc-card address-card  mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
  <div class="demo-card__primary">
    <div class="card-heading">
          <span class="demo-card__title mdc-typography--headline6">Branches</span>
          <div class="mdc-typography--caption">Last updated : 13/12/12 6:00 AM</div>
          <div class="mdc-typography--subtitle2" style='color:green;'>Active: 3</div>
      </div>
      
      <div class='heading-action-container total-count'>
            <span class='mdc-typography--subtitle2'>Total</span>
            <div class='mdc-typography--headline5'>3</div>
      </div>
    </div>
  <div class="demo-card__primary-action">   </div>
  <div class="mdc-card__actions mdc-card__actions--full-bleed">
  <button class="mdc-button mdc-card__action mdc-card__action--button">
    <span class="mdc-button__label">Manage Branches</span>
    <i class="material-icons" aria-hidden="true">arrow_forward</i>
  </button>

  </div>
</div>
`
}

const customerCard = () => {
  return `<div id='customer-card' class="mdc-card address-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
  <div class="demo-card__primary">
      <div class="card-heading">
          <span class="demo-card__title mdc-typography--headline6">Customers</span>
          <div class="mdc-typography--caption">Last updated : 13/12/12 6:00 AM</div>
          <div class="mdc-typography--subtitle2" style='color:green;'>Verified: 30</div>
      </div>
      <div class='heading-action-container total-count'>
          <span class='mdc-typography--subtitle2'>Total</span>
          <div class='mdc-typography--headline5'>32</div>
      </div>

  </div>
  <div class="demo-card__primary-action">   
    
  </div>
  <div class="mdc-card__actions mdc-card__actions--full-bleed">
  <button class="mdc-button mdc-card__action mdc-card__action--button">
    <span class="mdc-button__label">Manage Customers</span>
    <i class="material-icons" aria-hidden="true">arrow_forward</i>
  </button>

  </div>
</div>`
}

function customers(office) {
  http('GET', `/api/search?office=${office || history.state.office}&template=customer`).then(response => {
    addressManagement(office,response)
  }).catch(console.log)
}

function branches(office) {
  http('GET', `/api/search?office=${office || history.state.office}&template=branch`).then(response => {
    addressManagement(office, response);
  }).catch(console.log);
}

const addressManagement = (office, response) => {
  console.log(response)
  commonDom.progressBar.close();
  commonDom.drawer.list_.selectedIndex = 3;

  const filters = ['Name', 'location', 'address']
  document.getElementById('app-content').innerHTML = `
<div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div class='search-bar-container'></div>    
  <div class='action-header'>
  <button class="mdc-fab mdc-fab--mini mdc-theme--primary-bg" aria-label="add">
       <span class="mdc-fab__icon material-icons mdc-theme--on-primary">add</span>
  </button>
</div>
  <ul class='mdc-list mdc-list--two-line address-list-container' id='address-list'></ul>
  </div>
</div>
<div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4  mdc-layout-grid__cell--order-1'>
<div id='map-view'></div>
</div>
`
  document.querySelector('.search-bar-container').appendChild(searchBar('search-address', filters))
  // const selectedRadio 
  const radios = {}
  filters.forEach((filter, index) => {
    const radio = new mdc.radio.MDCRadio(document.querySelector(`[data-id="${filter}"]`));
    if (index == 0) {
      radio.checked = true;
      document.getElementById('search-address').dataset.selectedRadio = radio.value;
    }
    radio.root_.addEventListener('click', function () {
      console.log(radio)
      document.getElementById('search-address').dataset.selectedRadio = radio.value;
    })
    radios[filter] = radio;
  })


  const ul = document.getElementById('address-list');
  Object.keys(response).forEach(key => {
    ul.append(actionListStatusChange(response, key));
  });

  const branchList = new mdc.list.MDCList(document.getElementById('address-list'))
  branchList.selectedIndex = 0;
  renderAddressForm(response,branchList.listElements[0])
  branchList.listen('MDCList:action', function (evt) {
    renderAddressForm(response,branchList.listElements[evt.detail.index])
  });

  initializeAddressSearch(response, radios, branchList);
}


const renderAddressForm = (response,li) => {
  document.getElementById("map-view").innerHTML = addressForm(response[li.dataset.key])

}

const actionListStatusChange = (response, key) => {
  const list = actionList(response[key].attachment.Name.value, response[key].venue[0].address, response[key].status);
  list.querySelector('.mdc-list-item').dataset.key = key

  const btn = list.querySelector('.status-button')

  btn.addEventListener('click', function () {
    getLocation().then(geopoint => {
      http('PATCH', '/api/activities/change-status', {
        activityId: key,
        status: btn.dataset.status,
        geopoint: geopoint
      }).then(statusChangeResponse => {
        console.log(statusChangeResponse);
        btn.dataset.status = 
      }).catch(console.error)

    }).catch(handleLocationError)
  });
  return list;
}

const addressForm = (data) => {
  console.log(data)
  return `
  <div class="mdc-card demo-card demo-basic-with-header address-card">
  <div class="demo-card__primary">
  <h2 class="demo-card__title mdc-typography mdc-typography--headline6 mt-0 mb-0">${data.attachment.Name.value}</h2>
  <h3 class="demo-card__subtitle mdc-typography mdc-typography--subtitle1 mt-0">${data.venue[0].address}</h3>
  </div>
  <div class="mdc-card__primary-action demo-card__primary-action" tabindex="0">
  <div class="mdc-card__media mdc-card__media--16-9 demo-card__media map-static" style='background-image: url(&quot;https://maps.googleapis.com/maps/api/staticmap?center=${data.venue[0].geopoint. latitude},${data.venue[0].geopoint.longitude}&color:89273E&markers=color:89273E%7Clabel:${data.venue[0].location}%7C${data.venue[0].geopoint. latitude},${data.venue[0].geopoint.longitude}&zoom=18&size=600x600&key=AIzaSyCadBqkHUJwdcgKT11rp_XWkbQLFAy80JQ&quot;);'></div>
  <div class="demo-card__secondary mdc-typography mdc-typography--body2">
  form here
  </div>
  </div>
  
  </div>
 
  `
}
const initializeAddressSearch = (response, radios, branchList) => {
  const search = new mdc.textField.MDCTextField(document.getElementById('search-address'))
  console.log(radios)
  search.root_.addEventListener('input', function (event) {

    searchBranch(event, response, branchList)
  });

}
const searchBranch = (event, data, branchList) => {
  const inputValue = event.target.value.toLowerCase();
  const selectedRadio = document.getElementById('search-address').dataset.selectedRadio;
  removeChildren(branchList.root_);
  let selectedObject = {};
  Object.keys(data).forEach(key => {
    if (selectedRadio === 'Name' && data[key].attachment.Name.value.toLowerCase().indexOf(inputValue) > -1) {
      selectedObject[key] = data[key]
    }
    if (selectedRadio === 'location' && data[key].venue[0].location.toLowerCase().indexOf(inputValue) > -1) {
      selectedObject[key] = data[key]
    }
    if (selectedRadio === 'address' && data[key].venue[0].address.toLowerCase().indexOf(inputValue) > -1) {
      selectedObject[key] = data[key]
    }
  });
  console.log(selectedObject);
  Object.keys(selectedObject).forEach(key => {
    branchList.root_.appendChild(actionListStatusChange(selectedObject, key))
  })
}