 const sortByLatest = (data) => {
     return data.slice(0).sort((a, b) => {
         return b.lastModifiedDate - a.lastModifiedDate;
     })
 }



 const getLocation = () => {
     return new Promise((resolve, reject) => {
         const storedGeopoint = sessionStorage.getItem('geopoint')
         if(storedGeopoint) {
             return resolve(JSON.parse(storedGeopoint))
         }
         
         if (!"geolocation" in navigator) return reject("Your browser doesn't support geolocation")
         navigator.geolocation.getCurrentPosition(function (position) {
             const geopoint = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                provider: "HTML5"
            }
             sessionStorage.setItem('geopoint',JSON.stringify(geopoint))
             return resolve(geopoint);
         }, function (error) {
             return reject(error)
         },{
             enableHighAccuracy:false,
             timeout:8000,
         })
     })
 }


 const getIdToken = () => {
     return new Promise((resolve, reject) => {
         firebase.auth().currentUser.getIdToken().then(resolve).catch(reject);
     })
 }


 const http = (method, endPoint, postData) => {
     commonDom.progressBar.open();
     return new Promise((resolve, reject) => {
         getIdToken().then(idToken => {
             fetch(appKeys.getBaseUrl() + endPoint, {
                 method: method,
                 body: postData ? createPostData(postData) : null,
                 headers: {
                     'Content-type': 'application/json',
                     'Authorization': `Bearer ${idToken}`
                 }
             }).then(response => {
                 return response.json();
             }).then(response => {
                 commonDom.progressBar.close();
                 if (response.hasOwnProperty('success') && !response.success) {
                     return reject(response)
                 }
                 return resolve(response)
             })
         }).catch(error => {
             commonDom.progressBar.close();
             return reject(error)
         })
     })

 }


 const createPostData = (postData) => {
     console.log(postData)
     postData.timestamp = offsetTime();
     return JSON.stringify(postData);

 }


 const offsetTime = () => {
     return Date.now() + Number(sessionStorage.getItem('serverTime'))
 }

 const signOut = (topAppBar, drawer) => {
     firebase.auth().signOut().then(function () {
         if (topAppBar && drawer) {
             document.getElementById('app').classList.remove('mdc-top-app-bar--fixed-adjust')
             drawer.root_.classList.add('mdc-drawer--modal');
             hideTopAppBar(topAppBar)
             drawer.root_.classList.add("hidden")
             drawer.open = false;
             closeProfile();
         }
     }).catch(console.log)
 }

 const redirect = (pathname) => {
     window.location = window.location.origin + pathname;
 }

 const showSnacksApiResponse = (text, buttonText = 'Okay') => {
     const el = document.getElementById('snackbar-container')
     el.innerHTML = '';
     const sb = snackBar(text, buttonText);
     const snackBarInit = new mdc.snackBar.MDCSnackBar(sb);
     el.appendChild(sb);
     snackBarInit.open();

 }
 const handleLocationError = (error) => {

     console.log(error)
     let messageString = title = '';

     switch (error.code) {
         case 1:
             title = 'Location permission'
             messageString = 'You have disabled Location . Growthfile requires location access for activity management'
             break;
         case 2:
             title = 'Location failure'
             messageString = 'Failed to detect your location. Please try again or refresh your browser'
             break;
         case 3:
             title = 'Location failure',
             messageString = 'Failed to detect your location. Please try again or refresh your browser'
             break;
         default:
             break;
     }
     locationDialog = alertDialog(title,`<h3 class='mdc-typography--headline5'>${messageString}</h3>`);
     locationDialog.open();
 }