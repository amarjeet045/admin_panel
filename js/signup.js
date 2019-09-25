import mdcAutoInit from '@material/auto-init';
import firebase from "firebase/app";
import "firebase/auth";
import {
    MDCCheckbox
} from "@material/checkbox";
import {
    MDCTabBar
} from "@material/tab-bar";
import {
    MDCIconButtonToggle
} from "@material/icon-button";
import {
    appKeys
} from '../env-config';
import { MDCTextField } from "@material/textfield";
import {phoneFieldInit} from './phoneNumber';

window.addEventListener('load',function(){
    
    firebase.initializeApp(appKeys.getKeys());

    const auth = firebase.auth().currentUser;

    mdcAutoInit.register('MDCTextField', MDCTextField);
    mdcAutoInit.register('MDCCheckbox', MDCCheckbox);
    mdcAutoInit.register('MDCTabBar', MDCTabBar);
    mdcAutoInit.register('MDCIconButtonToggle', MDCIconButtonToggle);
    const navigationDrawer = new MDCTabBar(document.querySelector('#mobile-navigation-drawer .mdc-tab-bar'))
navigationDrawer.listen('MDCTabBar:activated', function (e) {
    console.log(e);
    [].map.call(document.querySelectorAll('.tab-content-drawer'), function (el) {
        el.classList.add('hidden');
        document.getElementById('tab-content-drawer-' + e.detail.index).classList.remove(
            'hidden');
    })
});

navigationDrawer.activateTab(0);

document.getElementById('products-btn').addEventListener('click',function(){
    document.querySelector('.desktop-growthfile-resources').classList.remove('hidden')
    document.getElementById('desktop-navigation-drawer-products').classList.remove('hidden')
    document.getElementById('desktop-navigation-drawer-company').classList.add('hidden')
});


document.getElementById('company-btn').addEventListener('click',function(){
    document.querySelector('.desktop-growthfile-resources').classList.remove('hidden')
    document.getElementById('desktop-navigation-drawer-company').classList.remove('hidden')
    document.getElementById('desktop-navigation-drawer-products').classList.add('hidden')

});
[...document.querySelectorAll('.close-desktop-navigation i')].forEach(function(el){
    el.addEventListener('click',function(){
        document.querySelector('.desktop-growthfile-resources').classList.add('hidden')
        document.getElementById('desktop-navigation-drawer-company').classList.add('hidden')
        document.getElementById('desktop-navigation-drawer-products').classList.add('hidden')
    })
})

const menu = new MDCIconButtonToggle(document.getElementById('menu'))
menu.listen('MDCIconButtonToggle:change', function (event) {
    toggleNavigationDrawer(event.detail.isOn)

})


    const inputs = {};
    [].map.call(document.querySelectorAll('.mdc-text-field'),function(el){
        const textField = new MDCTextField(el);
        inputs[el.id] = textField;
        if(el.querySelector('input').type === 'tel') {
            const phoneField = phoneFieldInit(textField)
        }
    })
    console.log(inputs)
    const checkbox = new MDCCheckbox(document.getElementById('admin-checkbox'))
    checkbox.listen('change', function (event) {
        if (checkbox.checked) {
            inputs['company-admin-1-name'].value = auth.displayName;
            inputs['company-admin-1-email'].value = auth.email;
            inputs['company-admin-1-phonenumber'].value = auth.phoneNumber;
        } else {
            inputs['company-admin-1-name'].value =  inputs['company-admin-1-email'].value = inputs['company-admin-1-phonenumber'].value = "";
           
        }
    })
    initAddressField(inputs['company-location'])
})



const initAddressField = (textField) => {

    const autocomplete = new google.maps.places.Autocomplete(textField.input_);
    console.log(autocomplete)
    google.maps.event.addListener(autocomplete, 'place_changed', function (event) {
        const place = autocomplete.getPlace();
        console.log(place)
        textField.root_.dataset.latitude = place.geometry.location.lat();
        textField.root_.dataset.longitude = place.geometry.location.lng();
        textField.root_.dataset.location = place.name;
        textField.root_.dataset.address = place.formatted_address;
    });
}

function toggleNavigationDrawer(open){
    if(open) {
        document.getElementById('mobile-navigation-drawer').classList.remove("hidden")
        return
    }
    document.getElementById('mobile-navigation-drawer').classList.add("hidden")
}