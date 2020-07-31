window.addEventListener('load', function () {
  //load footer
  loadPartial('/partials/footer').then(function (footer) {
    document.querySelector('footer').innerHTML = footer;
  })  

  if(window.mdc) {
    window.mdc.autoInit();
  }
  if (document.querySelector(
      '.mdc-linear-progress')) {

    commonDom.progressBar = new mdc.linearProgress.MDCLinearProgress(document.querySelector(
      '.mdc-linear-progress'))
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // flush stored errors that were logged before auth
      addLogoutBtn();
      flushStoredErrors()
    }
    initAuthBox(user);
  });

  //init drawer & menu for non-desktop devices
  const drawer = new mdc.drawer.MDCDrawer(document.querySelector(".mdc-drawer"))
  const menu = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('menu'))
  menu.listen('MDCIconButtonToggle:change', function (event) {
    drawer.open = !drawer.open;
  });
})
/**
 * initialize the auth box.
 * if user is logged out , then show the phonenumber field 
 * for user to perform auth , else remove the phonenumber field. 
 * @param {object} user // firebase auth object
 */
const initAuthBox = (user) => {
  const getStartedBtn = document.getElementById('get-started');
  getStartedBtn.addEventListener('click',(ev)=>{
    if(user) return redirect('/join');
    const inputNumber = new mdc.textField.MDCTextField(document.getElementById('phone-number'));
    const iti = phoneFieldInit(inputNumber);
    if()
  });

  if(!user) {
    document.getElementById('auth-section').classList.remove('hidden');

    return
  };
  //user is logged in;
  document.getElementById('auth-section').classList.add('hidden');
}
/**
 * fetches the partial html document. 
 * source iS the url of the document
 * @param {object} source 
 * 
 */
const loadPartial = (source) => {
  return new Promise(function (resolve, reject) {
    //check if browser supports fetch
    if (window.fetch) {
      fetch(source).then(function (response) {
          return response.text();
        })
        .then(resolve).catch(reject)
      return;
    }
    // use  XMLHttpRequest() if fetch is not supported
    var request = new XMLHttpRequest();
    request.open('GET', source);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        resolve(request.responseText)
        return
      }
      reject(request);
    };
    request.send();
  })
}






/**
 *  create the view for entering otp;
 *  @returns {DocumentFragment}
 */
const otpFlow = () => {

  const frag = document.createDocumentFragment();
  const div = createElement('div', {
      className: 'otp-container'
  })

  /** 6 inputs fields because otp length is 6 digits */
  for (let i = 0; i < 6; i++) {
      let disabled = true;
      if (i == 0) {
          disabled = false
      }
      const tf = textFieldOutlinedWithoutLabel({
          type: 'tel',
          required: true,
          disabled: disabled,
          maxLength: "1",
          size: "1",
          min: "0",
          max: "9",
          pattern: "[0-9]{1}"
      });
      div.appendChild(tf.root_);
  }

  div.addEventListener('keydown', otpKeyDown)
  div.addEventListener('keyup', otpKeyUp);

  const resendCont = createElement('div', {
      className: 'resend-box text-center',
      textContent: "Didn't receive the code ?"
  })
  const resend = createElement('div', {
      className: 'mdc-theme--secondary',
      textContent: 'Send code again'
  })
  /**
   * resent otp code
   */
  resend.addEventListener('click', (e) => {

  })
  resendCont.appendChild(resend);
  frag.appendChild(div)
  frag.appendChild(resendCont);
  return frag;
}

/**
 *  Handles keyDown event for otp input. Allow only numeric characters ,
 *  enter & backspace
 * @param {Event} e 
 */
const otpKeyDown = (e) => {
  const key = e.which;

  if (/^[0-9]*$/.test(e.key) || key == 8 || key == 13) return true
  e.preventDefault();
  return false;
}
/**
* Go to next otp input. Allow only numeric characters ,
*  enter & backspace
* @param {Event} e 
*/
const otpKeyUp = (e) => {
  const key = e.which;
  const target = e.target;
  // get next parent sibling
  const parentSibling = target.parentElement.nextSibling;

  if (/^[0-9]*$/.test(e.key) || key == 8 || key == 13) {
      // focus next element after sometime to handle fast typing
      setTimeout(() => {
          if (parentSibling) {
              parentSibling.classList.remove('mdc-text-field--disabled')
              parentSibling.querySelector('input').removeAttribute('disabled');
              parentSibling.querySelector('input').focus();
          };
          journeyNextBtn.disabled = !otpBoxesFilled()
      }, 300)

      return true
  }

  e.preventDefault();
  return false;
}

/**
* checks if all otp input fields are fileld with value
* @returns {Boolean}
*/
const otpBoxesFilled = () => {
  const container = document.querySelector('.otp-container');
  if (!container) return;
  let filled = true
  container.querySelectorAll('input').forEach(el => {
      if (!el.value) {
          filled = false;
          return
      }
  })
  return filled;
};