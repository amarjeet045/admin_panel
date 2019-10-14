function expenses(office, response) {
  console.log(office);
  console.log(response)
  commonDom.progressBar.close()
  commonDom.drawer.list.selectedIndex = 2;
  const cardTypes = ['payroll', 'reimbursement']

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

  document.getElementById('app-content').innerHTML = `
    ${cardTypes.map(function(type){
        return `${response[type] ? payrollCard(type,paymentData,response[type].recipient.assignees) : ''}
        `
    }).join("")}
  `

  const payrollList = new mdc.list.MDCList(document.querySelector('#payroll-card ul'));
  const reimList = new mdc.list.MDCList(document.querySelector('#reimbursement-card ul'))
  reimList.selectedIndex = 0;
  payrollList.singleSelection = true;
  payrollList.selectedIndex = 0;

  [].map.call(document.querySelectorAll('.mdc-list-item'), function (el) {
    new mdc.ripple.MDCRipple(el)
  })

  cardTypes.forEach(function (type) {
    const el = document.querySelector(`[data-type="${type}"] .heading-action-container`);
    el.addEventListener('click', function (e) {
      manageRecipients(response[type].recipient, type,office);
    });
  })

  payrollList.listen('MDCList:action', function (event) {
    if (event.detail.index == 1) {
      history.pushState({
        view: 'payrollView',
        office: office
      }, 'Payroll View', `/?view=PayrollView`);
      payrollView(office)
    }
  });
}

function manageRecipients(recipient, type,office) {
  
  commonDom.progressBar.close();
  document.getElementById('app-content').innerHTML = `<div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    <div class='mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-6-tablet mdc-layout-grid__cell--span-4-phone'>
        ${assigneeCard()}
    </div>
    </div>
    <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
    `;
  const ul = createElement('ul', {
    className: 'mdc-list demo-list mdc-list--two-line mdc-list--avatar-list'
  })
  recipient.assignees.forEach(function (assignee) {
    const li = assigneeLi(assignee)
    li.querySelector('.status-button').addEventListener('click', function () {
     
      http('PATCH', `/api/activities/share/`, {
        activityId:recipient.activityId,
        share:[assignee],
       
      }).then(function (response) {
        console.log(response)
        snackBar(`${assignee.phoneNumber} removed from ${type}`)
      }).catch(console.error)
    
    })
    ul.appendChild(li);
  });

  document.querySelector('#recipient-update-card .list-section').appendChild(ul)
  const add = document.getElementById('add-assignee-btn')
  setTimeout(() => {
    add.classList.remove('mdc-fab--exited')
  }, 200)

  add.addEventListener('click', function (event) {
    history.pushState({
      view: 'expenses',
      office: history.state.office
    }, 'expenses', `/?view=addRecipient`);
    add.remove();
    addRecipient('recipient-update-card');
  });
}

const assigneeCard = () => {
  return `
  <div class='mdc-card  mdc-card--outlined assignee-card' id='recipient-update-card'>
 <div class="demo-card__primary">
     <div class="card-heading">
         <span class="demo-card__title mdc-typography mdc-typography--headline6"> Manage Recipients</span>
         
      </div>
      <div class='recipients-container'>
        ${cardButton('add-assignee-btn').add('add').outerHTML}
      </div>
 </div>
 <div class="demo-card__primary-action">   
          <div class='list-section'></div>
  </div>
     <div class="mdc-card__actions hidden">
         <div class="mdc-card__action-icons">
         </div>
         <div class="mdc-card__action-buttons">
         
         </div>
       </div>
</div>
</div>
`

}


const assigneeLi = (assignee) => {
  const img = createElement('img', {
    className: 'mdc-list-item__graphic',
    src: assignee.photoURL || '../img/person.png'
  })

  const container = createElement('div', {
    className: 'actionable-list-container'
  });

  const li = createElement('li', {
    className: 'mdc-list-item'
  });

  const textSpan = createElement('span', {
    className: 'mdc-list-item__text'
  });

  const primaryText = createElement('span', {
    className: 'mdc-list-item__primary-text',
    textContent: assignee.displayName
  });

  const secondaryText = createElement('span', {
    className: 'mdc-list-item__secondary-text',
    textContent: assignee.email || '-'
  });

  textSpan.appendChild(primaryText)
  textSpan.appendChild(secondaryText);
  li.appendChild(img)
  li.appendChild(textSpan);
  new mdc.ripple.MDCRipple(li)
  container.appendChild(li)
  container.appendChild(createStatusIcon('CONFIRMED'));
  return container;

}


