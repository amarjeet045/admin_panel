import * as view from './views';
import {
  MDCList
} from "@material/list";
import {
  MDCRipple
} from "@material/ripple";
import * as firebase from "firebase/app";
import {
  MDCTextField
} from '@material/textfield';


export const expenses = (office) => {
  console.log(office);
  commonDom.progressBar.close()
  commonDom.drawer.list.selectedIndex = 2;
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
      history.pushState({
        view:'payrollView',
        office:office
      },'Payroll View',`?view=Payroll`);
      
      payrollView(office)
    }
  });
}

const manageRecipients = (assignees) => {

  document.getElementById('app-content').innerHTML = `<div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    <div class='mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-6-tablet mdc-layout-grid__cell--span-4-phone'>
        ${view.assigneeCard(assignees)}
      
    </div>
    </div>
  
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    `;



  const fab = new MDCRipple(document.querySelector('.mdc-fab'))

  setTimeout(() => {
    fab.root_.classList.remove('mdc-fab--exited')

  }, 200)
  fab.root_.addEventListener('click', function (event) {
    updateRecipient('recipient-update-card');
  })
}



const updateRecipient = (id) => {
  const el = document.getElementById(id)
  el.classList.add("iframe-card");
  el.innerHTML = `<iframe src="../forms/recipient/" id='iframe'></iframe>`
  document.getElementById('iframe').addEventListener('load', function (evt) {
    history.pushState({
      view: 'expenses',
      office: history.state.office
    }, 'expenses', `/?view=addRecipient`)
    window.resizeIframe(document.getElementById('iframe'));
  })
}


function showRecipientActions() {
  [...document.querySelectorAll('.save')].forEach(function (el) {
    el.classList.remove("hidden")
  })
  // document.qu('save').classList.remove('hidden');
}


const payrollView = (office) => {
  const leaeTypes = [{
    name: 'leave type 1',
    limit: 23
  }, {
    name: 'leave type 2',
    limit: 1
  }, {
    name: 'leave type 3',
    limit: 2
  }]
  document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-12-desktop'>
    <ul class="mdc-list demo-list mdc-list--two-line mdc-list--avatar-list">
    <li class="mdc-list-item mdc-ripple-upgraded" tabindex="0" id="" style="">
    <span class="mdc-list-item__graphic material-icons" aria-hidden="true">people</span>
    <span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">Employees</span>
    <span class="mdc-list-item__secondary-text">Active yesterday : 300</span>
    </span>
    </li>
    </ul>
    </div>
    <div class='mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-12-desktop'>
        ${view.leaveTypeCard(leaeTypes)}
      
    </div>
    `


  const list = new MDCList(document.getElementById('leave-type-list'))
  list.singleSelection = true;
  list.listen('MDCList:action', function (event) {
    updateLeaveType(leaeTypes[event.detail.index], 'leave-update-card')
  });

  const fab = new MDCRipple(document.querySelector('.mdc-fab'))
  setTimeout(() => {
    fab.root_.classList.remove('mdc-fab--exited')

  }, 200)
  fab.root_.addEventListener('click', function (event) {
    addLeaveType('leave-update-card');
  })
}
const updateLeaveType = (leaveType, id) => {
  const el = document.getElementById(id)
  el.classList.add("iframe-card");
  el.innerHTML = `<iframe src="../forms/leave-type/" id='iframe'></iframe>`
  const frame = document.getElementById('iframe')
  frame.addEventListener('load', function (evt) {
    frame.contentWindow.init({
      "venue": [],
      "hidden": 1,
      "canEditRule": "ADMIN",
      "schedule": [],
      "attachment": {
        "Annual Limit": {
          "type": "number",
          "value": "213"
        },
        "Name": {
          "type": "string",
          "value": "sad"
        }
      },
      "name": "leave-type",
      "comment": "Leave-Type template is created for listing different types of leaves.",
      "statusOnCreate": "CONFIRMED",
      "timestamp": 1552914459794
    })
    history.pushState({
      view: 'expenses',
      office: history.state.office
    }, 'expenses', `/?view=addLeaveType`)

    window.resizeIframe(document.getElementById('iframe'));
  })
}

const addLeaveType = (id) => {
  const el = document.getElementById(id)
  el.classList.add("iframe-card");
  el.innerHTML = `<iframe src="../forms/leave-type/" id='iframe'></iframe>`
  document.getElementById('iframe').addEventListener('load', function (evt) {
    document.getElementById('iframe').contentWindow.init();
    history.pushState({
      view: 'expenses',
      office: history.state.office
    }, 'expenses', `/?view=addLeaveType`)
    window.resizeIframe(document.getElementById('iframe'));
  })
}