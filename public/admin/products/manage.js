const productName = document.getElementById('name');
const brand = document.getElementById('brand');
const price = document.getElementById('price');
const description = document.getElementById('description');
const form = document.getElementById('manage-form');

const init = (office, officeId) => {
    // check if we have activity id in url. 
    // if activity id is  found, then udpate the form else create
    const formId = getFormId();
    const requestParams = getFormRequestParams();

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
        ev.submitter.classList.add('active')
        ev.preventDefault();

        const activityBody = createActivityBody();
        activityBody.setOffice(office)
        activityBody.setActivityId(formId)
        activityBody.setTemplate('product')
        activityBody.setAttachment('Name',productName.value,'string')
        activityBody.setAttachment('Brand',brand.value,'string') 
        activityBody.setAttachment('Product Description',description.value,'string') 
        activityBody.setAttachment('Unit Value (excluding GST)',price.value,'string');
        
        const requestBody = activityBody.get();

        http(requestParams.method, requestParams.url, requestBody).then(res => {
            let message = 'New product added';
            if (requestParams.method === 'PUT') {
                message = 'Product updated'
                putActivity(requestBody).then(function () {
                    handleFormButtonSubmit(ev.submitter, message);
                })
                return
            }
            handleFormButtonSubmit(ev.submitter, message);
        }).catch(err => {
            if (err.message === `product '${requestBody.attachment.Name.value}' already exists`) {
                setHelperInvalid(new mdc.textField.MDCTextField(document.getElementById('name-field-mdc')), err.message);
                handleFormButtonSubmit(ev.submitter);
                return
            }
            handleFormButtonSubmit(ev.submitter, err.message)
        })
    })
}



const updateProductFields = (activity) => {
    productName.value = activity.attachment['Name'].value;
    brand.value = activity.attachment['Brand'].value;
    price.value = activity.attachment['Unit Value (excluding GST)'].value;
    description.value = activity.attachment['Product Description'].value;
}