importScripts('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.js')
// Backend API Url
const apiUrl = 'https://us-central1-growthfilev2-0.cloudfunctions.net/api/'

const functionCaller = {
  search: search,
  createOffice: createOffice,
  read: read,
  fetchServerTime: fetchServerTime
}

self.onmessage = function (event) {
  functionCaller[event.data.type](event.data).then(read).catch(console.log)
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
        if (xhr.status > 226) {
          return reject(xhr.response)
        }
        resolve(JSON.parse(xhr.responseText))
      }
    }
    if (method == 'GET') {
      xhr.send(null)
    } else {
      xhr.send(data)
    }
  })
}

function fetchServerTime(data) {
  return new Promise((resolve, reject) => {
    http(
      'GET',
      `${apiUrl}admin/now?deviceId=${data.body.device}`,
      data
    ).then(function (response) {
      console.log(response)
      initializeIDB(data.uid, response.timestamp).then(function (uid) {
        resolve(data);
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
  http(
    'GET',
    `${apiUrl}admin/search?query=${data.body.office}`,
    data.idToken
  ).then(function (response) {
    self.postMessage({
      success: true,
      data: response
    })
  }).catch(function (error) {
    self.postMessage({
      succes: false,
      message: error
    })
  })
}

function createOffice(data) {
  const office = data.office
  http(
    'PUT',
    `${apiUrl}admin/create`,
    data.idToken,
    JSON.stringify(office)
  ).then(function (success) {
    self.postMessage({
      success: true,
      result: office
    })
  }).catch(function (error) {
    self.postMessage({
      succes: false,
      message: error
    })
  })
}

function initializeIDB(uid, serverTime) {
  console.log("init db")
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
      activities.createIndex('list', ['office', 'canEditRule', 'timestamp']);
      activities.createIndex('template', ['office', 'canEditRule', 'template', 'timestamp']);


      const users = db.createObjectStore('users', {
        keyPath: 'phoneNumber'
      })
      users.createIndex('name', 'displayName');
      users.createIndex('updated','updated');
      const templates = db.createObjectStore('templates', {
        keyPath: 'name'
      })
      templates.createIndex('drawer', 'canEditRule');

      const root = db.createObjectStore('root', {
        keyPath: 'uid'
      })
      root.put({
        uid: uid,
        fromTime: 0,
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

function read(data) {
  // self.postMessage(data)
  console.log(data);

  const uid = data.uid
  const req = indexedDB.open(data.uid)

  req.onsuccess = function () {
    const db = req.result
    const rootObjectStore = db.transaction('root', 'readonly').objectStore('root')

    rootObjectStore.get(uid).onsuccess = function (root) {
      http(
          'GET',
          `${apiUrl}admin/read?from=${0}&office=${data.body.office}`,
          data
        )
        .then(function (response) {
          successResponse(response, data);
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }
}

function successResponse(read, data) {
  console.log(read)
  const req = indexedDB.open(data.uid);
  req.onsuccess = function () {
    const db = req.result;
    const transaction = db.transaction(['activities', 'users', 'templates', 'root'], 'readwrite')
    const activityStore = transaction.objectStore('activities');

    read.activities.forEach(function (activity) {
      activityStore.put(activity);
      addUsers(activity, transaction);
    })

    read.templates.forEach(function (template) {
      updateTemplates(template, transaction)
    })

    const rootObjectStore = transaction.objectStore('root');

    rootObjectStore.put({
      fromTime: read.upto,
      uid: data.uid
    });

    transaction.oncomplete = function () {
      createUsersApiRequest(data).then(function() {
        self.postMessage({
          success: true
        });
      }).catch(console.log)
    }
  }

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
          updated:0
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
        string += `%2B${cursor.value.phoneNumber.replace('+','')}&q=`
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

let updateTemplates = (template, transaction) => {
  const templateStore = transaction.objectStore('templates');
  templateStore.put(template);
}

let updateUsers = (result,data) => {
  return new Promise((resolve,reject)=>{

    const req = indexedDB.open(data.uid);
    req.onsuccess = function(){
      const db = req.result;
      const transaction = db.transaction(['users'],'readwrite');
      const userStore = transaction.objectStore('users');
      const updated = userStore.index('updated');
      updated.openCursor(0).onsuccess = function(event){
        const cursor = event.target.result;
        if(!cursor) return;

        const value = result[cursor.value.phoneNumber];
        // rec = result[cursor.value.phoneNumber];
        if(value.displayName && value.photoURL) {
          cursor.value.updated = 1;
          cursor.value.photoURL = value.photoURL;
          cursor.value.displayName = value.displayName;
        }        
        userStore.put(cursor.value);
        cursor.continue();
      }
      transaction.oncomplete = function(){
        resolve(true)
      }
      transaction.onerror = function(){
        reject(transaction.error)
      }
    }
    req.onerror = function(){
      reject(req.error)
    }
  })
}