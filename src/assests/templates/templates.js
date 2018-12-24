import {
    panel
} from '../js/panel';
import {
    signOutUser
} from '../js/login';
import {
    MDCTextField
} from '@material/textfield';
import {
    MDCList
} from "@material/list";
import {
    MDCTopAppBar
} from "@material/top-app-bar";
import {
    MDCMenu
} from '@material/menu';
import {
    newOfficeForm
} from '../js/support';
import {
    requestCreator
} from '../js/services';
import {
    MDCRipple
} from '@material/ripple';

let listHandler = (data, call) => {
    const fn = {
        panel: panel,
        activityEdit: activityEdit,
        createActivity: createActivity
    }
    fn[call](data)
    return
}

let officeList = (data) => {

    const li = document.createElement('li')
    li.className = 'mdc-list-item mdc-ripple-surface mdc-ripple-surface--primary'

    li.onclick = function () {
        requestCreator('fetchServerTime', {
            device: '123',
            office: data
        }).then(function (success) {
            panel(data, 'ADMIN')
        }).catch(function (error) {
            console.log(error)
        })
    }

    const span = document.createElement('span')
    span.className = 'mdc-list-item__text'
    span.textContent = data
    li.appendChild(span)
    return li
}

let showHeaderDefault = (type) => {
    const searchBar = new MDCTextField(document.querySelector('.search-bar'));

    const topAppBarElement = document.querySelector('header');
    const topAppBar = new MDCTopAppBar(topAppBarElement);

    if (type === 'admin') {
        searchBar['root_'].classList.add("hidden");
    }
    if (type === 'support') {
        const input = document.getElementById('search-input')
        input.addEventListener('keyup', function (e) {
            if (e.keyCode == 13) {
                if (e.target.value) {

                    requestCreator('search', {
                        office: e.target.value
                    }).then(function (event) {
                        if (event.data.data.length == 0) {
                            textField['root_'].children[0].value = ''

                            textField['root_'].children[0].placeholder = 'No Office found'
                            return
                        }
                        document.querySelector('#app').appendChild(MdcList(event.data.data))
                    }).catch(function (error) {
                        textField['root_'].children[0].placeholder = error
                    })
                } else {
                    input.placeholder = 'Please Enter a valid office Name'
                }
            }
        })

    }

    document.getElementById('profile--image').onclick = function () {
        const menu = new MDCMenu(document.querySelector('#profile-menu'));

        menu.open = true;
        menu.items[0].onclick = function () {
            signOutUser()
        }
    }
}

let drawer = (type) => {
    console.log(type)
    if (type === 'admin') {
        toggleAppComponents(false)
        return
    }

    if (type === 'support') {
        console.log("support drawer")
        const drawerContent = document.querySelector('.mdc-drawer__content')
        drawerContent.classList.add('hidden')

        const fabRipple = new MDCRipple(document.querySelector('.mdc-fab'))
        fabRipple['root_'].onclick = function () {
            document.querySelector('.search-bar').classList.add('hidden')
            newOfficeForm()
        }
    }
    if (type === 'panel') {
        const fabRipple = new MDCRipple(document.querySelector('.mdc-fab'))
        document.querySelector('.mdc-drawer__header').classList.add('mdc-menu-surface--anchor')
        fabRipple['root_'].onclick = function () {
            const menu = `<div class="mdc-menu mdc-menu-surface" tabindex="-1" id="create-menu">
        <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
          <li class="mdc-list-item" role="menuitem">
            <span class="mdc-list-item__text">Create New</span>
          </li>
          <li class="mdc-list-item" role="menuitem">
            <span class="mdc-list-item__text">Bulk Create</span>
          </li>
          
        </ul>
      </div>`
            document.querySelector('.create-header').innerHTML = menu
            const createMenu = new MDCMenu(document.querySelector('#create-menu'))
            console.log(createMenu)
            createMenu.open = true;

        }
        const createNewButton = document.getElementById('create-new-activity');
        createNewButton.addEventListener('click', function () {
            renderTemplatesInDom()
        })
    }

    const list = MDCList.attachTo(document.querySelector('.mdc-list'));
    list.wrapFocus = true

}

