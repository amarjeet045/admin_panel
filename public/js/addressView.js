function addressView  (office)  {
    // add fetch to get required apiData;
    commonDom.progressBar.close();
    commonDom.drawer.list.selectedIndex = 3;
    document.getElementById('app-content').innerHTML = `${branchCard()}${customerCard()}`;

    document.getElementById('branch-card').addEventListener('click', function () {

        openBranches()
    })
    document.getElementById('customer-card').addEventListener('click', function () {
        openBranches();
    })

};

const branchCard = () => {
    return `<div id='branch-card' class="mdc-card address-card  mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
  <div class="demo-card__primary">
      <div class="card-heading">
          <span class="demo-card__title mdc-typography--headline6">Branches</span>
          <div class="mdc-typography--caption">Last updated : 13/12/12 6:00 AM</div>
          <div class="mdc-typography--subtitle2" style='color:green;'>Active: 3</div>
      </div>
      <div class='recipients-container'>
          <span class='mdc-typography--subtitle2'>Total</span>
          <div class='mdc-typography--headline5'>3</div>
      </div>

  </div>
  <div class="demo-card__primary-action">   </div>
  <div class="mdc-card__actions mdc-card__actions--full-bleed">
  <a class="mdc-button mdc-card__action mdc-card__action--button" href="#">
    <span class="mdc-button__label">Manage Branches</span>
    <i class="material-icons" aria-hidden="true">arrow_forward</i>
  </a>

  </div>
</div>
`
}

const customerCard = () => {
    return `<div id='customer-card' class="mdc-card address-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
  <div class="demo-card__primary">
      <div class="card-heading">
          <span class="demo-card__title mdc-typography--headline6">Customers</span>
          <div class="mdc-typography--caption">Last updated : 13/12/12 6:00 AM</div>
          <div class="mdc-typography--subtitle2" style='color:green;'>Verified: 30</div>
      </div>
      <div class='recipients-container'>
          <span class='mdc-typography--subtitle2'>Total</span>
          <div class='mdc-typography--headline5'>32</div>
      </div>

  </div>
  <div class="demo-card__primary-action">   
    
  </div>
  <div class="mdc-card__actions mdc-card__actions--full-bleed">
  <a class="mdc-button mdc-card__action mdc-card__action--button" href="#">
    <span class="mdc-button__label">Manage Customers</span>
    <i class="material-icons" aria-hidden="true">arrow_forward</i>
  </a>

  </div>
</div>`
}


const openBranches = () => {
    const sample = [{
        Name: 'Lorem Ipsum',
        address: 'Somewhere but not here'
    }, {
        Name: 'Lorem Ipsum',
        address: 'Somewhere but not here'
    }, {
        Name: 'Lorem Ipsum',
        address: 'Somewhere but not here'
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
    <button class="mdc-fab mdc-fab--mini mdc-theme--primary-bg" aria-label="add">
         <span class="mdc-fab__icon material-icons mdc-theme--on-primary">add</span>
    </button>
</div>
<ul class='mdc-list mdc-list--two-line' id='branch-list'>
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
  <div class="mdc-card__media mdc-card__media--16-9 demo-card__media" style="height: 200px;background-image: url(&quot;https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap%20&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=AIzaSyCadBqkHUJwdcgKT11rp_XWkbQLFAy80JQ&quot;);"></div>
  <div class="demo-card__secondary mdc-typography mdc-typography--body2">
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

    const search = new mdc.textField.MDCTextField(document.getElementById('search-address'))
    const branchList = new mdc.list.MDCList(document.getElementById('branch-list'))
    branchList.selectedIndex = 0;
}