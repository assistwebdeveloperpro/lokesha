jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("./admin-notifications.repository");
jest.mock("../../../shared/property/repositories/property-read.repository");

const repository = require("./admin-notifications.repository");
const readRepository = require("../../../shared/property/repositories/property-read.repository");
const { listNotifications, getUnreadCount, markAsRead, markAllAsRead } = require("./admin-notifications.service");

const row = (overrides = {}) => ({
  id: "n1",
  type: "lead_received",
  title: "Sky Towers",
  message: "Asha contacted this property.",
  property_id: "p1",
  lead_id: "l1",
  read_at: null,
  created_at: "2026-11-23T10:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("listNotifications", () => {
  it("returns the page with the group image, read flag and unread count", async () => {
    repository.findAll.mockResolvedValue([
      row(),
      row({ id: "n2", type: "subscription_purchased", property_id: null, lead_id: null, read_at: "2026-11-23T11:00:00.000Z" }),
    ]);
    repository.countAll.mockImplementation(async (status) => (status === "unread" ? 3 : 8));
    readRepository.findGroupImagesByPropertyIds.mockResolvedValue([
      { source_id: "p1", category: "main-photo", file_path: "/uploads/properties/p2/a.jpg" },
    ]);

    const result = await listNotifications({ status: "read", page: 1, limit: 20 });

    expect(repository.findAll).toHaveBeenCalledWith({ status: "read", page: 1, limit: 20 });
    expect(readRepository.findGroupImagesByPropertyIds).toHaveBeenCalledWith(["p1"]);
    expect(result).toMatchObject({ page: 1, limit: 20, total: 8, unreadCount: 3 });
    expect(result.items[0]).toMatchObject({ id: "n1", image: "/uploads/properties/p2/a.jpg", leadId: "l1", isRead: false });
    expect(result.items[1]).toMatchObject({ id: "n2", image: null, isRead: true });
  });
});

describe("getUnreadCount", () => {
  it("counts the unread notifications", async () => {
    repository.countAll.mockResolvedValue(4);

    await expect(getUnreadCount()).resolves.toEqual({ unreadCount: 4 });
    expect(repository.countAll).toHaveBeenCalledWith("unread");
  });
});

describe("markAsRead", () => {
  it("returns the id with the remaining unread count", async () => {
    repository.markRead.mockResolvedValue({ id: "n1", read_at: "2026-11-23T12:00:00.000Z" });
    repository.countAll.mockResolvedValue(2);

    await expect(markAsRead("n1")).resolves.toEqual({ id: "n1", unreadCount: 2 });
  });

  it("throws 404 when the notification does not exist", async () => {
    repository.markRead.mockResolvedValue(undefined);

    await expect(markAsRead("missing")).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("markAllAsRead", () => {
  it("marks everything read and reports zero unread", async () => {
    repository.markAllRead.mockResolvedValue(5);

    await expect(markAllAsRead()).resolves.toEqual({ unreadCount: 0 });
    expect(repository.markAllRead).toHaveBeenCalled();
  });
});
