function initializeLogIn(el,shouldRedirect = true) {
  var appKeys = new AppKeys();
  firebase.initializeApp(appKeys.getKeys());
  firebase.auth().onAuthStateChanged(user => {
    console.log(user)
    if (!user) {
      if(shouldRedirect) {
          redirect('');
          return;
      }
      login(el);
      return;
    };
    document.body.classList.remove('hidden')
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
          // if(response.hasCheckInSubscription) return redirect()
          redirect('/signup.html')
        })
      });
      return;
    };
    updateAuth(user);
  });

}