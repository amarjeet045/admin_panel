export const phoneFieldInit = (numberField) => {
    const input = numberField.input_;
    input.addEventListener("countrychange", function (e) {
        // do something with iti.getSelectedCountryData()
        numberField.focus();
    });

    numberField.foundation_.adapter_.registerInputInteractionHandler('blur',function(event){
        numberField.focus()
    })
    return intlTelInput(input, {
        initialCountry: "IN",
        dropdownContainer: document.getElementById("country-dom"),
        formatOnDisplay: false,
        separateDialCode: true,
    });
};