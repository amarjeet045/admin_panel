const init = (office, officeId) => {

    const form = document.getElementById('manage-form');
    const auth = firebase.auth().currentUser;
    const nameField = new mdc.textField.MDCTextField(document.getElementById('account-name'));
    const emailField = new mdc.textField.MDCTextField(document.getElementById('account-email'));
    const imageField = document.querySelector('.account-photo');
    const imageUpload = document.getElementById('image-upload');
    let base64Image = auth.photoURL;

    nameField.value = auth.displayName;
    emailField.value = auth.email;
    if (auth.photoURL) {
        imageField.style.backgroundImage = `url("${auth.photoURL}")`
    };
    imageUpload.addEventListener('change',(ev)=>{
        getImageBase64(ev).then(base64 => {
            base64Image = base64;
            imageField.style.backgroundImage = `url("${base64}")`;

        })
    })



    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        ev.submitter.classList.add('active');
        let imageProm;
        if(auth.photoURL !== base64Image) {
            imageProm = http('POST',`${appKeys.getBaseUrl()}/api/services/images`,{
                imageBase64:base64Image
            })
        }
        else {
            imageProm = Promise.resolve();
        }
        imageProm.then(()=>{
            return handleAuthUpdate({
                displayName: nameField.value,
                email: emailField.value
            })
        }).then(() => {
            auth.reload();
            handleFormButtonSubmit(ev.submitter, 'Account updated')
        }).catch(err => {
            ev.submitter.classList.remove('active')
            const message = getEmailErrorMessage(err);
            if (message) {
                setHelperInvalid(emailField, message);
                return
            }
            handleFormButtonSubmit(ev.submitter, message);
        })
    });
}