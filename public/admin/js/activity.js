const init = (office,officeId) => {
    const activityId = new URLSearchParams(window.location.search).get('id');

    if(!activityId) {
        alert("Invalid url");
        return;
    }

    window
    .database
    .transaction("activity")
    .objectStore("activity")
    .get(activityId).onsuccess = function(e) {
        const activity = e.target.result;
        
        updateActivity();
    }

    http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${activityId}/`).then(response => {
        console.log(response)
    })
}