import {MdcList, toggleAppComponents, drawer,showHeaderDefault} from '../templates/templates';
import { MDCList } from '@material/list';

let panel = () => {
    toggleAppComponents(false)
    showHeaderDefault()
    drawer('panel')
    localStorage.setItem('selectedOffice',data)
    document.getElementById('app').innerHTML = ''
    createActivityList()
}

function createActivityList() {
    const req = indexedDB.open(firebase.auth().currentUser.uid)
    let dom =''
    let count = 0
    req.onsuccess = function(){
        const db = req.result;
        const store = db.transaction('activities').objectStore('activities')
        store.openCursor(null,'prev').onsuccess = function(event){
            const cursor = event.target.result
            if(!cursor) {
                appendListToApp(dom)
                return
            }

         activityListUI(cursor.value).then(function(li){
            dom += li
            cursor.continue()   
         })
         
         if(count =0) {
             cursor.continue();
             count++
         }
        }
    }
}

function activityListUI(data) {


const li = document.createElement('li')
li.className  = 'mdc-list-item mdc-ripple-surface mdc-ripple-surface--primary'

const image = document.createElement('img')
image.className = 'mdc-list-item__graphic'
image.src = ''
 const span = document.createElement('span')
 span.className = 'mdc-list-item__text'
 span.textContent = data
  li.appendChild(span)
  return li
}

function appendListToApp(dom) {
    document.getElementById('app').className ='mdc-list mdc-list--two-line mdc-list--avatar-list'
    document.getElementById('app').innerHTML = dom
}

export {panel}
