var productName = document.getElementById('name');
var brand = document.getElementById('brand');
var price = document.getElementById('price');
var description = document.getElementById('description');
var form = document.getElementById('manage-form');

var init = function init(office, officeId) {
  // check if we have activity id in url. 
  // if activity id is  found, then udpate the form else create
  var formId = getFormId();
  var requestParams = getFormRequestParams();

  if (formId) {
    document.getElementById('form-heading').innerHTML = 'Update ' + new URLSearchParams(window.location.search).get('name');
    getActivity(formId).then(function (activity) {
      if (activity) {
        updateProductFields(activity);
      }

      http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/activity/").concat(formId, "/")).then(function (res) {
        putActivity(res).then(updateProductFields);
      });
    });
  }

  form.addEventListener('submit', function (ev) {
    ev.submitter.classList.add('active');
    ev.preventDefault();
    var activityBody = createActivityBody();
    activityBody.setOffice(office);
    activityBody.setActivityId(formId);
    activityBody.setTemplate('product');
    activityBody.setAttachment('Name', productName.value, 'string');
    activityBody.setAttachment('Brand', brand.value, 'string');
    activityBody.setAttachment('Product Description', description.value, 'string');
    activityBody.setAttachment('Unit Value (excluding GST)', price.value, 'string');
    var requestBody = activityBody.get();
    http(requestParams.method, requestParams.url, requestBody).then(function (res) {
      var message = 'New product added';

      if (requestParams.method === 'PUT') {
        message = 'Product updated';
        putActivity(requestBody).then(function () {
          setTimeout(function () {
            history.back();
          }, 1000);
        });
      }

      handleFormButtonSubmit(ev.submitter, message);
    }).catch(function (err) {
      if (err.message === "product '".concat(requestBody.attachment.Name.value, "' already exists")) {
        setHelperInvalid(new mdc.textField.MDCTextField(document.getElementById('name-field-mdc')), err.message);
        handleFormButtonSubmit(ev.submitter);
        return;
      }

      handleFormButtonSubmit(ev.submitter, err.message);
    });
  });
};

var updateProductFields = function updateProductFields(activity) {
  productName.value = activity.attachment['Name'].value;
  brand.value = activity.attachment['Brand'].value;
  price.value = activity.attachment['Unit Value (excluding GST)'].value;
  description.value = activity.attachment['Product Description'].value;
};