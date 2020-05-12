function initializeLogIn(el) {
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
    
      document.body.classList.remove('hidden');
      
      if (window.location.pathname === '/app') {
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
  if(param && (param.get('utm_source') || param.get('utm_medium') || param.get('utm_campaign'))){
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
    
    firebase.auth().signOut().then(function () {
      redirect(`/signup`);
    })
    // if (window.location.pathname === `/signup`) return createOfficeInit()
  });
}






function handleAuthAnalytics(result) {

  console.log(result);

  commonDom.progressBar  ?  commonDom.progressBar.close() : '';
  const sign_up_params = {
      method: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      'isAdmin': 0
  }
  if (result.additionalUserInfo.isNewUser) {
      firebase.auth().currentUser.getIdTokenResult().then(function (tokenResult) {
          if (isAdmin(tokenResult)) {
              fbq('trackCustom', 'Sign Up Admin');
              analyticsApp.setUserProperties({
                  "isAdmin":"true"
              });
              sign_up_params.isAdmin = 1
          }
          else {
              fbq('trackCustom', 'Sign Up');
          }
          analyticsApp.logEvent('sign_up', sign_up_params)
      })
      return
  }
  fbq('trackCustom', 'login');
  analyticsApp.logEvent('login', {
      method: result.additionalUserInfo.providerId
  })

}
