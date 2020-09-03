const heading  = document.getElementById('form-heading');
const companyName = document.getElementById('company-name');
const yearInput = document.getElementById('year-of-estd');
const address = document.getElementById('address');
const description  = document.getElementById('description');
const pincode = document.getElementById('pincode');
const form = document.getElementById('manage-form');


const init = (office,officeId) => {
    const tx = window.database.transaction("activities");
    const store = tx.objectStore("activities");
    store.get(officeId).onsuccess = function(evt) {
        const record = evt.target.result;
        if(!record) return;
        updateForm(record)
    }
};

const updateForm = (record) => {
    heading.textContent = `Manage ${record.office}`;
    companyName.value = record.office
    yearInput.nodeValue = record.attachment['Year Of Establishment'].value;
    address.value = record.attachment['Registered Office Address'].value;
    description.value = record.attachment['Description'].value;
    pincode.value = record.attachment['Pincode'].value;


    form.addEventListener('submit',(ev)=>{
        ev.preventDefault();
        ev.submitter.classList.add('active')

        const clone = JSON.parse(JSON.stringify(record))
        clone.attachment['Year Of Establishment'].value = yearInput.value;
        clone.attachment['Registered Office Address'].value = address.value;
        clone.attachment['Description'].value = description.value;
        clone.attachment['Pincode'].value = pincode.value;
        clone.geopoint = {
            latitude:0,
            longitude:0
        }
        http('PUT',`${appKeys.getBaseUrl()}/api/activities/update`,clone).then(res=>{
            formSubmittedSuccess(ev.submitter,'Company info updated')
        }).catch(err=>{
            ev.submitter.classList.remove('active')
        })
        return
    })
}