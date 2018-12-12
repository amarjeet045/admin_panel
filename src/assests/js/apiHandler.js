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
     if(method == 'GET'){
       xhr.send(null)
     }
     else {
       xhr.send(data)
     }
  })
}

function fetchServerTime(data) {
  return new Promise((resolve,reject)=>{

  http(
    'GET',
    `${apiUrl}admin/now?deviceId=${data.body.device}`,
    data
  ).then(function (response) {
    console.log(response)
    initializeIDB(data.uid, response.timestamp).then(function (uid) {
        resolve(data);
      }, function (error) {
        reject({success:false,message:error})
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
        succes:false,
        message:error
      })
    })
}

function getProfileOfCreator(activityStore) {
  const creator = activityStore.index('creator')
  let apiUrl;
  let assigneeString = ''
  const defaultReadUserString = `${apiUrl}services/users/read?q=`


  creator.openCursor(null, 'unique').onsuccess = function (event) {
    const cursor = event.target.result
    if (!cursor) {
      const fullReadUserString = `${defaultReadUserString}${assigneeString}`
      http(
        'GET',
        fullReadUserString,
      ).then(function (result) {
        fillProfileInformationForCreator(result)
      }).catch(function (error) {
        self.postMessage(error)
      })
      return
    }
    const assigneeFormat = `%2B${cursor.key}&q=`
    assigneeString += `${assigneeFormat.replace('+', '')}`
    cursor.continue()
  }

}

function fillProfileInformationForCreator(result) {
  console.log(result)
  const req = indexedDB.open(firebase.auth().currentUser.uid)
  req.onsuccess = function () {
    const db = req.result
    const userStoreTx = db.transaction('users', 'readwrite')
    userStoreTx.oncomplete = function () {
      console.log("users store filled")
    }

    const userStore = userStoreTx.objectStore('users')
    Object.keys(result).forEach(function (key) {
      const record = {
        mobile: key,
        displayName: result[key].displayName,
        photoUrl: result[key].photoUrl,
        updated: true
      }
      userStore.put(record)
    })
  }
}

function initializeIDB(uid, serverTime) {
  console.log("init db")
  // onAuthStateChanged is added because app is reinitialized
  // let hasFirstView = true
  return new Promise(function (resolve, reject) {

    const request = indexedDB.open('growthfile', 1);

    request.onerror = function (event) {
      reject(event.error);
    }

    request.onupgradeneeded = function () {
      const db = request.result

      const activities = db.createObjectStore('activities', {
        keyPath: 'activityId'
      })
      activities.createIndex('list', ['office', 'canEditRule', 'timestamp']);
      activities.createIndex('template',['office','canEditRule','template','timestamp']);

      const users = db.createObjectStore('users', {
        keyPath: 'phoneNumber'
      })

      const templates = db.createObjectStore('templates', {
        keyPath: 'name'
      })

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
  const req = indexedDB.open('growthfile')

  req.onsuccess = function () {
    const db = req.result
    const rootObjectStore = db.transaction('root', 'readonly').objectStore('root')

    rootObjectStore.get(uid).onsuccess = function (root) {
      http(
          'GET',
          `${apiUrl}admin/read?from=${root.target.result.fromTime}&office=${data.body.office}`,
          data
        )
        .then(function (response) {

          successResponse(response, db);

        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }
}



function successResponse(read) {
 
  console.log(read)

  const req = indexedDB.open('growthfile');
  req.onsuccess = function(){
  
    const db = req.result;
    const transaction = db.transaction(['activities','users'],'readwrite')
    const activityStore = transaction.objectStore('activities');
    const userStore = transaction.objectStore('users')
  
    read.activities.forEach(function(activity){
      activityStore.put(activity);
      updateUsers(activity,userStore)
    })
  
    transaction.oncomplete = function(){    
      self.postMessage({success:true})
    }
  }

  function updateUsers(activity,userStore){
    activity.adminsCanEdit.forEach(function(user){
      // userStore.put({phoneNumber:user})
    })
  }


  // const rootObjectStore = db.transaction('root', 'readwrite').objectStore('root')
  // rootObjectStore.get(firebase.auth().currentUser.uid).onsuccess = function (event) {
  //   const record = event.target.result
  //   record.fromTime = Date.parse(read.upto)
  //   rootObjectStore.put(record)
  //   // getProfileOfCreator(activityStore)
  // }
}