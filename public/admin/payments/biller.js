const form = document.getElementById('manage-form');
const submitBtn = form.querySelector('.mdc-fab--action[type="submit"]');

const billerName = document.getElementById('name');
const firstContact = document.getElementById('first-contact');
const gst = document.getElementById('gst');
const emailInput  = document.getElementById('emails');
const address = document.getElementById('address');

const init = (office,officeId) => {
    const requestParams = getFormRequestParams();
    const formId = getFormId();
    

    userAdditionComponent({input:emailInput,officeId});
    emailInput.addEventListener('selected',(ev) => {
        emailInput.dataset += emailInput.dataset+ev.detail
    })
    emailInput.addEventListener('removed',(ev) => {

    })

    if(formId) {
        getActivity(formId).then(updateBiller);
        http('GET',`${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${formId}`).then(activity=>{
            putActivity(activity).then(updateBiller);
        });
    }

    form.addEventListener('submit',(ev)=>{
        ev.preventDefault();
        const activityBody = createActivityBody();
        activityBody.setTemplate('biller');
        activityBody.setOffice(office);
        activityBody.setAttachment('Name',billerName.value,'string')
        activityBody.setAttachment('Emails',emailInput.dataset.emails,'string')
        activityBody.setAttachment('First Contact',firstContact.value,'phoneNumber')
        activityBody.setAttachment('Biller GST',gst.value,'string')
        activityBody.setAttachment('Biller Address',address.value,'string');
        const requestBody = activityBody.get();

        http(requestParams.method,requestParams.url,requestBody).then(res=>{
            let message = 'New biller added';
            if(requestParams.method === 'PUT') {
                message = 'Biller updated'
                putActivity(requestBody).then(()=>{
                    handleFormButtonSubmitSuccess(submitBtn,message);
                })
                return
            };
            handleFormButtonSubmitSuccess(submitBtn,message);
        }).catch(err=>{
            if (err.message === `No subscription found for the template: 'biller' with the office '${office}'`) {
                createSubscription(office, 'biller').then(() => {
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


const updateBiller = (activity) => {
    billerName.value = activity.attachment['Name'].value;
    firstContact.value = activity.attachment['First Contact'].value;
    gst.value = activity.attachment['Biller GST'].value;
    address.value = activity.attachment['Biller Address'].value;
    emailInput.dataset.value = activity.attachment['Emails'].value;

    activity.attachment['Emails'].value.split(",").forEach(email=>{
        const chip = createInputChip(email);
    });

}   

