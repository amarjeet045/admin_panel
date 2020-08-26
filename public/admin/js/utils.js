const getCompanyDetails = (officeId) => {
    let record;
    return new Promise((resolve,reject)=>{
        window.database
        .transaction("activities")
        .objectStore("activities")
        .get(officeId)
        .onsuccess = function (event) {
            record = event.target.result;
            if(record) {
                resolve(record)
            }
            http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${officeId}/`).then(officeActivity => {
                window.database
                .transaction("activities", "readwrite")
                .objectStore("activities")
                .put(officeActivity);
                if(!record) {
                    resolve(officeActivity)
                }
            }).catch(reject)
        }
    })
}

