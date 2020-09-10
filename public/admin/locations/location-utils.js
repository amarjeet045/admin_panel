const getLocationList = (props, onSuccess, onError) => {
    const limit = props.query_limit_size;
    const start = props.start;
    const officeId = props.officeId
    let count = 0;
    const records = []
    const tx = window.database;
    let advanced = false
    tx.objectStore("locations")
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
                    totalActiveLocations: e.target.result.totalCheckedinUsers,
                    totalLocationsSize: e.target.result.totalUsersSize,
                    fresh: false
                })
            }
        }
        getUsersDetails(`${appKeys.getBaseUrl()}/api/office/${officeId}/location?limit=${limit}&start=${start}`).then(response => {
            onSuccess({
                users: response.results,
                totalActiveLocations: response.totalCheckedinUsers,
                totalLocationsSize: response.size,
                fresh: true
            })
        }).catch(console.error);
    }

}


// updateLocationsSection(records, e.target.result.totalActiveLocations, e.target.result.totalLocationsSize)


const updateLocationsSection = (locations, totalActiveLocations, totalSize) => {
    const activeCont = document.getElementById('locations-active-container');
    const ul = document.getElementById('locations-list');
    if (totalActiveLocations !== undefined && totalSize !== undefined) {
        activeCont.innerHTML = `${totalActiveLocations}/${totalSize} `
    }
    ul.innerHTML = ''
    locations.forEach(location => {
        const li = createElement('li', {
            className: 'mdc-list-item user-list'
        });
        li.innerHTML = `<span class="mdc-list-item__ripple"></span>
        <span class="mdc-list-item__text">
          <span class="mdc-list-item__primary-text">${location['location']}</span>
          <span class="mdc-list-item__secondary-text">${location['address']}</span>
        </span>
        <span class='mdc-list-item__meta list-time'>${formatCreatedTime(location.timestamp)}</span>`


        new mdc.ripple.MDCRipple(li);
        ul.appendChild(li);
    })

}