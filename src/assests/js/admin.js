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
    const selectedOffice = localStorage.getItem('selectedOffice')
    if (selectedOffice) {
        loadSingleOffice(selectedOffice);
        return;
    }

    if (offices.length > 1) {
        offices.forEach(function (office) {
            document.getElementById('app').appendChild(officeList(office, 'ADMIN'));
        })
        return
    }
    loadSingleOffice(offices[0]);
}

const loadSingleOffice = (office) => {
    panel(office, 'ADMIN')
    requestCreator('fetchServerTime', {
        device: '123',
        office: office
    }).then(function (success) {
    }).catch(function (error) {
        console.log(error)
    })
}

export {
    adminUser
}