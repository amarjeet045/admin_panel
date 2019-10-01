import * as core from './core';


export const addressView = (office) => {
    // add fetch to get required apiData;
    const testData = [{
        lastModifiedDate: 1569825339982,
        location: 'mock location 1',
        address: 'mock address 1',
        latitude: 23.213,
        longitude: 77.123,
        canEdit: true,
        template: 'branch',
        Name: 'seattle'
    }, {
        lastModifiedDate: 1569825341003,
        location: 'mock location 2',
        address: 'mock address 2',
        latitude: 23.213,
        longitude: 77.123,
        canEdit: false,
        template: 'customer',
        Name: 'Through the never'
    }];

    document.getElementById('app-content').innerHTML = ` <div  class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
    <div class="demo-card__primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">Branch</span>
        </div>
        <div class='recipients-container' tabindex="0">
            <ul class='mdc-list demo-list mdc-list--two-line'>
                <li class='mdc-list-item'>
                    
                </li>
            </ul>
        </div>
    </div>
    <div class="demo-card__primary-action">   
         
    </div>
</div>
<div  class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
    <div class="demo-card__primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">Customer</span>
        </div>
        <div class='recipients-container' tabindex="0">

        </div>
    </div>
    <div class="demo-card__primary-action">   
         
    </div>
</div>
`
    
};
