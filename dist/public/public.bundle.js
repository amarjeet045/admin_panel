!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=54)}({54:function(e,t,n){n(55),e.exports=n(56)},55:function(e,t){window.mdc.autoInit();var n,o=new mdc.tabBar.MDCTabBar(document.querySelector("#mobile-navigation-drawer .mdc-tab-bar"));o.listen("MDCTabBar:activated",function(e){console.log(e),[].map.call(document.querySelectorAll(".tab-content-drawer"),function(t){t.classList.add("hidden"),document.getElementById("tab-content-drawer-"+e.detail.index).classList.remove("hidden")})}),o.activateTab(0),document.getElementById("products-btn").addEventListener("click",function(){document.querySelector(".desktop-growthfile-resources").classList.remove("hidden"),document.getElementById("desktop-navigation-drawer-products").classList.remove("hidden"),document.getElementById("desktop-navigation-drawer-company").classList.add("hidden")}),document.getElementById("company-btn").addEventListener("click",function(){document.querySelector(".desktop-growthfile-resources").classList.remove("hidden"),document.getElementById("desktop-navigation-drawer-company").classList.remove("hidden"),document.getElementById("desktop-navigation-drawer-products").classList.add("hidden")}),(n=document.querySelectorAll(".close-desktop-navigation i"),function(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}(n)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(n)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()).forEach(function(e){e.addEventListener("click",function(){document.querySelector(".desktop-growthfile-resources").classList.add("hidden"),document.getElementById("desktop-navigation-drawer-company").classList.add("hidden"),document.getElementById("desktop-navigation-drawer-products").classList.add("hidden")})}),new mdc.iconButton.MDCIconButtonToggle(document.getElementById("menu")).listen("MDCIconButtonToggle:change",function(e){!function(e){if(e)return void document.getElementById("mobile-navigation-drawer").classList.remove("hidden");document.getElementById("mobile-navigation-drawer").classList.add("hidden")}(e.detail.isOn)})},56:function(e,t,n){e.exports=n.p+"public.bundle.css"}});