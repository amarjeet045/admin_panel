const employeeName = document.getElementById('name');
const phonenumber = document.getElementById('phonenumber');
const designation = document.getElementById('designation');
const code = document.getElementById('code');

const form = document.getElementById('manage-form');

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
                updateProductFields(activity)
            }
            http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${formId}/`).then(res => {
                putActivity(res).then(updateProductFields);
            })
        })
    }

    form.addEventListener('submit', (ev) => {
      
        ev.preventDefault();

        var error = iti.getValidationError();
        console.log(iti.isValidNumber())
        console.log(error);
        // if (!phoneNumberField.value) {
        //     setHelperInvalid(phoneNumberField, 'Enter your phone number');
        //     return
        // }
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
        ev.submitter.classList.add('active')

        const requestBody = {
            attachment: {
                'Name': {
                    value: employeeName.value,
                    type: 'string'
                },
                'Phone Number': {
                    value: iti.getNumber(intlTelInputUtils.numberFormat.E164),
                    type: 'string'
                },
                'Designation': {
                    value: designation.value,
                    type: 'string'
                },
                'Employee Code': {
                    value: code.value,
                    type: 'string'
                },
            },
            template: 'employee',
            office: office,
            geopoint: {
                latitude: 0,
                longitude: 0
            },
            share: [],
            schedule: [],
            venue: [],
            activityId: formId
        }

        http(requestParams.method, requestParams.url, requestBody).then(res => {
            let message = 'New employee added';
            if (requestParams.method === 'PUT') {
                message = 'Employee updated'
                putActivity(requestBody).then(function () {
                    handleFormButtonSubmit(ev.submitter, message);
                })
                return
            }
            handleFormButtonSubmit(ev.submitter, message);
        }).catch(err => {
            if (err.message === `employee '${requestBody.attachment.Name.value}' already exists`) {
                setHelperInvalid(new mdc.textField.MDCTextField(document.getElementById('name-field-mdc')), err.message);
                handleFormButtonSubmit(ev.submitter);
                return
            }

            handleFormButtonSubmit(ev.submitter, err.message)
        })
    })
}



const updateEmployeeFields = (activity) => {
    employeeName.value = activity.attachment['Name'].value;
    phonenumber.value = activity.attachment['Phone Number'].value;
    designation.value = activity.attachment['Designation'].value;
    code.value = activity.attachment['Employee Code'].value;
}