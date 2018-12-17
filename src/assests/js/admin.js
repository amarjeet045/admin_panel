import {
    officeList,
    showHeaderDefault,
    drawer
} from '../templates/templates';
import {
    panel
} from '../js/panel';
import {
    requestCreator
} from './services'

function adminUser(offices) {
    showHeaderDefault('admin');

        if (offices.length > 1) {
            offices.forEach(function (office) {
                document.getElementById('app').appendChild(officeList(office, 'ADMIN'));
            })
            return
        }

        requestCreator('fetchServerTime', {
            device: '123',
            office: offices[0]
        }).then(function (success) {
            panel(offices[0], 'ADMIN')
        }).catch(function (error) {
            console.log(error)
        })
       

}

export {
    adminUser
}