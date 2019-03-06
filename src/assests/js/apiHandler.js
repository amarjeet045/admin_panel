importScripts('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.js')
// Backend API Url
const apiUrl = 'https://us-central1-growthfilev2-0.cloudfunctions.net/api/'

const functionCaller = {
  search: search,
  create: create,
  read: read,
  fetchServerTime: fetchServerTime,
  validateFile:validateFile
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
        if (xhr.status > 226) {
          return reject(xhr.response)
        }
        resolve(JSON.parse(xhr.responseText))
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
    http(
      'GET',
      `${apiUrl}admin/now?deviceId=${data.body.id}`,
      data
    ).then(function (response) {
      console.log(response)
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
    http(
      'GET',
      `${apiUrl}admin/search?query=${data.body.office}`,
      data
    ).then(function (response) {
      console.log(response)
      resolve(response)
    }).catch(function (error) {
      reject(error)
    })
  })
}

function create(data) {
  http(
    'PUT',
    `${apiUrl}admin/bulk`,
    data
  ).then(function (success) {
    resolve(success)
  }).catch(function (error) {
    reject(error)
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
      activities.createIndex('list', ['canEditRule', 'office', 'template']);


      const users = db.createObjectStore('users', {
        keyPath: 'phoneNumber'
      })
      users.createIndex('name', 'displayName');
      users.createIndex('updated', 'updated');
      const templates = db.createObjectStore('templates', {
       autoIncrement:true,
     
      })
      templates.createIndex('selectTemplate', ['canEditRule', 'office']);
      templates.createIndex('office', 'office');
      templates.createIndex('template','name');
      templates.createIndex('selectDetail',['canEditRule','office','name']);

      // const officeValidation = db.createObjectStore('officeValidation',{
      //   autoIncrement:true
      // })
      // officeValidation.createIndex('name','Name',{unique:true});
      // officeValidation.createIndex('FirstContact','FirstContact');
      // officeValidation.createIndex('SecondContact','SecondContact');
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
  console.log(data);
  return new Promise((resolve,reject) => {
    getFromTime(data).then(function(fromTime){
      http(
        'GET',
        `${apiUrl}admin/read?from=${fromTime}&office=${data.body.office}`,
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


    console.log(read)
    const req = indexedDB.open(data.uid);
    req.onsuccess = function () {
      const db = req.result;
      const transaction = db.transaction(['activities', 'users', 'templates', 'root'], 'readwrite')
      const activityStore = transaction.objectStore('activities');
      const length = read.activities.length
      for (let index = length; index--;) {
        const activity = read.activities[index];
        activityStore.put(activity);
      }
      // read.activities.forEach(function (activity) {
      //   activityStore.put(activity);
      //   // addUsers(activity, transaction);
      // })

      updateTemplates(read.templates, transaction, data)

      const rootObjectStore = transaction.objectStore('root');
      rootObjectStore.get(data.uid).onsuccess = function (event) {
        const record = event.target.result;
        delete record['fromTime'];
        record[data.body.office] = read.upto;
        rootObjectStore.put(record);
      }

      transaction.oncomplete = function () {
        // createUsersApiRequest(data).then(function () {
          resolve(true);
        // }).catch(console.log)
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

let updateTemplates = (templates, transaction, data) => {

  const store = transaction.objectStore('templates');
  const index = store.index('template');
  const sizeReq = store.count();
  sizeReq.onsuccess = function () {
    const count = sizeReq.result;
    templates.forEach(function (template) {
      if (!count) {
        template.office = data.body.office
        store.put(template);
      } else {
        
        index.openCursor(template.name).onsuccess = function (event) {
          const cursor = event.target.result;
          if (!cursor) return;
          
          if(cursor.value.office === data.body.office) {  
              console.log('template for office found')
              const updatedData = template;
              updatedData.office = data.body.office;
              const updateReq = cursor.update(updatedData)
              updateReq.onsuccess = function () {
                console.log('updated ' + cursor.value.name + 'in template store');
              }
            }
            else {
              console.log('Add new template for new office')
              template.office = data.body.office
              store.put(template);
            }
          cursor.continue();
        }
      }
    })
  }
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

function validateFile(data) {
const office = data.office;
const template = data.template;
const body = data.body;
const length = body.length;
for (let index = 0; index < length; index++) {
  const val = body[index];
  if(!val.Name) {
    
  }
}
}