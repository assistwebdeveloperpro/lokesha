jest.mock("./property-contact.service");

const service = require("./property-contact.service");
const { listContacted } = require("./property-contact.controller");

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

describe("listContacted", () => {
  it("responds 200 with the contacted property ids of the logged in user", async () => {
    service.listContactedPropertyIds.mockResolvedValue({ propertyIds: ["prop-1"] });
    const res = createResponse();

    await listContacted({ user: { id: "user-1" } }, res);

    expect(service.listContactedPropertyIds).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ propertyIds: ["prop-1"] });
  });

  it("responds 500 when the service fails", async () => {
    service.listContactedPropertyIds.mockRejectedValue(new Error("db down"));
    const res = createResponse();

    await listContacted({ user: { id: "user-1" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });
});
