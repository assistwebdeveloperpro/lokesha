jest.mock("./user-leads.service");

const service = require("./user-leads.service");
const { listLeads } = require("./user-leads.controller");

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
  it("responds 200 using the id of the logged in user", async () => {
    service.listLeads.mockResolvedValue({ items: [], page: 1, limit: 10, total: 0 });
    const res = createResponse();

    await listLeads({ user: { id: "user-1" }, validatedQuery: { page: 1, limit: 10 } }, res);

    expect(service.listLeads).toHaveBeenCalledWith("user-1", { page: 1, limit: 10 });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("responds 500 when the service fails", async () => {
    service.listLeads.mockRejectedValue(new Error("db down"));
    const res = createResponse();

    await listLeads({ user: { id: "user-1" }, validatedQuery: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });
});
