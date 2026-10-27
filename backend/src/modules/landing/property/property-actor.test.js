const { isAdminCaller, toOwner, toStatusActor, toOwnerColumns } = require("./property-actor");

const USER = { id: "user-1", role: "agent" };
const ADMIN = { adminId: "admin-1", role: "admin" };

describe("property actor", () => {
  it("tells admins from users", () => {
    expect(isAdminCaller(ADMIN)).toBe(true);
    expect(isAdminCaller(USER)).toBe(false);
  });

  it("scopes a user to their own rows and keeps their role", () => {
    expect(toOwner(USER)).toEqual({ userId: "user-1", listedBy: "agent" });
    expect(toOwnerColumns(USER)).toEqual({ user_id: "user-1" });
    expect(toStatusActor(USER)).toEqual({ userId: "user-1" });
  });

  it("scopes an admin to admin rows listed by admin and skipping review", () => {
    expect(toOwner(ADMIN)).toEqual({ adminId: "admin-1", listedBy: "admin" });
    expect(toOwnerColumns(ADMIN)).toEqual({ admin_id: "admin-1" });
    expect(toStatusActor(ADMIN)).toEqual({ adminId: "admin-1", bypassReview: true });
  });
});