const addRecipient = (id) => {

  const el = document.getElementById(id)
  el.querySelector(".card-heading .demo-card__title").textContent = 'Add Recipients'
  el.querySelector(".card-heading .mdc-typography--subtitle1").textContent = ''
  el.querySelector('.mdc-card__actions').classList.remove('hidden')
  if (!el) return;

  el.querySelector('.demo-card__primary-action').innerHTML = `<div class='recipient-update-container'>
      <div class='mt-10 mb-10'>
          ${textFieldTelephone({id:'recipient-phone'})}
      </div>
  </div>`

  el.querySelector('.mdc-card__action-icons').innerHTML = ''
  const cardButtonContainer = el.querySelector('.mdc-card__action-buttons');

  const cancelBtn = cardButton('close-btn').cancel();
  const saveBtn = cardButton('save-btn').save();

  cancelBtn.addEventListener('click', function () {
    history.back();
  })
  saveBtn.addEventListener('click', function () {
    //send api
  })

  cardButtonContainer.appendChild(cancelBtn)

  const numberField = new mdc.textField.MDCTextField(document.getElementById('recipient-phone'))
  numberField.focus();
  const phoneNumberField = phoneFieldInit(numberField)
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


function payrollView(office) {
  commonDom.progressBar.close();
  document.getElementById('app-content').innerHTML = `
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell'>
    <div class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
    <div class="demo-card__primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">Employees</span>
            <div class="mdc-typography--caption">Last updated : 13/12/12 6:00 AM</div>
            <div class="mdc-typography--subtitle2" style='color:green;'>Active yesterday: 296</div>
            </div>
            <div class='heading-action-container'>
           
              <span class='mdc-typography--subtitle2'>Total</span>
              <div class='mdc-typography--headline5'>300</div>
           
            </div>
    </div>

    <div class="mdc-card__actions mdc-card__actions--full-bleed">
    <button class="mdc-button mdc-card__action mdc-card__action--button" id='open-employee'>
      <span class="mdc-button__label">Manage Employees</span>
      <i class="material-icons" aria-hidden="true">arrow_forward</i>
    </button>
    
    </div>
</div>
    </div>
    <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell'>
        ${leaveTypeCard()}
    </div>
    `

  document.getElementById('open-leave-type').addEventListener('click', function () {
    history.pushState({
      view: 'updateLeaveType',
      office: office
    }, 'updateLeaveType', '/?view=updateLeaveType')
    updateLeaveType()
  })
  document.getElementById('open-employee').addEventListener('click', function () {
    history.pushState({
      view: 'manageEmployees',
      office: office
    }, 'manageEmployees', '/?view=manageEmployees')
    manageEmployees()
  })

}

function manageEmployees() {
  commonDom.progressBar.close();
  commonDom.drawer.list_.selectedIndex = 2;
  const sample = [{
    Name: 'John doe',
    code: '123',
    phoneNumber: '+919999288921'
  }, {
    Name: 'John doe',
    code: '123123',
    phoneNumber: '+919999288921'
  }, {
    Name: 'John doe',
    code: 'sdfsdf',
    phoneNumber: '+919999288921'
  }]
  document.getElementById('app-content').innerHTML = `
<div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
${searchBar('employee-search').outerHTML}
<div class='action-header'>
<h3 class="mdc-list-group__subheader mdc-typography--headline5">Employees</h3>
<button class="mdc-fab mdc-fab--mini mdc-theme--primary-bg" aria-label="add" id='add-emp'>
     <span class="mdc-fab__icon material-icons mdc-theme--on-primary">add</span>
</button>
</div>
<ul class='mdc-list mdc-list--two-line' id='branch-list'>
${sample.map(function(item){
  const f = `${item.Name} (${item.phoneNumber})`
  return `${actionList(f,item.code,'CONFIRMED').outerHTML}`
}).join("")}

</ul>
</div>
</div>
<div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
</div>
`

  const search = new mdc.textField.MDCTextField(document.getElementById('employee-search'))
  const branchList = new mdc.list.MDCList(document.getElementById('branch-list'))
  branchList.selectedIndex = 0;
  document.getElementById('add-emp').addEventListener('click', function () {
    document.getElementById('dialog').innerHTML = `<div class="mdc-dialog"
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="my-dialog-title"
  aria-describedby="my-dialog-content">
<div class="mdc-dialog__container">
 <div class="mdc-dialog__surface">
   <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
   <h2 class="mdc-dialog__title" id="my-dialog-title">Employees</h2>
   <div class="mdc-dialog__content" id="my-dialog-content">
      <div class='download-sample-container'>
        <button class='mdc-button mdc-button--raised'>
          <span class='mdc-button__label'>Download SAMPLE</span>
        </button>
      </div>
      <div class='download-sample-container'>
      <button class='mdc-button'>
        <span class='mdc-button__label'>Upload SHEET</span>
      </button>
    </div>
   </div>
 </div>
</div>
<div class="mdc-dialog__scrim"></div>
</div>`

    const dialog = new mdc.dialog.MDCDialog(document.querySelector('.mdc-dialog'))
    dialog.open();
  })
}

function updateLeaveType() {
  commonDom.progressBar.close();
  commonDom.drawer.list_.selectedIndex = 2;
  const leaeTypes = [{
    name: 'leave type 1',
    limit: 23,
    status: 'CANCELLED'
  }, {
    name: 'leave type 2',
    limit: 1,
    status: 'CONFIRMED'
  }, {
    name: 'leave type 3',
    limit: 2,
    status: 'CONFIRMED'
  }]


  const card = actionCard({
    id: 'leave-type-card',
    title: 'Leave type'
  })
  document.getElementById("app-content").innerHTML = `
  <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
  <div class='mdc-layout-grid__cell--span-10-desktop mdc-layout-grid__cell--span-6-tablet mdc-layout-grid__cell--span-4-phone'>
       ${card.outerHTML}
  </div>
  <div class='mdc-layout-grid__cell--span-1-desktop mdc-layout-grid__cell--span-1-tablet'></div>
  `

  const ul = createElement('ul', {
    className: 'mdc-list demo-list mdc-list--two-line mdc-list--avatar-list'
  })
  leaeTypes.forEach(function (item) {
    const li = actionList(item.name, `Annual Limit : ${item.limit}`, item.status);
    ul.appendChild(li);
  })
  document.querySelector('#leave-type-card .list-section').appendChild(ul)
  const add = document.getElementById('add-assignee-btn')
  setTimeout(() => {
    add.classList.remove('mdc-fab--exited')
  }, 200)

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