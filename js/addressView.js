import * as core from './core';
import {
    MDCDataTable
} from '@material/data-table';
import {
    events
} from '@material/data-table/constants';

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



    document.getElementById('app-content').innerHTML = `<div  class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-4-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
    <div class="demo-card__primary data-table-primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">Branch</span>
           
        </div>
        <div class='recipients-container' tabindex="0">
            <div class='overlapped-images-container'>
                
            </div>
        </div>
    </div>
    <div class="demo-card__primary-action">   
        ${branchTable()}
    </div>
    <div class="mdc-card__actions">
  <div class="mdc-card__action-buttons" id='branch-remove-selected'>
    
  </div>
  <div class="mdc-card__action-icons">
    
  </div>
</div>
</div>
<div  class="mdc-card expenses-card mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-4-tablet mdc-layout-grid__cell--span-6-desktop mdc-card--outlined">
    <div class="demo-card__primary data-table-primary">
        <div class="card-heading">
            <span class="demo-card__title mdc-typography mdc-typography--headline6">Customer</span>
            <div class='remove-selected-container' id='customer-remove-selected'>
                
            </div>
        </div>
        <div class='recipients-container' tabindex="0">
            <div class='overlapped-images-container'>
            </div>
        </div>
    </div>
    <div class="demo-card__primary-action">   
        ${customerTable()}
    </div>
</div>
`
    const branchTableInit = new MDCDataTable(document.getElementById('branch-table'))
    const customerTableInit = new MDCDataTable(document.getElementById('customer-table'))

    branchTableInit.listen(events.SELECTED_ALL, function (evt) {
        document.getElementById('branch-remove-selected').appendChild(removeSelectedButton());
    });

    branchTableInit.listen(events.UNSELECTED_ALL, function (evt) {
        console.log(evt)
        document.getElementById('branch-remove-selected').innerHTML = ''
    });

    branchTableInit.listen(events.ROW_SELECTION_CHANGED, function (evt) {
        console.log(evt);
        console.log(branchTableInit.getSelectedRowIds());

        const selectedLength = branchTableInit.getSelectedRowIds().length;
        if (selectedLength == 0) {
            document.getElementById('branch-remove-selected').innerHTML = ''
            return;
        };
        if (document.querySelector('#branch-remove-selected .mdc-button')) return;
        document.getElementById('branch-remove-selected').appendChild(removeSelectedButton());
    });
}

const branchTable = () => {
    return `<div class="mdc-data-table" id='branch-table'>
    <table class="mdc-data-table__table" aria-label="Dessert calories">
      <thead>
        <tr class="mdc-data-table__header-row">
          <th class="mdc-data-table__header-cell mdc-data-table__header-cell--checkbox" role="columnheader" scope="col">
            <div class="mdc-checkbox mdc-data-table__header-row-checkbox">
              <input type="checkbox" class="mdc-checkbox__native-control" aria-label="Checkbox for header row selection"/>
              <div class="mdc-checkbox__background">
                <svg class="mdc-checkbox__checkmark" viewbox="0 0 24 24">
                  <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                </svg>
                <div class="mdc-checkbox__mixedmark"></div>
              </div>
            </div>
          </th>
          <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Name</th>
          <th class="mdc-data-table__header-cell" role="columnheader" scope="col">location</th>
        </tr>
      </thead>
      <tbody class="mdc-data-table__content">
        <tr data-row-id="u0" class="mdc-data-table__row">
          <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
            <div class="mdc-checkbox mdc-data-table__row-checkbox">
              <input type="checkbox" class="mdc-checkbox__native-control" aria-labelledby="u0"/>
              <div class="mdc-checkbox__background">
                <svg class="mdc-checkbox__checkmark" viewbox="0 0 24 24">
                  <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                </svg>
                <div class="mdc-checkbox__mixedmark"></div>
              </div>
            </div>
          </td>
          <td class="mdc-data-table__cell">North</td>
          <td class="mdc-data-table__cell" id="u0">Nehru place</td>
        
        </tr>
        <tr data-row-id="u1" class="mdc-data-table__row">
        <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
        <div class="mdc-checkbox mdc-data-table__row-checkbox">
          <input type="checkbox" class="mdc-checkbox__native-control" aria-labelledby="u0"/>
          <div class="mdc-checkbox__background">
            <svg class="mdc-checkbox__checkmark" viewbox="0 0 24 24">
              <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
            </svg>
            <div class="mdc-checkbox__mixedmark"></div>
          </div>
        </div>
      </td>
          <td class="mdc-data-table__cell">South</td>
          <td class="mdc-data-table__cell" id="u1">location one</td>
         
        </tr>
      </tbody>
    </table>
  </div>`
}

