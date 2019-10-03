import * as core from './core';
import { MDCTextField } from '@material/textfield';
import {MDCList} from '@material/list';

export const addressView = (office) => {
    // add fetch to get required apiData;
    commonDom.progressBar.close();
    commonDom.drawer.list.selectedIndex = 3;
    document.getElementById('app-content').innerHTML = `


        <div class='list-view mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
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
        <div class='branches'>
                <h1 class='mdc-typography--headline5'>Branches</h1>
                <ul class='mdc-list mdc-list--two-line' id='branches-list'>
                    <li class='mdc-list-item'>
                    <span class="mdc-list-item__text">
                        <span class="mdc-list-item__primary-text">Lorem Ipsum</span>
                        <span class="mdc-list-item__secondary-text">Somewhere but not here</span>
                    </span>
                    </li>
                    <li class='mdc-list-item'>
                    <span class="mdc-list-item__text">
                        <span class="mdc-list-item__primary-text">Lorem Ipsum</span>
                        <span class="mdc-list-item__secondary-text">Somewhere but not here</span>
                    </span>
                    </li>
                    <li class='mdc-list-item'>
                    <span class="mdc-list-item__text">
                        <span class="mdc-list-item__primary-text">Lorem Ipsum</span>
                        <span class="mdc-list-item__secondary-text">Somewhere but not here</span>
                    </span>
                    </li>
                </ul>
            </div>
            <div class='customers'>
            <h1 class='mdc-typography--headline5'>Customers</h1>
            <ul class='mdc-list mdc-list--two-line' id='customers-list'>
                    <li class='mdc-list-item'>
                    <span class="mdc-list-item__text">
                        <span class="mdc-list-item__primary-text">outlaw</span>
                        <span class="mdc-list-item__secondary-text">Somewhere but not here</span>
                    </span>
                    </li>
                    <li class='mdc-list-item'>
                    <span class="mdc-list-item__text">
                        <span class="mdc-list-item__primary-text">time</span>
                        <span class="mdc-list-item__secondary-text">Somewhere but not here</span>
                    </span>
                    </li>
                    <li class='mdc-list-item'>
                    <span class="mdc-list-item__text">
                        <span class="mdc-list-item__primary-text">snake</span>
                        <span class="mdc-list-item__secondary-text">Somewhere but not here</span>
                    </span>
                    </li>
                </ul>
            </div>
        </div>
        <div class='map-view mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4'>
        
        <div class="mdc-card demo-card demo-basic-with-header">
  <div class="demo-card__primary">
    <h2 class="demo-card__title mdc-typography mdc-typography--headline6">Our Changing Planet</h2>
    <h3 class="demo-card__subtitle mdc-typography mdc-typography--subtitle2">by Kurt Wagner</h3>
  </div>
  <div class="mdc-card__primary-action demo-card__primary-action" tabindex="0">
    <div class="mdc-card__media mdc-card__media--16-9 demo-card__media" style="background-image: url(&quot;https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap%20&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=AIzaSyCadBqkHUJwdcgKT11rp_XWkbQLFAy80JQ&quot;);"></div>
    <div class="demo-card__secondary mdc-typography mdc-typography--body2">Visit ten places on our planet that are undergoing the biggest changes today.</div>
  </div>
  <div class="mdc-card__actions">
    <div class="mdc-card__action-buttons">
      <button class="mdc-button mdc-card__action mdc-card__action--button">Read</button>
      <button class="mdc-button mdc-card__action mdc-card__action--button">Bookmark</button>
    </div>
    <div class="mdc-card__action-icons">
      <button class="mdc-icon-button mdc-card__action mdc-card__action--icon--unbounded" aria-pressed="false" aria-label="Add to favorites" title="Add to favorites">
        <i class="material-icons mdc-icon-button__icon mdc-icon-button__icon--on">favorite</i>
        <i class="material-icons mdc-icon-button__icon">favorite_border</i>
      </button>
      <button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded" title="Share" data-mdc-ripple-is-unbounded="true">share</button>
      <button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded" title="More options" data-mdc-ripple-is-unbounded="true">more_vert</button>
    </div>
  </div>
</div>


        
    </div>
    `;


    const search = new MDCTextField(document.getElementById('search-address'))
    const branchList = new MDCList(document.getElementById('branches-list'))
    branchList.selectedIndex = 0;
};
