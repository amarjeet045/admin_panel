const ul = document.getElementById('billers-list')
const query_limit_size = Math.round((document.body.offsetHeight - ul.offsetTop) / 57)

const init = (office, officeId) => {
    let start = 0;
    getBillerList({
        officeId,
        query_limit_size,
        start
    }).then(console.log)
    /** initialize scroll detection */
    // mainContent.addEventListener('scroll', (ev) => {

    //     /** scrolled to bottom query_limit_size is deducted from scroll height to early load the list
    //      *to mitigate the problem of rough transitions at bottom*/

    //     if (ev.currentTarget.offsetHeight + ev.currentTarget.scrollTop >= (ev.currentTarget.scrollHeight - query_limit_size)) {
    //         // to prevent repeated scoll bottom executions
    //         debounce(function () {
    //             start += query_limit_size;
    //             getLocationList({
    //                 officeId,
    //                 query_limit_size,
    //                 start
    //             }, (res) => {
    //                 updateLocationList(res.locations, start, res.fresh)
    //                 // increment start count by query_limit_count each time list is scrolled to bottom.
    //             })
    //         }, 300)
    //     }
    // });

    /** initialzie search */
    // initializeSearch(searchInput, (value) => {
    //     console.log(value);
    //     const query = 'location=' + encodeURIComponent(value);
    //     getLocationsDetails(`${appKeys.getBaseUrl()}/api/office/${officeId}/location?${query}`).then(res => {
    //         ul.innerHTML = '';
    //         res.results.forEach(location => {
    //             ul.appendChild(createLocationLi(location))
    //         })
    //     })
    // }, 1000)
}

const getBillerList = (props, onSuccess, onError) => {
    const limit = props.query_limit_size;
    const start = props.start;
    const officeId = props.officeId
    let count = 0;
    const records = []
    let advanced = false
    const tx = window.database.transaction("billers");
    tx.objectStore('billers')
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
            //  window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (e) {
            //      onSuccess({
            //          locations: records,
            //          totalActiveLocations: e.target.result.totalActiveLocations,
            //          totalSize: e.target.result.size,
            //          fresh: false
            //      })
            //  }
        }
        getBillersDetails(`${appKeys.getBaseUrl()}/api/office/${officeId}/biller?limit=${limit}&start=${start}`).then(response => {
            onSuccess({
                locations: response.results,
                totalActiveLocations: response.totalActiveLocations,
                totalSize: response.size,
                fresh: true
            })
        }).catch(onError);
    }
}


const getBillersDetails = (url) => {
    return new Promise((resolve, reject) => {

        http('GET', url).then(response => {
            const tx = window.database
                .transaction("locations", "readwrite");
            for (let index = 0; index < response.results.length; index++) {
                const result = response.results[index];
                const {
                    address,
                    name
                } = result
                if (result.location) {
                    result['search_key_address'] = address.toLowerCase()
                    result['search_key_name'] = name.toLowerCase()
                    tx
                        .objectStore("billers")
                        .put(result)
                }
            }

            // const metaStore = tx.objectStore("meta");
            // metaStore.get("meta").onsuccess = function (e) {
            //     const metaData = e.target.result;
            //     metaData.totalSize = response.size;
            //     metaData.totalActiveLocations = response.totalActiveLocations
            //     metaStore.put(metaData);
            // }
            // tx.oncomplete = function () {
            resolve(response)
            // }
        }).catch(reject)
    })
}