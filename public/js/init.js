function initializeLogIn(el,shouldRedirect = true) {
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
      login(el);
      return;
    };

    
    if (user.email && user.emailVerified && user.displayName) {
      user.getIdTokenResult().then((idTokenResult) => {
        console.log(idTokenResult)
        if (idTokenResult.claims.hasOwnProperty('admin') && idTokenResult.claims.admin.length) {
          if (window.location.pathname === '/app.html') {
            getLocation().then(initializer).catch(err => {
              initializer();
            })
            return
          }
          redirect('/app.html');
          return;
        };
        http('GET', '/api/services/subscription/checkIn').then(response => {
          if(response.hasCheckInSubscription)  {
            window.location.href = 'https://growthfile.page.link/naxz';
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