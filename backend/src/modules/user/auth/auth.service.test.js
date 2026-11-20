process.env.JWT_SECRET = "test-secret";

jest.mock("./auth.repository");
jest.mock("../../shared/subscription/services/subscription-grant.service");

const jwt = require("jsonwebtoken");
const repository = require("./auth.repository");
const { grantFreePackage } = require("../../shared/subscription/services/subscription-grant.service");
const service = require("./auth.service");

const TRX = Symbol("trx");

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

describe("sendOtp", () => {
  const mobile_number = "9876543210";

  beforeEach(() => {
    jest.clearAllMocks();
    repository.getUserRoleAndOtp.mockResolvedValue(null);
    repository.findMobileOtp.mockResolvedValue(null);
  });

  it("issues the otp on the users table for a registered number", async () => {
    repository.getUserRoleAndOtp.mockResolvedValue({ id: 1, otp_expires_at: null });

    const result = await service.sendOtp({ mobile_number });

    expect(repository.setOtp).toHaveBeenCalled();
    expect(repository.upsertMobileOtp).not.toHaveBeenCalled();
    expect(result).toMatchObject({ is_registered: true });
  });

  it("stores the otp in otp_verifications for an unknown number", async () => {
    const result = await service.sendOtp({ mobile_number });

    expect(repository.upsertMobileOtp).toHaveBeenCalledWith(
      expect.objectContaining({ mobile_number, otpCode: expect.stringMatching(/^\d{4}$/) }),
    );
    expect(repository.setOtp).not.toHaveBeenCalled();
    expect(result).toMatchObject({ is_registered: false });
  });

  it("answers 429 with retryAfter inside the cooldown for an unknown number", async () => {
    repository.findMobileOtp.mockResolvedValue({ last_sent_at: new Date(Date.now() - 10_000) });

    await expect(service.sendOtp({ mobile_number })).rejects.toMatchObject({
      statusCode: 429,
      details: { retryAfter: expect.any(Number) },
    });
    expect(repository.upsertMobileOtp).not.toHaveBeenCalled();
  });

  it("answers 429 inside the cooldown for a registered number", async () => {
    repository.getUserRoleAndOtp.mockResolvedValue({
      id: 1,
      otp_expires_at: new Date(Date.now() + 290_000),
    });

    await expect(service.sendOtp({ mobile_number })).rejects.toMatchObject({ statusCode: 429 });
    expect(repository.setOtp).not.toHaveBeenCalled();
  });

  it("allows a resend once the cooldown has passed", async () => {
    repository.findMobileOtp.mockResolvedValue({ last_sent_at: new Date(Date.now() - 61_000) });

    await service.sendOtp({ mobile_number });

    expect(repository.upsertMobileOtp).toHaveBeenCalled();
  });
});

