const init = (office,officeId) => {

    const form = document.getElementById('manage-form');
    const auth  = firebase.auth().currentUser;
    const nameField = new mdc.textField.MDCTextField(document.getElementById('account-name'))
    const emailField = new mdc.textField.MDCTextField(document.getElementById('account-email'));
    nameField.value = auth.displayName;
    emailField.value = auth.email;
    form.addEventListener('submit',(ev)=>{
        ev.preventDefault();
        ev.submitter.classList.add('active')
        handleAuthUpdate({
            displayName:nameField.value,
            email:emailField.value
        }).then(()=>{
            formSubmittedSuccess(ev.submitter,'Account updated')
        }).catch(err=>{
            ev.submitter.classList.remove('active')

            const message = getEmailErrorMessage(err);
            if(message) {
                setHelperInvalid(emailField, message);
                return
            }   
        })
    });
}

