import * as core from './core';

export const addressView = (office) => {
    // add fetch to get required apiData;
    const testData = [{lastModifiedDate:1569825339982,location:'mock location 1',address:'mock address 1',latitude:23.213,longitude:77.123,canEdit:true,template:'branch',Name:'seattle'},{lastModifiedDate:1569825341003,location:'mock location 2',address:'mock address 2',latitude:23.213,longitude:77.123,canEdit:false,template:'customer',Name:'Through the never'}];    
        
}

function dataTableView () {

}



const dataTable = (tableData,headers,) => {
    const createElement = require('./views').createElement;
    const base = createElement('div',{className:'mdc-data-table'})
    const table = createElement('table',{className:'mdc-data-table__table','aria-label':'table'});
    const head = createElement('thead',{className:'mdc-data-table__header-row'})
    const tr = createElement('tr',{className:'mdc-data-table__header-row'})
    names.forEach(function(name){
        const th = createElement('th',{className:'mdc-data-table__header-cell',role:'columnheader',scope:'col',textContent:name})
        if(names.isNumeric) {
            th.classList.add('mdc-data-table__header-cell--numeric');
        }
        tr.appendChild(th);
    })
    head.appendChild(tr);
    const body = createElement('tbody',{className:'mdc-data-table__content'})
    tableData.forEach(function(data) {
        const bodyTr = createElement('tr',{className:'mdc-data-table__row'})
    })
}