const customerTable = () => {
    return `<div class="mdc-data-table" id='customer-table'>
    <table class="mdc-data-table__table" aria-label="Dessert calories">
      <thead>
        <tr class="mdc-data-table__header-row">
          <th class="mdc-data-table__header-cell mdc-data-table__header-cell--checkbox" role="columnheader" scope="col">
            <div class="mdc-checkbox mdc-data-table__header-row-checkbox mdc-checkbox--selected">
              <input type="checkbox" class="mdc-checkbox__native-control" aria-label="Checkbox for header row selection"/>
              <div class="mdc-checkbox__background">
                <svg class="mdc-checkbox__checkmark" viewbox="0 0 24 24">
                  <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                </svg>
                <div class="mdc-checkbox__mixedmark"></div>
              </div>
            </div>
          </th>
          <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Name</th>
          <th class="mdc-data-table__header-cell" role="columnheader" scope="col">location</th>
        </tr>
      </thead>
      <tbody class="mdc-data-table__content">
        <tr data-row-id="u0" class="mdc-data-table__row">
          <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
            <div class="mdc-checkbox mdc-data-table__row-checkbox">
              <input type="checkbox" class="mdc-checkbox__native-control" aria-labelledby="u0"/>
              <div class="mdc-checkbox__background">
                <svg class="mdc-checkbox__checkmark" viewbox="0 0 24 24">
                  <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                </svg>
                <div class="mdc-checkbox__mixedmark"></div>
              </div>
            </div>
          </td>
          <td class="mdc-data-table__cell">coworkin nehru place</td>
          <td class="mdc-data-table__cell" id="u0">Nehru place</td>
        
        </tr>
        <tr data-row-id="u1" class="mdc-data-table__row">
        <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
        <div class="mdc-checkbox mdc-data-table__row-checkbox">
          <input type="checkbox" class="mdc-checkbox__native-control" aria-labelledby="u0"/>
          <div class="mdc-checkbox__background">
            <svg class="mdc-checkbox__checkmark" viewbox="0 0 24 24">
              <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
            </svg>
            <div class="mdc-checkbox__mixedmark"></div>
          </div>
        </div>
      </td>
          <td class="mdc-data-table__cell">electrical shop</td>
          <td class="mdc-data-table__cell" id="u1">rohini west</td>
        </tr>
      </tbody>
    </table>
  </div>`
}

const dataTable = (tableData, headers, keys) => {
    const createElement = require('./views').createElement;
    const base = createElement('div', {
        className: 'mdc-data-table'
    })

    const table = createElement('table', {
        className: 'mdc-data-table__table',
        'aria-label': 'table'
    });

    const head = createElement('thead', {
        className: 'mdc-data-table__header-row'
    })
    const tr = createElement('tr', {
        className: 'mdc-data-table__header-row'
    })
    names.forEach(function (name) {
        const th = createElement('th', {
            className: 'mdc-data-table__header-cell',
            role: 'columnheader',
            scope: 'col',
            textContent: name
        })
        if (names.isNumeric) {
            th.classList.add('mdc-data-table__header-cell--numeric');
        }
        tr.appendChild(th);
    })
    head.appendChild(tr);
    const body = createElement('tbody', {
        className: 'mdc-data-table__content'
    })
    tableData.forEach(function (data) {
        const bodyTr = createElement('tr', {
            className: 'mdc-data-table__row'
        });

        const td = createElement('div', {
            className: 'mdc-data-table__cell',
            textContent: data
        })

    });



}

const removeSelectedButton = () => {
    const createElement = require('./views').createElement;
    const button = createElement('button', {
        className: 'mdc-button mdc-theme--error mdc-card__action mdc-card__action--button'
    })
    const icon = createElement('i', {
        className: 'material-icons',
        textContent: 'delete'
    })
    const span = createElement('span', {
        className: 'mdc-button__label',
        textContent: 'Remove'
    })
    button.appendChild(icon)
    button.appendChild(span);
    return button
}