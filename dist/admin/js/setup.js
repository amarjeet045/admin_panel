"use strict";

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
window.addEventListener('load', function () {
  firebase.auth().onAuthStateChanged(function (user) {
    // if user is logged out redirect to home page
    if (!user) {
      redirect('/login');
      return;
    }

    handleDrawerView();
    window.addEventListener('resize', function () {
      handleDrawerView();
    });
    window.mdc.autoInit();
    firebase.auth().currentUser.getIdTokenResult().then(function (idTokenResult) {
      var claims = idTokenResult.claims; // if (claims.support) return redirect('/support');

      if (claims.admin && claims.admin.length) return initializeIDB(claims.admin[0]);
      return redirect('/join');
    });
  });
});

var handleDrawerView = function handleDrawerView() {
  var width = document.body.offsetWidth; // if width is less than 839px then make drawer modal drawer 

  if (document.getElementById('drawer-scrim')) {
    document.getElementById('drawer-scrim').remove();
  }

  ;

  if (width < 839) {
    document.querySelector('.mdc-drawer').classList.replace('mdc-drawer--dismissible', 'mdc-drawer--modal');
    document.body.insertBefore(createElement('div', {
      className: 'mdc-drawer-scrim',
      id: 'drawer-scrim'
    }), document.querySelector('.mdc-drawer-app-content'));
    return;
  } // make drawer dismissible for desktops


  document.querySelector('.mdc-drawer').classList.replace('mdc-drawer--modal', 'mdc-drawer--dismissible');
};

var initializeIDB = function initializeIDB(office) {
  if (!window.indexedDB) {
    // startApplication();
    return;
  }

  ; //TODO add loader 

  var dbName = firebase.auth().currentUser.uid;
  var req = window.indexedDB.open(dbName, DB_VERSION);

  req.onerror = function (event) {
    console.error(event.target.error);
  };
  /** create object stores and initialize IDB Database.
   *   If no prior databse version exist this function will fire before onsuccess
   */


  req.onupgradeneeded = function (event) {
    if (event.oldVersion == 0) {
      try {
        document.querySelector('.mdc-drawer-app-content').classList.add('initializing-db');
        document.querySelector('.initializing-box').classList.remove('hidden');
      } catch (e) {
        console.log(e);
      }

      buildSchema(this.result, office);
      return;
    }
  };

  req.onsuccess = function (event) {
    window.database = this.result;
    initDBErrorHandler();
    startApplication(office);
  };

  req.onblocked = function (event) {
    alert("Close other growthfile opened tabs");
  };
};
/**
 * Build object stores
 * @param {IDBDatabase} db // IDBDatabase interface 
 * @param {string} office 
 */


var buildSchema = function buildSchema(db, office) {
  var users = db.createObjectStore("users", {
    keyPath: "phoneNumber",
    autoIncrement: true
  });
  users.createIndex("search_key", "search_key");
  var locations = db.createObjectStore("locations", {
    keyPath: "location"
  });
  locations.createIndex("search_key", "search_key");
  var activities = db.createObjectStore("activities", {
    keyPath: "activityId"
  });
  activities.createIndex("timestamp", "timestamp");
  var types = db.createObjectStore("types", {
    keyPath: "id"
  });
  types.createIndex("template", "template");
  types.createIndex("timestamp", "timestamp");
  var meta = db.createObjectStore("meta", {
    keyPath: "meta"
  }); // add office to meta object store, to later retrieve it for sending http requests
  // & other stuff

  meta.transaction.oncomplete = function () {
    var tx = db.transaction('meta', 'readwrite');
    var store = tx.objectStore('meta');
    store.add({
      meta: "meta",
      office: office
    });
  };
};
/**
 * Since all error event bubbles up to db, init the error handler for all idb errors
 */


var initDBErrorHandler = function initDBErrorHandler() {
  window.indexedDB.onerror = function (ev) {
    console.error("Database error: " + event.target.error);
  };
};
/**
 * call view init functions based on pathname
 */


var startApplication = function startApplication(office) {
  var drawer = new mdc.drawer.MDCDrawer(document.querySelector(".mdc-drawer"));
  var menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'));
  menu.listen('MDCIconButtonToggle:change', function (event) {
    if (drawer.root.classList.contains('mdc-drawer--dismissible')) {
      if (drawer.root.classList.contains('default-open')) {
        drawer.open = false;
        drawer.root.classList.remove('default-open');
        return;
      }
    }

    drawer.open = !drawer.open;
  });

  if (firebase.auth().currentUser.photoURL) {
    document.getElementById('user-logo').src = firebase.auth().currentUser.photoURL;
  }

  setOfficeId(office).then(function (officeId) {
    init(office, officeId);
  }); //init drawer & menu for non-desktop devices
};

var setOfficeId = function setOfficeId(office) {
  return new Promise(function (resolve, reject) {
    window.sessionStorage.setItem('office', office);

    window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (event) {
      var record = event.target.result;

      if (record.officeId) {
        window.sessionStorage.setItem('officeId', record.officeId);
        resolve(record.officeId);
        return;
      }

      http('GET', "".concat(appKeys.getBaseUrl(), "/api/office?office=").concat(office)).then(function (response) {
        var officeId = response.results[0].officeId;
        window.sessionStorage.setItem('officeId', officeId);
        window.database.transaction("meta", "readwrite").objectStore("meta").put({
          meta: "meta",
          office: office,
          officeId: officeId
        });
        resolve(officeId);
      });
    };
  });
};