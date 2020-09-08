const handleUserDetails = (officeId) => {
    window.database
        .transaction("users")
        .objectStore("users")
        .getAll(null, 5)
        .onsuccess = function (event) {
            const records = event.target.result;
            if (records.length) {
                window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (e) {
                    updateUsersSection(records, e.target.result.totalCheckedinUsers, e.target.result.totalUsersSize)

                }
            }
            getUsersDetails(officeId,5).then(response => {
                updateUsersSection(response.results, response.totalCheckedinUsers, response.size)
            }).catch(console.error)
        }
}


const updateUsersSection = (users, totalCheckedinUsers, totalSize) => {

    const activeCont = document.getElementById('employees-active-container');
    if (totalCheckedinUsers !== undefined && totalSize !== undefined) {
        activeCont.innerHTML = `${totalCheckedinUsers}/${totalSize} `
    }
    const ul = document.getElementById('employees-list');
    ul.innerHTML = ''
    users.forEach(user => {
        const li = createElement('li', {
            className: 'mdc-list-item user-list'
        })
        if (user.latestCheckIn.location) {
            li.classList.add('user-list--location')
        }
        li.innerHTML = `<span class="mdc-list-item__ripple"></span>
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

