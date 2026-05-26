export function generateLuhnNumber(length = 16) {
    if (length < 2) throw new Error("Length must be at least 2");

    let digits = [];


    for (let i = 0; i < length - 1; i++) {
        digits.push(Math.floor(Math.random() * 10));
    }

    let sum = 0;


    let shouldDouble = true;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }


    let checkDigit = (10 - (sum % 10)) % 10;

    return digits.join("") + checkDigit;
}

export function isValidCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, "");

    if (cleaned.length < 13 || cleaned.length > 19) {
        return false;
    }

    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

