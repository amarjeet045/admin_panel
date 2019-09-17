import * as view from  './views';
import {MDCList} from "@material/list";
import {MDCRipple} from "@material/ripple";
import * as firebase from "firebase/app";
export const expenses = (office) => {
  
    const cardTypes = ['Payroll','Reimbursements']
 
    const paymentData = [{
        amount:400,
        date:"30/9/2019",
        employees:400,
        label:'PENDING',
        buttonText:'pay now',
        status:'PENDING'
    },{
        amount:200,
        date:"30/9/2019",
        employees:400,
        label:'Current cycle',
        buttonText:'Manage',
        status:''


    },
    {
        amount:200,
        date:"30/8/2019",
        employees:400,
        label:'Last payment',
        buttonText:'view',
        status:'CONFIRMED'

    }]
   
    document.getElementById('app-content').innerHTML =
        `${cardTypes.map(function(type){
             return `${view.payrollCard(type,paymentData)}`
    }).join("")}`;

    const payrollList = new MDCList(document.querySelector('#Payroll-card ul'));
    const reimList = new MDCList(document.querySelector('#Reimbursements-card ul'))
    reimList.selectedIndex = 0;

    payrollList.singleSelection = true;
    payrollList.selectedIndex = 0;

    [].map.call(document.querySelectorAll('.mdc-list-item'),function(el){
        new MDCRipple(el)
    })

    payrollList.listen('MDCList:action',function(event){
        if(event.detail.index == 1) {
            payrollView(office)
        }
    });
}


const payrollView = (office) => {
    const activity = {
        assignees:[{
            displayName:'John Doe',
            photoURL:firebase.auth().currentUser.photoURL,
            phoneNumber:firebase.auth().currentUser.phoneNumber,
            email:'something@gmail.com',
            emailVerified:true
        }]
    }
document.getElementById('app-content').innerHTML = `<div class='mdc-layout-grid__cell--span-2-desktop mdc-layout-grid__cell--span-1-tablet'></div>
<div class='mdc-layout-grid__cell--span-8-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-6-tablet'>
<ul class='mdc-list'>
<li class='mdc-list-item'>
something
</li>
</ul>
<div id='assignee-container'>
    ${view.assigneeCard(activity)}
</div>
</div>
<div class='mdc-layout-grid__cell--span-2-desktop mdc-layout-grid__cell--span-1-tablet'></div>
`
const fab = new MDCRipple(document.querySelector('.mdc-fab'))
setTimeout(()=>{
    fab.root_.classList.remove('mdc-fab--exited')

},200)
fab.root_.addEventListener('click',function(event){

})

}

