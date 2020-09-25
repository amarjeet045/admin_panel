var formHeading = document.getElementById('form-heading');
var ul = document.getElementById('checkins-list');
var trackLocation = document.getElementById('track-live-location');
var editIcon = document.getElementById('edit-employee');

var init = function init(office, officeId) {
  var user = JSON.parse(localStorage.getItem('selected_user'));

  if (user.employeeId) {
    editIcon.href = "./manage.html?id=".concat(user.employeeId, "&name=").concat(user.employeeName || user.displayName || user.phoneNumber);
    editIcon.classList.remove('hidden');
  }

  if (!user.phoneNumber) {
    window.alert("No user found");
    return;
  }

  formHeading.textContent = user.employeeName || user.phoneNumber;

  window.database.transaction("users").objectStore("users").get(user.phoneNumber).onsuccess = function (event) {
    var record = event.target.result;
    var checkins = record.checkins || []; // sort checkins by timestamp in descinding order

    var sorted = checkins.sort(function (a, b) {
      return b.timestamp - a.timestamp;
    });
    updateCheckinList(sorted);
    http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/user?phoneNumber=").concat(encodeURIComponent(user.phoneNumber))).then(function (res) {
      window.database.transaction("users", 'readwrite').objectStore("users").put(res.results[0]);
      var userCheckins = res.results[0].checkins || [];
      updateCheckinList(userCheckins.sort(function (a, b) {
        return b.timestamp - a.timestamp;
      }));
    });
  };
};

var updateCheckinList = function updateCheckinList(checkins) {
  if (!checkins.length) {
    ul.appendChild(emptyCard('No checkins found'));
    return;
  }

  document.querySelector('.track-flex').classList.remove('hidden');
  var length = checkins.length;
  var origin = checkins[0].location;
  var destination = checkins[length - 1].location;
  var googleWayPointsUrl = new URLSearchParams("?api=1&origin=".concat(origin, "&destination=").concat(destination, "&"));
  ul.innerHTML = '';
  checkins.forEach(function (checkin, index) {
    ul.appendChild(checkinLi(checkin));
    ul.appendChild(createElement('li', {
      className: 'mdc-list-divider'
    }));

    if (index && index != length - 1) {
      googleWayPointsUrl.append('waypooints', checkin.location + encodeURIComponent('|'));
    }
  });
  trackLocation.href = "https://www.google.com/maps/dir/?".concat(googleWayPointsUrl.toString());
};

var checkinLi = function checkinLi(checkin) {
  var a = createElement('a', {
    className: 'mdc-list-item checkin-list',
    href: "https://www.google.com/maps/search/?api=1&query=".concat(checkin.location),
    target: '_blank'
  });
  a.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n    <span class=\"mdc-list-item__text\">\n      <a class=\"mdc-list-item__primary-text\" href=\"".concat(checkin.photoURL ? checkin.photoURL : "https://www.google.com/maps/search/?api=1&query=".concat(checkin.location), "\" target=\"_blank\" >").concat(checkin.photoURL ? 'Uploaded photo' : 'Checked-in', "</a>\n      <span class=\"mdc-list-item__secondary-text\">").concat(checkin.location, "</span>\n    </span>\n    <span class='mdc-list-item__meta list-time'>").concat(formatCreatedTime(checkin.timestamp), "</span>");
  new mdc.ripple.MDCRipple(a);
  return a;
};