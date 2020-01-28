function settings(office) {

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
            }, dataset.customer.data, dataset['customer-type'].data, office, 'customer')
        })
        branchCard.addEventListener('click', function () {
            updateState({
                view: 'manageAddress',
                name: 'Branches',
                office: office
            }, dataset.branch.data, [], office, 'branch')
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
                }, dataset[key].data, key, office);
            })
            appEl.appendChild(card);

        })




    });
}


function manageTypes(types, template, office) {
    console.log(types)
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
        const cont = actionListStatusChange({
            primaryText:type.attachment.Name.value, 
            secondaryText:getSecondaryText(type), 
            status:type.status,
            key:type.activityId
        })
        cont.querySelector('li').dataset.name = type.attachment.Name.value
        ul.append(cont);

    });

    const list = new mdc.list.MDCList(ul);
    list.singleSelection = true;
    list.selectedIndex = 0;
    const formContainer = document.getElementById('form-container');

    list.listen('MDCList:action', function (e) {
        const formData = types[e.detail.index]

        addView(formContainer, formData);
    })

    if (types.length) {
        const event = new CustomEvent('MDCList:action', {
            detail: {
                index: 0
            }
        });
        list.root_.dispatchEvent(event)
    }

    initializeSearch(function (value) {
        searchTypes(value, list);
    })




    document.getElementById('create-new').addEventListener('click', function () {


        http('GET', `/json?action=view-templates&name=${template}`).then(template => {
            const formData = template[Object.keys(template)[0]];
            formData.share = []
            formData.office = office;
            formData.template = formData.name;
            formData.isCreate = true
            addView(formContainer, formData);
        })
    })

}



function getSecondaryText(activity) {
    const keys = Object.keys(activity.attachment);
    const k = keys.filter(function (key) {
        return key !== 'Name'
    })
    if(k.length) {
        return `${k[0]} : ${activity.attachment[k[0]].value}`
    }
    return ''
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

const searchTypes = (inputValue, list) => {
    list.listElements.forEach((el) => {
        if (el.dataset.name.toLowerCase().indexOf(inputValue) > -1) {
            el.classList.remove('hidden')
        } else {
            el.classList.add('hidden')
        }
    })
}