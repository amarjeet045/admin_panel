
const radioList = (attr) => {
    return `<li class="mdc-list-item" role="radio" aria-checked="false">
    <span class="mdc-list-item__graphic">
    <div class="mdc-radio">
      <input class="mdc-radio__native-control"
            type="radio"
            id="list-radio-item-${attr.id}"
            name="demo-list-radio-item-group"
            value="${attr.label}">
      <div class="mdc-radio__background">
        <div class="mdc-radio__outer-circle"></div>
        <div class="mdc-radio__inner-circle"></div>
      </div>
    </div>
  </span>
  <label class="mdc-list-item__text" for="list-radio-item-${attr.id}">${attr.label}</label>
  ${trailingIcon(attr.icon)}
</li>`
}

const trailingIconList = (attr) => {
    return `<li class="mdc-list-item" tabindex="0">
        <span class="mdc-list-item__text">${attr.text}</span>
        ${trailingIcon(attr.icon)}
    </li>`
}

const trailingIcon = (icon = '') => {
    return `<span class="mdc-list-item__meta material-icons" aria-hidden="true">${icon}</span>
    `
}

const textField = (attr) => {
    return `<div class="mdc-text-field mdc-text-field--outlined" id=${attr.id}>
    <input class="mdc-text-field__input" id="text-field-hero-input" type=${attr.type ? attr.type:'number'} required autocomplete=${attr.autocomplete}>
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      <div class="mdc-notched-outline__notch">
        <label for="text-field-hero-input" class="mdc-floating-label">${attr.label}</label>
      </div>
      <div class="mdc-notched-outline__trailing"></div>
    </div>
  </div>`
}

const createDynamicLi = (name) => {
    const li = document.createElement('li');
    li.className = 'mdc-list-item'
    li.textContent = name;
    li.dataset.value = name
    return li
}


