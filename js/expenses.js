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
    emailVerified: firebase.auth().currentUser.emailVerified,
    status: 'CONFIRMED'

  }, {
    displayName: 'joen doe',
    photoURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs1Mtx-INbdQ5D3Xmsyq-D3HjpKmXnhKiqJsyzfNxzJ8gx-ewB',
    phoneNumber: '+919999288928',
    email: 'something@gmail.com',
    emailVerified: true,
    status: 'CONFIRMED'

  }, {
    displayName: 'joen doe 2',
    photoURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMr_Ky37u_30imoav7-kzi01LCBOh88WP6hu2r3IkXUJaQsWexdA',
    phoneNumber: '+919999288922',
    email: 'something2@gmail.com',
    emailVerified: false,
    status: 'CANCELLED'
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
        view: 'payrollView',
        office: office
      }, 'Payroll View', `?view=Payroll`);

      payrollView(office)
    }
  });
}

const manageRecipients = (assignees) => {

  document.getElementById('app-content').innerHTML = `<div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    <div class='mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-6-tablet mdc-layout-grid__cell--span-4-phone'>
        ${view.assigneeCard()}
    </div>
    </div>
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    `;
  const ul = view.createElement('ul', {
    className: 'mdc-list demo-list mdc-list--two-line mdc-list--avatar-list'
  })
  assignees.forEach(function (assignee) {
    const li = view.assigneeLi(assignee)
    li.querySelector('.status-button').addEventListener('click',function(){
      //share api
    })
    ul.appendChild(li);
  });
  document.querySelector('#recipient-update-card .list-section').appendChild(ul)
  ul.appendChild(view.createElement('li', {
    role: 'seperator',
    className: 'mdc-list-divider'
  }))
  const add = document.getElementById('add-assignee-btn')
  setTimeout(() => {
    add.classList.remove('mdc-fab--exited')
  }, 200)

  add.addEventListener('click', function (event) {
    history.pushState({
      view: 'expenses',
      office: history.state.office
    }, 'expenses', `/?view=addRecipient`);
    addRecipient('recipient-update-card');
  })
}



const addRecipient = (id) => {

  const el = document.getElementById(id)
  el.querySelector(".card-heading .demo-card__title").textContent = 'Add Recipients'
  el.querySelector(".card-heading .mdc-typography--subtitle1").textContent = ''

  if (!el) return;

  el.querySelector('.demo-card__primary-action').innerHTML = `<div class='recipient-update-container'>
      <div class='mt-10 mb-10'>
          ${view.textFieldTelephone({id:'recipient-phone'})}
      </div>
  </div>`

  el.querySelector('.mdc-card__action-icons').innerHTML = ''
  const cardButtonContainer = el.querySelector('.mdc-card__action-buttons');

  const cancelBtn = view.cardButton('close-btn').cancel();
  const saveBtn = view.cardButton('save-btn').save();

  cancelBtn.addEventListener('click',function(){
    history.back();
  })
  saveBtn.addEventListener('click',function(){
    //send api
  })

  cardButtonContainer.appendChild(cancelBtn)

  const numberField = new MDCTextField(document.getElementById('recipient-phone'))
  numberField.focus();
  const phoneNumberField = require("./phoneNumber").phoneFieldInit(numberField)
  numberField.input_.addEventListener('input', function (e) {
    console.log(e)
    if (!e.target.value) {
      cardButtonContainer.removeChild(saveBtn)
      return;
    };
    if (!document.getElementById('save-btn')) {
        cardButtonContainer.appendChild(saveBtn)
      return;
    }

  })

}




function showRecipientActions() {
  [...document.querySelectorAll('.save')].forEach(function (el) {
    el.classList.remove("hidden")
  })

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
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell'>
    <div class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
    <div class="demo-card__primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">Employees</span>
            <div class="mdc-typography--caption">Last updated : 13/12/12 6:00 AM</div>
            <div class="mdc-typography--subtitle2" style='color:green;'>Active yesterday: 296</div>
           
        </div>
        <div class='recipients-container' tabindex="0">
          <span class='mdc-typography--subtitle2'>Total</span>
          <div class='mdc-typography--headline5'>300</div>
        </div>
    </div>

    <div class="mdc-card__actions mdc-card__actions--full-bleed">
    <a class="mdc-button mdc-card__action mdc-card__action--button" href="#">
      <span class="mdc-button__label">Manage Employees</span>
      <i class="material-icons" aria-hidden="true">arrow_forward</i>
    </a>
    
    </div>
</div>
    </div>
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell'>
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
    fab.root_.classList.remove('mdc-fab--exited');
  }, 200)

  fab.root_.addEventListener('click', function (event) {
    addLeaveType('leave-update-card');
  });

}
const updateLeaveType = (leaveType, id) => {
  const el = document.getElementById(id)
  el.classList.add("iframe-card");
  el.innerHTML = `<iframe src="./forms/leave-type/" id='iframe'></iframe>`
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
  el.innerHTML = `<iframe src="./forms/leave-type/" id='iframe'></iframe>`
  document.getElementById('iframe').addEventListener('load', function (evt) {
    document.getElementById('iframe').contentWindow.init();
    history.pushState({
      view: 'expenses',
      office: history.state.office
    }, 'expenses', `/?view=addLeaveType`)
    window.resizeIframe(document.getElementById('iframe'));
  })
}