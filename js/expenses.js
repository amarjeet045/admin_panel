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
    
    [].map.call(document.querySelectorAll('.mdc-list-item, .mdc-card__action--button'), function (el) {
        console.log(el)
        if(el.classList.contains('mdc-list-item') && el.dataset.status === 'PENDING') {
     
            el.classList.add('mdc-list-item--selected')
        }
        new MDCRipple(el);
    })
}


