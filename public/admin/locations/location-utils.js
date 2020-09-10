const getLocationList = (props, onSuccess, onError) => {
    const limit = props.query_limit_size;
    const start = props.start;
    const officeId = props.officeId
    let count = 0;
    const records = []
    let advanced = false
    const tx = window.database.transaction("locations");
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
                    locations: records,
                    totalActiveLocations: e.target.result.totalActiveLocations,
                    totalSize: e.target.result.size,
                    fresh: false
                })
            }
        }
        getLocationsDetails(`${appKeys.getBaseUrl()}/api/office/${officeId}/location?limit=${limit}&start=${start}`).then(response => {
            onSuccess({
                locations: response.results,
                totalActiveLocations: response.totalActiveLocations,
                totalSize: response.size,
                fresh: true
            })
        }).catch(onError);
    }
}

const getLocationsDetails = (url) => {
    return new Promise((resolve, reject) => {

        http('GET', url).then(response => {
            const tx = window.database
                .transaction(["locations", "meta"], "readwrite");
            for (let index = 0; index < response.results.length; index++) {
                const result = response.results[index];
                result['search_key'] = result.location ? result.location.toLowerCase() : null;

                const locationStore = tx.objectStore("locations")
                locationStore.put(result)
            }
            const metaStore = tx.objectStore("meta");
            metaStore.get("meta").onsuccess = function (e) {
                const metaData = e.target.result;
                metaData.totalSize = response.size;
                metaData.totalActiveLocations = response.totalActiveLocations
                metaStore.put(metaData);
            }
            tx.oncomplete = function () {
                resolve(response)
            }
        }).catch(reject)
    })
}


// updateLocationsSection(records, e.target.result.totalActiveLocations, e.target.result.totalLocationsSize)


const updateLocationList = (locations, start, fresh) => {
    let freshCount = start;
    const ul = document.getElementById('locations-list');
    locations.forEach(location => {
        if (ul.querySelector(`[data-id="${location.id}"]`)) {
            ul.querySelector(`[data-id="${location.id}"]`).remove();
        }
        const li = createLocationLi(location);
        if (!fresh) {
            ul.appendChild(li);
        } else {
            ul.insertBefore(li, ul.children[freshCount])
            freshCount++
        }
    })

}

const createLocationLi = (location) =>{
    const li = createElement('a', {
        className: 'mdc-list-item user-list',
        href:`/admin/locations/duties?id=${location.id}&canEdit=${location.canEdit}&location=${encodeURIComponent(location['location'])}`
    });
    li.dataset.id = location.id
    li.innerHTML = `<span class="mdc-list-item__ripple"></span>
    <span class="mdc-list-item__text">
      <span class="mdc-list-item__primary-text">${location['location']}</span>
      <span class="mdc-list-item__secondary-text">${location['address']}</span>
    </span>
    <span class='mdc-list-item__meta list-time'>${formatCreatedTime(location.timestamp)}</span>`
    new mdc.ripple.MDCRipple(li);
    return li;
}
