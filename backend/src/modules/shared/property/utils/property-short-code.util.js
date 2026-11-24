// Shuffled base62 alphabet so codes do not read as a plain counter
const ALPHABET = "zuNd9jkMLOQRvVab25FsGnPtI7UqXZpWA1crhHTY3fio4DB8CxJK0Eywem6gSl";
const BASE = ALPHABET.length;
const CODE_PATTERN = /^[0-9A-Za-z]{1,12}$/;

// listing_number is unique and permanent, so the code never changes for a property
function encodeShortCode(listingNumber) {
  let value = Number(listingNumber);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error("Invalid listing number");
  }

  let code = "";
  while (value > 0) {
    code = ALPHABET[value % BASE] + code;
    value = Math.floor(value / BASE);
  }

  return code;
}

// Returns the listing number, or null when the code is not one we issued
function decodeShortCode(code) {
  if (typeof code !== "string" || !CODE_PATTERN.test(code)) return null;

  let value = 0;
  for (const char of code) {
    const digit = ALPHABET.indexOf(char);
    if (digit < 0) return null;
    value = value * BASE + digit;
  }

  return Number.isSafeInteger(value) && encodeShortCode(value) === code ? value : null;
}

module.exports = { encodeShortCode, decodeShortCode, SHORT_CODE_PATTERN: CODE_PATTERN };
