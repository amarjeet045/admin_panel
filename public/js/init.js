function initializeLogIn(el) {
firebase.auth().onAuthStateChanged(user => {
   
    console.log(user)
   if( document.getElementById('app-bar-signup')) {
     document.getElementById('app-bar-signup').classList.remove('hidden')
   }

    if (!user) {
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

function handleLoggedIn(isNewUser){
  addLogoutBtn();
  const param = parseURL()
  if(param){
    if(param.get('action') === 'get-subscription') {
      document.getElementById('campaign-heading').innerHTML = `Adding you to <span class='mdc-theme--primary'>${param.get('office')}</span>`
    }
    http('PUT', `${appKeys.getBaseUrl()}/api/profile/acquisition`, {
        source: param.get('utm_source'),
        medium: param.get('utm_medium'),
        campaign: param.get('utm_campaign'),
        campaignId: param.get('campaignId'),
        office: param.get('office'),
    }).then(function(){
      if(param.get('action') === 'get-subscription') {
        if(window.location.pathname === '/welcome') {
          document.getElementById('home-login').remove();
          document.getElementById('campaign-heading').innerHTML = `You are added into <span class='mdc-theme--primary'>${param.get('office')}</span>`
        }
        return
      }
      handleAuthRedirect(isNewUser)
    }).catch(function(){
      handleAuthRedirect(isNewUser);
    });
      return;
  }
  handleAuthRedirect(isNewUser);
}
const  handleAuthRedirect = (isNewUser) => {
  firebase.auth().currentUser.getIdToken(true)
  if(isNewUser) {
    try {
      commonDom.progressBar.open();
    }
    catch(e){
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
  });
}


const waitTillCustomClaimsUpdate = (office) => {
    const form = document.querySelector('.office-form');
    if(!form) return;
    form.classList.add('iframe-disabled');
    var interval = setInterval(function(){
      firebase.auth().currentUser.getIdToken(true).then(function(){
        firebase.auth().currentUser.getIdTokenResult().then(function(idTokenResult){
          if(idTokenResult.claims.admin && idTokenResult.claims.admin.indexOf(office) > -1) {
              clearInterval(interval);
              redirect('/app?u=1');
          }
        })
      }).catch(console.error)
    },4000);
}
