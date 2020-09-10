const init = (office, officeId) => {
    console.log('home page');
    handleProfileDetails(officeId);
    handleLocationsDetails(officeId);
    getUserList({officeId,start:0,query_limit_size:5},updateUsersSection)
};



const updateUsersSection = (response) => {
    const activeCont = document.getElementById('employees-active-container');
    if (response.totalCheckedinUsers !== undefined && response.totalSize !== undefined) {
        activeCont.innerHTML = `${response.totalCheckedinUsers}/${response.totalSize} `
    }
    const ul = document.getElementById('employees-list');
    ul.innerHTML = ''
    response.users.forEach(user=>{
        ul.appendChild(createUserli(user))
    })
}
