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
    <div class="mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon" id='search-address'>
    <i class="material-icons mdc-text-field__icon">search</i>
    <input class="mdc-text-field__input" id="text-field-hero-input">
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      <div class="mdc-notched-outline__notch">
        <label for="text-field-hero-input" class="mdc-floating-label">Search</label>
      </div>
      <div class="mdc-notched-outline__trailing"></div>
    </div>
    </div>
    </div>
    <div class='action-header'>
    <h3 class="mdc-list-group__subheader mdc-typography--headline5">Branches</h3>
    <button class="mdc-fab mdc-fab--mini" aria-label="add">
         <span class="mdc-fab__icon material-icons">add</span>
    </button>
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
  </div>
  <div class='mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
  <div class='map-view mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4 mdc-layout-grid__cell--order-1'>
  <div class="mdc-card demo-card demo-basic-with-header address-card">
    <div class="demo-card__primary">
      <h2 class="demo-card__title mdc-typography mdc-typography--headline6 mt-0 mb-0">Lorem Ipsm</h2>
      <h3 class="demo-card__subtitle mdc-typography mdc-typography--subtitle2 mt-0">Somewhere but not here</h3>
    </div>
  <div class="mdc-card__primary-action demo-card__primary-action" tabindex="0">
  <div class="mdc-card__media mdc-card__media--16-9 demo-card__media" style="background-image: url(&quot;https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap%20&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=AIzaSyCadBqkHUJwdcgKT11rp_XWkbQLFAy80JQ&quot;);"></div>
  <div class="demo-card__secondary mdc-typography mdc-typography--body2">
  <div class='address-card-data'>
    <ul class='mdc-list mdc-list--two-line mdc-list--avatar-list'>
      <li class='mdc-list-item'>
          <span class='mdc-list-item__graphic material-icons'>contacts</span>
          <span class='mdc-list-item__text'>
            <span class='mdc-list-item__primary-text'>First Contact</span>
            <span class='mdc-list-item__secondary-text'>+919999288921</span>
          </span>
      </li>
      <li class='mdc-list-item'>
        <span class='mdc-list-item__graphic material-icons'></span>
        <span class='mdc-list-item__text'>
          <span class='mdc-list-item__primary-text'>Second Contact</span>
          <span class='mdc-list-item__secondary-text'>+919999288921</span>
        </span>
      </li>
      <li class='mdc-list-item'>
      <span class='mdc-list-item__graphic material-icons'>code</span>
      <span class='mdc-list-item__text'>
        <span class='mdc-list-item__primary-text'>Branch Code</span>
        <span class='mdc-list-item__secondary-text'>123435</span>
      </span>
    </li>
  <li class='mdc-list-divider'></li>  
  <li class='mdc-list-item'>
      <span class='mdc-list-item__graphic material-icons'>work_off</span>
      <span class='mdc-list-item__text'>
        <span class='mdc-list-item__primary-text'>Sunday</span>
        <span class='mdc-list-item__secondary-text'>+919999288921</span>
      </span>
  </li>
  <li class='mdc-list-item'>
    <span class='mdc-list-item__graphic material-icons'>today</span>
    <span class='mdc-list-item__text'>
      <span class='mdc-list-item__primary-text'>Weekday Time</span>
      <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
    </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
    <span class='mdc-list-item__primary-text'>Staurday Time</span>
    <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-divider'></li>  
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  <li class='mdc-list-item'>
  <span class='mdc-list-item__graphic material-icons'></span>
  <span class='mdc-list-item__text'>
  <span class='mdc-list-item__primary-text'>Holiday 1</span>
  <span class='mdc-list-item__secondary-text'>6:00 AM - 10:00 PM</span>
  </span>
  </li>
  </ul>
  
  </div>
  </div>
  </div>
  <div class="mdc-card__actions">
  <div class="mdc-card__action-buttons">
  <button class="mdc-button mdc-card__action mdc-card__action--button">Edit</button>
  </div>
  <div class="mdc-card__action-icons">
  <button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded" title="Share" data-mdc-ripple-is-unbounded="true">delete</button>
  </div>
  </div>
  </div>
  </div>
  </div>
  `
}
