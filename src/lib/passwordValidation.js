export const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { valid: false, message: `Hasło musi mieć co najmniej ${minLength} znaków.` };
    }
    if (!hasUpperCase) {
        return { valid: false, message: "Hasło musi zawierać co najmniej jedną wielką literę." };
    }
    if (!hasLowerCase) {
        return { valid: false, message: "Hasło musi zawierać co najmniej jedną małą literę." };
    }
    if (!hasNumber) {
        return { valid: false, message: "Hasło musi zawierać co najmniej jedną cyfrę." };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: "Hasło musi zawierać co najmniej jeden znak specjalny." };
    }

    return { valid: true };
};
