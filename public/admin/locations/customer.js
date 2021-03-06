const customerName = document.getElementById('name');
const primaryPhoneNumber = document.getElementById('primary-phonenumber');
const secondaryPhoneNumber = document.getElementById('secondary-phonenumber');
const address = document.getElementById('address');
const form = document.getElementById('manage-form');
const submitBtn = form.querySelector('.form-actionable .mdc-fab--action[type="submit"]')




const init = (office, officeId) => {
    // check if we have activity id in url. 
    // if activity id is  found, then udpate the form else create
    const formId = getFormId();
    const requestParams = getFormRequestParams();

    const primaryPhoneNumberMdc = new mdc.textField.MDCTextField(document.getElementById('phone-field-mdc-primary'))
    const secondaryPhoneNumberMdc = new mdc.textField.MDCTextField(document.getElementById('phone-field-mdc-secondary'))

    const primaryIti = phoneFieldInit(primaryPhoneNumberMdc);
    const secondaryIti = phoneFieldInit(secondaryPhoneNumberMdc);


    if (formId) {
        document.getElementById('form-heading').innerHTML = 'Update ' + new URLSearchParams(window.location.search).get('name')
        getActivity(formId).then(activity => {
            if (activity) {
                updateCustomerFields(activity)
            }
            http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${formId}/`).then(res => {
                putActivity(res).then(updateCustomerFields);
            })
        })
    }

    form.addEventListener('submit', (ev) => {
      
        ev.preventDefault();
        const primaryContactValidation = validatePhonNumber(primaryIti)
        if(!primaryContactValidation.isValid) {
            setHelperInvalid(primaryPhoneNumberMdc, primaryContactValidation.message);
            return;
        }

        const secondaryContactValidation = validatePhonNumber(secondaryIti);
        if(secondaryPhoneNumberMdc.value && !secondaryContactValidation.isValid) {
            setHelperInvalid(secondaryPhoneNumberMdc, secondaryContactValidation.message);
            return;
        }

        setHelperValid(primaryPhoneNumberMdc);
        setHelperValid(secondaryPhoneNumberMdc);

        submitBtn.classList.add('active')
      
        const activityBody = createActivityBody();
        activityBody.setOffice(office);
        activityBody.setActivityId(formId);
        activityBody.setTemplate('customer')
        activityBody.setVenue([{
            location:address.value,
            address:address.value,
            venueDescriptor:'Customer Office',
            geopoint : {
                latitude:0,
                longitude:0
            }
        }])
        
        console.log(primaryIti.getNumber().value);

        activityBody.setAttachment('Name',customerName.value,'string');
        activityBody.setAttachment('First Contact',primaryIti.getNumber(),'phoneNumber');
        activityBody.setAttachment('Second Contact',secondaryIti.getNumber(),'phoneNumber');
        const requestBody = activityBody.get();

        http(requestParams.method, requestParams.url, requestBody).then(res => {
            let message = 'New Customer added';
            if (requestParams.method === 'PUT') {
                message = 'Customer updated'
                putActivity(requestBody).then(function () {
                    handleFormButtonSubmitSuccess(submitBtn, message);
                })
                return
            }
            handleFormButtonSubmitSuccess(submitBtn, message);
        }).catch(err => {
            if (err.message === `customer '${requestBody.attachment.Name.value}' already exists`) {
                setHelperInvalid(new mdc.textField.MDCTextField(document.getElementById('name-field-mdc')), err.message);
                handleFormButtonSubmit(submitBtn);
                return
            }
            if(err.message === `No subscription found for the template: 'customer' with the office '${office}'`) {
                createSubscription(office,'customer').then(()=>{
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

const updateCustomerFields = (activity) => {
    customerName.value = activity.attachment['Name'].value;
    primaryPhoneNumber.value = activity.attachment['First Contact'].value;
    secondaryPhoneNumber.value = activity.attachment['Second Contact'].value;
    address.value = activity.venue[0].address;
}

