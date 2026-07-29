const OTP_EXPIRY_SECONDS = Number(process.env.OTP_EXPIRY_SECONDS) || 142;

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function getOtpExpiry() {
  return new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);
}

module.exports = { generateOtp, getOtpExpiry, OTP_EXPIRY_SECONDS };
