window.mdc.autoInit();
var appKeys = new AppKeys();
firebase.initializeApp(appKeys.getKeys());
firebase.auth().onAuthStateChanged(user => {
    console.log(user)
    if (!user) {
        login('home-login')
        return;
    };

    if (user.email && user.emailVerified && user.displayName) {
      user.getIdTokenResult().then((idTokenResult) => {
        if (idTokenResult.claims.hasOwnProperty('admin') && idTokenResult.claims.admin.length) {
          redirect('/index.html');
          return;
        }
        document.querySelector('.sign-up-form').classList.remove('hidden');
        document.getElementById("home-login").remove();
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
