const init = (office,officeId) => {
    const tx = window.database.transaction('users');
    const store = tx.objectStore('users');
    const index = store.index('timestamp');
    const ul = document.getElementById('employees-list');
    ul.innerHTML = ''
  
    index.openCursor(null,'prev').onsuccess = function(evt) {
        const cursor = evt.target.result;
        if(!cursor) return;
        const li = createElement('li',{
            className:'mdc-list-item user-list'
        })
        if(user.latestCheckIn.location) {
            li.classList.add('user-list--location')
        }
        li.innerHTML  = `<span class="mdc-list-item__ripple"></span>
        <img class='mdc-list-item__graphic' src="${cursor.value.photoURL || '../img/person.png'}">
        <span class="mdc-list-item__text">
          <span class="mdc-list-item__primary-text">${cursor.value.displayName || cursor.value.phoneNumber}</span>
          <span class='mdc-list-item__meta list-time'>${formatCreatedTime(ursor.value.latestCheckIn.timestamp)}</span>
          <span class="mdc-list-item__secondary-text">${ursor.value.phoneNumber}</span>
          <span class="mdc-list-item__secondary-text">${ursor.value.latestCheckIn.location || ''}</span>
        </span>`
        
        new mdc.ripple.MDCRipple(li);
        ul.appendChild(li);
        cursor.continue();
    }
    tx.oncomplete = function() {
        getUsersDetails(officeId).then(respsone=>{

        })
    }
}


const updateUserlist = () => {
    
}

