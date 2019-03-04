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
	MDCSelect
} from '@material/select';
import {
	MDCDialog
} from '@material/dialog';

export function panel(auth) {
	if (auth.claims.support) {
		const button = document.createElement('button')
		button.textContent = 'create office'
		button.onclick = function () {
			BulkCreateInit('office');
		}
		document.querySelector('#root > .mdc-layout-grid__inner').appendChild(button);
		return;
	}

	// requestCreator('fetchServerTime', {
	// 	id: '123'
	// }).then(function () {
	initButtons(auth);
	// }).catch(console.log);
}


const isAdminValid = (auth) => {
	const admin = auth.admin
	if (Array.isArray(admin) && admin.length > 0) {
		return true
	}
	return false;
}

function initButtons(auth) {
	const searchButton = new MDCRipple(document.getElementById('search-office'))
	const createButton = new MDCRipple(document.getElementById('create-office'))
	const buttons = [searchButton, createButton]
	for (let index = 0; index < buttons.length; index++) {
		const element = buttons[index]['root_']
		console.log(element);

		element.addEventListener('click', function () {
			if (auth.claims.support) {
				initOfficeSearch(element.dataset.type)
				return;
			}
			if (isAdminValid(auth.claims)) {
				initOfficeSearch(element.dataset.type, auth.claims.admin)
				return;
			} else {
				alert("you dont have any office");
			}
		})
	}
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

const resetSiblings = (pivot) => {
	const nextSiblings = document.querySelectorAll(`#${pivot} ~ div`);
	nextSiblings.forEach(function (el) {
		el.innerHTML = '';
	})
}

function initOfficeSearch(type, adminOffice) {

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
	resetSiblings('office-select')
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

				selectTemplate(value, type);

			}).catch(console.log)
			// show rest of filters
			return;
		}

		if (value) {
			if (submitButton.dataset.value === 'search') {
				document.getElementById('document-select').innerHTML = ''
				showSearchedItems(searchList, value)
			} else {
				// requestCreator('read', {
				// 	office: value
				// }).then(function () {
				submitButton.dataset.value = 'search';
				submitButton.textContent = 'search';
				document.getElementById('document-select').innerHTML = ''
				selectTemplate('Little Group', type);


				// }).catch(console.log)
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

function BulkCreateInit(template, office) {
	const type = {
		'branch': '',
		'department': '',
		'employee': ''
	}

	const selector = document.getElementById('bulk-create-dialog')
	selector.classList.remove('hidden');
	const dialog = new MDCDialog(selector);
	dialog.listen('MDCDialog:opened', () => {

		document.getElementById('download-sample').addEventListener('click', function () {
			if (!type[template]) {
				const headerNames = ['Name', 'GST Number', 'First Contact', 'Second Contact', 'Timezone', 'Date Of Establishment', 'Trial Period', 'Head Office']
				createExcelSheet(headerNames, template);
				return;

			}

			getTemplateRawData(office, template).then(function (record) {
				const headerNames = getHeaders(record);
				createExcelSheet(headerNames, template);
			})
		});

		const upload = document.getElementById('upload-sample')
		upload.addEventListener('change', function (evt) {
			evt.stopPropagation();
			evt.preventDefault();

			const files = evt.target.files;
			const file = files[0];
			const reader = new FileReader();

			reader.onload = function (e) {
				const data = e.target.result;
				if (template === 'office') {
					const headerNames = ['Name', 'GST Number', 'First Contact', 'Second Contact', 'Timezone', 'Date Of Establishment', 'Trial Period', 'Head Office']
					validateFile(data, headerNames);
					return
				}
				getTemplateRawData(office, template).then(function (record) {
					validateFile(data, getHeaders(record))
				})

			}
			reader.readAsBinaryString(file);

		}, false)

	})
	dialog.open()
}


function createExcelSheet(headerNames, template) {
	var wb = XLSX.utils.book_new();
	wb.props = {
		Title: 'SheetJS',
		Subject: 'test',
		Author: 'Growthfile',
		CreatedDate: new Date()
	}

	let data = [];
	let headers = []
	headerNames.forEach(function (key) {
		headers.push(key)
	});

	data.push(headers);
	const ws = XLSX.utils.aoa_to_sheet(data);
	
	XLSX.utils.book_append_sheet(wb, ws, "Test Sheet");
	const about = XLSX.write(wb, {
		bookType: 'xlsx',
		type: 'binary'
	});
	XLSX.writeFile(wb, template + '.xlsx');
}


function readFile(data) {


}

function validateFile(data, headers) {

	const wb = XLSX.read(data, {
		type: 'binary'
	});
	console.log(wb)

	const name = wb.SheetNames[0];
	const ws = wb.Sheets[name];
	console.log(ws['!cols'])
	const jsonData = XLSX.utils.sheet_to_json(ws);
	console.log(jsonData);

	if (!validateHeaders(ws, headers)) {
		alert('Please Check Header in your excel file');
		return;
	}
	
}

function validateHeaders(ws, headerNames) {
	const keys = Object.keys(ws);
	keys.forEach(function (key) {
		if (key !== '!ref') {
			if (headerNames.indexOf(ws[key].v) < -1) {
				return false;
			}
		}
	})
	return true;
}

function getHeaders(record) {
	const headerNames = [];

	if (record.schedule) {
		record.schedule.forEach(function (sch) {
			headerNames.push(sch)
		})
	}
	if (record.venue) {
		record.venues.forEach(function (venue) {
			headerNames.push(venue)
		})
	}
	if (Object.keys(record.attachment).length) {
		Object.keys(record.attachment).forEach(function (key) {
			headerNames.push(key)
		});
	}
	return headerNames
}

function getTemplateRawData(office, template) {
	return new Promise(function (resolve) {

		const req = indexedDB.open(firebase.auth().currentUser.uid)
		req.onsuccess = function () {
			const db = req.result;
			const tx = db.transaction(['templates'], 'readonly');
			const store = tx.objectStore('templates');
			const index = store.index('template')
			let result;
			index.get(template).onsuccess = function (event) {
				const record = event.target.result;
				if (!record) return;
				if (record.office === office) {
					result = record;
				}
			}
			tx.oncomplete = function () {
				resolve(result);
			}
		}
	})
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

const selectTemplate = (office, type) => {
	const container = document.getElementById('document-select');
	const props = {
		className: 'select-template__select',
		label: 'Select Template'
	}

	const field = createSelectField(props);
	container.appendChild(field);
	resetSiblings('document-select')
	const req = indexedDB.open(firebase.auth().currentUser.uid);
	req.onsuccess = function () {

		const db = req.result;
		const tx = db.transaction(['templates']);
		const store = tx.objectStore('templates');
		const index = store.index('selectTemplate');
		index.openCursor(IDBKeyRange.bound(['', office], ['\uffff'])).onsuccess = function (event) {
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
				if (type === 'create') {
					const key = {}
					key[templateField.value] = office
					BulkCreateInit(templateField.value, office);
				} else {
					selectDetail(templateField.value, office);
				}

			})

		}
		tx.onerror = function () {

			console.log(tx.error)
		}


	}

}


const selectDetail = (name, office) => {
	const container = document.getElementById('detail-select');
	resetSiblings('detail-select')
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
				option.value = JSON.stringify({
					schedule: scheduleName
				})
				option.textContent = scheduleName;
				field.querySelector('select').appendChild(option)

			})
			record.venue.forEach(function (venueName) {
				const option = document.createElement('option');
				option.value = JSON.stringify({
					venue: venueName
				})
				option.textContent = venueName;
				field.querySelector('select').appendChild(option)
			})

			Object.keys(record.attachment).forEach(function (attachmentName) {
				const option = document.createElement('option');
				option.value = JSON.stringify({
					attachment: attachmentName
				})
				option.textContent = attachmentName
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
					value: value,
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
	resetSiblings('activity-select')

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
			option.value = JSON.stringify(cursor.value);
			option.textContent = cursor.value.activityName;
			field.querySelector('select').appendChild(option);
			cursor.continue();
		}
		tx.oncomplete = function () {
			container.appendChild(field);
			const activityField = new MDCSelect(document.querySelector('.activity-select__select'))
			activityField.listen('MDCSelect:change', () => {
				data.activityRecord = activityField.value
				editActivity(data);
			})
		}
	}
}

const editActivity = (data) => {
	const valueToEdit = JSON.parse(data.value);
	const key = Object.keys(valueToEdit)[0];
	const activityRecord = JSON.parse(data.activityRecord);
	const dataset = activityRecord[key][valueToEdit[key]]

	if (key === 'venue') {
		activityRecord[key].forEach(function (name) {
			if (name === valueToEdit[key]) {
				editVenue(dataset);
			}
		})
		return;
	}

	if (key === 'schedule') {
		activityRecord[key].forEach(function (name) {
			if (name === valueToEdit[key]) {
				editSchedule(dataset);
			}
		})
		return;
	}
	return editAttachment(dataset);
}

const editVenue = (data) => {
	console.log(data)
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

const editSchedule = (data) => {
	console.log(data)
}

const editAttachment = (data) => {
	console.log(data)
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
		case 'phoneNumber':
			return 'number'
		default:
			return 'text'
	}


}