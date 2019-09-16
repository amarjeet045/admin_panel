export const phoneFieldInit = (numberField) => {
    const input = numberField.input_;
    return intlTelInput(input, {
        initialCountry: "IN",
        dropdownContainer: document.getElementById("country-dom"),
        formatOnDisplay: false,
        separateDialCode: true,
    });
};