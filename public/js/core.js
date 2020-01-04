window.commonDom = {}
const sortByLatest = (data) => {
     return data.slice(0).sort((a, b) => {
         return b.lastModifiedDate - a.lastModifiedDate;
     })
 }



 const getLocation = () => {
     return new Promise((resolve, reject) => {
         const storedGeopoint = sessionStorage.getItem('geopoint')
         if (storedGeopoint) return resolve(JSON.parse(storedGeopoint))

         if (!"geolocation" in navigator) return reject("Your browser doesn't support geolocation.Please Use A different Browser")

         navigator.geolocation.getCurrentPosition(position => {
             const geopoint = {
                 latitude: position.coords.latitude,
                 longitude: position.coords.longitude,
                 accuracy: position.coords.accuracy,
                 provider: "HTML5"
             }
             sessionStorage.setItem('geopoint', JSON.stringify(geopoint))
             return resolve(geopoint);
         }, error => {
             return reject(error)
         }, {
             enableHighAccuracy: false,
             timeout: 8000,
         })
     })
 }


 const getIdToken = () => {
     return new Promise((resolve, reject) => {
         firebase.auth().currentUser.getIdToken().then(resolve).catch(reject);
     })
 }


 const http = (method, endPoint, postData) => {
     if(commonDom.progressBar) {
         commonDom.progressBar.open();
     }
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
             }).then(resolve)
         }).catch(error => {
            if(commonDom.progressBar) {
                commonDom.progressBar.close();
            }
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
     return Date.now();
     //  return Date.now() + Number(sessionStorage.getItem('serverTime'))
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
     
     const sb = snackBar(text, buttonText);
     sb.open();

 }
 const handleLocationError = (error) => {

     console.log(error)
     let messageString = title = '';

     switch (error.code) {
         case 1:
             title = 'Location permission'
             messageString = 'Growthfile does not have permission to use your location.'
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
     const sb = snackBar(messageString, 'Okay');
     sb.open();


 }

 const removeChildren = (parent) => {
     let childrenNodes = parent.childNodes.length;
     while (childrenNodes--) {
         parent.removeChild(parent.lastChild);
     }
 }


 const getConfirmedActivitiesCount = (activityObject) => {
     let count = 0;
     Object.keys(activityObject).forEach(key => {
         if (activityObject[key].status === 'CONFIRMED') {
             count++
         }
     })
     return count;
 }

 const uploadSheet = (event, template) => {

     event.preventDefault();
     getBinaryFile(event.target.files[0]).then(function (file) {
         console.log(file)
         http('POST', '/admin/bulk', {
             office: history.state.office,
             data: file,
             template: template
         }).then(console.log).catch(function(error){

            showSnacksApiResponse('Try again later');
         })
     })
 }

 const getBinaryFile = (file) => {
     return new Promise(resolve => {
         const fReader = new FileReader();
         fReader.onloadend = function (event) {
             return resolve(event.target.result);
         }
         fReader.readAsBinaryString(file);
     })
 }



 const downloadSample = (template) => {
     http('GET', `/api/action=view-templates&name=${template}`).then(template => {
         createExcelSheet(template);
     }).catch(function () {
         showSnacksApiResponse('Try again later');
     })
 }


 function createExcelSheet(rawTemplate) {
     var wb = XLSX.utils.book_new();
     wb.props = {
         Title: rawTemplate.name,
         Subject: `${rawTemplate.name} sheet`,
         Author: 'Growthfile',
         CreatedDate: new Date()
     }

     const data = [];

     if (rawTemplate.name === 'customer' ||
         rawTemplate.name === 'branch') {
         data.push(['address', 'location'])
     } else {
         const allKeys = Object.keys(template.attachment);

         rawTemplate
             .schedule
             .forEach(function (name) {
                 allKeys.push(name);
             });
         rawTemplate
             .venue
             .forEach(function (venueDescriptor) {
                 allKeys.push(venueDescriptor);
             });

         data.push(allKeys);

     }

     const ws = XLSX.utils.aoa_to_sheet(data);

     console.log(ws)
     XLSX.utils.book_append_sheet(wb, ws, "Sheet");
     XLSX.write(wb, {
         bookType: 'xlsx',
         type: 'binary'
     });
     XLSX.writeFile(wb, template.name + '.xlsx');

 }

 function debounce(func, wait, immeditate) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      var later = function () {
        timeout = null;
        if (!immeditate) func.apply(context, args)
      }
      var callNow = immeditate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  }
  