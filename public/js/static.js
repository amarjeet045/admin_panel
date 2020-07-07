window.addEventListener('load', function () {
  loadPartial('/partials/footer').then(function(footer){
    document.querySelector('footer').innerHTML = footer;
  })

  window.mdc.autoInit();
  if (document.querySelector(
      '.mdc-linear-progress')) {

    commonDom.progressBar = new mdc.linearProgress.MDCLinearProgress(document.querySelector(
      '.mdc-linear-progress'))
    commonDom.progressBar.open()

  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      return addLogoutBtn();
    }
  });

  const drawer = new mdc.drawer.MDCDrawer(document.querySelector(".mdc-drawer"))
  const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
  menu.listen('MDCIconButtonToggle:change', function (event) {
    drawer.open = !drawer.open;
  })

})



function loadPartial(source) {
  return new Promise(function (resolve, reject) {
    if (window.fetch) {
      fetch(source).then(function (response) {
          return response.text();
        })
        .then(resolve).catch(reject)
      return;
    }
    var request = new XMLHttpRequest();
    request.open('GET', source);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        resolve(request.responseText)
        return
      }
      reject(request);
    };
    request.send();
  })
}

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