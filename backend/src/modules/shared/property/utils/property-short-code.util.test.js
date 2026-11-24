const { encodeShortCode, decodeShortCode } = require("./property-short-code.util");

describe("property short code", () => {
  it("round trips listing numbers", () => {
    [1, 61, 62, 100000, 100001, 987654321].forEach((number) => {
      expect(decodeShortCode(encodeShortCode(number))).toBe(number);
    });
  });

  it("issues short unique codes for consecutive listing numbers", () => {
    const codes = Array.from({ length: 5000 }, (_, index) => encodeShortCode(100000 + index));

    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.every((code) => code.length <= 4)).toBe(true);
  });

  it("rejects codes that were never issued", () => {
    ["", "Al65!", "a".repeat(13), null, undefined, 123].forEach((code) => {
      expect(decodeShortCode(code)).toBeNull();
    });
  });

  it("rejects non canonical codes", () => {
    const leadingZeroDigit = `z${encodeShortCode(100000)}`;

    expect(decodeShortCode(leadingZeroDigit)).toBeNull();
  });

  it("refuses invalid listing numbers", () => {
    expect(() => encodeShortCode(0)).toThrow();
    expect(() => encodeShortCode("abc")).toThrow();
  });
});
