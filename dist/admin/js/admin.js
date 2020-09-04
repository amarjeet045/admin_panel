"use strict";

var init = function init(office, officeId) {
  console.log('home page');
  handleProfileDetails(officeId);
  handleUserDetails(officeId);
  handleLocationsDetails(officeId);
};

var handleUserDetails = function handleUserDetails(officeId) {
  window.database.transaction("users").objectStore("users").getAll(null, 5).onsuccess = function (event) {
    var records = event.target.result;

    if (records.length) {
      window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (e) {
        updateUsersSection(records, e.target.result.totalCheckedinUsers, e.target.result.totalUsersSize);
      };
    }

    getUsersDetails(officeId, 5).then(function (response) {
      updateUsersSection(response.results, response.totalCheckedinUsers, response.size);
    }).catch(console.error);
  };
};

var updateUsersSection = function updateUsersSection(users, totalCheckedinUsers, totalSize) {
  var activeCont = document.getElementById('employees-active-container');

  if (totalCheckedinUsers !== undefined && totalSize !== undefined) {
    activeCont.innerHTML = "".concat(totalCheckedinUsers, "/").concat(totalSize, " ");
  }

  var ul = document.getElementById('employees-list');
  ul.innerHTML = '';
  users.forEach(function (user) {
    var li = createElement('li', {
      className: 'mdc-list-item user-list'
    });

    if (user.latestCheckIn.location) {
      li.classList.add('user-list--location');
    }

    li.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n        <img class='mdc-list-item__graphic' src=\"".concat(user.photoURL || '../img/person.png', "\">\n        <span class=\"mdc-list-item__text\">\n          <span class=\"mdc-list-item__primary-text\">").concat(user.displayName || user.phoneNumber, "</span>\n          <span class='mdc-list-item__meta list-time'>").concat(formatCreatedTime(user.latestCheckIn.timestamp), "</span>\n          <span class=\"mdc-list-item__secondary-text\">").concat(user.phoneNumber, "</span>\n          <span class=\"mdc-list-item__secondary-text\">").concat(user.latestCheckIn.location || '', "</span>\n        </span>");
    new mdc.ripple.MDCRipple(li);
    ul.appendChild(li);
  });
};

var handleLocationsDetails = function handleLocationsDetails(officeId) {
  window.database.transaction("locations").objectStore("locations").getAll(null, 5).onsuccess = function (event) {
    var records = event.target.result;

    if (records.length) {
      window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (e) {
        updateLocationsSection(records, e.target.result.totalActiveLocations, e.target.result.totalLocationsSize);
      };
    }

    http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/location?limit=5&start=0")).then(function (response) {
      var tx = window.database.transaction(["locations", "meta"], "readwrite");

      for (var index = 0; index < response.results.length; index++) {
        var result = response.results[index];
        result['search_key'] = result.location ? result.location.toLowerCase() : null;
        var locationStore = tx.objectStore("locations");
        locationStore.put(result);
      }

      var metaStore = tx.objectStore("meta");

      metaStore.get("meta").onsuccess = function (e) {
        var metaData = e.target.result;
        metaData.totalLocationsSize = response.size;
        metaData.totalActiveLocations = response.totalActiveLocations;
        metaStore.put(metaData);
      };

      tx.oncomplete = function () {
        updateLocationsSection(response.results, response.totalActiveLocations, response.size);
      };
    }).catch(console.error);
  };
};

var updateLocationsSection = function updateLocationsSection(locations, totalActiveLocations, totalSize) {
  var activeCont = document.getElementById('locations-active-container');
  var ul = document.getElementById('locations-list');

  if (totalActiveLocations !== undefined && totalSize !== undefined) {
    activeCont.innerHTML = "".concat(totalActiveLocations, "/").concat(totalSize, " ");
  }

  ul.innerHTML = '';
  locations.forEach(function (location) {
    var li = createElement('li', {
      className: 'mdc-list-item user-list'
    });
    li.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n        <span class=\"mdc-list-item__text\">\n          <span class=\"mdc-list-item__primary-text\">".concat(location['location'], "</span>\n          <span class=\"mdc-list-item__secondary-text\">").concat(location['address'], "</span>\n        </span>\n        <span class='mdc-list-item__meta list-time'>").concat(formatCreatedTime(location.timestamp), "</span>");
    new mdc.ripple.MDCRipple(li);
    ul.appendChild(li);
  });
};

var formatCreatedTime = function formatCreatedTime(timestamp) {
  if (!timestamp) return '';
  return moment(timestamp).calendar(null, {
    sameDay: 'hh:mm A',
    lastDay: '[Yesterday]',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastWeek: 'DD/MM/YY',
    sameElse: 'DD/MM/YY'
  });
};