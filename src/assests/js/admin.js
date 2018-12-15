
import {MdcList,showHeaderDefault, drawer} from '../templates/templates';
import {panel} from '../js/panel';
import {requestCreator} from './services'

function adminUser(offices){
        showHeaderDefault('admin');
        drawer('admin');
        
    // if(offices.length > 1) {
    //     offices.forEach(function(office){
    //         document.getElementById('app').appendChild(MdcList(office,'panel'))
    //     })
    //     return
    // }

    // requestCreator('fetchServerTime',{device:'123',office:offices[0]}).then(function(success){
        panel(offices[0],'ADMIN')
    // }).catch(function(error){
    //     console.log(error)
    // })
}

export {adminUser}