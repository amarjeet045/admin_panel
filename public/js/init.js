function initializeLogIn(el,shouldRedirect = true,profileInfo) {
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
      login(el,profileInfo);
      return;
    };

    addLogoutBtn();

    const param = parseURL()
    user.getIdTokenResult().then((idTokenResult) => {
      
      if (idTokenResult.claims.admin || idTokenResult.claims.support) {
        if (user.email && user.emailVerified && user.displayName){
          if (window.location.pathname === '/app.html') {
            getLocation().then(initializer).catch(err => {
              initializer();
            })
            return
          }
          redirect(`/app.html${window.location.search}`);
        }
        updateAuth(el,user,profileInfo);
        return;
      };
      if(window.location.pathname === '/signup.html' && param && param.get('action') === 'create-office') {
        getLocation().then(searchOffice).catch(console.error)
        return;
      }
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
  });
}

const addLogoutBtn = () =>{
  const el = document.getElementById('app-bar-login');
  if(!el) return;
  el.textContent = 'Log out';
  el.removeAttribute('href');
  el.addEventListener('click',function(){
    firebase.auth().signOut().then(function(){
      redirect('')
    })
  })
}