
import {
    requestCreator
} from './utils';
import {
    MDCRipple
} from '@material/ripple';
import {
    MDCTextField
} from '@material/textfield';

export function panel(auth) {
    requestCreator('fetchServerTime', {
	id: '123'
    }).then(function () {
	initButtons(auth);
    }).catch(console.log)
}


const isAdminValid = (auth) => {
    const admin = auth.admin
    if (Array.isArray(admin) && admin.length > 0) {
	return true
    }
    return false;
}

function initButtons(auth) {
    console.log(auth)
    const searchButton = new MDCRipple(document.getElementById('search-office'))
    const createButton = new MDCRipple(document.getElementById('create-office'))
    searchButton['root_'].addEventListener('click', function () {
	if (auth.claims.support) {
	    initOfficeSearch()
	    return;
	}

	if (isAdminValid(auth.claims)) {
	    initOfficeSearch(auth.claims.admin)
	    return;
	} else {
	    alert("you dont have any office");
	}
    })

    createButton['root_'].addEventListener('click', function () {

    })

}

const createFilterFields = (attrs) => {

    const textField = document.createElement('div');
    textField.className =`mdc-text-field ${attrs.fieldClass}`;
    const input = document.createElement('input');
    input.type = `${attrs.input.type}`;
    input.id = `${attrs.input.id}`
    input.className ='mdc-text-field__input';
    attrs.input.datalist ?  input.setAttribute('list',`${attrs.input.datalist}`) : '';

    const label = document.createElement('label')
    label.className = 'mdc-floating-label'
    label.for = attrs.input.id;
    label.textContent = attrs.label.textContent;

    const ripple = document.createElement('div');
    ripple.className = 'mdc-line-ripple';

    textField.appendChild(input);
    textField.appendChild(label);
    textField.appendChild(ripple);
    return textField
}

const createButton = (id,name) =>{
    const button = document.createElement('button');
    button.id = id;
    button.className = 'mdc-button mdc-button--raised';

    const buttonName = document.createElement('span');
    buttonName.className = 'mdc-button__label';
    buttonName.textContent = name;
    button.appendChild(buttonName);
    return button;
}

function initOfficeSearch(adminOffice) {
    const props = {
	fieldClass:'office-search__input',
	input : {
	    type:'text',
	    id:'search-office-input',
	    className:[],
	    datalist:'offices',
	},
	label: {
	    textContent:'Select Office'
	}
    }
    const textField = createFilterFields(props)
    
    const container = document.getElementById('office-filter-container');

    container.appendChild(textField);
    const officeField = new MDCTextField(document.querySelector('.office-search__input'));
    
    let searchList;
    const submitButton =  createButton('select-office','Select Office');

    
    submitButton.onclick = function () {
	const value = officeField.value;
	if (adminOffice) {
	    requestCreator('read', {
		office: value
	    }).then(function () {
		selectTemplate(value);
	    }).catch(console.log)
	    // show rest of filters
	    return;
	}

	if (value) {
	    if (submitButton.dataset.value === 'search') {
		showSearchedItems(searchList, value)
	    } else {
		requestCreator('read', {
		    office: value
		}).then(function () {
		    selectTemplate(value);
		}).catch(console.log)
	    }
	    return;
	}
	input.placeholder = 'Please select an office'

    }

    if (adminOffice) {
	searchList = document.createElement('datalist');
	searchList.id = 'offices'

	adminOffice.forEach(function (office) {
	    const option = document.createElement('option');
	    option.value = office
	    searchList.appendChild(option)
	})
	return;
    }
    submitButton.textContent = 'search';
    submitButton.dataset.value = 'search';
    searchList = document.createElement('ul')
    container.appendChild(submitButton)
    container.appendChild(searchList);

}


function showSearchedItems(searchList, value) {
    searchList.innerHTML = ''
    requestCreator('search', {
	office: value
    }).then(function (offices) {
	if (offices.length > 0) {
	    offices.forEach(function (office) {
		const li = document.createElement('li');
		li.textContent = office
		searchList.appendChild(li);
		li.onclick = function () {
		    searchList.innerHTML = ''
		    document.getElementById('search-office-input').value = office;
		    document.getElementById('select-office').textContent = 'select office';
		    document.getElementById('select-office').dataset.value = 'select';


		}
	    })
	}

    }).catch(console.log)

};

