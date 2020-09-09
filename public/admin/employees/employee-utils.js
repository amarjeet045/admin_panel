const handleUserDetails = (officeId) => {
    let count = 0;
    const records = []
    const tx = window.database.transaction("users");
    
    tx.objectStore("users")
        .index('timestamp')
        .openCursor(null, 'prev')

        .onsuccess = function (event) {
            const cursor = event.target.result;
            if (!cursor) return;
            if (count >= 5) return;
            count++
            records.push(cursor.value)
            cursor.continue();
        }
    tx.oncomplete = function () {
        if (records.length) {
            window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (e) {
                updateUsersSection(records, e.target.result.totalCheckedinUsers, e.target.result.totalUsersSize)
            }
            getUsersDetails(officeId, 5).then(response => {
                updateUsersSection(response.results, response.totalCheckedinUsers, response.size)
            }).catch(console.error)
        }
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