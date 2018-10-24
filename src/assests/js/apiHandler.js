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
    } else {

      functionCaller[event.data.type](event.data.body).then(read).catch(console.log)
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
              reject(JSON.stringify(xhr.response))
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
    `${apiUrl}now?deviceId=${deviceInfo}`
  ).then(function (response) {

    initializeIDB(response.timestamp).then(function () {
      read('now completed')
    })

    if (response.revokeSession) {
      firebase.auth().signOut().then(function () {

      }, function (error) {
        console.log(error)
      })

      return
    }
  }).catch(function (error) {
    console.log(error)
  })
}

function search(searchString) {
  return new Promise(function (resolve, reject) {

    http(
      'GET',
      `${apiUrl}admin/search?query=${searchString}`,

    ).then(function (response) {

      resolve(response)

    }).catch(function (error) {
      reject(error)
    })
  })
}

function createOffice(newOffice) {
  return new Promise(function(resolve,reject){

    http(
      'POST',
      `${apiUrl}admin/create`,
      JSON.stringify(newOffice)
      ).then(function (success) {
        self.postMessage(success)  
      }).catch(function (error) {
        self.postMessage(error)
      })
    })
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
      const activities = db.createObjectStore('activities')
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

function read(response) {
  self.postMessage(response)
  const dbName = firebase.auth().currentUser.uid
  const req = indexedDB.open(dbName)

  req.onsuccess = function () {
    const db = req.result
    const rootObjectStore = db.transaction('root', 'readonly').objectStore('root')

    rootObjectStore.get(dbName).onsuccess = function (root) {
      http(
          'GET',
          `${apiUrl}admin/read?from=${root.target.result.fromTime}`
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
  const activityStore = db.transaction('activities', 'readwrite').objectStore('activities')
  // Object.keys(read.activities).forEach(function(id){
  //   activityStore.add(id)
  // })

  const rootObjectStore = db.transaction('root', 'readwrite').objectStore('root')
  rootObjectStore.get(firebase.auth().currentUser.uid).onsuccess = function (event) {
    const record = event.target.result
    record.fromTime = Date.parse(read.upto)
    rootObjectStore.put(record)
  }
}