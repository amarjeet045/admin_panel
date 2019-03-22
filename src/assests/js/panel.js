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
import {credentials,requestCreator} from './utils';

export function panel(cred) {

	requestCreator('fetchServerTime', {
		id: '123'
	}).then(function () {
		const searchButton = new MDCRipple(document.getElementById('search-office'));
		if(credentials.isSupport(cred)) {
			const selector = document.getElementById('create-office')
			const init = new MDCRipple(selector);
			init['foundation_']['adapter_'].removeClass('hidden');
			init['root_'].addEventListener('click',function(evt){
				BulkCreateInit('office');
			})
		}
		console.log(cred)
		searchButton['root_'].addEventListener('click', function (evt) {
			if(credentials.isSupport(cred)) {
				initOfficeSearch()
				return;
			}
			const offices = credentials.getAdminOffice(cred);
			initOfficeSearch(offices)
			
		});
	}).catch(console.log);
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
	input.value = attrs.input.value || '';
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

function initOfficeSearch(adminOffice) {
	const container = document.getElementById('office-select');
	if (adminOffice) {
		const officeSelectField = createSelectField({
			className: 'office-select',
			label: 'Select Office'
		})
		adminOffice.forEach(function (office) {
			const option = document.createElement('option');
			option.value = office
			option.textContent = office;
			officeSelectField.querySelector('select').appendChild(option)
		});
		container.appendChild(officeSelectField);
		const selectInit = new MDCSelect(officeSelectField);
		selectInit.listen('MDCSelect:change', () => {
			requestCreator('read', {
				office: selectInit.value
			}).then(function () {
				document.getElementById('document-select').innerHTML = ''
				selectTemplate(selectInit.value)
			})
		})
		return;
	}

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
	resetSiblings('office-select');
	const textField = createFilterFields(props)
	container.appendChild(textField);
	const officeSearchField = new MDCTextField(textField);
	const searchList = document.createElement('ul')
	searchList.className = 'mdc-list'
	const submitButton = createButton('select-office', 'Search');
	submitButton.onclick = function () {
		const value = officeSearchField.value;
		if (!value) {
			officeSearchField['input_'].placeholder = 'Please Select A Value';
			return
		}

		requestCreator('search', {search:`office=${value}`}).then(function (offices) {
			if (!offices.length) {
				alert('No Offie Found :/')
				return;
			}

			offices.forEach(function (office) {
				const li = document.createElement('li');
				li.className = 'mdc-list--item'
				li.textContent = office
				searchList.appendChild(li);
				li.onclick = function () {
					searchList.innerHTML = ''
					requestCreator('read', {
						office: office
					}).then(function () {
						document.getElementById('document-select').innerHTML = ''
						selectTemplate(office)
					});
				};
			});
			container.appendChild(searchList);
		}).catch(console.log)
	};
	container.appendChild(submitButton)
}

function BulkCreateInit(template,office,isAdmin) {
	console.log(template)
	console.log(office)
	console.log(isAdmin);
	const dialogHTML = ` <div class="mdc-dialog"
	role="alertdialog"
	id="bulk-create-dialog"
	aria-modal="true"
	aria-labelledby="my-dialog-title"
	aria-describedby="my-dialog-content">
 <div class="mdc-dialog__container">
   <div class="mdc-dialog__surface">
	
	 <h2 class="mdc-dialog__title" id="my-dialog-title">Upload Document</h2>
	 <div class="mdc-dialog__content" id="my-dialog-content">
	   <div class='upload-container'>
		 Upload excel file<input type="file" id='upload-sample' accept=".xlsx, .xls , .csv" multiple>
	   </div>
	   <div class='download-container'>
		 <button class="mdc-button mdc-button--raised mdc-button--shaped" id='download-sample'>
		   <span class="mdc-button__label">Download</span>
		 </button>
	   </div>

	 </div>
	 <footer class="mdc-dialog__actions">
	 </footer>
   </div>
 </div>
 <div class="mdc-dialog__scrim"></div>
</div>`
	document.getElementById('dialog-container').innerHTML = dialogHTML;
	const selector = document.querySelector('.mdc-dialog');
	const dialog = new MDCDialog(selector);
	const downloadSmaple = document.getElementById('download-sample')
	const upload = document.getElementById('upload-sample')
	dialog.listen('MDCDialog:opened', () => {

		downloadSmaple.addEventListener('click', function () {
			if (template === 'office') {
				const headerNames = ['Name', 'GST Number', 'First Contact', 'Second Contact', 'Timezone', 'Date Of Establishment', 'Trial Period', 'Head Office']
				createExcelSheet(headerNames, template);
				dialog.close()
				return;
			}
			
			getTemplateRawData(office, template,isAdmin).then(function (record) {
				const headerNames = getHeaders(record);
				createExcelSheet(headerNames, template);
				dialog.close()

			})

		});

		upload.addEventListener('change', function (evt) {
			evt.stopPropagation();
			evt.preventDefault();

			const files = evt.target.files;
			const file = files[0];
			const reader = new FileReader();

			reader.onload = function (e) {
				const data = e.target.result;
				convertToJSON({data:data,office:office,template:template});
			}
			reader.readAsBinaryString(file);
			dialog.close()
		})
	})
	dialog.listen('MDCDialog:closed',() =>{
		document.getElementById('dialog-container').innerHTML = ''
		
	})
	dialog.open()
}

function createExcelSheet(headerNames, template) {
	var wb = XLSX.utils.book_new();
	wb.props = {
		Title: template,
		Subject: `${template} sheet for Growthfile Admin Panel`,
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

function convertToJSON(body) {
	console.log(body)
	const wb = XLSX.read(body.data, {
		type: 'binary'
	});
	console.log(wb)

	const name = wb.SheetNames[0];
	const ws = wb.Sheets[name];

	const jsonData = XLSX.utils.sheet_to_json(ws,{blankRows:false, defval:'',raw:false});
	if(!jsonData.length) {
		alert('Empty File');
		return;
	};
	jsonData.forEach(function(val){
		val.share = [];	
	})
	if(body.template === 'office') {
		body.office = ''
	}
	console.log(jsonData)

	body.data = jsonData
	requestCreator('create',body).then(function(response){
		const rejectedOnes = response.data.filter((val)=> val.rejected);
		console.log(rejectedOnes);
		const table = document.getElementById('rejection-table');
		table.innerHTML = ''
		table.innerHTML = `<table id='table-result'>
		<caption id='total-docs-created'>total docs created : ${response.totalDocsCreated}</caption>
		<caption id='total-size'>total rows : ${body.data.length}</caption>
		<tr>
		  <th>reason</th>
		  <th>result</th>
		</tr>
		</table>`
		for (let index = 0; index < rejectedOnes.length; index++) {
			const val = rejectedOnes[index];
			document.getElementById('table-result').innerHTML += `<tr>
			  <td>${val.reason}</td>
			  <td>${JSON.stringify(val)}</td>
			  </tr>`
		}
	}).catch(console.log)
}


function getHeaders(record) {
	const headerNames = [];
	console.log(record)
	if (record.schedule) {
		record.schedule.forEach(function (sch) {
			headerNames.push(sch)
		})
	}
	if (record.venue) {
		record.venue.forEach(function (venue) {
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

function getTemplateRawData(office, template,isAdmin) {
	return new Promise(function (resolve) {

		const req = indexedDB.open(firebase.auth().currentUser.uid)
		req.onsuccess = function () {

			const db = req.result;
			const tx = db.transaction(['templates'], 'readonly');
			const store = tx.objectStore('templates');
			let index;
			let bound;
			if(isAdmin) {
				index = store.index('selectDetail')
				bound = ['ADMIN',office,template]
			}
			else {
				index = store.index('officeTemplate');
				bound = [office,template]
			}

			let result;
			
			index.get(bound).onsuccess = function (event) {
				const record = event.target.result;
				if (!record) return;
				result = record;
			}
			tx.oncomplete = function () {
				resolve(result);
			}
		}
	})
}

const selectTemplate = (office) => {
	const container = document.getElementById('document-select');
	const props = {
		className: 'select-template__select',
		label: 'Select Template'
	}
	let isAdmin = false;
	const field = createSelectField(props);
	resetSiblings('document-select')
	const req = indexedDB.open(firebase.auth().currentUser.uid);
	req.onsuccess = function () {
		const db = req.result;
		const tx = db.transaction(['templates']);
		const store = tx.objectStore('templates');
		const index = store.index('selectTemplate');
		let bound = ''
		firebase.auth().currentUser.getIdTokenResult().then(function(cred){
			if(credentials.isAdmin(cred)){
				bound = ['ADMIN',office]
				isAdmin = true;
			}
			else {
				bound = IDBKeyRange.bound(['',office],['\uffff',office]);
			}
			index.openCursor(bound).onsuccess = function (event) {
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
				const templateField = new MDCSelect(field)
				templateField.listen('MDCSelect:change', () => {
					document.getElementById('detail-select').innerHTML = ''
					const value = templateField.value;
					
					if(document.getElementById('bulkd-create-btn')){
						document.getElementById('bulkd-create-btn').remove()
					}
					if(document.getElementById('update-activity-btn')){
						document.getElementById('update-activity-btn').remove();
					}
				
					const createDialogButton = createButton('bulkd-create-btn', 'Create');
					const updateButton = createButton('update-activity-btn', 'Update');
					createDialogButton.onclick = function () {
						BulkCreateInit(value,office,isAdmin);
					}
					updateButton.onclick = function () {
						if(value === 'recipient') {
							requestCreator('search',{search:`office=${office}&template=${value}`}).then((activities)=>{
								selectDetail(value, office,activities);
							}).catch(console.log)
							return
						}
						selectDetail(value, office);

					}
					container.appendChild(createDialogButton);
					container.appendChild(updateButton)
				})
			}
			tx.onerror = function () {
				console.log(tx.error)
			}
		})
	
	}
}



const selectDetail = (templateName,office,activities) => {
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
		let index;
		let bound;
		if(isAdmin){
			index = store.index('selectDetail')
			bound = ['ADMIN',office,templateName]
		}
		else {
			index = store.index('officeTemplate');
			bound = [office,templateName];
		}
		let record;
		
		index.get(bound).onsuccess = function (event) {
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
			if(templateName === 'recipient') {
				const option = document.createElement('option');
				option.value = JSON.stringify({
					share: []
				})
				option.textContent = 'Assignees'
				field.querySelector('select').appendChild(option)
			}
		}

		tx.oncomplete = function () {
			container.appendChild(field);
			const detailNameField = new MDCSelect(document.querySelector('.select-detail__select'))
			detailNameField.listen('MDCSelect:change', () => {
				const activitySelect = document.getElementById('activity-select');
				activitySelect.innerHTML = '';
				const value = detailNameField.value;
				if(!value) return;
				const data = {
					office: office,
					template: templateName,
					value: value,
					record: record
				}
				console.log(data)
				if(templateName === 'recipient') {

					chooseActivity(data,activities);
					return
				}
				chooseActivity(data);
			})
		}
		tx.onerror = function () {
			console.log(tx.error);
		}
	}

}
const chooseActivity = (data,activities) => {

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
		if(activities) {
			activities.forEach(function(activity){
				const option = document.createElement('option');
				option.value = JSON.stringify(cursor.value);
				option.textContent = cursor.value.activityName;
				field.querySelector('select').appendChild(option);
			})
			container.appendChild(field);
		}
		else {
			index.openCursor(['ADMIN', data.office, data.template]).onsuccess = function (event) {
				const cursor = event.target.result;
				if (!cursor) return;
				
				const option = document.createElement('option');
				option.value = JSON.stringify(cursor.value);
				option.textContent = cursor.value.activityName;
				field.querySelector('select').appendChild(option);
				cursor.continue();
			}
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
	if( key === 'share') {
		const el = document.getElementById('detail-edit')
		const shareView = `
		<div class='share-view'>
		<div class="mdc-text-field mdc-text-field--textarea">
		<textarea id="textarea" class="mdc-text-field__input" rows="8" cols="40"></textarea>
		<div class="mdc-notched-outline">
		  <div class="mdc-notched-outline__leading"></div>
		  <div class="mdc-notched-outline__notch">
			<label for="textarea" class="mdc-floating-label">Add Assignees</label>
		  </div>
		  <div class="mdc-notched-outline__trailing"></div>
		</div>
		</div>
		<button class='mdc-button' id='share-assignee'>Share</button>
		<ul class='mdc-list mdc-list--two-line' id='share-list'>
		${data.activityRecord.share.forEach(function(assignee){
			return `<li class="mdc-list-item">
			<img class="mdc-list-item__graphic" aria-hidden="true" src=${assignee.photoURL}>
			<span class="mdc-list-item__text">
			  <span class="mdc-list-item__primary-text">${assignee.displayName}</span>
			  <span class="mdc-list-item__secondary-text">${assignee.phoneNumber}</span>
			</span>
		  </li>`
		})}
		</ul>
	  </div>`
	  el.innerHTML = shareView;
	  const textField = new MDCTextField(document.querySelector('.mdc-text-field.mdc-text-field--textarea'));
		document.getElementById('share-assignee').addEventListener('click',function(){
			const values = textField['value']
			const seperatedValues = values.split(',')
			data.activityRecord.share = seperatedValues;
			requestCreator('update',data.activityRecord).then(function(){
				alert('done')
			}).catch(function(error){
				alert(error.message)
			})
	    })
	  return;
	}
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
	const container   = document.getElementById('activity-edit');
	const props = {
		fieldClass: 'edit-stringAttachment--input',
		input: {
			type: 'text',
			id: '',
			className: [],
			value:data.value
		},
		label: {
			textContent: ''
		}
	}	
	const textfield = createFilterFields(props)
	container.appendChild(textfield);
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