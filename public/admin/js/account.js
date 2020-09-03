const init = (office,officeId) => {

    const form = document.getElementById('account-form');
    const auth  = firebase.auth().currentUser;
    const nameField = new mdc.textField.MDCTextField(document.getElementById('account-name'))
    const emailField = new mdc.textField.MDCTextField(document.getElementById('account-email'));
    nameField.value = auth.displayName;
    emailField.value = auth.email;
    form.addEventListener('submit',(ev)=>{
        ev.preventDefault();

        handleAuthUpdate({
            displayName:nameField.value,
            email:emailField.value
        }).then(()=>{
            document.getElementById('snackbar-label').textContent = 'Account information updated'
        }).catch(err=>{
            const message = getEmailErrorMessage(err);
            if(message) {
                setHelperInvalid(emailField, message);
                return
            }   
        })
    })

}