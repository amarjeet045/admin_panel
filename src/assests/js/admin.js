
import {MdcList,showHeaderDefault, drawer} from '../templates/templates';
import {panel} from '../js/panel';
function adminUser(offices){
        showHeaderDefault('admin');
        drawer('admin')
        
    if(offices.length > 1) {
        offices.forEach(function(office){

            document.getElementById('app').appendChild(MdcList(office,'panel'))
        })
        return
    }
    panel(offices[0])
}

export {adminUser}