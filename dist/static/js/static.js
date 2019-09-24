window.mdc.autoInit();
const navigationDrawer = new mdc.tabBar.MDCTabBar(document.querySelector('#mobile-navigation-drawer .mdc-tab-bar'))
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
    toggleNavigationDrawer(true)
});


document.getElementById('company-btn').addEventListener('click',function(){
    toggleNavigationDrawer(true)
})

const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
menu.listen('MDCIconButtonToggle:change', function (event) {
    toggleNavigationDrawer(event.detail.isOn)

})

function toggleNavigationDrawer(open){
    if(open) {
        document.getElementById('mobile-navigation-drawer').classList.remove("hidden")
        return
    }
    document.getElementById('mobile-navigation-drawer').classList.add("hidden")
}