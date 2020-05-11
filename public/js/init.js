function initializeLogIn(el, shouldRedirect = true) {
  var appKeys = new AppKeys();
  firebase.auth().onAuthStateChanged(user => {
   
    console.log(user)
   if( document.getElementById('app-bar-signup')) {
     document.getElementById('app-bar-signup').classList.remove('hidden')
   }

    if (!user) {
      localStorage.removeItem('created_office')
      if(commonDom.progressBar) {
        commonDom.progressBar.close()
      }
      if(window.location.pathname === '/office') {
        history.replaceState(null,'Sign up','/signup')
      }
      document.body.classList.remove('hidden')
      if (shouldRedirect) {
        redirect('');
        return;
      }
      
      login(el);
      return;
    };

    handleLoggedIn(appKeys)
  });
}

function handleLoggedIn(){
  addLogoutBtn();
  const param = parseURL()
  if(param){
    http('PUT', `${appKeys.getBaseUrl()}/api/profile/acquisition`, {
        source: param.get('utm_source'),
        medium: param.get('utm_medium'),
        campaign: param.get('utm_campaign'),
        office: param.get('office'),
    }).then(function(){
      if(param.get('action') === 'get-subscription') {
        if(window.location.pathname === '/welcome') {
          document.getElementById('home-login').remove();
          document.getElementById('campaign-heading').innerHTML = `You are added into <span class='mdc-theme--primary'>${param.get('office')}</span>`
        }
        return
      }
      handleAuthRedirect()
    }).catch(handleAuthRedirect);
      return;
  }
  handleAuthRedirect();
}
const  handleAuthRedirect = () => {
  firebase.auth().currentUser.getIdTokenResult().then((idTokenResult) => {
    if (idTokenResult.claims.admin || idTokenResult.claims.support ||  localStorage.getItem('created_office')) {
        if (window.location.pathname === `/app`) {
          initializer();
          return
        }
        redirect(`/app`);
        return;      
    }

    if (window.location.pathname === `/signup`) return createOfficeInit()
    redirect(`/signup`);
  });
}

