import * as view from './views';
import {
    MDCList
} from "@material/list";
import {
    MDCRipple
} from "@material/ripple";
import * as firebase from "firebase/app";
import { MDCTextField } from '@material/textfield';
import { phoneFieldInit} from './phoneNumber';

export const expenses = (office) => {
   
    const cardTypes = ['Payroll', 'Reimbursements']
    const assignees = [{
        displayName: firebase.auth().currentUser.displayName,
        photoURL: firebase.auth().currentUser.photoURL,
        phoneNumber: firebase.auth().currentUser.phoneNumber,
        email: firebase.auth().currentUser.email,
        emailVerified: firebase.auth().currentUser.emailVerified
    }, {
        displayName: 'joen doe',
        photoURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs1Mtx-INbdQ5D3Xmsyq-D3HjpKmXnhKiqJsyzfNxzJ8gx-ewB',
        phoneNumber: '+919999288928',
        email: 'something@gmail.com',
        emailVerified: true
    }, {
        displayName: 'joen doe 2',
        photoURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMr_Ky37u_30imoav7-kzi01LCBOh88WP6hu2r3IkXUJaQsWexdA',
        phoneNumber: '+919999288922',
        email: 'something2@gmail.com',
        emailVerified: false
    }]
    const paymentData = [{
            amount: 400,
            date: "30/9/2019",
            employees: 400,
            label: 'PENDING',
            buttonText: 'pay now',
            status: 'PENDING'
        }, {
            amount: 200,
            date: "30/9/2019",
            employees: 400,
            label: 'Current cycle',
            buttonText: 'Manage',
            status: ''


        },
        {
            amount: 200,
            date: "30/8/2019",
            employees: 400,
            label: 'Last payment',
            buttonText: 'view',
            status: 'CONFIRMED'

        }
    ]

    document.getElementById('app-content').innerHTML =
        `${cardTypes.map(function(type){
             return `${view.payrollCard(type,paymentData,assignees)}`
    }).join("")}`;

    const payrollList = new MDCList(document.querySelector('#Payroll-card ul'));
    const reimList = new MDCList(document.querySelector('#Reimbursements-card ul'))
    reimList.selectedIndex = 0;

    payrollList.singleSelection = true;
    payrollList.selectedIndex = 0;

    [].map.call(document.querySelectorAll('.mdc-list-item'), function (el) {
        new MDCRipple(el)
    })
    cardTypes.forEach(function (type) {
        const el = document.querySelector(`[data-type="${type}"] .recipients-container`);
        el.addEventListener('click', function (e) { 
         
            manageRecipients(assignees);
        })
        el.addEventListener('keypress', function (e) {
            if (e.charCode == 13) {
             
                manageRecipients(assignees);
                e.preventDefault();
                return;
            }
        })
    })

    payrollList.listen('MDCList:action', function (event) {
        if (event.detail.index == 1) {
            payrollView(office)
        }
    });
}

const manageRecipients = (assignees) => {
    
    document.getElementById('app-content').innerHTML = `<div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    <div class='mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-6-tablet mdc-layout-grid__cell--span-4-phone'>
    ${view.assigneeCard(assignees)}
    </div>
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    `
    const list = new MDCList(document.getElementById('report-recipient-list'))
    list.singleSelection = true;
    list.listen('MDCList:action', function (event) {
        updateRecipient(assignees[event.detail.index],assignees)
     
    });

    const fab = new MDCRipple(document.querySelector('.mdc-fab'))
    setTimeout(() => {
        fab.root_.classList.remove('mdc-fab--exited')

    }, 200)
    fab.root_.addEventListener('click', function (event) {
        updateRecipient(null,assignees);
    })
}

const updateRecipient = (recipient,assignees) => {
    const el = document.getElementById('recipient-update-card')
    const sub = el.querySelector(".mdc-typography--subtitle1")
    sub.textContent = recipient.displayName
    if(!el) return;
   
    el.querySelector('.demo-card__primary-action').innerHTML = `<div class='recipient-update-container'>
        <div class='mt-10 mb-10'>
            ${view.textFieldFilled({id:'recipient-name',type:'text',label:'Name',value:recipient ?  recipient.displayName : ''})}
        </div>
     
        <div class='mt-10 mb-10'>
            ${view.textFieldFilled({id:'recipient-email',type:'email',label:'Email',value:recipient ? recipient.email : ''})}
        </div>
        <div class='mt-10 mb-10'>
            ${view.textFieldTelephone({id:'recipient-phone',value:recipient ? recipient.phoneNumber : ''})}
        </div>
     
    </div>`


    const nameField = new MDCTextField(document.getElementById('recipient-name'))
    const emailField = new MDCTextField(document.getElementById('recipient-email'))
    const numberField = new MDCTextField(document.getElementById('recipient-phone'))
    const phoneNumberField =  phoneFieldInit(numberField)
    nameField.focus();
    el.querySelector('.mdc-card__actions').classList.remove('hidden');
    document.getElementById('cancel').onclick = function(){
        manageRecipients(assignees);
    };
    
    if(!recipient) {
        showRecipientActions();
        document.querySelector('#remove').classList.add('hidden')
        return;
    }
    [nameField,emailField,numberField].forEach(function(field){
        field.input_.addEventListener('input',showRecipientActions);
    })
}


function showRecipientActions() {
    document.getElementById('save').classList.remove('hidden');
}


const payrollView = (office) => {
    const leaeTypes = [{
        name:'leave type 1',
        limit:23
    },{
        name:'leave type 2',
        limit:1
    },{
        name:'leave type 3',
        limit:2
    }]
    document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop'>
    </div>
    <div class='mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop'>
        ${view.leaveTypeCard(leaeTypes)}
    </div>
    `
    const list = new MDCList(document.getElementById('leave-type-list'))
    list.singleSelection = true;
    list.listen('MDCList:action', function (event) {
        updateLeaveType(leaeTypes[event.detail.index])
    });

    const fab = new MDCRipple(document.querySelector('.mdc-fab'))
    setTimeout(() => {
        fab.root_.classList.remove('mdc-fab--exited')

    }, 200)
    fab.root_.addEventListener('click', function (event) {
        updateLeaveType();
    })
}
const updateLeaveType = (leaveType) => {
    const el = document.getElementById('leave-update-card')
    if(!el) return;
   
    el.querySelector('.demo-card__primary-action').innerHTML = `<div class='leaveType-update-container'>
        <div class='mt-10 mb-10'>
            ${view.textFieldFilled({id:'leave-name',type:'text',label:'Name',value:leaveType ? leaveType.name : ''})}
        </div>
    
        <div class='mt-10 mb-10'>
            ${view.textFieldFilled({id:'leave-limit',value:leaveType ? leaveType.limit : '',type:'number',label:'Annual limit'})}
        </div>
    </div>`


    const nameField = new MDCTextField(document.getElementById('leave-name'))
    const limitField = new MDCTextField(document.getElementById('leave-limit'))
   
    nameField.focus();
    el.querySelector('.mdc-card__actions').classList.remove('hidden');
    document.getElementById('cancel').onclick = function(){
        payrollView();
    };
    
    if(!leaveType) {
        showRecipientActions();
        document.querySelector('#remove').classList.add('hidden')
        return;
    }

    [nameField,limitField].forEach(function(field){
        field.input_.addEventListener('input',showRecipientActions);
    })
}