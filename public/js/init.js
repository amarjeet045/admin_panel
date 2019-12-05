window.addEventListener('load', function () {
    console.log(firebase)
    var appKeys = new AppKeys();
    firebase.initializeApp(appKeys.getKeys());
    firebase.auth().onAuthStateChanged(user => {
      console.log(user)
      if (!user) {
        return redirect('');
      };

      if (user.email && user.emailVerified && user.displayName) {
        
        user.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims.hasOwnProperty('admin') && idTokenResult.claims.admin.length) {
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
