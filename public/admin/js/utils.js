
/** callback is used because activity returned by this function needs to update dom 2 times */
const getCompanyDetails = (officeId,onSuccess,onError) => {
    window.database
    .transaction("activities")
    .objectStore("activities")
    .get(officeId)
    .onsuccess = function (event) {
        const  record = event.target.result;
        if(record) {
            onSuccess(record);
        }

        http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${officeId}/`).then(officeActivity => {
            window.database
            .transaction("activities", "readwrite")
            .objectStore("activities")
            .put(officeActivity);
            onSuccess(officeActivity)
        }).catch(onError)
    }
}


const handleProfileDetails = (officeId) => {
    getCompanyDetails(officeId,updateCompanyProfile,console.error)
}

const updateCompanyProfile = (activity) => {
    const companyLogo = document.getElementById('company-logo')
    const companyName = document.getElementById('company-name')
    const companyAddress = document.getElementById('company-address');
    
    const companyDescription = document.getElementById('company-description');
    const companyCategory = document.getElementById('company-category');

    companyLogo.textContent = activity.attachment['Company Logo'].value || './empt-user.jpg';
    companyName.textContent = activity.attachment['Name'].value;
    companyAddress.textContent = activity.attachment['Registered Office Address'].value;

    companyDescription.textContent = activity.attachment['Description'].value;
    companyCategory.textContent = activity.attachment['Category'] ? activity.attachment['Category'].value : '';

}

/**
 * format string to INR 
 * @param {string} money 
 * @returns {string} 
*/
const formatMoney = (money) => {
    const number = Number(money.split(',').join(''))
    return number.toLocaleString('en-IN',{
        style:'currency',
        currency:'INR',
    })
}

const emptyCard = (text) => {
    const div = createElement('div',{
        className:'mdc-card mdc-card--outlined  empty-card'
    })

    div.innerHTML = `<span class='text-cont'>
    <i class='material-icons'>info</i>
    ${text}
    </span>`
    return div;
}