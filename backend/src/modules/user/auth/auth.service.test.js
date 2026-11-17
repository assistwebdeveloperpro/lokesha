process.env.JWT_SECRET = "test-secret";

jest.mock("./auth.repository");

const jwt = require("jsonwebtoken");
const repository = require("./auth.repository");
const service = require("./auth.service");

const signupInput = {
  role: "buyer_owner_tenant",
  name: "Asha Rao",
  email: "asha@example.com",
  mobile_number: "9876543210",
  agreed_to_terms: true,
};

describe("signup", () => {
  it("creates the user when email and mobile are free", async () => {
    repository.findUserByEmail.mockResolvedValue(null);
    repository.findUserByMobile.mockResolvedValue(null);
    repository.createUser.mockResolvedValue({ id: 1 });

    await expect(service.signup(signupInput)).resolves.toEqual({ id: 1 });
    expect(repository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "asha@example.com", mobile_number: "9876543210" }),
    );
  });

  it("rejects a registered email with 409", async () => {
    repository.findUserByEmail.mockResolvedValue({ id: 2 });

    await expect(service.signup(signupInput)).rejects.toMatchObject({
      statusCode: 409,
      message: "Email is already registered",
    });
    expect(repository.createUser).not.toHaveBeenCalled();
  });

  it("rejects a registered mobile number with 409", async () => {
    repository.findUserByEmail.mockResolvedValue(null);
    repository.findUserByMobile.mockResolvedValue({ id: 2 });

    await expect(service.signup(signupInput)).rejects.toMatchObject({
      statusCode: 409,
      message: "Mobile number is already registered",
    });
  });
});

describe("login", () => {
  it("answers 404 for an unknown mobile number", async () => {
    repository.findUserByMobile.mockResolvedValue(null);

    await expect(service.login({ mobile_number: "9876543210" })).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(repository.setOtp).not.toHaveBeenCalled();
  });

  it("stores a 4 digit otp with an expiry for a known user", async () => {
    repository.findUserByMobile.mockResolvedValue({ id: 1 });

    const result = await service.login({ mobile_number: "9876543210" });

    const [mobile, otp, expiresAt] = repository.setOtp.mock.calls[0];
    expect(mobile).toBe("9876543210");
    expect(otp).toMatch(/^\d{4}$/);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(result).toEqual({
      message: "OTP sent successfully.",
      otp_expires_in: expect.any(Number),
    });
  });
});

