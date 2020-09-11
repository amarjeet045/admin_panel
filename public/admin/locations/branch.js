const branchName = document.getElementById('name');
const primaryPhoneNumber = document.getElementById('primary-phonenumber');
const secondaryPhoneNumber = document.getElementById('secondary-phonenumber');
const address = document.getElementById('address');
const weeklyOff = document.getElementById('weekly-off');
const weekdayStartTime = document.getElementById('weekday-start-time')
const weekdayEndTime = document.getElementById('weekday-end-time')


const form = document.getElementById('manage-form');

const init = (office, officeId) => {
    // check if we have activity id in url. 
    // if activity id is  found, then udpate the form else create
    const formId = getFormId();
    const requestParams = getFormRequestParams();
    const primaryPhoneNumberMdc = new mdc.textField.MDCTextField(document.getElementById('phone-field-mdc-primary'))
    const secondaryPhoneNumberMdc = new mdc.textField.MDCTextField(document.getElementById('phone-field-mdc-secondary'))

    const primaryIti = phoneFieldInit(primaryPhoneNumberMdc);
    const secondaryIti = phoneFieldInit(secondaryPhoneNumberMdc);

    // make weekday end time file min value equal to start time value
    weekdayStartTime.addEventListener('change', (evt) => {
        weekdayEndTime.value = evt.target.value;
        weekdayEndTime.min = evt.target.value;
    });

    if (formId) {
        document.getElementById('form-heading').innerHTML = 'Update ' + new URLSearchParams(window.location.search).get('name')
        getActivity(formId).then(activity => {
            if (activity) {
                updateBranchFields(activity)
            }
            http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${formId}/`).then(res => {
                putActivity(res).then(updateBranchFields);
            })
        });

    }
    else {
        const hours = new Date().getHours();
        const minutes = new Date().getMinutes();
        weekdayStartTime.value = `${hours < 10 ? '0':''}${hours}:${minutes < 10 ? '0' :''}${minutes}`
    }
    weekdayStartTime.dispatchEvent(new Event('change', { 'bubbles': true }))




    form.addEventListener('submit', (ev) => {

        ev.preventDefault();
        const primaryContactValidation = validatePhonNumber(primaryIti)
        if (!primaryContactValidation.isValid) {
            setHelperInvalid(primaryPhoneNumberMdc, primaryContactValidation.message);
            return;
        }

        const secondaryContactValidation = validatePhonNumber(secondaryIti);
        if (secondaryPhoneNumberMdc.value && !secondaryContactValidation.isValid) {
            setHelperInvalid(secondaryPhoneNumberMdc, secondaryContactValidation.message);
            return;
        }

        setHelperValid(primaryPhoneNumberMdc);
        setHelperValid(secondaryPhoneNumberMdc);

        ev.submitter.classList.add('active')




        const activityBody = createActivityBody();
        activityBody.setOffice(office)
        activityBody.setActivityId(formId)
        activityBody.setTemplate('branch')
        activityBody.setSchedule(Array.apply(null, Array(15)).map((x, y) => {
            return {
                'name': 'Holiday ' + (y + 1),
                'startTime': '',
                'endTime': ''
            }
        }))
        activityBody.setVenue([{
            location: address.value,
            address: address.value,
            venueDescriptor: 'Branch Office',
            geopoint: {
                latitude: 0,
                longitude: 0
            }
        }])
        activityBody.setAttachment('Name',branchName.value,'string');
        activityBody.setAttachment('First Contact',primaryIti.getNumber(intlTelInputUtils.numberFormat.E164),'string');
        activityBody.setAttachment('Second Contact',secondaryIti.getNumber(intlTelInputUtils.numberFormat.E164),'string');
        activityBody.setAttachment('Weekday Start Time',weekdayStartTime.value,'HH:MM')
        activityBody.setAttachment('Weekday End Time',weekdayEndTime.value,'HH:MM')
        activityBody.setAttachment('Weekly Off',weeklyOff.value,'weekdat')
        const requestBody = activityBody.get();
   


        
        http(requestParams.method, requestParams.url, requestBody).then(res => {
            let message = 'New Branch added';
            if (requestParams.method === 'PUT') {
                message = 'Branch updated'
                putActivity(requestBody).then(function () {
                    handleFormButtonSubmit(ev.submitter, message);
                })
                return
            }
            handleFormButtonSubmit(ev.submitter, message);
        }).catch(err => {
            if (err.message === `branch '${requestBody.attachment.Name.value}' already exists`) {
                setHelperInvalid(new mdc.textField.MDCTextField(document.getElementById('name-field-mdc')), err.message);
                handleFormButtonSubmit(ev.submitter);
                return
            }
            if (err.message === `No subscription found for the template: 'branch' with the office '${office}'`) {
                createSubscription(office, 'branch').then(() => {
                    form.submit();
                })
                return
            }
            handleFormButtonSubmit(ev.submitter, err.message)
        })
    })
}

const updateBranchFields = (activity) => {
    branchName.value = activity.attachment['Name'].value;
    primaryPhoneNumber.value = activity.attachment['First Contact'].value;
    secondaryPhoneNumber.value = activity.attachment['Second Contact'].value;
    weeklyOff.value = activity.attachment['Weekly Off'].value
    weekdayStartTime = ctivity.attachment['Weekday Start Time'].value
    weekdayEndTime = ctivity.attachment['Weekday End Time'].value
    address.value = activity.venue[0].address;
}