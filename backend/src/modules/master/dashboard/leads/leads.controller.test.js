jest.mock("./leads.service");

const service = require("./leads.service");
const { AppError } = require("../../../shared/property/utils/property.errors");
const { listLeads, sendLead } = require("./leads.controller");

function createResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe("listLeads", () => {
  it("responds 200 with the leads page for the validated query", async () => {
    service.listLeads.mockResolvedValue({ items: [], page: 1, limit: 10, total: 0 });
    const res = createResponse();

    await listLeads({ validatedQuery: { page: 1, limit: 10 } }, res);

    expect(service.listLeads).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("responds 500 when the service fails", async () => {
    service.listLeads.mockRejectedValue(new Error("db down"));
    const res = createResponse();

    await listLeads({ validatedQuery: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("sendLead", () => {
  it("responds 200 with the sent lead", async () => {
    const sent = { id: "lead-1", distributionStatus: "sent", sentAt: "2026-11-18T10:00:00.000Z" };
    service.sendLeadToLister.mockResolvedValue(sent);
    const res = createResponse();

    await sendLead({ params: { id: "lead-1" } }, res);

    expect(service.sendLeadToLister).toHaveBeenCalledWith("lead-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(sent);
  });

  it("passes the status and message of a known error through", async () => {
    service.sendLeadToLister.mockRejectedValue(new AppError("Lead already sent", 409));
    const res = createResponse();

    await sendLead({ params: { id: "lead-1" } }, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Lead already sent" });
  });

  it("responds 500 for an unexpected error", async () => {
    service.sendLeadToLister.mockRejectedValue(new Error("db down"));
    const res = createResponse();

    await sendLead({ params: { id: "lead-1" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
