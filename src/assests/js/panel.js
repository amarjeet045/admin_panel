import {
	requestCreator
} from './utils';
import {
	MDCRipple
} from '@material/ripple';
import {
	MDCTextField
} from '@material/textfield';
import {
	MDCTextFieldHelperText
} from '@material/textfield/helper-text';
import {
	MDCSelect
} from '@material/select';

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

const createSelectField = (attrs) => {
	const div = document.createElement('div');
	div.className = 'mdc-select ' + attrs.className
	const i = document.createElement('i');
	i.className = 'mdc-select__dropdown-icon'
	div.appendChild(i)
	const select = document.createElement('select');
	select.className = 'mdc-select__native-control';
	const option = document.createElement('option')
	option.value = "";
	option.textContent = "";
	option.disabled;
	option.selected;
	select.appendChild(option)
	const label = document.createElement('label');

	label.className = 'mdc-floating-label'
	label.textContent = attrs.label;
	const ripple = document.createElement('div')
	ripple.className = 'mdc-line-ripple';
	div.appendChild(select);
	div.appendChild(label);
	div.appendChild(ripple);
	return div;

}

const createFilterFields = (attrs) => {

	const textField = document.createElement('div');
	textField.className = `mdc-text-field ${attrs.fieldClass}`;
	const input = document.createElement('input');
	input.type = `${attrs.input.type}`;
	input.id = `${attrs.input.id}`
	input.className = 'mdc-text-field__input';
	attrs.input.datalist ? input.setAttribute('list', `${attrs.input.datalist}`) : '';

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
const createHelper = (className) => {
	const helper = document.createElement('div')
	helper.className = 'mdc-text-field-helper-line ' + className
	const text = document.createElement('div')
	text.className = 'mdc-text-field-helper-text'
	helper.appendChild(text);
	return helper
}
const createButton = (id, name) => {
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
		fieldClass: 'office-search__input',
		input: {
			type: 'text',
			id: 'search-office-input',
			className: [],
			datalist: 'offices',
		},
		label: {
			textContent: 'Select Office'
		}
	}
	const textField = createFilterFields(props)

	const container = document.getElementById('office-select');

	container.appendChild(textField);
	const officeField = new MDCTextField(document.querySelector('.office-search__input'));

	let searchList;
	const submitButton = createButton('select-office', 'Select Office');


	submitButton.onclick = function () {
		const value = officeField.value;
		if (adminOffice) {
			requestCreator('read', {
				office: value
			}).then(function () {
				submitButton.dataset.value = 'search';
				submitButton.textContent = 'search';
				document.getElementById('document-select').innerHTML = ''
				selectTemplate(value);
			}).catch(console.log)
			// show rest of filters
			return;
		}

		if (value) {
			if (submitButton.dataset.value === 'search') {
				document.getElementById('document-select').innerHTML = ''
				showSearchedItems(searchList, value)
			} else {
				requestCreator('read', {
					office: value
				}).then(function () {
					submitButton.dataset.value = 'search';
					submitButton.textContent = 'search';
					document.getElementById('document-select').innerHTML = ''
					selectTemplate(value);
				}).catch(console.log)
			}
			return;
		}
		input.placeholder = 'Please select an office'
	}

	if (adminOffice) {
		searchList = createSelectField({
			className: 'office-select',
			label: 'Select Office'
		})
		adminOffice.forEach(function (office) {
			const option = document.createElement('option');
			option.value = office
			option.textContent = office;
			searchList.querySelector('select').appendChild(option)
		});
		container.appendChild(searchList);
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
	const container = document.getElementById('document-select');
	const props = {
		className: 'select-template__select',
		label: 'Select Template'
	}

	const field = createSelectField(props);
	container.appendChild(field);

	const req = indexedDB.open(firebase.auth().currentUser.uid);
	req.onsuccess = function () {

		const db = req.result;
		const tx = db.transaction(['templates']);
		const store = tx.objectStore('templates');
		const index = store.index('selectTemplate');
		index.openCursor(['ADMIN', office]).onsuccess = function (event) {
			const cursor = event.target.result;
			if (!cursor) return;
			const option = document.createElement('option');
			option.value = cursor.value.name;
			option.textContent = cursor.value.name;
			field.querySelector('select').appendChild(option);
			cursor.continue();
		}

		tx.oncomplete = function () {
			container.appendChild(field);
			const templateField = new MDCSelect(document.querySelector('.select-template__select'))
			templateField.listen('MDCSelect:change', () => {
				document.getElementById('detail-select').innerHTML = ''
				selectDetail(templateField.value, office);
			})

		}
		tx.onerror = function () {

			console.log(tx.error)
		}


	}

}


const selectDetail = (name, office) => {
	const container = document.getElementById('detail-select');
	const props = {
		className: 'select-detail__select',
		label: 'Select Detail To Edit'

	}
	const field = createSelectField(props);

	const req = indexedDB.open(firebase.auth().currentUser.uid);
	req.onsuccess = function () {
		const db = req.result;
		const tx = db.transaction(['templates']);
		const store = tx.objectStore('templates')
		const index = store.index('selectDetail')
		let record;
		index.get(['ADMIN', office, name]).onsuccess = function (event) {

			record = event.target.result;
			if (!record) {
				alert("the selected document does not exist");
				return;
			}

			record.schedule.forEach(function (scheduleName) {
				const option = document.createElement('option');
				option.value = scheduleName
				option.textContent = scheduleName;
				field.querySelector('select').appendChild(option)

			})
			record.venue.forEach(function (venueName) {

				const option = document.createElement('option');
				option.value = venueName
				option.textContent = venueName;
				field.querySelector('select').appendChild(option)
			})

			Object.keys(record.attachment).forEach(function (attachmentName) {
				const option = document.createElement('option');
				option.value = attachmentName
				option.textContent  = attachmentName
				field.querySelector('select').appendChild(option)
			})
		}

		tx.oncomplete = function () {
			container.appendChild(field);
			const detailNameField = new MDCSelect(document.querySelector('.select-detail__select'))
			detailNameField.listen('MDCSelect:change', () => {
				const activitySelect = document.getElementById('activity-select');
				activitySelect.innerHTML = '';
				const value = detailNameField.value;
				const data = {
					office: office,
					template: name,
					valueToEdit: value,
					record: record
				}
				chooseActivity(data);
			})
		}
		tx.onerror = function () {
			console.log(tx.error);
		}
	}

}
const chooseActivity = (data) => {

	const container = document.getElementById('activity-select');

	const props = {
		className: 'activity-select__select',
		label: 'Choose Actiivty'
	}

	const field = createSelectField(props);

	const req = indexedDB.open(firebase.auth().currentUser.uid);
	req.onsuccess = function () {
		const db = req.result;
		const tx = db.transaction(['activities']);
		const store = tx.objectStore('activities');
		const index = store.index('list');
		index.openCursor(['ADMIN', data.office, data.template]).onsuccess = function (event) {
			const cursor = event.target.result;
			if (!cursor) return;

			const option = document.createElement('option');
			option.value = cursor.value.activityId;
			option.textContent = cursor.value.activityName;
			field.querySelector('select').appendChild(option);
			cursor.continue();
		}
		tx.oncomplete = function () {
			container.appendChild(field);
			const activityField = new MDCSelect(document.querySelector('.activity-select__select'))
			activityField.listen('MDCSelect:change',()=>{
				data.activityId = activityField.value
				editActivity(data)
			})
		}
	}
}

const editDetail = (data) => {
	const record = data.record
	if (record.venue.indexOf(data.valueToEdit) > -1) {
		editVenue(data);
		return;
	}
	if (record.schedule.indexOf(data.valueToEdit) > -1) {
		editSchedulet(value);
		return;
	}

	return editAttachment(data.valueToEdit);
}

const getDetailNameFromValue = (data) => {
	const record = data.record
	if (record.venue.indexOf(data.valueToEdit) > -1) {
		return 'venue'

	}
	if (record.venue.indexOf(data.valueToEdit) > -1) {
		return 'schedule'
	}
	if (record.schedule.indexOf(data.valueToEdit) > -1) {
		return 'attachment'
	}

	return editAttachment(data.valueToEdit);
}


const editSchedule = (record) => {

	record.forEach(function (data) {

		const props = {
			fieldClass: 'edit-schedule--input',
			input: {
				type: 'datetime',
				id: '',
				className: [],
				datalist: ''
			},
			label: {
				textContent: 'Start Time'
			}
		}

	});

}

const editVenue = (data) => {
	const req = indexedDB.open(firebase.auth().currentUser.uid);
	req.onsuccess = function () {
		const db = req.result;
		const tx = db.transaction(['activities']);
		const store = tx.objectStore('activities');
		const index = store.index('list');
		index.openCursor(['ADMIN', data.office, data.template]).onsuccess = function (event) {
			const cursor = event.target.result;
			if (!cursor) return;

		}
	}
	const container = document.getElementById('detail-edit');
	const props = {
		fieldClass: 'edit-venue--input',
		input: {
			type: 'text',
			id: '',
			className: [],
			datalist: ''
		},
		label: {
			textContent: data.valueToEdit
		}
	}

	const field = createFilterFields(props);
	const select = createButton('', 'Edit Venue');
	select.onclick = function () {

		console.log({
			lat: parseFloat(venueEditField['root_'].dataset.lat)
		})

	}

	container.appendChild(field)
	const venueEditField = new MDCTextField(document.querySelector('.edit-venue--input'))
	container.appendChild(select);
	let autocomplete = new google.maps.places.Autocomplete(venueEditField['root_'].querySelector('input'));
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
		venueEditField['root_'].dataset.location = place.name;
		venueEditField['root_'].dataset.address = address;
		venueEditField['root_'].dataset.lat = place.geometry.location.lat();
		venueEditField['root_'].dataset.lng = place.geometry.location.lng();
	});
}


const returnAttachmentType = (type) => {

	switch (type) {
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