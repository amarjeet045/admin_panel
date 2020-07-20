
function initializeLogIn(el) {

  firebase.auth().onAuthStateChanged(user => {

    if (document.getElementById('app-bar-signup')) {
      document.getElementById('app-bar-signup').classList.remove('hidden')
    }

    if (!user) {
      if (commonDom.progressBar) {
        commonDom.progressBar.close()
      }

      document.body.classList.remove('hidden');

      if (window.location.pathname === '/app') {
        redirect('');
        return;
      }

      login(el);
      return;
    };
    flushStoredErrors()
    handleLoggedIn()
  })
}

const sendAcqusition = () => {
  const param = parseURL();
  return http('PUT', `${appKeys.getBaseUrl()}/api/profile/acquisition`, {
    source: param.get('utm_source'),
    medium: param.get('utm_medium'),
    campaign: param.get('utm_campaign'),
    campaignId: param.get('campaignId'),
    office: param.get('office'),
  })
}

function handleLoggedIn(isNewUser) {
  addLogoutBtn();
  const param = parseURL();
  if (window.location.pathname === '/welcome' && param.get('action') === 'get-subscription') {
    handleWelcomePage();
    return
  }
  if (param) {
    sendAcqusition().then(function () {
      handleAuthRedirect(isNewUser)
    }).catch(function () {
      handleAuthRedirect(isNewUser);
    });
    return;
  }
  handleAuthRedirect(isNewUser);
}

const handleWelcomePage = () => {
  const param = parseURL();
  firebase.auth().currentUser.getIdTokenResult().then((idTokenResult) => {
    if (idTokenResult.claims.admin || idTokenResult.claims.support) {
      redirect(`/app`);
      return
    }
    document.getElementById('campaign-heading').innerHTML = `Adding you to <span class='mdc-theme--primary'>${param.get('office')}</span>`
    sendAcqusition().then(function () {
      document.getElementById('home-login').remove();
      document.getElementById('campaign-heading').innerHTML = `You are added into <span class='mdc-theme--primary'>${param.get('office')}</span>`
    }).catch(console.error)
  })
}
const handleAuthRedirect = (isNewUser) => {
  firebase.auth().currentUser.getIdToken(true)
  if (isNewUser) {
    try {
      commonDom.progressBar.open();
    } catch (e) {
      console.log(e)
    }
    waitTillCustomClaimsUpdate(localStorage.getItem('selected_office'));
    return
  }
  firebase.auth().currentUser.getIdTokenResult().then((idTokenResult) => {
    if (idTokenResult.claims.admin || idTokenResult.claims.support) {
      if (window.location.pathname === `/app`) {
        initializer();
        return
      }
      redirect(`/app${window.location.search}`);
      return;
    }
    firebase.auth().signOut().then(function () {
      redirect(`/signup`);
    })
  }).catch(function(err){
    sendErrorLog({
      message:err.message,
      stack:err.stack
    })
  });
}


const waitTillCustomClaimsUpdate = (office) => {
  const form = document.querySelector('.office-form');
  if (!form) return;
  form.classList.add('form-disabled');
  var interval = setInterval(function () {
    firebase.auth().currentUser.getIdToken(true).then(function () {
      firebase.auth().currentUser.getIdTokenResult().then(function (idTokenResult) {
        if (idTokenResult.claims.admin && idTokenResult.claims.admin.indexOf(office) > -1) {
          clearInterval(interval);
          redirect('/app?u=1');
        }
      })
    }).catch(console.error)
  }, 4000);
}