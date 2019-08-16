importScripts('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.js')
// Backend API Url

const functionCaller = {
  search: search,
  create: create,
  read: read,
  fetchServerTime: fetchServerTime,
  update:update,
  changePhoneNumber:changePhoneNumber
}

self.onmessage = function (event) {
  functionCaller[event.data.type](event.data).then(function (response) {
    self.postMessage({
      success: true,
      message: response
    });
  }).catch(console.log)
}

function http(method, url, data) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url, true)
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Authorization', data.idToken)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (!xhr.status) {
          return reject(xhr);
        }
        if (xhr.status > 226) {
          return reject(xhr.response)
        }
        return resolve(JSON.parse(xhr.responseText))
      }
    }
    if (method == 'GET') {
      xhr.send(null)
    } else {
      xhr.send(JSON.stringify(data.body))
    }
  })
}

function fetchServerTime(data) {
  return new Promise((resolve, reject) => {
   
    let url = `${data.baseUrl}admin/now?deviceId=${data.body.id}`;
    data.claims ? url = url + '&support=true' : ''
  
    http(
      'GET',
      url,
      data
    ).then(function (response) {
      initializeIDB(data.uid, response.timestamp).then(function (uid) {
        resolve(uid);
      }, function (error) {
        reject({
          success: false,
          message: error
        })
      })
    }, function (error) {
      self.postMessage({
        success: false,
        message: error
      })
    })
  })
}

function search(data) {
  return new Promise((resolve, reject) => {

    let url = `${data.baseUrl}admin/search?${data.body.search}`

    data.claims ? url = url + '&support=true' : ''
    http(
      'GET',
      url,
      data
    ).then(function (searchResponse) {
      const URLSearchParam = new URLSearchParams(data.body.search);
      if(URLSearchParam.get('template') === 'recipient') {
        successResponse(searchResponse,data).then(function(){
          resolve(searchResponse)
        }).catch(function(error){
          return resolve(searchResponse)
        })
        return;
      }
      resolve(searchResponse)
    }).catch(function (error) {
      reject(error)
    })
  })
}

function create(data) {
  return new Promise((resolve, reject) => {
    let url = `${data.baseUrl}admin/bulk`
    data.claims ? url = url + '?support=true' : ''

    http(
      'PUT',
      url,
      data
    ).then(function (success) {
      resolve(success)
    }).catch(function (error) {
      reject(error)
    })
  })
}

function update(data){
  return new Promise((resolve, reject) => {
    let url = `${data.baseUrl}admin/update`
    data.claims ? url = url + '?support=true' : ''
    http(
      'POST',
      url,
      data
    ).then(function (success) {
      resolve(success)
    }).catch(function (error) {
      reject(error)
    })
  })
}
function changePhoneNumber(data) {
  return new Promise((resolve,reject) =>{

    let url =  `${data.baseUrl}admin/change-phone-number`
    if(data.claims) {
      url = url+'?support=true'
    }
    http(
      'POST',
      url,
      data
    ).then((response)=>{
      resolve(response)
    }).catch((error)=>{
      reject(error)
    })
  })
}
function initializeIDB(uid, serverTime) {
  // onAuthStateChanged is added because app is reinitialized
  // let hasFirstView = true
  return new Promise(function (resolve, reject) {

    const request = indexedDB.open(uid, 1);

    request.onerror = function (event) {
      reject(event.error);
    }

    request.onupgradeneeded = function () {
      const db = request.result

      const activities = db.createObjectStore('activities', {
        keyPath: 'activityId'
      })
      activities.createIndex('list', ['canEditRule', 'office', 'template']);


      const users = db.createObjectStore('users', {
        keyPath: 'phoneNumber'
      })
      users.createIndex('name', 'displayName');
      users.createIndex('updated', 'updated');
      const templates = db.createObjectStore('templates', {
        autoIncrement: true,

      })
      templates.createIndex('selectTemplate', ['canEditRule', 'office']);
      templates.createIndex('office', 'office');
      templates.createIndex('template', 'name');
      templates.createIndex('selectDetail', ['canEditRule', 'office', 'name']);
      templates.createIndex('officeTemplate', ['office', 'name']);
    
      const root = db.createObjectStore('root', {
        keyPath: 'uid'
      })
      root.put({
        uid: uid,
        fromTime: 0,
        location: {
          latitude: '',
          longitude: '',
          accuracy: '',
          lastLocationTime: '',
          provider: ''
        }
      });

    }

    request.onsuccess = function () {

      const rootTx = request.result.transaction(['root'], 'readwrite')

      const rootObjectStore = rootTx.objectStore('root')
      rootObjectStore.get(uid).onsuccess = function (event) {
        const record = event.target.result
        record.serverTime = serverTime - Date.now()
        rootObjectStore.put(record)
      }

      rootTx.oncomplete = function () {
        resolve(uid)
      }
    }
  })
}

