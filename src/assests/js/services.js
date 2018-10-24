function requestCreator(requestType, requestBody) {

    const apiHandler = new Worker('../src/assests/js/apiHandler.js')
  
    const requestGenerator = {
      type: requestType,
      body: requestBody
    }
    // if(!requestBody) return
    // if(requestType === 'now'){

    // }
    // fetchCurrentLocation().then(function (geopoints) {
    
    //   const dbName = firebase.auth().currentUser.uid
    //   const req = indexedDB.open(dbName)
    //   req.onsuccess = function () {
    //     const db = req.result;
    //     const rootObjectStore = db.transaction('root').objectStore('root')
    //     rootObjectStore.get(dbName).onsuccess = function (event) {

    //       requestBody['timestamp'] = fetchCurrentTime(event.target.result.serverTime)
    //       requestBody['geopoint'] = geopoints
    //       requestGenerator.body = requestBody
    //       // post the requestGenerator object to the apiHandler to perform IDB and api
    //       // operations

    //       apiHandler.postMessage(requestGenerator)
    //     }
    //   }
    // })


    apiHandler.postMessage(requestGenerator)
     
      // handle the response from apiHandler when operation is completed
    return new Promise(function(resolve,reject){

      apiHandler.onmessage = function(event){
        resolve(event)
      }
      apiHandler.onerror = function(error){
        reject(error)
      }
    })
  }
  
  function workerMessage(event){
    
  }
  function onErrorMessage(error){
      console.log(error)
  }
  function fetchCurrentTime(serverTime) {
    return Date.now() + serverTime
  }
  

  function fetchCurrentLocation() {
   
    return new Promise(function (resolve) {
      navigator.geolocation.getCurrentPosition(function (position, error) {
        if (position) {
          geo.latitude = position.coords.latitude
          geo.longitude = position.coords.longitude
  
          resolve({
            'latitude':position.coords.latitude,
            'longitude':position.coords.longitude,
          })
        } else {
          reject(error)
        }
      
      })
    })
  }

  export {requestCreator}