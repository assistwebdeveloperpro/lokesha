const { generateOtp, getOtpExpiry, OTP_EXPIRY_SECONDS } = require("./otp");

describe("generateOtp", () => {
  it("always returns a 4 digit numeric string", () => {
    for (let i = 0; i < 200; i += 1) {
      expect(generateOtp()).toMatch(/^[1-9]\d{3}$/);
    }
  });
});

describe("getOtpExpiry", () => {
  it("expires the configured number of seconds from now", () => {
    jest.useFakeTimers().setSystemTime(new Date("2030-01-01T00:00:00Z"));

    const expiry = getOtpExpiry();

    expect(expiry.getTime() - Date.now()).toBe(OTP_EXPIRY_SECONDS * 1000);

    jest.useRealTimers();
  });
});
