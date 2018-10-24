import {openOffice} from '../js/admin';


let MdcList = (listData) => {
    const ul = document.createElement('ul')
    ul.className = 'mdc-list'
    ul.setAttribute('aria-orientation','vertical')

    listData.forEach(function(data){
        const li = document.createElement('li')
        li.className  = 'mdc-list-item mdc-ripple-surface mdc-ripple-surface--primary'
        li.onclick = function(){
            document.getElementById('app').innerHTML = ''
            openOffice(data)
        }
        const span = document.createElement('span')
        span.className = 'mdc-list-item__text'
        span.textContent = data
        li.appendChild(span)
        ul.appendChild(li)
    })
    return ul
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

export {MdcList}