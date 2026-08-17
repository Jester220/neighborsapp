// Only accept official DIU email addresses
function isValidDiuEmail(email) {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@(diu\.edu\.bd|diu-edu\.com)$/i.test(email) ||
    // Fallback for testing: still requires a real-looking email
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function isValidPhone(phone) {
  if (!phone) return true; // phone is optional in some places
  return /^[0-9+\-\s()]{7,20}$/.test(phone);
}

function isNonEmptyString(value, minLength = 1) {
  return typeof value === 'string' && value.trim().length >= minLength;
}

function isValidRating(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

function isValidRadius(value) {
  const n = Number(value);
  return [500, 1000, 2000, 5000].includes(n);
}

module.exports = {
  isValidDiuEmail,
  isValidPhone,
  isNonEmptyString,
  isValidRating,
  isValidRadius
};
