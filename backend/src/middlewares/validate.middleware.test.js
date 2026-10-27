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

describe("validateParams middleware", () => {
  const paramsSchema = Joi.object({ id: Joi.string().guid().required() });

  it("passes valid params on", () => {
    const req = { params: { id: "3f2b8a52-6c5e-4d0e-9f53-0a1c2d3e4f50" } };
    const next = jest.fn();

    validate.validateParams(paramsSchema)(req, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("responds 400 for an invalid id", () => {
    const req = { params: { id: "abc" } };
    const res = createResponse();
    const next = jest.fn();

    validate.validateParams(paramsSchema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(Object.keys(res.json.mock.calls[0][0].fields)).toEqual(["id"]);
  });
});

describe("validateQuery middleware", () => {
  const querySchema = Joi.object({ page: Joi.number().integer().min(1).default(1) });

  it("stores converted values on validatedQuery and applies defaults", () => {
    const req = { query: { page: "3", extra: "x" } };
    const next = jest.fn();

    validate.validateQuery(querySchema)(req, createResponse(), next);

    expect(req.validatedQuery).toEqual({ page: 3 });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("responds 400 for an invalid query", () => {
    const req = { query: { page: "0" } };
    const res = createResponse();

    validate.validateQuery(querySchema)(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
