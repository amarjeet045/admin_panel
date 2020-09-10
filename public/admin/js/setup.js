/** initialize IDB and claims validation */

// Prefixes of all IDB implementations.
// Taken from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {
    READ_WRITE: "readwrite"
}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
window.DB_VERSION = 2;

window.database;

window.addEventListener('load', () => {
    firebase.auth().onAuthStateChanged(function (user) {
        // if user is logged out redirect to login page
        if (!user) {
            redirect('/login')
            return
        }
        handleDrawerView()
        window.addEventListener('resize', () => {
            handleDrawerView()
        })
        window.mdc.autoInit();
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
    if (document.getElementById('drawer-scrim')) {
        document.getElementById('drawer-scrim').remove();
    };
    if (width < 839) {
        document.querySelector('.mdc-drawer').classList.replace('mdc-drawer--dismissible', 'mdc-drawer--modal');
        document.body.insertBefore(createElement('div', {
            className: 'mdc-drawer-scrim',
            id: 'drawer-scrim'
        }), document.querySelector('.mdc-drawer-app-content'));

        return
    }
    // make drawer dismissible for desktops
    document.querySelector('.mdc-drawer').classList.replace('mdc-drawer--modal', 'mdc-drawer--dismissible');

}

const initializeIDB = (office) => {

    if (!window.indexedDB) {

        // startApplication();
        return
    };

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
            try {
                document.querySelector('.mdc-drawer-app-content').classList.add('initializing-db');
                document.querySelector('.initializing-box').classList.remove('hidden');
            } catch (e) {
                console.log(e)
            }

            buildSchema(this.result, office);
            return
        }
        if (event.oldVersion == 1) {
            const tx = event.currentTarget.transaction;
            const store = tx.objectStore('types');
            store.createIndex("search_key_name", "search_key_name");
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
const buildSchema = (db, office) => {

    // users object store to add users meta data
    const users = db.createObjectStore("users", {
        keyPath: "phoneNumber",
        autoIncrement: true
    });
    users.createIndex("search_key", "search_key")
    users.createIndex("timestamp", "timestamp")
    // locations object store to add locations meta data
    const locations = db.createObjectStore("locations", {
        keyPath: "location"
    });
    locations.createIndex("search_key", "search_key");
    locations.createIndex("timestamp", "timestamp");
    
    // activity object store to add activity
    const activities = db.createObjectStore("activities", {
        keyPath: "activityId"
    });
    activities.createIndex("timestamp", "timestamp");

    const subscriptions = db.createObjectStore("subscriptions", {
        keyPath: "id"
    });
    subscriptions.createIndex("name", "name");

    // types object store to add types meta data (product, department etc)
    const types = db.createObjectStore("types", {
        keyPath: "id"
    })
    types.createIndex("template", "template");
    types.createIndex("timestamp", "timestamp");
    types.createIndex("search_key_name", "search_key_name");

    // meta object store to add meta data for user

    const meta = db.createObjectStore("meta", {
        keyPath: "meta"
    });
    // add office to meta object store, to later retrieve it for sending http requests
    // & other stuff
    meta.transaction.oncomplete = function () {
        const tx = db.transaction('meta', 'readwrite');
        const store = tx.objectStore('meta');
        store.add({
            meta: "meta",
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
    const drawer = new mdc.drawer.MDCDrawer(document.querySelector(".mdc-drawer"))
    const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
    menu.listen('MDCIconButtonToggle:change', function (event) {
        if (drawer.root.classList.contains('mdc-drawer--dismissible')) {
            if (drawer.root.classList.contains('default-open')) {
                drawer.open = false;
                drawer.root.classList.remove('default-open');
                return
            }
        }
        drawer.open = !drawer.open;
    });

    if (firebase.auth().currentUser.photoURL) {
        document.getElementById('user-logo').src = firebase.auth().currentUser.photoURL;
    }
    // get office id
    getOfficeId(office).then(officeId => {
        // get office activity 
        return getOfficeActivity(officeId)
    }).then(officeActivity => {
        document.querySelector('.mdc-drawer-app-content').classList.remove('initializing-db');
        if (document.querySelector('.initializing-box')) {
            document.querySelector('.initializing-box').remove();
        }
    
        // if (!officeHasMembership(officeActivity.schedule)) {
        //     officeActivity.geopoint = {
        //         latitude: 0,
        //         longitude: 0
        //     }
        //     http('PUT', `${appKeys.getBaseUrl()}/api/activities/update`, officeActivity).then(res => {
        //         const dialog = new mdc.dialog.MDCDialog(document.getElementById('payment-dialog'));
        //         const dialogBody = document.getElementById('payment-dialog--body');
        //         dialog.scrimClickAction = "";
                    
        //         if(officeActivity.attachment['First Contact'].value === firebase.auth().currentUser.phoneNumber) {
        //             dialog.open();
        //             return
        //         }
        //         dialogBody.innerHTML  = 'Please ask the business owner to complete the payment';
        //         dialog.open();
        //     });
        // }
        init(office, officeActivity.activityId)
    }).catch(console.error)

    //init drawer & menu for non-desktop devices

}

const getOfficeId = (office) => {
    window.sessionStorage.setItem('office', office)
    return new Promise((resolve, reject) => {
        const officeIdSessionStorage = window.sessionStorage.getItem('officeId')
        if (officeIdSessionStorage) return resolve(window.sessionStorage.getItem('officeId'));

        window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (event) {
            const record = event.target.result;
            if (record.officeId) {
                window.sessionStorage.setItem('officeId', record.officeId)
                resolve(record.officeId);
                return
            }
            http('GET', `${appKeys.getBaseUrl()}/api/office?office=${office}`).then(response => {
                const officeId = response.results[0].officeId;
                window.sessionStorage.setItem('officeId', officeId);
                window.database.transaction("meta", "readwrite").objectStore("meta").put({
                    meta: "meta",
                    office,
                    officeId
                });
                resolve(officeId);
            })
        }
    })
}

const getOfficeActivity = (officeId) => {
    return new Promise((resolve, reject) => {
        getActivity(officeId).then(record => {
            if (record) {
                return resolve(record);
            }
            http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${officeId}/`).then(officeActivity => {
                putActivity(officeActivity).then(resolve)
            }).catch(reject)
        })
    })
}

