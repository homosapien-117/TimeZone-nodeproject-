// name validation
const nameValid = (username) => {
    const usernameRegex = /^[A-Za-z]+$/;
    return username.trim().length > 0 && usernameRegex.test(username);
};

// email validation
const emailValid = (email) => {
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    return emailRegex.test(email.trim());
};

// phone validation
const phoneValid = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.trim());
};

// passwordValid validation
const passwordValid = (password) => {
    const length = /^.{8,}$/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /\d/;
    const specialcharecter = /[!@#$%^&*(),.?":{}|<>]/;

    const haslength = length.test(password);
    const hasuppercase = uppercase.test(password);
    const haslowercase = lowercase.test(password);
    const hasnumber = number.test(password);
    const hasspecialcharecter = specialcharecter.test(password);
    return (
        haslength &&
        hasuppercase &&
        haslowercase &&
        hasnumber &&
        hasspecialcharecter
    );
};

// confirmpassword Validation
const confirmpasswordValid = (confirmpassword, password) => {
    return confirmpassword.trim() == password.trim();
};

// module exporting
module.exports = {
    emailValid,
    nameValid,
    phoneValid,
    passwordValid,
    confirmpasswordValid,
};
