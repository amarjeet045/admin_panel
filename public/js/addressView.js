

function manageAddress(locations, customerTypes, office,template) {
  console.log(customerTypes)
  const customerTypesNames = [];
  customerTypes.forEach(type=>{
    customerTypesNames.push(type.attachment.Name.value)
  })
  document.getElementById('app-content').innerHTML = `
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
    <div class='flex-container'>
      <div class='flex-manage'>
          <div class='search-bar-container'></div>
          <ul class='mdc-list mdc-list--two-line overflow-list' id='branch-list'></ul>
      </div>
      <div class="mdc-menu-surface--anchor flex-fab-cont">
          ${faButton('create-new', 'add').normal().outerHTML}
          
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
      primaryTextContent: location.venue[0].location,
      secondaryTextContent: location.venue[0].address || '-',
      status: location.status,
      key: location.activityId,
      canEdit:location.canEdit
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
    console.log(formData);
    addView(formContainer, formData,customerTypesNames);
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


 

  document.getElementById('create-new').addEventListener('click', function () {
   

      http('GET', `/json?action=view-templates&name=${template}`).then(template => {
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
          addView(formContainer, formData,customerTypesNames);
        })
      })
    
  })
}

const actionListStatusChange = (attr) => {
  const list = actionList(attr);
  list.querySelector('.mdc-list-item').dataset.key = attr.key

  const btn = list.querySelector('.status-button')
  if(btn)  {
    btn.addEventListener('click', function () {
      statusChange(attr.key,btn.dataset.status);
     
    });
  }

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