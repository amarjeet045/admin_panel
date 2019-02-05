const apiHandler = new Worker('assests/js/apiHandler.js')

function requestCreator(requestType, requestBody) {

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

export {
  requestCreator
}