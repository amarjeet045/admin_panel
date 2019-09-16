export const phoneFieldInit = (numberField,dropEl) => {
    const input = numberField.input_;
    return intlTelInput(input, {
        initialCountry: "IN",
        dropdownContainer: dropEl,
        formatOnDisplay: false,
        separateDialCode: true,
    });
};