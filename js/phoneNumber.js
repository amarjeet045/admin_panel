export const phoneFieldInit = (numberField) => {
    const input = numberField.input_;
    console.log(numberField.trailingIcon_);

    numberField.listen('MDCTextField:icon',function(evt){
        console.log("trailing icon clicked",evt)
    });

    numberField.trailingIcon_.foundation_.adapter_.notifyIconAction()
    return intlTelInput(input, {
        initialCountry: "IN",
        dropdownContainer: document.getElementById("country-dom"),
        formatOnDisplay: false,
        separateDialCode: true,
    });
};