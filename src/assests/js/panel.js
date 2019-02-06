import {
    requestCreator
} from './utils';
import {
    MDCRipple
} from '@material/ripple';

export function panel(auth) {
    requestCreator('fetchServerTime', {
        id: '123'
    }).then(function () {
        initButtons(auth);
    }).catch(console.log)
}

const isAdminValid = (auth) => {
    const admin = auth.admin
    if (Array.isArray(admin) && admin.length > 0) {
        return true
    }
    return false;
}

function initButtons(auth) {
    console.log(auth)
    const searchButton = new MDCRipple(document.getElementById('search-office'))
    const createButton = new MDCRipple(document.getElementById('create-office'))
    searchButton['root_'].addEventListener('click', function () {
        if (auth.claims.support) {
            initOfficeSearch()
            return;
        }

        if (isAdminValid(auth.claims)) {
            initOfficeSearch(auth.claims.admin)
            return;
        } else {
            alert("you dont have any office");
        }
    })

    createButton['root_'].addEventListener('click', function () {

    })

}


function initOfficeSearch(adminOffice) {
    const input = document.createElement('input');
    input.id = 'search-office-input'
    input.setAttribute('list', 'offices')
    input.name = 'office-search'
    
    if (adminOffice) {
        const searchList = document.createElement('datalist');
        searchList.id = 'offices'
    
        adminOffice.forEach(function (office) {
            const option = document.createElement('option');
            option.value = office
            searchList.appendChild(option)
        })
        return;
    }

    const searchList = document.createElement('ul');
    input.oninput = function () {
        const value = input.value;
      searchList.innerHTML = '' 
        if (value) {
            requestCreator('search', {
                office: value
            }).then(function (offices) {
                if (offices.length > 0) {
                  offices.forEach(function (office) {
                        const option = document.createElement('li');
                        option.textContent = office
                        searchList.innerHTML += option.outerHTML
                    })
                }
            }).catch(console.log)
        }
    }


    document.getElementById('office-filter-container').appendChild(input);
    document.getElementById('office-filter-container').appendChild(searchList);
}