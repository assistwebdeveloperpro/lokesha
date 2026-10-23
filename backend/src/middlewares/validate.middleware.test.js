const Joi = require("joi");
const validate = require("./validate.middleware");

const schema = Joi.object({
  name: Joi.string().min(3).required(),
  age: Joi.number().integer().min(18).required(),
});

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("validate middleware", () => {
  it("passes valid bodies on with the converted value", () => {
    const req = { body: { name: "Asha", age: "30" } };
    const res = createResponse();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({ name: "Asha", age: 30 });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("strips unknown keys", () => {
    const req = { body: { name: "Asha", age: 30, role: "admin" } };

    validate(schema)(req, createResponse(), jest.fn());

    expect(req.body).toEqual({ name: "Asha", age: 30 });
  });

  it("responds 400 with every message and the first message per field", () => {
    const req = { body: { name: "A", age: 5 } };
    const res = createResponse();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);

    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe("Validation failed");
    expect(payload.errors).toHaveLength(2);
    expect(Object.keys(payload.fields).sort()).toEqual(["age", "name"]);
  });
});
