window.mdc.autoInit();



const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
menu.listen('MDCIconButtonToggle:change', function (event) {
    if (event.detail.isOn) {
        const navigationDrawer = new mdc.tabBar.MDCTabBar(document.getElementById('mobile-navigation-tab'))
        navigationDrawer.listen('MDCTabBar:activated', function (e) {
            console.log(e);
            [].map.call(document.querySelectorAll('.mdc-top-app-bar--navigation-content-list'), function (el) {
                el.classList.add('hidden');
            });

            if (e.detail.index == 0) {
                document.getElementById('product-list-tab').classList.remove('hidden')
                return
            }
            if (e.detail.index == 1) {
                document.getElementById('company-list-tab').classList.remove('hidden')
            }
        });
        navigationDrawer.activateTab(0);
        return createHeaderNavigation()
    }
    return closeHeaderNavigaton()
})


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

document.getElementById('products-btn').addEventListener('click', showProductNav)
document.getElementById('company-btn').addEventListener('click', showCompanyNav)
document.getElementById('close-navigation-btn').addEventListener('click', closeHeaderNavigaton);

function closeHeaderNavigaton() {
    const el = document.querySelector(".mdc-top-app-bar--navigation");
    el.classList.add('hidden')
    // document.querySelector('.page-content-section').style.display = 'block';
}

function showProductNav() {
    createHeaderNavigation()
    document.querySelector('.desktop-navigation .products').classList.remove('hidden');
    document.querySelector('.desktop-navigation .company').classList.add('hidden');


}

function showCompanyNav() {
    createHeaderNavigation()
    document.querySelector('.desktop-navigation .company').classList.remove('hidden');
    document.querySelector('.desktop-navigation .products').classList.add('hidden');
}

function createHeaderNavigation() {
    const el = document.querySelector(".mdc-top-app-bar--navigation");
    el.classList.remove('hidden')
}