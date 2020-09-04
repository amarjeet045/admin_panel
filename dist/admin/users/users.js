"use strict";

var init = function init(office, officeId) {
  var tx = window.database.transaction('users');
  var store = tx.objectStore('users');
  var index = store.index('timestamp');
  var ul = document.getElementById('employees-list');
  ul.innerHTML = '';

  index.openCursor(null, 'prev').onsuccess = function (evt) {
    var cursor = evt.target.result;
    if (!cursor) return;
    var li = createElement('li', {
      className: 'mdc-list-item user-list'
    });

    if (user.latestCheckIn.location) {
      li.classList.add('user-list--location');
    }

    li.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n        <img class='mdc-list-item__graphic' src=\"".concat(cursor.value.photoURL || '../img/person.png', "\">\n        <span class=\"mdc-list-item__text\">\n          <span class=\"mdc-list-item__primary-text\">").concat(cursor.value.displayName || cursor.value.phoneNumber, "</span>\n          <span class='mdc-list-item__meta list-time'>").concat(formatCreatedTime(ursor.value.latestCheckIn.timestamp), "</span>\n          <span class=\"mdc-list-item__secondary-text\">").concat(ursor.value.phoneNumber, "</span>\n          <span class=\"mdc-list-item__secondary-text\">").concat(ursor.value.latestCheckIn.location || '', "</span>\n        </span>");
    new mdc.ripple.MDCRipple(li);
    ul.appendChild(li);
    cursor.continue();
  };

  tx.oncomplete = function () {
    getUsersDetails(officeId).then(function (respsone) {});
  };
};

var updateUserlist = function updateUserlist() {};