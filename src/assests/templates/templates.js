import {panel} from '../js/panel';
import {signOutUser} from '../js/login';
import {MDCTextField} from '@material/textfield';
import {MDCList} from "@material/list";
import {MDCTopAppBar} from "@material/top-app-bar";
import {MDCMenu} from '@material/menu';
import{newOfficeForm} from '../js/support';
import {requestCreator} from '../js/services';
import {MDCRipple} from '@material/ripple';

let listHandler = (call,data) =>{
const fn = {
    panel : panel,
    activityEdit:activityEdit,
    createActivity: createActivity
}
 fn[call](data)
 return
} 

let MdcList = (data,view) => {
    const ul = document.createElement('ul')
    ul.className = 'mdc-list'
    ul.setAttribute('aria-orientation','vertical')

        const li = document.createElement('li')
        li.className  = 'mdc-list-item mdc-ripple-surface mdc-ripple-surface--primary'
        
        li.onclick = function(){
            listHandler(view,data)
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
    
   if(type === 'admin') {

        searchBar['root_'].style.opactiy = '0'
    }
    if(type === 'support'){
    const input = document.getElementById('search-input')
    input.addEventListener('keyup',function(e){
        if(e.keyCode == 13) {
            if(e.target.value) {

                requestCreator('search', {office:e.target.value}).then(function (event) {
                    if(event.data.data.length ==0) {
                        textField['root_'].children[0].value = ''
                        
                        textField['root_'].children[0].placeholder = 'No Office found'
                        return
                    }
                    document.querySelector('#app').appendChild(MdcList(event.data.data))
                }).catch(function(error){
                    textField['root_'].children[0].placeholder = error

                })
            }
            else {
               input.placeholder = 'Please Enter a valid office Name'
            }
        }
    })

}

    document.getElementById('profile--image').onclick = function(){
        const menu = new MDCMenu(document.querySelector('#profile-menu'));
     
        menu.open = true;
        menu.items[0].onclick = function() {
          signOutUser()
        }
    }
}

let drawer = (type) => {
    console.log(type)
if(type === 'admin') {
    toggleAppComponents(true)
    return
}

if(type === 'support') {
    console.log("support drawer")
    const drawerContent = document.querySelector('.mdc-drawer__content')
    drawerContent.classList.add('hidden')

    const fabRipple = new MDCRipple(document.querySelector('.mdc-fab'))
    fabRipple['root_'].onclick = function () {
        document.querySelector('.search-bar').classList.add('hidden')
        newOfficeForm()
    }
}
if(type === 'panel'){
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
      
}

const list = MDCList.attachTo(document.querySelector('.mdc-list'));
list.wrapFocus = true

}

let toggleAppComponents = (hide) => {
    const drawerHeader = document.querySelector('.mdc-drawer__header');
    const drawerContent = document.querySelector('.mdc-drawer__content')
    if(hide) {

        drawerHeader.classList.add('hidden')
        drawerContent.classList.add('hidden')
    }
    else {
        drawerHeader.classList.remove('hidden')
        drawerContent.classList.remove('hidden')
        const searchBar = new MDCTextField(document.querySelector('.search-bar'));
        searchBar['root_'].style.opactiy = '1';
        document.getElementById('app').innerHTML = ''
    }
}

// let MdcExtendedFab = (fabName,icon) => {
//     const button = document.createElement('button')
//     button.className = 'mdc-fab mdc-fab--extended'
//     button.setAttribute('aria-label','add')

//     const span = document.createElement('span')
//     span.className = 'mdc-fab__label'
//     span.textContent = fabName

//     const icon = document.createElement('i')
//     icon.className = 'mdc-fab__icon material-icons'
//     icon.textContent = icon

//     button.append(span)
//     button.appendChild(icon)
//     return button
// }

export {MdcList,showHeaderDefault,drawer,toggleAppComponents}