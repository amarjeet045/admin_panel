import * as view from './views';
import {
    MDCList
} from "@material/list";
import {
    MDCRipple
} from "@material/ripple";
import * as firebase from "firebase/app";
export const expenses = (office) => {

    const cardTypes = ['Payroll', 'Reimbursements']

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
             return `${view.payrollCard(type,paymentData)}`
    }).join("")}`;

    const payrollList = new MDCList(document.querySelector('#Payroll-card ul'));
    const reimList = new MDCList(document.querySelector('#Reimbursements-card ul'))
    reimList.selectedIndex = 0;

    payrollList.singleSelection = true;
    payrollList.selectedIndex = 0;

    [].map.call(document.querySelectorAll('.mdc-list-item'), function (el) {
        new MDCRipple(el)
    })

    payrollList.listen('MDCList:action', function (event) {
        if (event.detail.index == 1) {
            payrollView(office)
        }
    });
}


const payrollView = (office) => {
    const activity = {
        assignees: [{
            displayName: 'John Doe',
            photoURL: firebase.auth().currentUser.photoURL,
            phoneNumber: firebase.auth().currentUser.phoneNumber,
            email: 'something@gmail.com',
            emailVerified: true
        }]
    }
    document.getElementById('app-content').innerHTML = `

<ul class="mdc-list demo-list mdc-list--two-line mdc-list--avatar-list mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-12-desktop">
<li class="mdc-list-item mdc-ripple-upgraded" tabindex="0" id="9b330666-c520-444f-8b70-24cf48c149f7" style="--mdc-ripple-fg-size:360px; --mdc-ripple-fg-scale:1.7064; --mdc-ripple-fg-translate-start:-49.0508px, -136.094px; --mdc-ripple-fg-translate-end:120px, -144px;">
<span class="mdc-list-item__graphic material-icons" aria-hidden="true">people</span>
<span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">Manage Employees</span>
<span class="mdc-list-item__secondary-text">Active yesterday : 200</span>
</span>
<span class="mdc-list-item__meta material-icons" aria-hidden="true">arrow_forward</span></li></ul>


`
    

}