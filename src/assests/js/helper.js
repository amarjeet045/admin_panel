/** Utility file for common use cases */

let fetchCurrentLocation = () => {
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


let getRootRecord = () => {
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

const updateRootRecord = (updatedRecord) => {
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


export {
    getIdToken,
    getRootRecord,
    updateRootRecord,
    fetchCurrentLocation
}