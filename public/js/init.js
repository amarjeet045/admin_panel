function initializeLogIn(el, shouldRedirect = true, profileInfo) {
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
      login(el, profileInfo);
      return;
    };

    addLogoutBtn();

  console.log(firebase.auth().currentUser)

    const param = parseURL()
    user.getIdTokenResult().then((idTokenResult) => {

      if (idTokenResult.claims.admin || idTokenResult.claims.support ||  localStorage.getItem('created_office')) {
          if (window.location.pathname === '/app') {
            initializer();
            return
          }
          redirect(`/app`);
          return;      
      }
      http('GET', `${appKeys.getBaseUrl()}/api/services/subscription/checkIn`).then(response => {
        if(commonDom.progressBar) {
          commonDom.progressBar.close()
        }
        if (response.hasCheckInSubscription) {
          setFirebaseAnalyticsUserProperty("hasCheckin", "true");
          signOut()
          showSnacksApiResponse('Please use Growthfile app on your mobile to continue');
          setTimeout(function () {
            window.location.href = 'https://growthfile.page.link/naxz';
          }, 2000)
          return;
        }
        if (window.location.pathname === '/signup') return createOfficeInit()
        redirect('/signup');
      })
    });
  });
}

const addLogoutBtn = () => {
  const el = document.getElementById('app-bar-login');
  if (!el) return;
  document.getElementById('app-bar-signup').classList.add('hidden')
  el.textContent = 'Log out';
  el.removeAttribute('href');
  el.addEventListener('click', function () {
    firebase.auth().signOut().then(function () {
      redirect('')
     
    })
  })
}