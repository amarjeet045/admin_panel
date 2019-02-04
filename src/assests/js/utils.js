/** Utility file for common use cases */
const apiHandler = new Worker('assests/js/apiHandler.js')
export let fetchCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(function (position) {
            resolve({
                'latitude': position.coords.latitude,
                'longitude': position.coords.longitude,
            })
        })
    })
}

let getIdToken = () => {
    return new Promise(function (resolve, reject) {
        firebase
            .auth()
            .currentUser
            .getIdToken()
            .then(function (idToken) {
                resolve(idToken)
                console.log(idToken)
            }).catch(function (error) {
                reject(error)
            })
    })
}


export let getRootRecord = () => {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('growthfile');
        req.onsuccess = function () {
            const db = req.result;
            const tx = db.transaction(['root'], 'readonly');
            const store = tx.objectStore('root');
            let rootRecord;
            store.get(firebase.auth().currentUser.uid).onsuccess = function (event) {
                const record = event.target.result;
                rootRecord = record;
            }
            tx.oncomplete = function () {
                resolve(rootRecord);
            }
            tx.onerror = function () {
                reject(tx.error)
            }
        }
        req.onerror = function () {
            reject(req.error);
        }
    });
}

export const updateRootRecord = (updatedRecord) => {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('growthfile');
        req.onsuccess = function () {
            const db = req.result;
            const tx = db.transaction(['root'], 'readwrite');
            const store = tx.objectStore('root');
            store.put(updatedRecord);
            tx.oncomplete = function () {
                resolve(true)
            }
            tx.onerror = function () {
                reject(tx.error)
            }
        }
        req.onerror = function () {
            reject(req.error)
        }
    })
}




export function requestCreator(requestType, requestBody) {

  const token = utility.getIdToken();
  const location = utility.fetchCurrentLocation();
  const promiseArray = [token,location];
  if(requestType !== 'fetchServerTime') {
    const rootObjectStore = utility.getRootRecord();
    promiseArray.push(rootObjectStore)
  }

  Promise.all(promiseArray).then(function (result) {
    console.log(result);
    
    const idToken = result[0];
    const location = result[1];
    const rootRecord = result[2];
    let timestamp;
    
    requestType === 'fetchServerTime' ? timestamp = Date.now() : fetchCurrentTime(rootRecord.serverTime);
  
    const requestGenerator = {
      type: requestType,
      idToken: `Bearer ${idToken}`,
      uid: firebase.auth().currentUser.uid
    }

    requestBody['timestamp'] = timestamp;
    requestBody['geopoint'] = location;
    requestGenerator['body'] = requestBody;
    apiHandler.postMessage(requestGenerator)

  }).catch(function(error){
    console.log(error)
  })

  // handle the response from apiHandler when operation is completed
  return new Promise(function (resolve, reject) {

    apiHandler.onmessage = function (event) {
      if (event.data.success) {
        resolve(event.data)
      } 
      else {
        const parsedError = JSON.parse(event.data)
        console.log(parsedError)
        reject(parsedError.message)
      }
    }
    apiHandler.onerror = function (error) {
      reject(error)
    }
  })
}

function fetchCurrentTime(serverTime) {
  return Date.now() + serverTime
}


