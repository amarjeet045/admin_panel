window.mdc.autoInit();
// const navigationDrawer = new mdc.tabBar.MDCTabBar(document.querySelector('#mobile-navigation-drawer .mdc-tab-bar'))
// navigationDrawer.listen('MDCTabBar:activated', function (e) {
//     console.log(e);
//     [].map.call(document.querySelectorAll('.tab-content-drawer'), function (el) {
//         el.classList.add('hidden');
//         document.getElementById('tab-content-drawer-' + e.detail.index).classList.remove(
//             'hidden');
//     })
// });

// navigationDrawer.activateTab(0);


const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
menu.listen('MDCIconButtonToggle:change', function (event) {
    if(event.detail.isOn) {
        return createHeaderNavigation()
    }
    return closeHeaderNavigaton()
})


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

document.getElementById('products-btn').addEventListener('click',createHeaderNavigation)
document.getElementById('close-navigation-btn').addEventListener('click',closeHeaderNavigaton);
function closeHeaderNavigaton() {
    const el = document.querySelector(".mdc-top-app-bar--navigation");
    el.classList.add('hidden')
    // document.querySelector('.page-content-section').style.display = 'block';
}
function createHeaderNavigation(){
    const el = document.querySelector(".mdc-top-app-bar--navigation");
    el.classList.remove('hidden')
    // document.querySelector('.page-content-section').style.display = 'none';

    // if(window.screenWidth > 839) {
    //     //if desktop
    //     return desktopNavigationContent();
    // }
    // return mobileNavigationContent();
}

function desktopNavigationContent(){

}

function mobileNavigationContent() {
    return `<ul class="mdc-list">
    <a class="mdc-list-item" href="./attendace.html">
        Attendance
        <span class="mdc-list-item__meta material-icons">arrow_right</span>
    </a>
    <a class="mdc-list-item" href="./staff.html">
        Staff allocation
        <span class="mdc-list-item__meta material-icons">arrow_right</span>
    </a>
    <a class="mdc-list-item" href="./salary.html">
        Salary & Compliance
        <span class="mdc-list-item__meta material-icons">arrow_right</span>
    </a>
    <a class="mdc-list-item" href="./reimbursements.html">
        Reimbursement
        <span class="mdc-list-item__meta material-icons">arrow_right</span>
    </a>
    <a class="mdc-list-item" href="./reimbursements.html">
        In-built payment transfer
        <span class="mdc-list-item__meta material-icons">arrow_right</span>
    </a>
</ul>
`
}