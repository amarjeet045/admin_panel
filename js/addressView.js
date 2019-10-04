import * as core from './core';
import {
  MDCTextField
} from '@material/textfield';
import {
  MDCList
} from '@material/list';

export const addressView = (office) => {
  // add fetch to get required apiData;
  commonDom.progressBar.close();
  commonDom.drawer.list.selectedIndex = 3;
  document.getElementById('app-content').innerHTML =`${branchCard()}${customerCard()}`;

  document.getElementById('branch-card').addEventListener('click',function(){
   
    openBranches()
  })
  document.getElementById('customer-card').addEventListener('click',function(){
    openCustomers();
  })

  const search = new MDCTextField(document.getElementById('search-address'))
  const branchList = new MDCList(document.getElementById('branches-list'))
  branchList.selectedIndex = 0;
  
};

const branchCard = () => {
  return `<div id='branch-card' class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
  <div class="demo-card__primary">
      <div class="card-heading">
          <span class="demo-card__title mdc-typography--headline6">Branches</span>
          <div class="mdc-typography--caption">Last updated : 13/12/12 6:00 AM</div>
          <div class="mdc-typography--subtitle2">Active Branches: 3</div>
      </div>
      <div class='recipients-container'>
          <span class='mdc-typography--subtitle2'>Total</span>
          <div class='mdc-typography--headline5'>3</div>
      </div>

  </div>
  <div class="demo-card__primary-action">   
      <ul class='mdc-list'>
        <li class='mdc-list-item'>North : 1</li>
        <li class='mdc-list-item'>South : 1</li>
        <li class='mdc-list-item'>Non-Region : 1</li>
      </ul>
  </div>
</div>
`
}

const customerCard = () => {
  return `<div id='customer-card' class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
  <div class="demo-card__primary">
      <div class="card-heading">
          <span class="demo-card__title mdc-typography--headline6">Customers</span>
          <div class="mdc-typography--caption">Last updated : 13/12/12 6:00 AM</div>
          <div class="mdc-typography--subtitle2">Verified Customers: 30</div>
      </div>
      <div class='recipients-container'>
          <span class='mdc-typography--subtitle2'>Total</span>
          <div class='mdc-typography--headline5'>32</div>
      </div>

  </div>
  <div class="demo-card__primary-action">   
      <ul class='mdc-list'>
       
        <li class='mdc-list-item'>North : 20</li>
        <li class='mdc-list-item'>South : 10</li>
        <li class='mdc-list-item'>Non-Region : 2</li>
      </ul>
  </div>
</div>`
}


const openBranches = () => {
  const sample = [{
    Name:'Lorem Ipsum',
    address:'Somewhere but not here'
  },{
    Name:'Lorem Ipsum',
    address:'Somewhere but not here'
  },{
    Name:'Lorem Ipsum',
    address:'Somewhere but not here'
  }]
  document.getElementById('app-content').innerHTML = `
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
    <div class='search-bar'>

    </div>
    <ul class='mdc-list mdc-list--two-line'>
      ${sample.map(function(item){
          return `<li class='mdc-list-item'>
              <span class='mdc-list-item__text'>
                  <span class='mdc-list-item__primary-text'>${item.Name}</span>
                  <span class='mdc-list-item__secondary-text'>${item.address}</span>
              </span>
          </li>`
      }).join("")}
    
    </ul>
  </div>
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
      
  </div>

  `
}