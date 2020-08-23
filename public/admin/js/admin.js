const loadHomepage = (office,officeId) => {
    console.log('home page');
    handleProfileDetails(officeId);
    handleUserDetails(officeId);
};


/**
 * update office details 
 * @param {string} officeId 
 */
const handleProfileDetails = (officeId) => {

    window.database
    .transaction("activities")
    .objectStore("activities")
    .get(officeId)
    .onsuccess = function (event) {
        const record = event.target.result;
        if(record) {
            updateCompanyProfile(record)        
        }

        http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${officeId}/`).then(officeActivity => {
            window.database
            .transaction("activities", "readwrite")
            .objectStore("activities")
            .put(officeActivity);
            updateCompanyProfile(officeActivity)        
        }).catch(console.error)
    }
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
    .getAll()
    .onsuccess = function (event) {
        const records = event.target.result;
        if(records.length) {
            updateUsersSection(records)        
        }

        http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/user?limit=5&start=0`).then(response => {
            for (let index = 0; index < response.results.length; index++) {
                const result = response.results[index];
                result['search_key'] = result.displayName ? result.displayName.toLowerCase() : null;
                window.database
                .transaction("users", "readwrite")
                .objectStore("users")
                .put(result);
            
            }

            updateUsersSection(response.results,response.totalCheckedinUsers,response.size)        
        }).catch(console.error)
    }
}


const updateUsersSection = (users,totalCheckedinUsers,totalSize) => {

    const activeCont = document.getElementById('employees-active-container');
    const ul = document.getElementById('employees-list');
    activeCont.innerHTML = `${totalCheckedinUsers}/${totalSize}`
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
          <span class="mdc-list-item__secondary-text">${user.phoneNumber}</span>
          <span class="mdc-list-item__secondary-text">${user.latestCheckIn.location || ''}</span>
        </span>
        
        <span class='mdc-list-item__meta'>${formatCreatedTime(user.latestCheckIn.timestamp)}</span>`
        new mdc.ripple.MDCRipple(li);
        ul.appendChild(li);
    })


}
const formatCreatedTime = (timestamp) => {
    if (!timestamp) return ''
    return moment(createdTime).calendar(null, {
        sameDay: 'hh:mm A',
        lastDay: '[Yesterday]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastWeek: 'DD/MM/YY',
        sameElse: 'DD/MM/YY'
    })
}