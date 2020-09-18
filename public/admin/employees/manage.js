const employeeName = document.getElementById('name');
const phonenumber = document.getElementById('phonenumber');
const designation = document.getElementById('designation');
const code = document.getElementById('code');

const supervisorInput = document.getElementById('supervisor');
const supervisorChipSetEl = document.getElementById('supervisor-chipset');
const supervisorMenu = document.getElementById('supervisor-menu');

const form = document.getElementById('manage-form');
const submitBtn = form.querySelector('.form-actionable .mdc-fab--action[type="submit"]')

const init = (office, officeId) => {
    // check if we have activity id in url. 
    // if activity id is  found, then udpate the form else create
    const formId = getFormId();
    const requestParams = getFormRequestParams();
    const employeePhoneNumberMdc = new mdc.textField.MDCTextField(document.getElementById('phone-field-mdc'))
    const iti = phoneFieldInit(employeePhoneNumberMdc);


    if (formId) {
        document.getElementById('form-heading').innerHTML = 'Update ' + new URLSearchParams(window.location.search).get('name')
        getActivity(formId).then(activity => {
            if (activity) {
                updateEmployeeFields(activity)
            }
            http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${formId}/`).then(res => {
                putActivity(res).then(updateEmployeeFields);
            })
        })
    }

    userAdditionComponent({
        officeId,
        input: supervisorInput
    });
    supervisorInput.addEventListener('selected', (ev) => {
        const user = ev.detail.user;
        supervisorInput.value = user.employeeName || user.displayName ||  user.phoneNumber;
        supervisorInput.dataset.number = user.phoneNumber;
    })
  

    form.addEventListener('submit', (ev) => {

        ev.preventDefault();

        var error = iti.getValidationError();

        if (error !== 0) {
            const message = getPhoneFieldErrorMessage(error);
            setHelperInvalid(employeePhoneNumberMdc, message);
            return
        }
        if (!iti.isValidNumber()) {
            setHelperInvalid(employeePhoneNumberMdc, 'Invalid number. Please check again');
            return;
        };

        setHelperValid(employeePhoneNumberMdc);
        submitBtn.classList.add('active')

        
        const activityBody = new Employee(office);
        activityBody.activityId =  formId;        
        activityBody.name = employeeName.value;
        activityBody.phoneNumber = iti.getNumber();
        activityBody.designation = designation.value;
        activityBody.employeeCode = code.value;
        activityBody.supervisor = supervisorInput.dataset.number;
    
        const requestBody = activityBody.create;

        http(requestParams.method, requestParams.url, requestBody).then(res => {
            let message = 'New employee added';
            if (requestParams.method === 'PUT') {
                message = 'Employee updated';
                putActivity(requestBody).then(function () {
                    handleFormButtonSubmitSuccess(submitBtn, message);
                })
                return
            };
           
            handleFormButtonSubmitSuccess(submitBtn, message);
        }).catch(err => {
            if (err.message === `employee '${requestBody.attachment.Name.value}' already exists`) {
                setHelperInvalid(new mdc.textField.MDCTextField(document.getElementById('name-field-mdc')), err.message);
                handleFormButtonSubmit(submitBtn);
                return
            }
            if (err.message === `No subscription found for the template: 'employee' with the office '${office}'`) {
                createSubscription(office, 'employee').then(() => {
                    form.dispatchEvent(new Event('submit',{
                        cancelable:true,
                        bubbles:true
                    }))
                })
                return
            }
            handleFormButtonSubmit(submitBtn, err.message)
        })
    })
}

const updateEmployeeFields = (activity) => {
    employeeName.value = activity.attachment['Name'].value;
    phonenumber.value = activity.attachment['Phone Number'].value;
    designation.value = activity.attachment['Designation'].value;
    code.value = activity.attachment['Employee Code'].value;

    const supervisorNumber = activity.attachment['First Supervisor'].value;

    supervisorInput.value = supervisorNumber || '';
    supervisorInput.dataset.number = supervisorNumber;
    
    if(activity.assignees) {
        activity.assignees.forEach(assignee => {
            const chip = createUserChip(assignee);
            if (document.querySelector(`.mdc-chip[data-number="${assignee.phoneNumber}"]`)) {
                document.querySelector(`.mdc-chip[data-number="${assignee.phoneNumber}"]`).remove()
            }
            if (assignee.phoneNumber === supervisorNumber) {
                supervisorInput.value = assignee.displayName
                document.getElementById('supervisor-chipset').appendChild(chip);
            }
        })
    }
}