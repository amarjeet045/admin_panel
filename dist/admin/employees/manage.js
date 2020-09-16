var employeeName = document.getElementById('name');
var phonenumber = document.getElementById('phonenumber');
var designation = document.getElementById('designation');
var code = document.getElementById('code');
var supervisorInput = document.getElementById('supervisor');
var supervisorChipSetEl = document.getElementById('supervisor-chipset');
var supervisorMenu = document.getElementById('supervisor-menu');
var form = document.getElementById('manage-form');
var submitBtn = form.querySelector('.form-actionable .mdc-fab--action[type="submit"]');

var init = function init(office, officeId) {
  // check if we have activity id in url. 
  // if activity id is  found, then udpate the form else create
  var formId = getFormId();
  var requestParams = getFormRequestParams();
  var employeePhoneNumberMdc = new mdc.textField.MDCTextField(document.getElementById('phone-field-mdc'));
  var iti = phoneFieldInit(employeePhoneNumberMdc);

  if (formId) {
    document.getElementById('form-heading').innerHTML = 'Update ' + new URLSearchParams(window.location.search).get('name');
    getActivity(formId).then(function (activity) {
      if (activity) {
        updateEmployeeFields(activity);
      }

      http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/activity/").concat(formId, "/")).then(function (res) {
        putActivity(res).then(updateEmployeeFields);
      });
    });
  }

  userAdditionComponent({
    officeId: officeId,
    input: supervisorInput
  });
  supervisorInput.addEventListener('selected', function (ev) {
    var user = ev.detail.user;
    supervisorInput.value = user.employeeName || user.displayName || user.phoneNumber;
    supervisorInput.dataset.number = user.phoneNumber;
  });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var error = iti.getValidationError();

    if (error !== 0) {
      var message = getPhoneFieldErrorMessage(error);
      setHelperInvalid(employeePhoneNumberMdc, message);
      return;
    }

    if (!iti.isValidNumber()) {
      setHelperInvalid(employeePhoneNumberMdc, 'Invalid number. Please check again');
      return;
    }

    ;
    setHelperValid(employeePhoneNumberMdc);
    submitBtn.classList.add('active');
    var activityBody = createActivityBody();
    activityBody.setOffice(office);
    activityBody.setActivityId(formId);
    activityBody.setTemplate('employee');
    activityBody.setAttachment('Name', employeeName.value, 'string');
    activityBody.setAttachment('Phone Number', iti.getNumber(), 'phoneNumber');
    activityBody.setAttachment('Designation', designation.value, 'string');
    activityBody.setAttachment('Employee Code', code.value, 'string');
    activityBody.setAttachment('First Supervisor', supervisorInput.dataset.number, 'phoneNumber');
    var requestBody = activityBody.get();
    http(requestParams.method, requestParams.url, requestBody).then(function (res) {
      var message = 'New employee added';

      if (requestParams.method === 'PUT') {
        message = 'Employee updated';
        putActivity(requestBody).then(function () {
          handleFormButtonSubmitSuccess(submitBtn, message);
        });
        return;
      }

      ;
      handleFormButtonSubmitSuccess(submitBtn, message);
    }).catch(function (err) {
      if (err.message === "employee '".concat(requestBody.attachment.Name.value, "' already exists")) {
        setHelperInvalid(new mdc.textField.MDCTextField(document.getElementById('name-field-mdc')), err.message);
        handleFormButtonSubmit(submitBtn);
        return;
      }

      if (err.message === "No subscription found for the template: 'employee' with the office '".concat(office, "'")) {
        createSubscription(office, 'employee').then(function () {
          form.dispatchEvent(new Event('submit', {
            cancelable: true,
            bubbles: true
          }));
        });
        return;
      }

      handleFormButtonSubmit(submitBtn, err.message);
    });
  });
};

var updateEmployeeFields = function updateEmployeeFields(activity) {
  employeeName.value = activity.attachment['Name'].value;
  phonenumber.value = activity.attachment['Phone Number'].value;
  designation.value = activity.attachment['Designation'].value;
  code.value = activity.attachment['Employee Code'].value;
  var supervisorNumber = activity.attachment['First Supervisor'].value;
  supervisorInput.value = supervisorNumber || '';
  supervisorInput.dataset.number = supervisorNumber;

  if (activity.assignees) {
    activity.assignees.forEach(function (assignee) {
      var chip = createUserChip(assignee);

      if (document.querySelector(".mdc-chip[data-number=\"".concat(assignee.phoneNumber, "\"]"))) {
        document.querySelector(".mdc-chip[data-number=\"".concat(assignee.phoneNumber, "\"]")).remove();
      }

      if (assignee.phoneNumber === supervisorNumber) {
        supervisorInput.value = assignee.displayName;
        document.getElementById('supervisor-chipset').appendChild(chip);
      }
    });
  }
};