const selectTemplate = (office) => {
    const props = {
	fieldClass:'select-template__input',
	input : {
	    type:'text',
	    id:'template-input',
	    className:[],
	    datalist:'template-name',			
	},
	label: {
	    textContent:'Select Template'
	}
    }
    const container = document.getElementById('office-filter-container');

    const field = createFilterFields(props);
    container.appendChild(field);
    const templateField = new MDCTextField(document.querySelector('.select-template__input'))

    
    const templateNames = document.createElement('datalist');
    templateNames.id = 'template-name'

    const req = indexedDB.open(firebase.auth().currentUser.uid);
    req.onsuccess = function () {

	const db = req.result;
	const tx = db.transaction(['templates']);
	const store = tx.objectStore('templates');
	store.openCursor().onsuccess = function (event) {
	    const cursor = event.target.result;
	    if (!cursor) return;
	    const option = document.createElement('option');
	    option.value = cursor.value.name;
	    templateNames.appendChild(option);
	    cursor.continue();
	}

	tx.oncomplete = function () {
	    const select = createButton('','Select Document');
	    select.onclick = function () {
		//open next filter
		const name = templateField.value;
		selectDetail(name);
	    }
	    
	    container.appendChild(select);
	    container.appendChild(templateNames);
	    
	}
	tx.onerror = function () {

	    console.log(tx.error)
	}


    }

}


const selectDetail = (name) => {
    const props = {
	fieldClass:'select-detail__input',
	input : {
	    type:'text',
	    id:'detail-name-input',
	    className:[],
	    datalist:'detail-name',			
	},
	label: {
	    textContent:'Select Detail To Edit'
	}
    }
    const container = document.getElementById('office-filter-container');

    const field = createFilterFields(props);
    container.appendChild(field);
    const detailNameField = new MDCTextField(document.querySelector('.select-detail__input'))


    const datalist = document.createElement('datalist');
    datalist.id = 'detail-name';

    const req = indexedDB.open(firebase.auth().currentUser.uid);
    req.onsuccess = function () {
	const db = req.result;
	const tx = db.transaction(['templates']);
	const store = tx.objectStore('templates')
	let record;
	store.get(name).onsuccess = function (event) {

	    record = event.target.result;
	    if (!record) {
		alert("the selected document does not exist");
		return;
	    }
	    
	    record.schedule.forEach(function(scheduleName){		
		const option = document.createElement('option');
		option.value = scheduleName
		datalist.appendChild(option);
	    })
	    
	    record.venue.forEach(function(venueName){

	    
	    const option = document.createElement('option');
	    option.value = venueName
	    datalist.appendChild(option);

	    })
	    
	    Object.keys(record.attachment).forEach(function(attachmentName){
		const option = document.createElement('option');
		option.value = attachmentName
		datalist.appendChild(option);    
	    })
	    
	}

	tx.oncomplete = function () {
	    const select = createButton('','Select Detail');
	    select.onclick = function () {
		//open next filter
		const value = detailNameField.value;
		editDetail(value,record);
	    }
	    container.appendChild(select);
	    container.appendChild(datalist);
	}
	tx.onerror = function () {
	    console.log(tx.error);
	}
    }

}

const editDetail = (value,record) => {

    if(value === 'schedule') {
	editSchedulet(record);
	return;
    }
    if(value === 'venue') {
	editVenue(record[value]);
	return;
    }

    return editAttachment(record);

}

const editSchedule = (record) => {

    record.forEach(function(data){
	
	const props = {
	    fieldClass:'edit-schedule--input',
	    input : {
		type:'datetime',
		id:'',
		className:[],
		datalist:''			
	    },
	    label: {
		textContent:'Start Time'
	    }
	}
   	
    });
    
}

const editVenue = (record) => {
    const container = document.getElementById('office-filter-container');
    console.log(record)
    record.forEach(function(value){
	
	const props = {
	    fieldClass:'edit-venue--input',
	    input : {
		type:'text',
		id:'',
		className:[],
		datalist:''			
	    },
	    label: {
		textContent:value
	    }
	}

	
	const field = createFilterFields(props);
	
	container.appendChild(field)
	
    });
    const venueObject = {
	venue
    }
    const initFields = [].map.call(document.querySelectorAll('.edit-venue--input'),function(el){
	
	let autocomplete = new google.maps.places.Autocomplete(el.querySelector('input'));
	initializeAutocompleteGoogle(autocomplete).then(function(result){
	    console.log(result);
	})	    
	return new MDCTextField(el);
    })
}

function initializeAutocompleteGoogle(autocomplete) {
    return new Promise((resolve,reject) => {
	autocomplete.addListener('place_changed', function () {

            let place = autocomplete.getPlace();

            if (!place.geometry) {
		return
            }
            var address = '';
            if (place.address_components) {
		address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
		].join(' ');
            }

	    return resolve({
		location : place.name,
		address : address,
		lat : place.geometry.location.lat(),
		lng : place.geometry.location.lng()
	    })
	})
    });
}



const isAttachmentTypeSelector = (type) => {
    
    const selector = {
	'phoneNumber':true,
	'product':true,
	'customer':true,
	'Name':true,
    }
    return selector[type]
    
}



const returnAttachmentType = (type) => {
    
    switch(type) {	
    case 'base64':
	return 'file'
    case 'string':
	return 'text'
    case 'HH:MM':
	return 'datetime-local'
	
    case 'number':
	return 'number'
    default:
	return 'text'
    }
    

}
