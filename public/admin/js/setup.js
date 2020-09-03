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
        handleDrawerView()
        window.addEventListener('resize',()=>{
            handleDrawerView()
        })
        firebase.auth().currentUser.getIdTokenResult().then(idTokenResult => {
            const claims = idTokenResult.claims;
            // if (claims.support) return redirect('/support');
            if (claims.admin && claims.admin.length) return initializeIDB('Puja Capital');
            return redirect('/join');
        })
    });
})

const handleDrawerView = () => {
    const width = document.body.offsetWidth
    // if width is less than 839px then make drawer modal drawer 
    if(document.getElementById('drawer-scrim')) {
        document.getElementById('drawer-scrim').remove();
    }
    if (width < 839) {
        document.querySelector('.mdc-drawer').classList.replace('mdc-drawer--dismissible','mdc-drawer--modal');
        document.body.insertBefore(createElement('div',{
            className:'mdc-drawer-scrim',
            id:'drawer-scrim'
        }), document.querySelector('.mdc-drawer-app-content'));

        return
    }
    // make drawer dismissible for desktops
    document.querySelector('.mdc-drawer').classList.replace('mdc-drawer--modal','mdc-drawer--dismissible');
    
}

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

    const types = db.createObjectStore("types",{
        keyPath:"id"
    })
    types.createIndex("template","template");
    types.createIndex("timestamp","timestamp");

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

        init(office,officeId);
    });
      //init drawer & menu for non-desktop devices
  const drawer = new mdc.drawer.MDCDrawer(document.querySelector(".mdc-drawer"))
  const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
  menu.listen('MDCIconButtonToggle:change', function (event) {
    drawer.open = !drawer.open;
  });
  
}

const setOfficeId = (office) => {
    return new Promise((resolve,reject)=>{

        window.sessionStorage.setItem('office',office) 

        window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (event) {
            const record = event.target.result;
            if(record.officeId) {
                window.sessionStorage.setItem('officeId',record.officeId) 
                resolve(record.officeId);
                return
            }
            http('GET',`${appKeys.getBaseUrl()}/api/office?office=${office}`).then(response=>{
                const officeId = response.results[0].officeId;
                window.sessionStorage.setItem('officeId',officeId); 
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


