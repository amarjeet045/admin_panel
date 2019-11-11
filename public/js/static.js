window.mdc.autoInit();



const featuresBtn = document.getElementById('features-button');
const featuresMenu = new mdc.menu.MDCMenu(document.getElementById('features-menu'));
featuresBtn.addEventListener('click', function () {
  featuresMenu.open = true;
})

const solutionsBtn = document.getElementById('solutions-button');
const solutionsMenu = new mdc.menu.MDCMenu(document.getElementById('solutions-menu'));
solutionsBtn.addEventListener('click', function () {
  solutionsMenu.open = true;
})


const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
menu.listen('MDCIconButtonToggle:change', function (event) {
  console.log(event)
  const drawer = new mdc.drawer.MDCDrawer(document.querySelector(".mdc-drawer"))
  const list = new mdc.list.MDCList(document.querySelector('.mdc-drawer .mdc-list'))
  if(event.detail.isOn) {
    drawer.open = true
    list.wrapFocus = true
  }
  else {
    drawer.open = false;
  }
})


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function loginButton() {

  const a = createElement('a', {
    className: 'mdc-top-app-bar__action-item mdc-button',
    href: './index.html?redirect_to=LOGIN',
    id: 'app-bar-login',
    textContent: 'Log in'
  })
  new mdc.ripple.MDCRipple(a)
  return a
}