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
        const drawerList = document.getElementById('template-list');
        template.renderTemplatesInDom(db,user,drawerList);
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



export {panel}
