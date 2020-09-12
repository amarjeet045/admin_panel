var getLocationList = function getLocationList(props, onSuccess, onError) {
  var limit = props.query_limit_size;
  var start = props.start;
  var officeId = props.officeId;
  var count = 0;
  var records = [];
  var advanced = false;
  var tx = window.database.transaction("locations");

  tx.objectStore("locations").index('timestamp').openCursor(null, 'prev').onsuccess = function (event) {
    var cursor = event.target.result;
    if (!cursor) return;
    if (count >= limit) return;

    if (advanced == false && start) {
      advanced = true;
      cursor.advance(start);
    } else {
      count++;
      records.push(cursor.value);
      cursor.continue();
    }
  };

  tx.oncomplete = function () {
    if (records.length) {
      window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (e) {
        onSuccess({
          locations: records,
          totalActiveLocations: e.target.result.totalActiveLocations,
          totalSize: e.target.result.size,
          fresh: false
        });
      };
    }

    getLocationsDetails("".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/location?limit=").concat(limit, "&start=").concat(start)).then(function (response) {
      onSuccess({
        locations: response.results,
        totalActiveLocations: response.totalActiveLocations,
        totalSize: response.size,
        fresh: true
      });
    }).catch(onError);
  };
};

var getLocationsDetails = function getLocationsDetails(url) {
  return new Promise(function (resolve, reject) {
    http('GET', url).then(function (response) {
      var tx = window.database.transaction(["locations", "meta"], "readwrite");

      for (var index = 0; index < response.results.length; index++) {
        var result = response.results[index];

        if (result.location) {
          result['search_key'] = result.location ? result.location.toLowerCase() : null;
          var locationStore = tx.objectStore("locations");
          locationStore.put(result);
        }
      }

      var metaStore = tx.objectStore("meta");

      metaStore.get("meta").onsuccess = function (e) {
        var metaData = e.target.result;
        metaData.totalSize = response.size;
        metaData.totalActiveLocations = response.totalActiveLocations;
        metaStore.put(metaData);
      };

      tx.oncomplete = function () {
        resolve(response);
      };
    }).catch(reject);
  });
}; // updateLocationsSection(records, e.target.result.totalActiveLocations, e.target.result.totalLocationsSize)


var updateLocationList = function updateLocationList(locations, start, fresh) {
  var freshCount = start;
  var ul = document.getElementById('locations-list');
  locations.forEach(function (location) {
    if (ul.querySelector("[data-id=\"".concat(location.id, "\"]"))) {
      ul.querySelector("[data-id=\"".concat(location.id, "\"]")).remove();
    }

    var li = createLocationLi(location);

    if (!fresh) {
      ul.appendChild(li);
    } else {
      ul.insertBefore(li, ul.children[freshCount]);
      freshCount++;
    }
  });
};

var createLocationLi = function createLocationLi(location) {
  var li = createElement('a', {
    className: 'mdc-list-item user-list',
    href: "/admin/duties/?id=".concat(location.id, "&canEdit=").concat(location.canEdit, "&location=").concat(encodeURIComponent(location['location']))
  });
  li.dataset.id = location.id;
  li.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n    <span class=\"mdc-list-item__text\">\n      <span class=\"mdc-list-item__primary-text\">".concat(location['location'], "</span>\n      <span class=\"mdc-list-item__secondary-text\">").concat(location['address'], "</span>\n    </span>\n    <span class='mdc-list-item__meta list-time'>").concat(formatCreatedTime(location.timestamp), "</span>");
  new mdc.ripple.MDCRipple(li);
  return li;
};