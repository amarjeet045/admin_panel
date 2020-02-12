function initializeLogIn(el,shouldRedirect = true,phoneNumber) {
  var appKeys = new AppKeys();
  firebase.initializeApp(appKeys.getKeys());
  firebase.auth().onAuthStateChanged(user => {
    console.log(user)
    
    if (!user) {
      document.body.classList.remove('hidden')
      if(shouldRedirect) {
          redirect('');
          return;
      }
      login(el,phoneNumber);
      return;
    };

    
    if (user.email && user.emailVerified && user.displayName) {
      user.getIdTokenResult().then((idTokenResult) => {
        console.log(idTokenResult)
        if (idTokenResult.claims.admin || idTokenResult.claims.support) {
          if (window.location.pathname === '/app.html') {
            getLocation().then(initializer).catch(err => {
              initializer();
            })
            return
          }
          redirect(`/app.html${window.location.search}`);
          return;
        };
        
        http('GET', `${appKeys.getBaseUrl()}/api/services/subscription/checkIn`).then(response => {
          if(response.hasCheckInSubscription)  {
            signOut()
            showSnacksApiResponse('Please use Growthfile app on your mobile to continue');
            setTimeout(function(){
              window.location.href = 'https://growthfile.page.link/naxz';
            },2000)
            return;
          }
          if(window.location.pathname === '/signup.html') {
            getLocation().then(searchOffice).catch(console.error)
            return;
          }
          redirect('/signup.html');

        })
      });
      return;
    };
    updateAuth(el,user);
  });
}