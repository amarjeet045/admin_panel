"use strict";

/** callback is used because activity returned by this function needs to update dom 2 times */
var getCompanyDetails = function getCompanyDetails(officeId, onSuccess, onError) {
  window.database.transaction("activities").objectStore("activities").get(officeId).onsuccess = function (event) {
    var record = event.target.result;

    if (record) {
      onSuccess(record);
    }

    http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/activity/").concat(officeId, "/")).then(function (officeActivity) {
      window.database.transaction("activities", "readwrite").objectStore("activities").put(officeActivity);
      onSuccess(officeActivity);
    }).catch(onError);
  };
};

var handleProfileDetails = function handleProfileDetails(officeId) {
  getCompanyDetails(officeId, updateCompanyProfile, console.error);
};

var updateCompanyProfile = function updateCompanyProfile(activity) {
  var companyLogo = document.getElementById('company-logo');
  var companyName = document.getElementById('company-name');
  var companyAddress = document.getElementById('company-address');
  var companyDescription = document.getElementById('company-description');
  var companyCategory = document.getElementById('company-category');

  if (activity.attachment['Company Logo'].value) {
    companyLogo.src = activity.attachment['Company Logo'].value;
  }

  companyName.textContent = activity.attachment['Name'].value;
  companyAddress.textContent = activity.attachment['Registered Office Address'].value;
  companyDescription.textContent = activity.attachment['Description'].value;
  companyCategory.textContent = activity.attachment['Category'] ? activity.attachment['Category'].value : '';
  document.querySelector('.mdc-drawer-app-content').classList.remove('initializing-db');

  if (document.querySelector('.initializing-box')) {
    document.querySelector('.initializing-box').remove();
  }

  if (!officeHasMembership(activity.schedule)) {
    activity.geopoint = {
      latitude: 0,
      longitude: 0
    };
    http('PUT', "".concat(appKeys.getBaseUrl(), "/api/activities/update"), activity).then(function (res) {
      var dialog = new mdc.dialog.MDCDialog(document.getElementById('payment-dialog'));
      dialog.scrimClickAction = "";
      dialog.open();
    });
  }
};

var getUsersDetails = function getUsersDetails(officeId, limit) {
  return new Promise(function (resolve, reject) {
    var url = "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/user");

    if (limit) {
      url = "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/user?limit=").concat(limit, "&start=0");
    }

    http('GET', url).then(function (response) {
      var tx = window.database.transaction(["users", "meta"], "readwrite");

      for (var index = 0; index < response.results.length; index++) {
        var result = response.results[index];
        result['search_key'] = result.displayName ? result.displayName.toLowerCase() : null;
        var usersStore = tx.objectStore("users");
        usersStore.put(result);
      }

      var metaStore = tx.objectStore("meta");

      metaStore.get("meta").onsuccess = function (e) {
        var metaData = e.target.result;
        metaData.totalUsersSize = response.size;
        metaData.totalCheckedinUsers = response.totalCheckedinUsers;
        metaStore.put(metaData);
      };

      tx.oncomplete = function () {
        resolve(response);
      };
    }).catch(reject);
  });
};
/**
 * format string to INR 
 * @param {string} money 
 * @returns {string} 
 */


var formatMoney = function formatMoney(money) {
  var number = Number(money.split(',').join(''));
  return number.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR'
  });
};

var emptyCard = function emptyCard(text) {
  var div = createElement('div', {
    className: 'mdc-card mdc-card--outlined  empty-card'
  });
  div.innerHTML = "<span class='text-cont'>\n    <i class='material-icons'>info</i>\n    ".concat(text, "\n    </span>");
  return div;
};

var openProfileBox = function openProfileBox(event) {
  event.stopPropagation();
  document.querySelector('.user-profile--logo').classList.add('focused');
  var el = document.querySelector('.profile-box');

  if (el.classList.contains('hidden')) {
    el.classList.remove('hidden');
  } else {
    closeProfileBox();
  }

  ;
  var name = firebase.auth().currentUser.displayName;
  var email = firebase.auth().currentUser.email;
  var photo = firebase.auth().currentUser.photoURL;

  if (photo) {
    document.getElementById('auth-image').src = photo;
  }

  document.getElementById('auth-name').textContent = name;
  document.getElementById('auth-email').textContent = email;
};

var closeProfileBox = function closeProfileBox() {
  var el = document.querySelector('.profile-box');
  document.querySelector('.user-profile--logo').classList.remove('focused');
  el.classList.add('hidden');
};

var formSubmittedSuccess = function formSubmittedSuccess(button, text) {
  button.classList.remove('active');
  showSnacksApiResponse(text);
};