const panel = () => {
    return `<div class="b3id-timeline-view-section b3-timeline-view-section last-item b3-component-group-no-title b3id-section b3-section flyout toplevel collapsed"
  tabindex="0" data-ui-reference="3023" data-sub-component-group-class="childSectionId-8976697432725106034"
  data-ui-reference-list="[2006, 3031, 6102]" data-ui-type="7" data-was-visible="true">
  <div class="b3-section-outer-content b3id-section-outer-content" data-was-visible="true"
      style="top: 1px; height: auto;">
      <div class="b3-section-header-container" data-was-visible="true"><span
              class="b3id-section-close b3-section-close goog-control" tabindex="0" role="button" aria-label="Close"
              style="user-select: none;"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px"
                  viewBox="0 0 24 24" id='c'>
                  <path
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
                  </path>
                  <path d="M0 0h24v24H0z" fill="none"></path>
              </svg></span></div>
      <div class="b3id-section-content-container b3-section-inner-content" data-was-visible="true">
          <div class="b3id-timeline-view-simple-form b3-timeline-view-simple-form b3id-simple-form b3-simple-form"
              data-ui-reference="2006" data-component-name="SIMPLE_FORM" data-label="">
              <div class="b3id-form-header b3-form-header b3id-simple-form-form-header with-no-content"
                  data-id="-5201488696692163999" data-ui-reference="2006"></div>
              <div class="b3id-form-field b3-simple-form-form-field">
                  <div class="b3id-simple-form-field b3-simple-form-field b3id-form-field-field">
                      <div
                          class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-field-info-message b3-field-info-message">
                    
                          <div class="b3id-info-message-html b3-info-message-html b3-info-message-image-message">
                          </div>
                      </div>
                  </div>
              </div>
              <div class="b3id-form-field b3-simple-form-form-field">
                  <div class="b3id-sub-form b3id-form-field-sub-form b3-form-field-sub-form"
                      data-ui-reference="26595">
                      <div class="b3id-form-header b3-form-header b3id-sub-form-form-header with-no-content"
                          data-id="-7994200650037573178" data-ui-reference="26595"></div>
                      <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                          <div
                              class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-field-info-message b3-field-info-message">
                              <div class="b3id-info-message-html b3-info-message-html"><span>Oct 31, 2018, 8:02
                                      AM</span></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="b3id-table b3-table" data-ui-reference="3031">
              <table class="b3id-widget-table b3-widget-table">
                  <tbody>
                      <tr class="b3id-widget-table-header-row b3-widget-table-header-row" data-ui-reference="48086"
                          data-row-type="2">
                          <th class="b3id-widget-table-header-cell b3-widget-table-header-cell b3-widget-table-cell-text"
                              role="gridcell" tabindex="0" data-ui-reference="89045" scope="col">
                              <div class="b3id-cell-container b3-cell-container">
                                  <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                      <div
                                          class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-table-info-message">
                                          <div class="b3id-info-message-html b3-info-message-html"><span>Item</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </th>
                          <th class="b3id-widget-table-header-cell b3-widget-table-header-cell b3-widget-table-cell-numeric"
                              role="gridcell" tabindex="0" data-ui-reference="93141" scope="col">
                              <div class="b3id-cell-container b3-cell-container">
                                  <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                      <div
                                          class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-table-info-message">
                                          <div class="b3id-info-message-html b3-info-message-html"><span>Price
                                                  (INR)</span></div>
                                      </div>
                                  </div>
                              </div>
                          </th>
                      </tr>
                      <tr class="b3id-widget-table-data-row b3-widget-table-data-row" role="row"
                          data-ui-reference="52182" data-row-type="1">
                          <td class="b3id-widget-table-data-cell b3-widget-table-data-cell b3-widget-table-cell-text"
                              role="gridcell" tabindex="0" data-ui-reference="97237">
                              <div class="b3id-cell-container b3-cell-container">
                                  <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                      <div
                                          class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-table-info-message">
                                          <div class="b3id-info-message-html b3-info-message-html">
                                        </div>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td class="b3id-widget-table-data-cell b3-widget-table-data-cell b3-widget-table-cell-numeric"
                              role="gridcell" tabindex="0" data-ui-reference="101333">
                              <div class="b3id-cell-container b3-cell-container">
                                  <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                      <div
                                          class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-table-info-message">
                                          <div class="b3id-info-message-html b3-info-message-html">
                                              <span>₹340.00</span></div>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                      <tr class="b3id-widget-table-data-row b3-widget-table-data-row b3-receipt-total-row" role="row"
                          data-ui-reference="56278" data-row-type="1">
                          <td class="b3id-widget-table-data-cell b3-widget-table-data-cell b3-widget-table-cell-text"
                              role="gridcell" tabindex="0" data-ui-reference="105429">
                              <div class="b3id-cell-container b3-cell-container">
                                  <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                      <div
                                          class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-table-info-message">
                                          <div class="b3id-info-message-html b3-info-message-html"><span>Total</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td class="b3id-widget-table-data-cell b3-widget-table-data-cell b3-widget-table-cell-numeric"
                              role="gridcell" tabindex="0" data-ui-reference="109525">
                              <div class="b3id-cell-container b3-cell-container">
                                  <div class="b3id-widget-table-cell-content b3-widget-table-cell-content">
                                      <div
                                          class="b3id-info-message-component b3-info-message-component b3-info-message-emphasis b3id-table-info-message">
                                          <div class="b3id-info-message-html b3-info-message-html"><span>₹0.00</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
          <div class="b3id-timeline-view-simple-form b3-timeline-view-simple-form b3id-simple-form b3-simple-form"
              data-ui-reference="6102" data-component-name="SIMPLE_FORM" data-label="">
              <div class="b3id-form-header b3-form-header b3id-simple-form-form-header with-no-content"
                  data-id="-7085739701070148207" data-ui-reference="6102"></div>
              <div class="b3id-form-field b3-simple-form-form-field">
                  <div class="b3id-sub-form b3id-form-field-sub-form b3-form-field-sub-form"
                      data-ui-reference="30691">
                      <div class="b3id-form-header b3-form-header b3id-sub-form-form-header with-no-content"
                          data-id="-1766474237790175733" data-ui-reference="30691"></div>
                      <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                          <div
                              class="b3id-info-message-component b3-info-message-component b3-info-message-emphasis b3id-field-info-message b3-field-info-message">
                              <div class="b3id-info-message-html b3-info-message-html"><span>Payment method</span>
                              </div>
                          </div>
                      </div>
                      <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                          <div
                              class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-field-info-message b3-field-info-message">
                              <div class="b3id-info-message-html b3-info-message-html">
                                  <span>Mastercard •••• 1120</span></div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="b3id-form-field b3-simple-form-form-field">
                  <div class="b3id-sub-form b3id-form-field-sub-form b3-form-field-sub-form"
                      data-ui-reference="34787">
                      <div class="b3id-form-header b3-form-header b3id-sub-form-form-header with-no-content"
                          data-id="2225647067834427065" data-ui-reference="34787"></div>
                      <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                          <div
                              class="b3id-info-message-component b3-info-message-component b3-info-message-emphasis b3id-field-info-message b3-field-info-message">
                              <div class="b3id-info-message-html b3-info-message-html"><span>Transaction ID</span>
                              </div>
                          </div>
                      </div>
                      <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                          <div
                              class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-field-info-message b3-field-info-message">
                              <div class="b3id-info-message-html b3-info-message-html">
                                  <span>GPA.3330-7017-8943-85753..0</span></div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="b3id-form-field b3-simple-form-form-field">
                  <div class="b3id-sub-form b3id-form-field-sub-form b3-form-field-sub-form"
                      data-ui-reference="26582">
                      <div class="b3id-form-header b3-form-header b3id-sub-form-form-header with-no-content"
                          data-id="-3920504449100019210" data-ui-reference="26582"></div>
                      <div class="b3id-simple-form-field b3-simple-form-field b3id-sub-form-field">
                          <div
                              class="b3id-info-message-component b3-info-message-component b3-info-message-unknown b3id-field-info-message b3-field-info-message">
                              <div class="b3id-info-message-html b3-info-message-html"></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div class="b3id-page-overlay-spinner b3-page-overlay-spinner " style="display: none;">
          <div class="b3id-page-overlay b3-page-overlay"></div>
          <div class="b3id-spinner-section b3-spinner-section">
              <div class="b3-quantum-spinner"></div>
              <div class="b3-spinner-message b3-quantum-spinner-message"></div>
          </div>
      </div>
  </div>
</div>`
}


const activityCard = (name) => {
    return `<div class='mdc-card mdc-card--outlined activity-card'>
        <div class='mdc-card__primary-action'>
            <span class='mdc-typography--headline5'>${name}</span>
        </div>
        <div class='mdc-card__actions'>
            <div class='mdc-card__action-buttons'>
                <button class='mdc-button mdc-card__action mdc-card__action--button'>
                    Manage
                </button>
            </div>
        </div>
    </div>`
}

function BreadCrumbs() {
    return `<nav>
    <div class="nav-wrapper">
      <div class="mdc-layout-grid--span-8" id='breadcrumb-container'>
      </div>
    </div>
  </nav>`
}
BreadCrumbs.prototype.getParent = function(){
    return document.getElementById('breadcrumb-container');
}
BreadCrumbs.prototype.addCrumb = function (name) {
    const crumb = document.createElement('a')
    crumb.classList.add('breadcrumb')
    crumb.textContent = name
    this.getParent.appendChild(crumb);
}
BreadCrumbs.prototype.clearAll = function() {
    this.getParent.innerHTML = '';
}

export {
    radioList,
    trailingIconList,
    textField,
    createDynamicLi,
    activityCard,
    BreadCrumbs
}