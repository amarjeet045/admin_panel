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

    handleLoggedIn()
  });
}

function handleLoggedIn(newUser){
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
      handleAuthRedirect(newUser)
    }).catch(function(){
      handleAuthRedirect(newUser);
    });
      return;
  }
  handleAuthRedirect(newUser);
}
const  handleAuthRedirect = (newUser) => {
  firebase.auth().currentUser.getIdToken(true)
  if(newUser) {
    setTimeout(function(){
      return redirect('/share?office='+localStorage.getItem('created_office'));
    },8000)
    return
  }
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
  });
}
