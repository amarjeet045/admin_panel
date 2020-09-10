const getUserList = (props, onSuccess, onError) => {
    const limit = props.query_limit_size;
    const start = props.start;
    const officeId = props.officeId
    let count = 0;
    const records = []
    const tx = window.database.transaction("users");
    let advanced = false
    tx.objectStore("users")
        .index('timestamp')
        .openCursor(null, 'prev')

        .onsuccess = function (event) {
            const cursor = event.target.result;
            if (!cursor) return;
            if (count >= limit) return;
            if (advanced == false && start) {
                advanced = true;
                cursor.advance(start);

            } else {
                count++
                records.push(cursor.value)
                cursor.continue();
            }
        }
    tx.oncomplete = function () {
        if (records.length) {
            window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (e) {
                onSuccess({
                    users: records,
                    totalCheckedinUsers: e.target.result.totalCheckedinUsers,
                    totalSize: e.target.result.totalUsersSize,

                    fresh: false
                })
            }
        }
        getUsersDetails(`${appKeys.getBaseUrl()}/api/office/${officeId}/user?limit=${limit}&start=${start}`).then(response => {
            onSuccess({
                users: response.results,
                totalCheckedinUsers: response.totalCheckedinUsers,
                totalSize: response.size,
                fresh: true
            })
        }).catch(console.error)
    }
}

const getUsersDetails = (url) => {
    return new Promise((resolve, reject) => {


        http('GET', url).then(response => {

            const tx = window.database
                .transaction(["users", "meta"], "readwrite");
            for (let index = 0; index < response.results.length; index++) {
                const result = response.results[index];
                result['search_key'] = result.displayName ? result.displayName.toLowerCase() : null;

                const usersStore = tx.objectStore("users")
                usersStore.put(result)
            }
            const metaStore = tx.objectStore("meta");
            metaStore.get("meta").onsuccess = function (e) {
                const metaData = e.target.result;
                metaData.totalUsersSize = response.size;
                metaData.totalCheckedinUsers = response.totalCheckedinUsers
                metaStore.put(metaData);
            }
            tx.oncomplete = function () {
                resolve(response);
            }
        }).catch(reject);
    })
}


// updateUsersSection(records, e.target.result.totalCheckedinUsers, e.target.result.totalUsersSize)

const updateUsersList = (users, start, fresh) => {
    let freshCount = start;
    const ul = document.getElementById('employees-list');
    users.forEach(user => {
        if (ul.querySelector(`[data-number="${user.phoneNumber}"]`)) {
            ul.querySelector(`[data-number="${user.phoneNumber}"]`).remove();
        }
        const li = createUserli(user);
        if (!fresh) {
            ul.appendChild(li);
        } else {
            ul.insertBefore(li, ul.children[freshCount])
            freshCount++
        }
    })
}

const createUserli = (user) => {
    user.latestCheckIn.location = 'Prachin Mahakali Mandir, Mangalam Place, Sector 3, Rohini, New Delhi, Delhi'
    user.latestCheckIn.timestamp = Date.now();
    const li = createElement('li', {
        className: 'mdc-list-item user-list',
      
    });

    li.dataset.number = user.phoneNumber
    if (user.latestCheckIn.location) {
        li.classList.add('user-list--location')
    }
    li.innerHTML = `<span class="mdc-list-item__ripple"></span>
    <img class='mdc-list-item__graphic' src="${user.photoURL || '../../img/person.png'}">
    <span class="mdc-list-item__text">
      <span class="mdc-list-item__primary-text">${user.displayName || user.phoneNumber}</span>
      <span class="mdc-list-item__secondary-text">${user.latestCheckIn.location || ''}</span>
    </span>
    <span class='mdc-list-item__meta list-time'>${formatCreatedTime(user.latestCheckIn.timestamp)}</span>`

    new mdc.ripple.MDCRipple(li);
    li.addEventListener('click',(ev)=>{
        user.checkins = [{
            location:user.latestCheckIn.location,
            timestamp:user.latestCheckIn.timestamp,
            photoURL:firebase.auth().currentUser.photoURL
        },{
            location:'Rajiv chownk, new delhi',
            timestamp:user.latestCheckIn.timestamp,
        }]
        localStorage.setItem('selected_user',JSON.stringify(user));

        redirect('/admin/employees/checkins');
    })
    return li;
}