const init = (office,officeId) => {

    const saveBtn = document.getElementById('save-account');
    const auth  = firebase.auth().currentUser;

    const nameField = new mdc.textField.MDCTextField(document.getElementById('account-name'))
    const emailField = new mdc.textField.MDCTextField(document.getElementById('account-email'));
    nameField.value = auth.displayName;
    emailField.value = auth.email;
    
    saveBtn.addEventListener('click',()=>{
        if(!nameField.value) {
            setHelperInvalid(nameField,'Enter your name');
            return;
        }
        if(!emailField.value) {
            setHelperInvalid(emailField,'Enter your email');
            return;
        }
        saveBtn.classList.add('active');
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