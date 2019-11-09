window.mdc.autoInit();
var appKeys = new AppKeys();
firebase.initializeApp(appKeys.getKeys());
firebase.auth().onAuthStateChanged(user => {
    console.log(user)
    if (!user) {
      document.getElementById("home-login").classList.remove('hidden')
      document.querySelector('.sign-up-form').classList.add('hidden');
      const logoutbtn = document.getElementById("app-bar-logout");
      if(logoutbtn) {
        document.querySelector('.mdc-top-app-bar__section--align-end').replaceChild(loginButton(),logoutbtn);
      }

      login('home-login')
      return;
    };
    
    document.querySelector('.mdc-top-app-bar__section--align-end').replaceChild(headerButton('Log out','app-bar-logout'),document.getElementById('app-bar-login'))   
    document.getElementById('app-bar-logout').addEventListener('click',signOut);

    if (user.email && user.emailVerified && user.displayName) {
      user.getIdTokenResult().then((idTokenResult) => {
        if (idTokenResult.claims.hasOwnProperty('admin') && idTokenResult.claims.admin.length) {
          redirect('/index.html');
          return;
        }
        document.querySelector('.sign-up-form').classList.remove('hidden');
        document.getElementById("home-login").classList.add('hidden')
        initSignUp();
      });
      return;
    };

    updateAuth(user);
  });



const featuresBtn = document.getElementById('features-button');
const featuresMenu = new mdc.menu.MDCMenu(document.getElementById('features-menu'));
featuresBtn.addEventListener('click', function () {
    featuresMenu.open = true;
})

const solutionsBtn = document.getElementById('solutions-button');
const solutionsMenu = new mdc.menu.MDCMenu(document.getElementById('solutions-menu'));
solutionsBtn.addEventListener('click', function () {
    solutionsMenu.open = true;
})


// const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
// menu.listen('MDCIconButtonToggle:change', function (event) {

// })


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function loginButton() {
 
  const a = createElement('a',{
    className:'mdc-top-app-bar__action-item mdc-button',
    href:'./index.html?redirect_to=LOGIN',
    id:'app-bar-login',
    textContent:'Log in'
  })
  new mdc.ripple.MDCRipple(a)
  return a
}