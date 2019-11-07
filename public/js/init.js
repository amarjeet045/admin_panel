window.addEventListener('load', function () {
    console.log(firebase)
    var appKeys = new AppKeys();
    firebase.initializeApp(appKeys.getKeys());
    firebase.auth().onAuthStateChanged(user => {
      console.log(user)
      if (!user) {
        if (parseRedirect('redirect_to') === 'LOGIN') {
          login();
          return;
        };
        return redirect('/home.html');
      };

      if (user.email && user.emailVerified && user.displayName) {
        user.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims.hasOwnProperty('admin') && idTokenResult.claims.admin.length) {
            if (parseRedirect('redirect_to') === 'LOGIN') {
              
              history.pushState(null, null, window.location.pathname);
              
            }
            getLocation().then(geopoint => {
                return initializer(user,geopoint)
            }).catch(error => {
               
                initializer(user);
            })
            return;
          }
          redirect('/signup.html');
        });
        return;
      };

      updateAuth(user);
    });
});