const getFromTime = (data) => {
  return new Promise((resolve, reject) => {
    const uid = data.uid
    const req = indexedDB.open(data.uid)

    req.onsuccess = function () {
      const db = req.result
      const rootObjectStore = db.transaction('root', 'readonly').objectStore('root')

      rootObjectStore.get(uid).onsuccess = function (event) {
        let fromTime;
        const root = event.target.result;
        if (root.hasOwnProperty(data.body.office)) {
          fromTime = root[data.body.office]
          return resolve(fromTime);
        }
        return resolve(0);
      }
    }
  });
}

function read(data) {
  return new Promise((resolve, reject) => {
    getFromTime(data).then(function (fromTime) {
      let url = `${data.baseUrl}admin/read?from=${fromTime}&office=${data.body.office}`
      data.claims ? url = url + '&support=true' : ''

      http(
          'GET',
          url,
          data
        )
        .then(function (response) {
          successResponse(response, data).then(function (response) {
            resolve(response)
          }).catch(function (error) {
            reject(error)
          })
        }).catch(function (error) {
          reject(error);
        })
    })
  })
}

function successResponse(read, data) {
  return new Promise((resolve, reject) => {


    const req = indexedDB.open(data.uid);
    req.onsuccess = function () {
      const db = req.result;
      const transaction = db.transaction(['activities', 'users', 'root'], 'readwrite')
      const activityStore = transaction.objectStore('activities');
      const length = read.activities.length
      for (let index = length; index--;) {
        const activity = read.activities[index];
        activityStore.put(activity);
      }


      const rootObjectStore = transaction.objectStore('root');
      rootObjectStore.get(data.uid).onsuccess = function (event) {
        const record = event.target.result;
        delete record['fromTime'];
        record[data.body.office] = read.upto;
        rootObjectStore.put(record);
      }

      transaction.oncomplete = function () {
        updateTemplates(read.templates, data).then(function () {
          resolve(true);
        }).catch(function (error) {
          reject(error)
        })

      }
      transaction.onerror = function () {
        reject(transaction.error.message);
      }
    }
  });
}

const addUsers = (activity, transaction) => {
  const userStore = transaction.objectStore('users');
  activity.adminsCanEdit.forEach(function (user) {
    userStore.get(user).onsuccess = function (event) {
      const record = event.target.result;
      if (!record) {
        userStore.put({
          phoneNumber: user,
          photoURL: '',
          displayName: '',
          lastSignInTime: '',

        });
      }
    }
  })
}

const createUsersApiRequest = (data) => {
  return new Promise((resolve, reject) => {
    let string = '';
    let baseurl = `${apiUrl}services/users?q=`;
    const req = indexedDB.open(data.uid);
    req.onsuccess = function () {
      const db = req.result;
      const transaction = db.transaction(['users'], 'readwrite');
      const userStore = transaction.objectStore('users');
      userStore.openCursor(null, 'next').onsuccess = function (event) {
        const cursor = event.target.result;
        if (!cursor) return;
        string += `%2B${cursor.value.phoneNumber.replace('+', '')}&q=`
        cursor.continue();
      }

      transaction.oncomplete = function () {
        baseurl = baseurl + string;
        http('GET', baseurl, data).then(function (result) {
          resolve(updateUsers(result, data));
        }).catch(console.log)
      }

      transaction.onerror = function () {
        reject(transaction.error)
      }
    }
    req.onerror = function () {
      reject(req.error)
    }
  })
}

let updateTemplates = (templates, data) => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(data.uid);
    req.onsuccess = function () {
      const db = req.result;
      const deletTransaction = db.transaction(['templates'], 'readwrite');
      const store = deletTransaction.objectStore('templates');
      const index = store.index('officeTemplate');

      templates.forEach(function (template) {
        index.openCursor([data.body.office, template.name]).onsuccess = function (event) {
          const cursor = event.target.result;
          if (cursor) {
            const deleteReq = cursor.delete();
            deleteReq.onsuccess = function () {
            }
            deleteReq.onerror = function () {
            }
          } 
        }
      });
      deletTransaction.oncomplete = function(){
        const addReq = indexedDB.open(data.uid);
        addReq.onsuccess = function(){
          const addDb = addReq.result;
          const addTx = addDb.transaction(['templates'],'readwrite');
          const addStore = addTx.objectStore('templates');
          templates.forEach(function(template){
            template.office = data.body.office
            addStore.put(template)
          })
          addTx.oncomplete = function(){
            resolve(true)
          }
        }
      }
    }
  })
}

let updateUsers = (result, data) => {
  return new Promise((resolve, reject) => {

    const req = indexedDB.open(data.uid);
    req.onsuccess = function () {
      const db = req.result;
      const transaction = db.transaction(['users'], 'readwrite');
      const userStore = transaction.objectStore('users');
      userStore.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;
        if (!cursor) return;

        const value = result[cursor.value.phoneNumber];
        // rec = result[cursor.value.phoneNumber];
        if (value.displayName && value.photoURL) {
          cursor.value.photoURL = value.photoURL;
          cursor.value.displayName = value.displayName;
        }
        userStore.put(cursor.value);
        cursor.continue();
      }
      transaction.oncomplete = function () {
        resolve(true)
      }
      transaction.onerror = function () {
        reject(transaction.error)
      }
    }
    req.onerror = function () {
      reject(req.error)
    }
  })
}