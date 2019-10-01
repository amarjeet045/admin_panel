export const sortByLatest = (data) => {
    return data.slice(0).sort((a, b) => {
        return b.lastModifiedDate - a.lastModifiedDate
    })
}

export const getLocation = () => {
    return new Promise((resolve, reject) => {

        if (!"geolocation" in navigator) return reject("Your browser doesn't support geolocation")
        navigator.geolocation.getCurrentPosition(function (position) {
            return resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                provider: "HTML5"
            })
        }, function (error) {
            return reject(error)
        })
    })
}
export const getIdToken = () => {
    return new Promise((resolve, reject) => {
        const firebase = require("firebase/app");
        firebase.auth().getIdToken(true).then(resolve).catch(reject);
    })
}
export const http = (method, postData, url) => {
    return new Promise((resolve, reject) => {

        getIdToken().then(function (idToken) {

            fetch(url, {
                method: method,
                body: postData ? JSON.stringify(postData) : null,
                headers: {
                    'Content-type': 'application/json',
                    'idToken': `Bearer ${idToken}`
                }
            }).then(response => {
                return response.json();
            }).then(resolve).catch(reject);
        }).catch(reject);
    })
}