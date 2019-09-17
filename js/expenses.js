import * as view from  './views';
import {MDCList} from "@material/list";
import {MDCRipple} from "@material/ripple";

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
document.getElementById('app-content').innerHTML = ''

}

