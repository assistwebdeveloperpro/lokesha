const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REGISTRATION_TOKEN_PURPOSE = "register";
const REGISTRATION_TOKEN_EXPIRES_IN = "15m";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function signRegistrationToken(mobile_number) {
  return jwt.sign({ purpose: REGISTRATION_TOKEN_PURPOSE, mobile_number }, JWT_SECRET, {
    expiresIn: REGISTRATION_TOKEN_EXPIRES_IN,
  });
}

// Returns the verified mobile number, or null for any invalid/expired/wrong-purpose token.
function verifyRegistrationToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.purpose === REGISTRATION_TOKEN_PURPOSE ? decoded.mobile_number : null;
  } catch (error) {
    return null;
  }
}

module.exports = { signToken, verifyToken, signRegistrationToken, verifyRegistrationToken };
