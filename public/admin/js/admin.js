const init = (office, officeId) => {
    console.log('home page');
    handleProfileDetails(officeId);
    getUserList({
        officeId,
        start: 0,
        query_limit_size: 5
    }, updateUsersSection)
    getLocationList({
        officeId,
        start: 0,
        query_limit_size: 5
    }, updateLocationsSection);
};


const updateUsersSection = (response) => {
    const activeCont = document.getElementById('employees-active-container');
    if (response.totalCheckedinUsers !== undefined && response.totalSize !== undefined) {
        activeCont.innerHTML = `${response.totalCheckedinUsers}/${response.totalSize} `
    }
    const ul = document.getElementById('employees-list');
    ul.innerHTML = ''
    response.users.forEach(user => {
        ul.appendChild(createUserli(user))
    })
}



const updateLocationsSection = (response) => {
    const activeCont = document.getElementById('locations-active-container');
    const ul = document.getElementById('locations-list');
    if (response.totalActiveLocations !== undefined && response.totalSize !== undefined) {
        activeCont.innerHTML = `${response.totalActiveLocations}/${response.totalSize} `
    }
    ul.innerHTML = ''
    response.locations.forEach(location => {
        ul.appendChild(createLocationLi(location))
    })
}