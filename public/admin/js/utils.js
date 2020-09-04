
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

const getUsersDetails = (officeId,limit) => {
    return new Promise((resolve,reject)=>{
        let url = `${appKeys.getBaseUrl()}/api/office/${officeId}/user`;
        if(limit) {
            url = `${appKeys.getBaseUrl()}/api/office/${officeId}/user?limit=${limit}&start=0`
        }
        http('GET', url).then(response => {
            
            const tx =  window.database
            .transaction(["users","meta"], "readwrite");
            for (let index = 0; index < response.results.length; index++) {
                const result = response.results[index];
                result['search_key'] = result.displayName ? result.displayName.toLowerCase() : null;
                
                const usersStore = tx.objectStore("users")
                usersStore.put(result)
            }
            const metaStore = tx.objectStore("meta");
            metaStore.get("meta").onsuccess = function(e){
                const metaData = e.target.result;
                metaData.totalUsersSize = response.size;
                metaData.totalCheckedinUsers = response.totalCheckedinUsers 
                metaStore.put(metaData);
            }
            tx.oncomplete = function() {
                resolve(response);
            }
    }).catch(reject);
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

const openProfileBox = (event) => {
    event.stopPropagation();
    document.querySelector('.user-profile--logo').classList.add('focused')

    const el = document.querySelector('.profile-box');
    if(el.classList.contains('hidden')) {
        el.classList.remove('hidden');
    }
    else {
        closeProfileBox()
    };
    const name = firebase.auth().currentUser.displayName;
    const email = firebase.auth().currentUser.email;
    const photo = firebase.auth().currentUser.photoURL;

    if(photo) {
        document.getElementById('auth-image').src = photo;
    }
    document.getElementById('auth-name').textContent = name;
    document.getElementById('auth-email').textContent = email;

}

const closeProfileBox = () => {
    const el = document.querySelector('.profile-box');
    document.querySelector('.user-profile--logo').classList.remove('focused')
    el.classList.add('hidden');
}

const formSubmittedSuccess = (button,text) => {
    button.classList.remove('active');
    showSnacksApiResponse(text);
}