describe("verifyOtp", () => {
  const futureExpiry = () => new Date(Date.now() + 60_000);

  it("answers 404 when no account exists", async () => {
    repository.getUserRoleAndOtp.mockResolvedValue(null);

    await expect(
      service.verifyOtp({ mobile_number: "9876543210", otp: "1234" }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it.each([
    ["wrong", { otp_code: "9999", otp_expires_at: futureExpiry() }],
    ["expired", { otp_code: "1234", otp_expires_at: new Date(Date.now() - 1000) }],
    ["missing", { otp_code: null, otp_expires_at: null }],
  ])("rejects a %s otp with 400", async (_label, otpState) => {
    repository.getUserRoleAndOtp.mockResolvedValue({ id: 1, role: "agent", ...otpState });

    await expect(
      service.verifyOtp({ mobile_number: "9876543210", otp: "1234" }),
    ).rejects.toMatchObject({ statusCode: 400, message: "Invalid or expired OTP" });
    expect(repository.clearOtp).not.toHaveBeenCalled();
  });

  it("clears the otp and returns a signed token on success", async () => {
    repository.getUserRoleAndOtp.mockResolvedValue({
      id: 7,
      role: "builder",
      name: "Asha",
      otp_code: "1234",
      otp_expires_at: futureExpiry(),
    });

    const result = await service.verifyOtp({ mobile_number: "9876543210", otp: "1234" });

    expect(repository.clearOtp).toHaveBeenCalledWith(7);
    expect(result).toMatchObject({ role: "builder", name: "Asha" });
    expect(jwt.verify(result.token, "test-secret")).toMatchObject({ id: 7, role: "builder" });
  });
});

describe("connectSeller", () => {
  const input = { ...signupInput };
  delete input.role;

  beforeEach(() => jest.clearAllMocks());

  it("stores a pending registration and does not create a user for a new number", async () => {
    repository.findUserByMobile.mockResolvedValue(null);
    repository.findUserByEmail.mockResolvedValue(null);

    await service.connectSeller(input);

    expect(repository.createUser).not.toHaveBeenCalled();
    expect(repository.upsertPendingRegistration).toHaveBeenCalledWith(
      expect.objectContaining({ mobile_number: "9876543210", email: "asha@example.com" }),
    );
  });

  it("rejects an email owned by another account with 409", async () => {
    repository.findUserByMobile.mockResolvedValue(null);
    repository.findUserByEmail.mockResolvedValue({ id: 2 });

    await expect(service.connectSeller(input)).rejects.toMatchObject({ statusCode: 409 });
    expect(repository.upsertPendingRegistration).not.toHaveBeenCalled();
  });

  it("sends an otp to an existing user without a pending registration", async () => {
    repository.findUserByMobile.mockResolvedValue({ id: 1 });

    await service.connectSeller(input);

    expect(repository.setOtp).toHaveBeenCalled();
    expect(repository.upsertPendingRegistration).not.toHaveBeenCalled();
  });
});

describe("verifyOtp for a pending registration", () => {
  const pending = (overrides = {}) => ({
    name: "Asha Rao",
    email: "asha@example.com",
    agreed_to_terms: true,
    otp_code: "1234",
    otp_expires_at: new Date(Date.now() + 60_000),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    repository.getUserRoleAndOtp.mockResolvedValue(null);
    repository.findUserByMobile.mockResolvedValue(null);
    repository.findUserByEmail.mockResolvedValue(null);
  });

  it("creates the user only after the otp matches", async () => {
    repository.findPendingRegistration.mockResolvedValue(pending());
    repository.createUser.mockResolvedValue({ id: 9, role: "buyer_owner_tenant", name: "Asha Rao" });

    const result = await service.verifyOtp({ mobile_number: "9876543210", otp: "1234" });

    expect(repository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: "buyer_owner_tenant", mobile_number: "9876543210" }),
    );
    expect(repository.deletePendingRegistration).toHaveBeenCalledWith("9876543210");
    expect(jwt.verify(result.token, "test-secret")).toMatchObject({ id: 9 });
  });

  it.each([
    ["wrong", { otp_code: "9999" }],
    ["expired", { otp_expires_at: new Date(Date.now() - 1000) }],
  ])("creates no user for a %s otp", async (_label, overrides) => {
    repository.findPendingRegistration.mockResolvedValue(pending(overrides));

    await expect(
      service.verifyOtp({ mobile_number: "9876543210", otp: "1234" }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.createUser).not.toHaveBeenCalled();
  });

  it("rejects with 409 when the mobile was registered after the otp was sent", async () => {
    repository.findPendingRegistration.mockResolvedValue(pending());
    repository.findUserByMobile.mockResolvedValue({ id: 3 });

    await expect(
      service.verifyOtp({ mobile_number: "9876543210", otp: "1234" }),
    ).rejects.toMatchObject({ statusCode: 409, message: "Mobile number is already registered" });
    expect(repository.createUser).not.toHaveBeenCalled();
  });

  it("answers 404 when there is no user and no pending registration", async () => {
    repository.findPendingRegistration.mockResolvedValue(null);

    await expect(
      service.verifyOtp({ mobile_number: "9876543210", otp: "1234" }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("getMe", () => {
  it("returns the user", async () => {
    repository.findUserById.mockResolvedValue({ id: 1 });

    await expect(service.getMe(1)).resolves.toEqual({ id: 1 });
  });

  it("answers 404 when the user is gone", async () => {
    repository.findUserById.mockResolvedValue(null);

    await expect(service.getMe(1)).rejects.toMatchObject({ statusCode: 404 });
  });
});
