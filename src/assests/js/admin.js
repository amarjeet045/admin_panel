
import {MdcList} from '../templates/templates';
import {MDCTopAppBar} from '@material/top-app-bar/index';
import {MDCMenu} from '@material/menu';
import {signOutUser} from './login';

function adminUser(offices){
    showHeaderDefault('admin')
    if(offices.length > 1) {
        document.getElementById('app').appendChild(MdcList(offices))
        return
    }
    openOffice(offices[0])
}

function openOffice(officeName){
    document.getElementById('header-action--container').innerHTML = `<p class="mdc-typography--headline5 office-name--header">${officeName}</p>`
    document.getElementById('app').innerHTML = ''
    document.getElementById('sidebar').innerHTML = ''

}

function showHeaderDefault(type) {
    document.getElementById('app-header').classList.remove('hidden')

    const topAppBarElement = document.querySelector('#app-header');
    const topAppBar = new MDCTopAppBar(topAppBarElement);
    document.querySelector('.mdc-top-app-bar__section--align-start').classList.add('remove-flex')
    
    document.getElementById('header-action--container').classList.add(type)
    document.getElementById('header-action--container').style.opacity = 1
    document.getElementById('account-circle-header').onclick = function(){
        const menu = new MDCMenu(document.querySelector('.mdc-menu'));
        menu['root_'].style.marginLeft = '-70px'
        menu['root_'].style.marginTop = '44px';
        menu.open = true;
        menu.items[0].onclick = function() {
            signOutUser()
        }
        console.log(menu)
    }
}


export {adminUser,openOffice,showHeaderDefault}