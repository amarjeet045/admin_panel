importScripts('https://www.gstatic.com/firebasejs/5.0.4/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/5.0.4/firebase-auth.js')
importScripts('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.js')
// Backend API Url
const apiUrl = 'https://us-central1-growthfile-207204.cloudfunctions.net/api/'

/** reinitialize the firebase app */

firebase.initializeApp({
  apiKey: 'AIzaSyA4s7gp7SFid_by1vLVZDmcKbkEcsStBAo',
  authDomain: 'growthfile-207204.firebaseapp.com',
  databaseURL: 'https://growthfile-207204.firebaseio.com',
  projectId: 'growthfile-207204',
  storageBucket: 'growthfile-207204.appspot.com',
  messagingSenderId: '701025551237'
})

const functionCaller = {
  search: search,
  createOffice: createOffice,
  read: read
}

self.onmessage = function (event) {
  firebase.auth().onAuthStateChanged(function (auth) {
    if (event.data.type === 'now') {
      fetchServerTime(event.data.body)
    }
    else if(event.data.type === 'search') {
        search(event.data.body)
    }
    else {

      functionCaller[event.data.type](event.data.body).then(read).catch(function(error){
       
        self.postMessage(error)
      })
    }

  }, function (error) {
    console.log(error)
  })
}

function http(method, url, data) {
  return new Promise(function (resolve, reject) {
    firebase
      .auth()
      .currentUser
      .getIdToken()
      .then(function (idToken) {
        const xhr = new XMLHttpRequest()

        xhr.open(method, url, true)

        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.setRequestHeader('Authorization', `Bearer ${idToken}`)

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status > 226) {
              return reject(xhr.response)
              // return reject(xhr)
            }
            if (!xhr.responseText) return resolve('success')
            resolve(JSON.parse(xhr.responseText))
          }
        }

        xhr.send(data || null)
      }).catch(function (error) {
        console.log(error)
      })
  })
}

function fetchServerTime(deviceInfo) {

  http(
    'GET',
    `${apiUrl}now?deviceId=${deviceInfo.deviceId}`
  ).then(function (response) {

    if (response.revokeSession) {
      firebase.auth().signOut().then(function () {

      }, function (error) {
        console.log(error)
      })

      return
    }
    initializeIDB(response.timestamp).then(function(success){
      self.postMessage({success:true})
    },function(error){
      console.log(error)
    })

  }).catch(function (error) {
    console.log(error)
  })
}

function search(search) {
    http(
      'GET',
      `${apiUrl}admin/search?query=${search.office}`,

    ).then(function (response) {

     self.postMessage({success:true,data:response})

    }).catch(function (error) {
      self.postMessage(error)
    })
  
}

function createOffice(newOffice) {
  const office = newOffice.office
  return new Promise(function(resolve,reject){

    http(
      'PUT',
      `${apiUrl}admin/create`,
      JSON.stringify(newOffice)
      ).then(function (success) {
        
        resolve({
          success:true,
          message:office
        })  
      }).catch(function (error) {
        reject(error)
      })
    })
}

function getProfileOfCreator(activityStore) {
  const creator = activityStore.index('creator')
  let apiUrl;
  let assigneeString = ''
  const defaultReadUserString = `${apiUrl}services/users/read?q=`


  creator.openCursor(null,'unique').onsuccess = function(event){
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
  req.onsuccess = function(){
    const db = req.result
    const userStoreTx = db.transaction('users','readwrite')
    userStoreTx.oncomplete = function(){
      console.log("users store filled")
    }

    const userStore = userStoreTx.objectStore('users')
    Object.keys(result).forEach(function(key){
      const record = {
        mobile : key,
        displayName : result[key].displayName,
        photoUrl : result[key].photoUrl,
        updated : true
      }
      userStore.put(record)
    })
  }
}


function initializeIDB(serverTime) {
  console.log("init db")
  // onAuthStateChanged is added because app is reinitialized
  // let hasFirstView = true
  return new Promise(function (resolve, reject) {
    var auth = firebase.auth().currentUser

    const request = indexedDB.open(auth.uid)

    request.onerror = function (event) {
      reject(event.error)
    }

    request.onupgradeneeded = function () {
      const db = request.result
      
      const activities = db.createObjectStore('activities',{
        keyPath : 'officeId'
      })
      activities.createIndex('creator','creator')
      
      const users = db.createObjectStore('users',{
        keyPath : 'mobile'
      })

      const templates = db.createObjectStore('templates',{
        keyPath:'name'
      })

      const root = db.createObjectStore('root', {
        keyPath: 'uid'
      })

      root.put({
        uid: auth.uid,
        fromTime: 0,
      })
    }

    request.onsuccess = function () {

      const rootTx = request.result.transaction('root', 'readwrite')
      const rootObjectStore = rootTx.objectStore('root')
      rootObjectStore.get(auth.uid).onsuccess = function (event) {
        const record = event.target.result
        record.serverTime = serverTime - Date.now()
        rootObjectStore.put(record)
      }
      rootTx.oncomplete = function () {
        resolve(auth.uid)
      }

    }
  })
}

function read(data) {
  self.postMessage(data)
  const dbName = firebase.auth().currentUser.uid
  const req = indexedDB.open(dbName)

  req.onsuccess = function () {
    const db = req.result
    const rootObjectStore = db.transaction('root', 'readonly').objectStore('root')

    rootObjectStore.get(dbName).onsuccess = function (root) {
      http(
          'GET',
          `${apiUrl}admin/read?from=${root.target.result.fromTime}&office=${data.message}`
        )
        .then(function (response) {

          successResponse(response, db)
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }
}



function successResponse(read, db) {
  console.log(read)
  // const activityStore = db.transaction('activities', 'readwrite').objectStore('activities')
  // const templates = db.transaction('templates','readwrite').objectStore('templates')
  //   read.activities.forEach(function(activity){
  //     activityStore.put(activity)
  //   })

  //   read.templates.forEach(function(template){
  //     templates.put(template)
  //   })

    
    const rootObjectStore = db.transaction('root', 'readwrite').objectStore('root')
    rootObjectStore.get(firebase.auth().currentUser.uid).onsuccess = function (event) {
    const record = event.target.result
    record.fromTime = Date.parse(read.upto)
    rootObjectStore.put(record)
    // getProfileOfCreator(activityStore)
  }
}
