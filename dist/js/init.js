"use strict";

function initializeLogIn(el) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (document.getElementById('app-bar-signup')) {
      document.getElementById('app-bar-signup').classList.remove('hidden');
    }

    if (!user) {
      if (commonDom.progressBar) {
        commonDom.progressBar.close();
      }

      document.body.classList.remove('hidden');

      if (window.location.pathname === '/app') {
        redirect('');
        return;
      }

      login(el);
      return;
    }

    ;
    firebase.auth().currentUser.getIdTokenResult().then(function (idToken) {
      if (idToken.claims && idToken.claims.support) {
        redirect('/support');
        return;
      }

      flushStoredErrors();
      sendAcqusition().then(handleLoggedIn).catch(handleLoggedIn);
    });
  });
}

var sendAcqusition = function sendAcqusition() {
  var param = parseURL();
  if (!param) return Promise.resolve();
  return http('PUT', "".concat(appKeys.getBaseUrl(), "/api/profile/acquisition"), {
    source: param.get('utm_source'),
    medium: param.get('utm_medium'),
    campaign: param.get('utm_campaign'),
    campaignId: param.get('campaignId'),
    office: param.get('office')
  });
};
/**
 * Handles a logged in user.
 * @param {Boolean} isNewUser 
 */


function handleLoggedIn(isNewUser) {
  addLogoutBtn();
  var param = parseURL();

  if (window.location.pathname === '/welcome' && param && param.get('action') === 'get-subscription') {
    handleWelcomePage();
    return;
  }

  ;
  handleAuthRedirect(isNewUser);
}
/**
 * If user is privileged then redirect them to /join page
 * else modify the page to reflect user successfull addition
 */


var handleWelcomePage = function handleWelcomePage() {
  var param = parseURL();
  firebase.auth().currentUser.getIdTokenResult().then(function (idTokenResult) {
    // if (idTokenResult.claims.admin || idTokenResult.claims.support) {
    //   redirect(`/join`);
    //   return
    // }
    document.getElementById('campaign-heading').innerHTML = "Adding you to <span class='mdc-theme--primary'>".concat(param.get('office'), "</span>");
    sendAcqusition().then(function () {
      document.getElementById('home-login').remove();
      document.getElementById('campaign-heading').innerHTML = "You are added into <span class='mdc-theme--primary'>".concat(param.get('office'), "</span>");
    }).catch(console.error);
  });
};
/**
 * Take user to /join page to start onboarding flow
 * @param {Boolean} isNewUser 
 */


var handleAuthRedirect = function handleAuthRedirect(isNewUser) {
  redirect('/join');
};
/**
 * Recursively checks if users custom claims are updated with the office.
 * If office is found then clear interval and execute the callback;
 * @param {String} office 
 * @param {Function} callback 
 */


var waitTillCustomClaimsUpdate = function waitTillCustomClaimsUpdate(office, callback) {
  var interval = setInterval(function () {
    firebase.auth().currentUser.getIdToken(true).then(function () {
      firebase.auth().currentUser.getIdTokenResult().then(function (idTokenResult) {
        if (idTokenResult.claims.admin && idTokenResult.claims.admin.indexOf(office) > -1) {
          clearInterval(interval);
          callback();
        }
      });
    }).catch(console.error);
  }, 4000);
};