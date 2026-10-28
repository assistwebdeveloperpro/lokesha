const {
  PROPERTY_TYPE_TO_DB,
  OPTION_GROUPS,
  LISTING_TYPES,
  RULES,
  getRule,
  isBuilderAllowed,
  LIMITS,
} = require("../constants/property.constants");
const {
  uuidParamSchema,
  draftFileParamsSchema,
  draftCreateSchema,
  draftSaveSchema,
  amenityQuerySchema,
  fileKindQuerySchema,
  fileMetaSchema,
} = require("./property.validation");

const DRAFT_ID = "3f2b8a52-6c5e-4d0e-9f53-0a1c2d3e4f50";

const EXPECTED_SUB_TYPES = {
  residential: [
    "flat-apartment",
    "bungalow-villa",
    "studio-apartment",
    "weekend-homes",
    "farm-house",
    "residential-land",
    "penthouse",
    "duplex",
  ],
  commercial: [
    "shop",
    "office",
    "showroom",
    "cold-storage",
    "industrial-shed",
    "guest-house",
    "hotel-resort",
    "warehouse-godown",
    "co-working-space",
  ],
  "pg-co-living": ["pg", "hostel"],
  plot: ["residential-plot", "industrial-plot", "commercial-plot"],
  land: [
    "agriculture-land",
    "non-agriculture-land",
    "commercial-land",
    "residential-land",
    "industrial-land",
  ],
};

const TYPE_TABLE_BY_DB_TYPE = {
  residential: "residential",
  commercial: "commercial",
  pg: "pg",
  plot: "plot",
  land: "land",
};

describe("post property rules matrix", () => {
  it("covers every property type of the form", () => {
    expect(Object.keys(RULES).sort()).toEqual(Object.keys(PROPERTY_TYPE_TO_DB).sort());
  });

  it.each(Object.entries(EXPECTED_SUB_TYPES))("covers every %s sub type", (propertyType, subTypes) => {
    expect(Object.keys(RULES[propertyType]).sort()).toEqual([...subTypes].sort());
  });

  it("maps every combination to exactly one type table", () => {
    Object.entries(RULES).forEach(([propertyType, subTypes]) => {
      Object.entries(subTypes).forEach(([subType, rule]) => {
        const expectedTable =
          propertyType === "residential" || propertyType === "commercial"
            ? TYPE_TABLE_BY_DB_TYPE[PROPERTY_TYPE_TO_DB[propertyType]]
            : PROPERTY_TYPE_TO_DB[propertyType];

        expect(rule.typeTable).toBe(expectedTable);
        expect(rule.listingTypes.every((type) => LISTING_TYPES.includes(type))).toBe(true);
        expect(getRule(propertyType, subType)).toBe(rule);
      });
    });
  });

  it("only allows known option groups", () => {
    const groups = Object.values(OPTION_GROUPS);

    Object.values(RULES).forEach((subTypes) =>
      Object.values(subTypes).forEach((rule) =>
        rule.selections.forEach((group) => expect(groups).toContain(group))
      )
    );
  });

  it("keeps PG listings rent only", () => {
    expect(RULES["pg-co-living"].pg.listingTypes).toEqual(["rent-lease"]);
  });

  it("returns null for an unknown combination", () => {
    expect(getRule("residential", "castle")).toBeNull();
    expect(getRule("space", "shop")).toBeNull();
  });

  it("allows builder listings for sale only and never for PG", () => {
    expect(isBuilderAllowed("residential", "sale")).toBe(true);
    expect(isBuilderAllowed("residential", "rent-lease")).toBe(false);
    expect(isBuilderAllowed("pg-co-living", "sale")).toBe(false);
  });
});

describe("draft schemas", () => {
  it("applies defaults when creating a draft", () => {
    const { error, value } = draftCreateSchema.validate({});

    expect(error).toBeUndefined();
    expect(value).toEqual({ currentStep: 1, formData: {} });
  });

  it("requires step and form data when saving", () => {
    const { error } = draftSaveSchema.validate({}, { abortEarly: false });

    expect(error.details.map((detail) => detail.path[0]).sort()).toEqual(["currentStep", "formData"]);
  });

  it.each([0, 6, 2.5])("rejects step %s", (currentStep) => {
    expect(draftSaveSchema.validate({ currentStep, formData: {} }).error).toBeDefined();
  });

  it("keeps unknown keys inside form data", () => {
    const { value } = draftSaveSchema.validate({ currentStep: 2, formData: { version: 1, any: { a: 1 } } });

    expect(value.formData).toEqual({ version: 1, any: { a: 1 } });
  });

  it("rejects form data over the size limit", () => {
    const formData = { blob: "x".repeat(LIMITS.maxFormDataBytes) };

    expect(draftSaveSchema.validate({ currentStep: 1, formData }).error.message).toBe("Form data is too large");
  });
});

describe("amenityQuerySchema", () => {
  it("accepts a listing type, property type and sub type", () => {
    const { error, value } = amenityQuerySchema.validate({
      listingType: "rent-lease",
      propertyType: "pg-co-living",
      subType: "",
    });

    expect(error).toBeUndefined();
    expect(value.subType).toBeUndefined();
  });

  it.each([
    [{ propertyType: "residential" }],
    [{ listingType: "sale" }],
    [{ listingType: "swap", propertyType: "residential" }],
    [{ listingType: "sale", propertyType: "castle" }],
    [{ listingType: "sale", propertyType: "residential", subType: "Flat; DROP" }],
  ])("rejects %j", (query) => {
    expect(amenityQuerySchema.validate(query).error).toBeDefined();
  });
});

describe("file schemas", () => {
  it("accepts a uuid id and rejects anything else", () => {
    expect(uuidParamSchema.validate({ id: DRAFT_ID }).error).toBeUndefined();
    expect(uuidParamSchema.validate({ id: "me" }).error).toBeDefined();
  });

  it("accepts only server generated file names", () => {
    const fileName = `media-${DRAFT_ID}.jpg`;

    expect(draftFileParamsSchema.validate({ id: DRAFT_ID, fileName }).error).toBeUndefined();
    expect(draftFileParamsSchema.validate({ id: DRAFT_ID, fileName: "../../etc/passwd" }).error).toBeDefined();
  });

  it("accepts only known file kinds", () => {
    expect(fileKindQuerySchema.validate({ kind: "brochure" }).error).toBeUndefined();
    expect(fileKindQuerySchema.validate({ kind: "script" }).error).toBeDefined();
    expect(fileKindQuerySchema.validate({}).error).toBeDefined();
  });

  it("validates upload metadata", () => {
    expect(fileMetaSchema.validate({ category: "exterior", label: "Hall" }).error).toBeUndefined();
    expect(fileMetaSchema.validate({ category: "garage" }).error).toBeDefined();
    expect(fileMetaSchema.validate({ planType: "4d" }).error).toBeDefined();
  });
});
