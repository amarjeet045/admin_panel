window.addEventListener('load', function () {

  window.mdc.autoInit();
  if (document.querySelector(
      '.mdc-linear-progress')) {

    commonDom.progressBar = new mdc.linearProgress.MDCLinearProgress(document.querySelector(
      '.mdc-linear-progress'))
    commonDom.progressBar.open()
    document.body.classList.remove('hidden')
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      return addLogoutBtn();
    }
  });


  const drawer = new mdc.drawer.MDCDrawer(document.querySelector(".mdc-drawer"))

  const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
  const topAppBar = new mdc.topAppBar.MDCTopAppBar(document.querySelector('.mdc-top-app-bar'))
  menu.listen('MDCIconButtonToggle:change', function (event) {
    drawer.open = !drawer.open;
  })
})


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function loginButton() {

  const a = createElement('a', {
    className: 'mdc-top-app-bar__action-item mdc-button',
    href: './signup.html',
    id: 'app-bar-login',
    textContent: 'Log in'
  })
  new mdc.ripple.MDCRipple(a)
  return a
}