
const loadHomepage = (office,officeId) => {
    console.log('home page');
    handleProfileDetails(officeId);
    handleUserDetails(officeId);
    handleLocationsDetails(officeId);
};



const handleProfileDetails = (officeId) => {
    getCompanyDetails(officeId).then(updateCompanyProfile).catch(console.error)
}

const updateCompanyProfile = (activity) => {
    const companyLogo = document.getElementById('company-logo')
    const companyName = document.getElementById('company-name')
    const companyAddress = document.getElementById('company-address')

    companyLogo.textContent = activity.attachment['Company Logo'].value || './empt-user.jpg';
    companyName.textContent = activity.attachment['Name'].value;
    companyAddress.textContent = activity.attachment['Registered Office Address'].value;

}

const handleUserDetails = (officeId) => {
    window.database
    .transaction("users")
    .objectStore("users")
    .getAll(null,5)
    .onsuccess = function (event) {
        const records = event.target.result;
        if(records.length) {
            window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function(e){
                updateUsersSection(records,e.target.result.totalCheckedinUsers,e.target.result.totalUsersSize)        
            }
        }

        http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/user?limit=5&start=0`).then(response => {
            const tx =  window.database
            .transaction(["users","meta"], "readwrite");
            for (let index = 0; index < response.results.length; index++) {
                const result = response.results[index];
                result['search_key'] = result.displayName ? result.displayName.toLowerCase() : null;
            
                const usersStore = tx.objectStore("users")
                usersStore.put(result)
            }
            const metaStore = tx.objectStore("meta");
            metaStore.get("meta").onsuccess = function(e){
                const metaData = e.target.result;
                metaData.totalUsersSize = response.size;
                metaData.totalCheckedinUsers = response.totalCheckedinUsers 
                metaStore.put(metaData);
            }
            tx.oncomplete = function() {
                updateUsersSection(response.results,response.totalCheckedinUsers,response.size)        
            }

        }).catch(console.error)
    }
}


const updateUsersSection = (users,totalCheckedinUsers,totalSize) => {

    const activeCont = document.getElementById('employees-active-container');
    const ul = document.getElementById('employees-list');
    if(totalCheckedinUsers !== undefined && totalSize !== undefined) {
        activeCont.innerHTML = `${totalCheckedinUsers}/${totalSize} `
    }
    ul.innerHTML = ''
    users.forEach(user=>{
        const li = createElement('li',{
            className:'mdc-list-item user-list'
        })
        if(user.latestCheckIn.location) {
            li.classList.add('user-list--location')
        }
        li.innerHTML  = `<span class="mdc-list-item__ripple"></span>
        <img class='mdc-list-item__graphic' src="${user.photoURL || '../img/person.png'}">
        <span class="mdc-list-item__text">
          <span class="mdc-list-item__primary-text">${user.displayName || user.phoneNumber}</span>
          <span class='mdc-list-item__meta list-time'>${formatCreatedTime(user.latestCheckIn.timestamp)}</span>
          <span class="mdc-list-item__secondary-text">${user.phoneNumber}</span>
          <span class="mdc-list-item__secondary-text">${user.latestCheckIn.location || ''}</span>
        </span>`
        
      
        new mdc.ripple.MDCRipple(li);
        ul.appendChild(li);
    })


}



const handleLocationsDetails = (officeId) => {
    window.database
    .transaction("locations")
    .objectStore("locations")
    .getAll(null,5)
    .onsuccess = function (event) {
        const records = event.target.result;
        if(records.length) {
            window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function(e){
                updateLocationsSection(records,e.target.result.totalActiveLocations,e.target.result.totalLocationsSize)        
            }
        }

        http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/location?limit=5&start=0`).then(response => {
            const tx =  window.database
            .transaction(["locations","meta"], "readwrite");
            for (let index = 0; index < response.results.length; index++) {
                const result = response.results[index];
                result['search_key'] = result.location ? result.location.toLowerCase() : null;
            
                const locationStore = tx.objectStore("locations")
                locationStore.put(result)
            }
            const metaStore = tx.objectStore("meta");
            metaStore.get("meta").onsuccess = function(e){
                const metaData = e.target.result;
                metaData.totalLocationsSize = response.size;
                metaData.totalActiveLocations = response.totalActiveLocations 
                metaStore.put(metaData);
            }
            tx.oncomplete = function() {
                updateLocationsSection(response.results,response.totalActiveLocations,response.size)        
            }

        }).catch(console.error)
    }
    
}

const updateLocationsSection = (locations,totalActiveLocations,totalSize) => {
    const activeCont = document.getElementById('locations-active-container');
    const ul = document.getElementById('locations-list');
    if(totalActiveLocations !== undefined && totalSize !== undefined) {
        activeCont.innerHTML = `${totalActiveLocations}/${totalSize} `
    }
    ul.innerHTML = ''
    locations.forEach(location=>{
        const li = createElement('li',{
            className:'mdc-list-item user-list'
        });
        li.innerHTML  = `<span class="mdc-list-item__ripple"></span>
        <span class="mdc-list-item__text">
          <span class="mdc-list-item__primary-text">${location['location']}</span>
          <span class="mdc-list-item__secondary-text">${location['address']}</span>
        </span>
        <span class='mdc-list-item__meta list-time'>${formatCreatedTime(location.timestamp)}</span>`
        
      
        new mdc.ripple.MDCRipple(li);
        ul.appendChild(li);
    })

}


const formatCreatedTime = (timestamp) => {
    if (!timestamp) return ''
    return moment(timestamp).calendar(null, {
        sameDay: 'hh:mm A',
        lastDay: '[Yesterday]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastWeek: 'DD/MM/YY',
        sameElse: 'DD/MM/YY'
    })
}