let toggleAppComponents = (hide) => {
    const drawerHeader = document.querySelector('.mdc-drawer__header');
    const drawerContent = document.querySelector('.mdc-drawer__content')
    if (hide) {
        drawerHeader.classList.add('hidden')
        drawerContent.classList.add('hidden')
    } else {
        drawerHeader.classList.remove('hidden')
        drawerContent.classList.remove('hidden')
        const searchBar = new MDCTextField(document.querySelector('.search-bar'));
        searchBar['root_'].style.opactiy = '1';
        document.getElementById('app').innerHTML = ''
    }
}


function createActivityList(db, data) {
    return new Promise(function (resolve) {
        getCreatorDetails(db, data).then(function (meta) {
            resolve(activityListUI(data, meta))
        })
    })
}

function getCreatorDetails(db, data) {

    return new Promise(function (resolve) {
        const meta = {
            photo: '../media/empty-user.jpg',
            name: ''
        };
        if (data.creator === firebase.auth().currentUser.phoneNumber) {
            meta.photo = firebase.auth().currentUser.photoURL || '../media/empty-user.jpg';
            meta.name = firebase.auth().currentUser.displayName;
            resolve(meta);
            return;
        }

        const userTx = db.transaction(['users']);
        const userObjStore = userTx.objectStore('users');

        userObjStore.get(data.creator).onsuccess = function (userstore) {
            const record = userstore.target.result
            if (record) {
                meta.photo = record.photoURL || '../media/empty-user.jpg'
                meta.name = record.displayName || record.phoneNumber
            } else {
                meta.photo = '../media/empty-user.jpg';
                meta.name = 'User'
            }
        };

        userTx.oncomplete = function () {
            resolve(meta)
        }
    })
}


function activityListUI(data, metaData) {
    const li = document.createElement('li')
    li.dataset.id = data.activityId
    li.setAttribute('onclick', `localStorage.setItem('clickedActivity',this.dataset.id);conversation(this.dataset.id,true)`)
    li.className = 'mdc-list-item activity--list-item mdc-elevation--z1'

    const creator = document.createElement("img")
    creator.className = 'mdc-list-item__graphic material-icons'
    // creator.setAttribute('onerror', `handleImageError(this)`)
    creator.src = metaData.photo


    const leftTextContainer = document.createElement('span')
    leftTextContainer.classList.add('mdc-list-item__text')

    const activityNameText = document.createElement('span')

    activityNameText.className = 'mdc-list-item__primary-text bigBlackBold'

    activityNameText.textContent = `${metaData.name} ${data.activityName}`
    leftTextContainer.appendChild(activityNameText);

    const metaTextContainer = document.createElement('span')
    metaTextContainer.classList.add('mdc-list-item__meta')

    const timeCustomText = document.createElement('div')
    timeCustomText.className = 'mdc-meta__custom-text'
    timeCustomText.style.width = '80px';
    timeCustomText.style.fontSize = '14px';
    timeCustomText.textContent = moment(data.timestamp).calendar()

    metaTextContainer.appendChild(timeCustomText)


    li.appendChild(creator);
    li.appendChild(leftTextContainer);
    li.appendChild(metaTextContainer);
    return li
    // }

    // li.innerHTML += creator.outerHTML + leftTextContainer.outerHTML + metaTextContainer.outerHTML
    // return li.outerHTML
}


let renderTemplatesInDom = (db, user, parent) => {

    const category = {
        PURCHASE: ['material','bill','payment'],
        HR:['employee','branch','department','leave-type','expense-type','customer-type','supplier-type','recipient','admin','subscription'],
        SALES:['product','invoice','collection']
    }
    Object.keys(category).forEach(function(cat){
        createDrawerLi(cat,category[cat])
    }) 
}

let createDrawerLi = (name,values) => {
    const ul = document.createElement('ul')
    ul.className ='mdc-list'
    values.forEach(function(value){
        const li = document.createElement('li');
        li.className = 'mdc-list-item'
        const span = document.createElement('span')
        span.className = 'mdc-list-item__text'
        span.textContent = value;
        ul.appendChild(li)
    })
    return ul;

}

export {
    officeList,
    showHeaderDefault,
    drawer,
    toggleAppComponents,
    createActivityList,
    renderTemplatesInDom
}