describe("verifyMobileOtp", () => {
  const mobile_number = "9876543210";
  const futureExpiry = () => new Date(Date.now() + 60_000);

  beforeEach(() => {
    jest.clearAllMocks();
    repository.getUserRoleAndOtp.mockResolvedValue(null);
  });

  it("signs in a registered user and clears the otp", async () => {
    repository.getUserRoleAndOtp.mockResolvedValue({
      id: 7,
      role: "agent",
      name: "Asha",
      otp_code: "1234",
      otp_expires_at: futureExpiry(),
    });

    const result = await service.verifyMobileOtp({ mobile_number, otp: "1234" });

    expect(repository.clearOtp).toHaveBeenCalledWith(7);
    expect(result).toMatchObject({ is_new_user: false, role: "agent", name: "Asha" });
    expect(jwt.verify(result.token, "test-secret")).toMatchObject({ id: 7, role: "agent" });
  });

  it("returns a registration token and deletes the otp for an unknown number", async () => {
    repository.findMobileOtp.mockResolvedValue({ otp_code: "1234", otp_expires_at: futureExpiry() });

    const result = await service.verifyMobileOtp({ mobile_number, otp: "1234" });

    expect(repository.deleteMobileOtp).toHaveBeenCalledWith(mobile_number);
    expect(result.is_new_user).toBe(true);
    expect(jwt.verify(result.registration_token, "test-secret")).toMatchObject({
      purpose: "register",
      mobile_number,
    });
  });

  it.each([
    ["missing", null],
    ["wrong", { otp_code: "9999", otp_expires_at: futureExpiry() }],
    ["expired", { otp_code: "1234", otp_expires_at: new Date(Date.now() - 1000) }],
  ])("rejects a %s otp for an unknown number with 400", async (_label, record) => {
    repository.findMobileOtp.mockResolvedValue(record);

    await expect(service.verifyMobileOtp({ mobile_number, otp: "1234" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid or expired OTP",
    });
    expect(repository.deleteMobileOtp).not.toHaveBeenCalled();
  });

  it("rejects a wrong otp for a registered user with 400", async () => {
    repository.getUserRoleAndOtp.mockResolvedValue({
      id: 7,
      otp_code: "9999",
      otp_expires_at: futureExpiry(),
    });

    await expect(service.verifyMobileOtp({ mobile_number, otp: "1234" })).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(repository.clearOtp).not.toHaveBeenCalled();
  });
});

describe("registerWithOtp", () => {
  const mobile_number = "9876543210";
  const details = { name: "Asha Rao", email: "asha@example.com", agreed_to_terms: true };
  const tokenFor = (payload, options = { expiresIn: "15m" }) =>
    jwt.sign(payload, "test-secret", options);

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findUserByMobile.mockResolvedValue(null);
    repository.findUserByEmail.mockResolvedValue(null);
    repository.runInTransaction.mockImplementation((callback) => callback(TRX));
  });

  it("creates the buyer account for the verified mobile and returns a session", async () => {
    repository.createUser.mockResolvedValue({ id: 9, role: "buyer_owner_tenant", name: "Asha Rao" });

    const result = await service.registerWithOtp({
      ...details,
      registration_token: tokenFor({ purpose: "register", mobile_number }),
    });

    expect(repository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: "buyer_owner_tenant", mobile_number }),
      TRX,
    );
    expect(jwt.verify(result.token, "test-secret")).toMatchObject({ id: 9 });
  });

  it("grants the Free package inside the same transaction as the account", async () => {
    const createdUser = { id: 9, role: "buyer_owner_tenant", mobile_number };
    repository.createUser.mockResolvedValue(createdUser);

    await service.registerWithOtp({
      ...details,
      registration_token: tokenFor({ purpose: "register", mobile_number }),
    });

    expect(grantFreePackage).toHaveBeenCalledWith(TRX, createdUser);
  });

  it("fails the registration when the Free package grant fails", async () => {
    repository.createUser.mockResolvedValue({ id: 9 });
    grantFreePackage.mockRejectedValue(new Error("db down"));

    await expect(
      service.registerWithOtp({
        ...details,
        registration_token: tokenFor({ purpose: "register", mobile_number }),
      }),
    ).rejects.toThrow("db down");
  });

  it.each([
    ["an expired", () => tokenFor({ purpose: "register", mobile_number }, { expiresIn: -10 })],
    ["a wrong purpose", () => tokenFor({ id: 1, role: "agent" })],
    ["a malformed", () => "not-a-token"],
  ])("rejects %s registration token with 401", async (_label, buildToken) => {
    await expect(
      service.registerWithOtp({ ...details, registration_token: buildToken() }),
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(repository.createUser).not.toHaveBeenCalled();
  });

  it("rejects an email owned by another account with 409", async () => {
    repository.findUserByEmail.mockResolvedValue({ id: 2 });

    await expect(
      service.registerWithOtp({
        ...details,
        registration_token: tokenFor({ purpose: "register", mobile_number }),
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(repository.createUser).not.toHaveBeenCalled();
  });

  it("maps a unique violation raised by the insert to 409", async () => {
    repository.createUser.mockRejectedValue({ code: "23505" });

    await expect(
      service.registerWithOtp({
        ...details,
        registration_token: tokenFor({ purpose: "register", mobile_number }),
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
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
