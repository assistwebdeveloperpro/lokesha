jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("./user-notifications.repository");
jest.mock("../../../shared/property/repositories/property-read.repository");

const repository = require("./user-notifications.repository");
const readRepository = require("../../../shared/property/repositories/property-read.repository");
const { listNotifications, getUnreadCount, markAsRead } = require("./user-notifications.service");

const row = (overrides = {}) => ({
  id: "n1",
  type: "property_approved",
  title: "Sky Towers",
  message: "Your property has been approved and is now live.",
  property_id: "p1",
  read_at: null,
  created_at: "2026-10-27T10:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("listNotifications", () => {
  it("returns the page with the property image, read flag and unread count", async () => {
    repository.findByUser.mockResolvedValue([row(), row({ id: "n2", property_id: null, read_at: "2026-10-27T11:00:00.000Z" })]);
    repository.countByUser.mockImplementation(async (userId, status) => (status === "unread" ? 3 : 8));
    readRepository.findImagesByPropertyIds.mockResolvedValue([
      { property_id: "p1", category: "main-photo", file_path: "/uploads/properties/p1/a.jpg" },
    ]);

    const result = await listNotifications("u1", { status: "read", page: 1, limit: 20 });

    expect(repository.findByUser).toHaveBeenCalledWith("u1", { status: "read", page: 1, limit: 20 });
    expect(readRepository.findImagesByPropertyIds).toHaveBeenCalledWith(["p1"]);
    expect(result).toMatchObject({ page: 1, limit: 20, total: 8, unreadCount: 3 });
    expect(result.items[0]).toMatchObject({ id: "n1", image: "/uploads/properties/p1/a.jpg", isRead: false, propertyId: "p1" });
    expect(result.items[1]).toMatchObject({ id: "n2", image: null, isRead: true });
  });
});

describe("getUnreadCount", () => {
  it("counts the unread notifications of the user", async () => {
    repository.countByUser.mockResolvedValue(4);

    await expect(getUnreadCount("u1")).resolves.toEqual({ unreadCount: 4 });
    expect(repository.countByUser).toHaveBeenCalledWith("u1", "unread");
  });
});

describe("markAsRead", () => {
  it("marks the notification and returns the new unread count", async () => {
    repository.markRead.mockResolvedValue({ id: "n1", read_at: "now" });
    repository.countByUser.mockResolvedValue(2);

    await expect(markAsRead("u1", "n1")).resolves.toEqual({ id: "n1", unreadCount: 2 });
    expect(repository.markRead).toHaveBeenCalledWith("n1", "u1");
  });

  it("answers 404 for a notification that is not the user's", async () => {
    repository.markRead.mockResolvedValue(undefined);

    await expect(markAsRead("u1", "other")).rejects.toMatchObject({ statusCode: 404 });
  });
});
