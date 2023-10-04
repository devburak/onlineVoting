function maskPhone(phone) {
    if (!phone) return null;
    const visibleStartDigits = phone.substr(0, 4);
    const visibleEndDigits = phone.substr(-2);
    const maskSize = phone.length - 6; // Total - visible digits
    const maskedSection = '*'.repeat(maskSize);
    return `${visibleStartDigits}${maskedSection}${visibleEndDigits}`;
}

module.exports = maskPhone;
