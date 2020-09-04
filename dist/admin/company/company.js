"use strict";

var init = function init(office, officeId) {
  handleProfileDetails(officeId);
  handleProductList(officeId);
  handleDepartmentList(officeId);
};

var handleProductList = function handleProductList(officeId) {
  window.database.transaction("types").objectStore("types").index("template").getAll("product", 5).onsuccess = function (e) {
    var products = e.target.result;
    showProductList(products);
    http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/type?template=product&limit=5&start=0")).then(function (response) {
      var tx = window.database.transaction("types", "readwrite");
      var store = tx.objectStore("types");
      response.results.forEach(function (result) {
        result.template = 'product';
        store.put(result);
      });

      tx.oncomplete = function () {
        showProductList(response.results);
      };
    });
  };
};

var handleDepartmentList = function handleDepartmentList(officeId) {
  window.database.transaction("types").objectStore("types").index("template").getAll("department", 5).onsuccess = function (e) {
    var products = e.target.result;
    showDepartmentList(products);
    http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/type?template=department&limit=5&start=0")).then(function (response) {
      var tx = window.database.transaction("types", "readwrite");
      var store = tx.objectStore("types");
      response.results.forEach(function (result) {
        result.template = 'department';
        store.put(result);
      });

      tx.oncomplete = function () {
        showDepartmentList(response.results);
      };
    });
  };
};

var showProductList = function showProductList(products) {
  var ul = document.getElementById('products-list');
  ul.innerHTML = '';

  if (!products.length) {
    ul.appendChild(emptyCard('No products found'));
    document.querySelector('.see-all--products').remove();
    return;
  }

  products.forEach(function (product) {
    var li = createElement("li", {
      className: 'mdc-list-item'
    });

    if (product.brand) {
      li.classList.add('product-with--brand');
    }

    li.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n        \n        <span class=\"mdc-list-item__text\">\n            <span class=\"mdc-list-item__primary-text\">".concat(product.name, "</span>\n            <span class=\"mdc-list-item__secondary-text\">").concat(product.brand, "</span>\n        </span>\n        <div class=\"mdc-list-item__meta\">\n            ").concat(product.value ? "<span class='product-value'>".concat(formatMoney(product.value), "</span>") : '', "\n            <a href='../products/manage?id=").concat(product.id, "' class=\"material-icons list-meta--icon\">").concat(product.canEdit ? 'edit' : 'keyboard_arrow_right', "</a>\n        </div>");
    new mdc.ripple.MDCRipple(li);
    ul.appendChild(li);
    ul.appendChild(createElement('li', {
      className: 'mdc-list-divider'
    }));
  });
};

var showDepartmentList = function showDepartmentList(departments) {
  var ul = document.getElementById('departments-list');
  ul.innerHTML = '';

  if (!departments.length) {
    ul.appendChild(emptyCard('No departments found'));
    document.querySelector('.see-all--departments').remove();
    return;
  }

  departments.forEach(function (department) {
    var li = createElement("li", {
      className: 'mdc-list-item'
    });
    li.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n        ".concat(department.name, "\n        ").concat(department.canEdit ? "<span class=\"mdc-list-item__meta material-icons\">edit</span>" : '');
    new mdc.ripple.MDCRipple(li);
    ul.appendChild(li);
    ul.appendChild(createElement('li', {
      className: 'mdc-list-divider'
    }));
  });
};