const { notificationListQuerySchema } = require("./user-notifications.validation");

describe("notificationListQuerySchema", () => {
  it("lists unread notifications by default", () => {
    const { error, value } = notificationListQuerySchema.validate({});

    expect(error).toBeUndefined();
    expect(value).toEqual({ status: "unread", page: 1, limit: 20 });
  });

  it("accepts the read status", () => {
    expect(notificationListQuerySchema.validate({ status: "read" }).error).toBeUndefined();
  });

  it.each([[{ status: "all" }], [{ page: 0 }], [{ limit: 500 }]])("rejects %j", (query) => {
    expect(notificationListQuerySchema.validate(query).error).toBeDefined();
  });
});
