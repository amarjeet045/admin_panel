import {MdcList, toggleAppComponents, drawer,showHeaderDefault} from '../templates/templates';
import { MDCList } from '@material/list';
import * as template from '../templates/templates';
import { request } from 'https';
let panel = (office,user) => {

    localStorage.setItem('selectedOffice',office)
    document.getElementById('app').innerHTML = ''
    createActivityList(office,user)

    console.log(office);
}

function createActivityList(office,user) {
  const dbName = firebase.auth().currentUser.uid
   const req = indexedDB.open(dbName,1)
   req.onsuccess = function(){
       const db = req.result;
       const transaction = db.transaction(['activities']);
       const store = transaction.objectStore('activities');
       const index = store.index('list');
       const query = IDBKeyRange.bound([office,user,0],[office,user,new Date().getTime()]); 
       const results = []
       index.openCursor(query,'prev').onsuccess = function(event){
           const cursor = event.target.result;
           if(!cursor) return;
           results.push(cursor.value)
           cursor.continue();   
       }
       transaction.oncomplete = function(){
          renderDrawerWithTemplates(db,user);
          convertResultsToList(db,results)
       }
   }
}

function convertResultsToList(db, results) {
  
  let activityDom = ''
    let promiseMap = results.map(function (data) {
      return template.createActivityList(db, data).then(function (li) {
        return li.outerHTML
      })
    });
    
    Promise.all(promiseMap).then(function (results) {
      results.forEach(function (li) {
        activityDom += li
      })
      document.getElementById('app').innerHTML = activityDom
  })

}

let renderDrawerWithTemplates = (db,user) => {
const transaction = db.transaction(["templates"]);
const templatesStore = transaction.objectStore('templates')
const index = templatesStore.index('drawer');
const drawerList = document.getElementById('template-list');

index.openCursor(user).onsuccess = function(event){
  const cursor = event.target.result;
  if(!cursor) return;  
  drawerList.appendChild(createDrawerLi(cursor.value.name))
  cursor.continue()
  }
}

let createDrawerLi = (name) =>{
  const a = document.createElement('a')
  a.className = 'mdc-list-item'
  a.href = '#'
  a.tabIndex = 0;
  a.setAttribute('aria-selected',true);
  a.textContent = name;
  return a;
}
export {panel}
