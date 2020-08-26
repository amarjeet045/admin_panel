/** initialize IDB and claims validation */


// Prefixes of all IDB implementations.
// Taken from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {
    READ_WRITE: "readwrite"
}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
window.DB_VERSION = 1;
window.database;

window.addEventListener('load', () => {
    firebase.auth().onAuthStateChanged(function (user) {
        // if user is logged out redirect to home page
        if (!user) {
            redirect('/login')
            return
        }
        firebase.auth().currentUser.getIdTokenResult().then(idTokenResult => {
            const claims = idTokenResult.claims;
            if (claims.support) return redirect('/support');
            if (claims.admin && claims.admin.length) return initializeIDB('Puja Capital');
            return redirect('/join');
        })
    });
})

const initializeIDB = (office) => {

    if (!window.indexedDB) {
        // startApplication();
        return
    };

    //TODO add loader 


    const dbName = firebase.auth().currentUser.uid;
    const req = window.indexedDB.open(dbName, DB_VERSION);

    req.onerror = function (event) {
        console.error(event.target.error)
    }
    /** create object stores and initialize IDB Database.
     *   If no prior databse version exist this function will fire before onsuccess
     */
    req.onupgradeneeded = function (event) {
        if (event.oldVersion == 0) {
            buildSchema(this.result,office);
            return
        }
    }
    req.onsuccess = function (event) {
        window.database = this.result;
        initDBErrorHandler();
        startApplication(office);
    }
    req.onblocked = function (event) {
        alert("Close other growthfile opened tabs");
    }
}


/**
 * Build object stores
 * @param {IDBDatabase} db // IDBDatabase interface 
 * @param {string} office 
 */
const buildSchema = (db,office) => {

    const users = db.createObjectStore("users", {
        keyPath: "phoneNumber",
        autoIncrement:true
    });
    users.createIndex("search_key", "search_key")

    const locations = db.createObjectStore("locations", {
        keyPath: "location"
    });
    locations.createIndex("search_key", "search_key");
    const activities = db.createObjectStore("activities", {
        keyPath: "activityId"
    });
    activities.createIndex("timestamp", "timestamp");

    const meta = db.createObjectStore("meta",{keyPath:"meta"});
    // add office to meta object store, to later retrieve it for sending http requests
    // & other stuff
    meta.transaction.oncomplete = function() {
        const tx = db.transaction('meta','readwrite');
        const store = tx.objectStore('meta');
        store.add({
            meta:"meta",
            office,
        })
    }
}

/**
 * Since all error event bubbles up to db, init the error handler for all idb errors
 */
const initDBErrorHandler = () => {
    window.indexedDB.onerror = function (ev) {
        console.error("Database error: " + event.target.error);
    }
}


/**
 * call view init functions based on pathname
 */
const startApplication = (office) => {
    setOfficeId(office).then((officeId)=>{
        const path = window.location.pathname;
        switch(path) {
            case '/admin/':
                loadHomepage(office,officeId);
            break;
            case '/company/':
                loadCompanyPage(office,officeId);
            default:
                loadHomepage();
            break;
        }
    })
}

const setOfficeId = (office) => {
    return new Promise((resolve,reject)=>{

        document.body.dataset.office = office;

        window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (event) {
            const record = event.target.result;
            if(record.officeId) {
                document.body.dataset.officeId = record.officeId
                resolve(record.officeId);
                return
            }
            http('GET',`${appKeys.getBaseUrl()}/api/office?office=${office}`).then(response=>{
                const officeId = response.results[0].officeId;
                document.body.dataset.officeId = officeId
                window.database.transaction("meta","readwrite").objectStore("meta").put({
                    meta:"meta",
                    office,
                    officeId
                });
                resolve(officeId);
            })
        }
    })
}