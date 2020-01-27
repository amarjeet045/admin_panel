function settings(office) {
    const templateTypes = {}
    const appEl = document.getElementById('app-content')
    appEl.innerHTML = ''
    http('GET', `${appKeys.getBaseUrl()}/api/myGrowthfile?office=${office}&field=types`).then(response => {
        const dataset = {}

        response.types.forEach(item => {
            if (!dataset[item.template]) {
                dataset[item.template] = {
                    data: [item],
                    active: 0
                }
            } else {
                dataset[item.template].data.push(item)
            }
            if (item.status === 'CONFIRMED' || item.status === 'PENDING') {
                dataset[item.template].active++
            };
        })

        const customerCard = basicCards('Customers', {
            total: dataset.customer.data.length,
            active: dataset.customer.active
        })
        const branchCard = basicCards('Branches', {
            total: dataset.branch.data.length,
            active: dataset.branch.active
        })
        const officeCard = basicCards(office, {
            total: 0,
            active: 0
        })
        customerCard.addEventListener('click', function () {
            updateState({
                view: 'manageAddress',
                name: 'Customers',
                office: office
            }, dataset.customer.data,dataset['customer-type'],office,'customer')
        })
        branchCard.addEventListener('click', function () {
            updateState({
                view: 'manageAddress',
                name: 'Branches',
                office: office
            }, dataset.branch.data,[],office,'branch')
        })
        officeCard.addEventListener('click', function () {
            updateState({
                view: 'manageOffice',
                name: office,
                office: office
            }, dataset.office.data)
        })
        appEl.appendChild(customerCard)
        appEl.appendChild(branchCard)
        appEl.appendChild(officeCard)

        Object.keys(dataset).forEach(key => {

            if (key === 'customer' || key === 'branch' || key === 'office') return
            const card = basicCards(key, {
                total: dataset[key].data.length,
                active: dataset[key].active
            })
            card.addEventListener('click', function () {
                updateState({
                    view: 'manageTypes',
                    name: key,
                    office: office
                }, dataset[key].data,key,office);
            })
            appEl.appendChild(card);

        })

       

        // console.log(response)
        // response.types.forEach(function (type) {
        //     if(!templateTypes[type.template]) {
        //         templateTypes[type.template] = [type]
        //     }
        //     else {
        //         templateTypes[type.template].push(type)
        //     }
        // });

        // Object.keys(templateTypes).forEach(function(template){
        //     const card = createTypeCard(template)
        //     appEl.appendChild(card);
        //     templateTypes[template].forEach(function(activity){  
        //         const li = typeLi(activity.attachment.Name.value,getSecondaryText(activity),activity.status)
        //         li.querySelector(".mdc-icon-button").addEventListener('click',function(e){
        //             getLocation().then(geopoint => {
        //                 http('PATCH', `${appKeys.getBaseUrl()}/api/activities/change-status`,{
        //                     activityId:activity.activityId,
        //                     status:e.currentTarget.dataset.status,
        //                     geopoint:geopoint
        //                 }).then(function(){
        //                     if(e.currentTarget.dataset.status === 'delete') {
        //                         li.remove();
        //                     }
        //                 }).catch(function(err){
        //                     showSnacksApiResponse(err.message)
        //                 })
        //             }).catch(handleLocationError)
        //         })
        //         li.querySelector('.mdc-list-item').addEventListener('click',function(){
        //             history.pushState({
        //                 view: 'editType',
        //                 office: office
        //               }, `Type View`, `/?view=editType`);
        //               editType(activity)
        //         });

        //         card.querySelector('ul').appendChild(li);
        //     })
        //     appEl.appendChild(card);
        //     card.querySelector('.mdc-fab').addEventListener('click',function(){
        //         history.pushState({
        //             view: 'editType',
        //             office: office
        //           }, `Type View`, `/?view=editType`);
        //           addType({
        //               template:template,
        //               office:office
        //           })
        //     })
        // })
    });
}


function manageTypes(types,template,office) {
    document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
      <div class='flex-container'>
        <div class='flex-manage'>
            <div class='search-bar-container'></div>
            <ul class='mdc-list mdc-list--two-line overflow-list' id='type-list'></ul>
        </div>
        <div class="mdc-menu-surface--anchor flex-fab-cont">
            ${faButton('create-new', 'add').normal().outerHTML}
            
        </div>
      </div>
    </div>
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
      <div id='form-container'></div>
    </div>`

    document.querySelector('.search-bar-container').appendChild(searchBar('search-type'));

    const ul = document.getElementById('type-list');
    types.forEach(type => {  
      const cont = typeLi(type.attachment.Name.value,getSecondaryText(type),type.status)
      cont.querySelector('li').dataset.name = type.attachment.Name.value
      ul.append(cont);
  
    });
  
    const list = new mdc.list.MDCList(ul);
    list.singleSelection = true;
    list.selectedIndex = 0;
    const formContainer = document.getElementById('form-container');
  
    list.listen('MDCList:action', function (e) {
      const formData = types[e.detail.index]
     
      loadForm(formContainer, formData);
    })
  
    if (types.length) {
      const event = new CustomEvent('MDCList:action',{
        detail:{index:0}
      });
      list.root_.dispatchEvent(event)
    }
  
    initializeSearch(function (value) {
      searchTypes(value, list);
    })
  
  
   
  
    document.getElementById('create-new').addEventListener('click', function () {
     
        loadForm(formContainer, {
            office:office,
            template:template
        },true);
  
        // http('GET', `/json?action=view-templates&name=${template}`).then(template => {
        //   const formData = template[Object.keys(template)[0]];
        //   getLocation().then((geopoint) => {
        //     formData.office = office;
        //     formData.template = formData.name;
        //     const vd = formData.venue[0]
        //     formData.venue = [{
        //       'venueDescriptor': vd,
        //       'address': '',
        //       'location': '',
        //       'geopoint': geopoint
        //     }]
        //     if(formData.template === 'customer') {
        //       formData.customerTypes = customerTypes;
        //     }
        //     formData.isCreate = true
        //   })
        // })
      
    })

}

function addType(activity) {
    const appEl = document.getElementById('app-content');
    loadForm(appEl, activity, true);
}


function editType(activity) {
    console.log(activity);
    const appEl = document.getElementById('app-content');
    loadForm(appEl, activity);
}

function getSecondaryText(activity) {
    const keys = Object.keys(activity.attachment);
    const k = keys.filter(function (key) {
        return key !== 'Name'
    })
    return k[0]
}


function typeLi(primaryTextContent, secondaryTextContent, status) {
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
        textContent: primaryTextContent
    });

    const secondaryText = createElement('span', {
        className: 'mdc-list-item__secondary-text',
        textContent: secondaryTextContent
    });

    textSpan.appendChild(primaryText)
    textSpan.appendChild(secondaryText);

    li.appendChild(textSpan);
    new mdc.ripple.MDCRipple(li)
    container.appendChild(li)
    container.appendChild(createStatusIcon(status));
    return container;

}

const searchTypes = (inputValue,list) => {
    list.listElements.forEach((el) => {
        if (el.dataset.name.toLowerCase().indexOf(inputValue) > -1) {
          el.classList.remove('hidden')
        } else {
          el.classList.add('hidden')
        }
      })
}