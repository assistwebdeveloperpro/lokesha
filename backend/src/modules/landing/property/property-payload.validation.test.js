const { validateCompletePayload } = require("./property-payload.validation");
const { RULES } = require("./property.constants");

const address = { locality: "Vesu", pinCode: "395007", state: "Gujarat" };
const files = { media: [{ path: "temp/drafts/d/media-x.jpg", category: "exterior" }] };

const validListing = (propertyType, subType, listingType, extra = {}) => {
  const rule = RULES[propertyType][subType];
  const details = {};
  if (rule.bedrooms === "required") details.bedrooms = 2;
  if (propertyType === "pg-co-living") Object.assign(details, { pgName: "Sunrise PG", pgGender: "male" });

  return {
    propertySubType: subType,
    description: "A nice property",
    details,
    plotDetails: rule.plotArea === "required" ? { plotArea: 100 } : undefined,
    pricing: listingType === "sale" ? { expectedPrice: 5000000 } : { monthlyRent: 20000 },
    files,
    ...extra,
  };
};

const payload = (propertyType, subType, listingType, extra) => ({
  listingType,
  propertyType,
  address: { ...address },
  listings: [validListing(propertyType, subType, listingType, extra)],
});

const project = { projectName: "Green Heights", highlights: [{ text: "Near metro" }] };

const COMBINATIONS = Object.entries(RULES).flatMap(([propertyType, subTypes]) =>
  Object.entries(subTypes).flatMap(([subType, rule]) =>
    rule.listingTypes.map((listingType) => [propertyType, subType, listingType])
  )
);

describe("validateCompletePayload", () => {
  it.each(COMBINATIONS)("accepts a minimal %s / %s / %s payload", (propertyType, subType, listingType) => {
    const { fields, value } = validateCompletePayload(payload(propertyType, subType, listingType), {
      isBuilderPost: false,
    });

    expect(fields).toEqual({});
    expect(value.listings).toHaveLength(1);
  });

  it("applies defaults for lists and selections", () => {
    const { value } = validateCompletePayload(payload("residential", "flat-apartment", "sale"), {
      isBuilderPost: false,
    });

    expect(value.listings[0].amenities).toEqual({ amenities: [], furnishing: [] });
    expect(value.listings[0].selections).toEqual({});
  });

  it("reports missing required fields by path", () => {
    const body = payload("residential", "flat-apartment", "sale");
    body.address = { locality: "Vesu" };
    body.listings[0].description = "";
    body.listings[0].details = {};
    body.listings[0].pricing = {};

    const { fields } = validateCompletePayload(body, { isBuilderPost: false });

    expect(Object.keys(fields).sort()).toEqual([
      "address.pinCode",
      "address.state",
      "listings.0.description",
      "listings.0.details.bedrooms",
      "listings.0.pricing.expectedPrice",
    ]);
  });

  it("requires the monthly rent for rent listings", () => {
    const body = payload("residential", "flat-apartment", "rent-lease");
    body.listings[0].pricing = {};

    expect(Object.keys(validateCompletePayload(body, { isBuilderPost: false }).fields)).toContain("listings.0.pricing.monthlyRent");
  });

  it("drops fields the sub type does not have", () => {
    const body = payload("residential", "studio-apartment", "sale");
    Object.assign(body.listings[0].details, { bedrooms: 3, terraceArea: 50, penthouseType: "duplex" });

    const { value, fields } = validateCompletePayload(body, { isBuilderPost: false });

    expect(fields).toEqual({});
    expect(value.listings[0].details).toEqual({});
  });

  it("drops sale only fields for rent listings", () => {
    const body = payload("commercial", "shop", "rent-lease");
    Object.assign(body.listings[0].details, { isLeasedOut: true, propertyTransaction: "new", washrooms: 2 });

    const { value } = validateCompletePayload(body, { isBuilderPost: false });

    expect(value.listings[0].details).toEqual({ washrooms: 2 });
  });

  it("treats empty strings and nulls as missing", () => {
    const body = payload("residential", "flat-apartment", "sale");
    Object.assign(body.listings[0].details, { balconies: "", lifts: null, furnishingStatus: "" });

    const { value, fields } = validateCompletePayload(body, { isBuilderPost: false });

    expect(fields).toEqual({});
    expect(value.listings[0].details).toEqual({ bedrooms: 2 });
  });

  it("checks ranges and enums", () => {
    const body = payload("residential", "flat-apartment", "sale");
    Object.assign(body.listings[0].details, { bedrooms: 11, furnishingStatus: "broken" });

    expect(Object.keys(validateCompletePayload(body, { isBuilderPost: false }).fields).sort()).toEqual([
      "listings.0.details.bedrooms",
      "listings.0.details.furnishingStatus",
    ]);
  });

  it("rejects a floor number above the total floors", () => {
    const body = payload("residential", "flat-apartment", "sale");
    Object.assign(body.listings[0].details, { totalFloors: 5, floorNumber: 9 });

    expect(Object.keys(validateCompletePayload(body, { isBuilderPost: false }).fields)).toContain("listings.0.details.floorNumber");
  });

  it("requires the lease end date when leased out", () => {
    const body = payload("commercial", "shop", "sale");
    body.listings[0].details.isLeasedOut = true;

    expect(Object.keys(validateCompletePayload(body, { isBuilderPost: false }).fields)).toContain("listings.0.details.leaseContractTill");
  });

  describe("possession date for ready to move", () => {
    const dayOffset = (days) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toLocaleDateString("en-CA");
    };
    const withConstruction = (construction) =>
      payload("residential", "flat-apartment", "sale", { construction });
    const fieldsOf = (body) => Object.keys(validateCompletePayload(body, { isBuilderPost: false }).fields);

    it("accepts a past possession date", () => {
      const body = withConstruction({ status: "ready-to-move", possessionDate: dayOffset(-30) });

      expect(fieldsOf(body)).not.toContain("listings.0.construction.possessionDate");
    });

    it("accepts today as the possession date", () => {
      const body = withConstruction({ status: "ready-to-move", possessionDate: dayOffset(0) });

      expect(fieldsOf(body)).not.toContain("listings.0.construction.possessionDate");
    });

    it("rejects a future possession date", () => {
      const body = withConstruction({ status: "ready-to-move", possessionDate: dayOffset(30) });

      expect(fieldsOf(body)).toContain("listings.0.construction.possessionDate");
    });

    it("allows a future possession date while under construction", () => {
      const body = withConstruction({ status: "under-construction", possessionDate: dayOffset(30) });

      expect(fieldsOf(body)).not.toContain("listings.0.construction.possessionDate");
    });
  });

  it("defaults the PG sub type and requires the PG name", () => {
    const body = payload("pg-co-living", "pg", "rent-lease");
    delete body.listings[0].propertySubType;
    delete body.listings[0].details.pgName;

    const { fields } = validateCompletePayload(body, { isBuilderPost: false });

    expect(Object.keys(fields)).toEqual(["listings.0.details.pgName"]);
  });

  it("rejects sale for PG listings", () => {
    const { fields } = validateCompletePayload(payload("pg-co-living", "pg", "sale"), { isBuilderPost: false });

    expect(Object.keys(fields)).toContain("listings.0.propertySubType");
  });

  it("rejects an unknown sub type and a bad pin code", () => {
    const body = payload("residential", "flat-apartment", "sale");
    body.listings[0].propertySubType = "castle";
    body.address.pinCode = "12";

    const { fields } = validateCompletePayload(body, { isBuilderPost: false });

    expect(Object.keys(fields)).toContain("listings.0.propertySubType");
    expect(Object.keys(fields)).toContain("address.pinCode");
  });

  it("allows only one listing and no project for normal posts", () => {
    const body = payload("residential", "flat-apartment", "sale");
    body.listings.push(validListing("residential", "duplex", "sale"));
    body.project = project;

    const { fields } = validateCompletePayload(body, { isBuilderPost: false });

    expect(Object.keys(fields)).toContain("listings");
    expect(Object.keys(fields)).toContain("project");
  });
});

describe("validateCompletePayload for builders", () => {
  const variant = { label: "2 BHK", size: 1000, sizeUnit: "sq-ft", price: 4000000, details: { bhk: 2 } };
  const builderListing = (subType) => ({
    ...validListing("residential", subType, "sale", { variants: [variant] }),
    details: {},
  });
  const builderPayload = (subTypes = ["flat-apartment"]) => ({
    listingType: "sale",
    propertyType: "residential",
    address: { ...address },
    project,
    listings: subTypes.map(builderListing),
  });

  it("accepts several sub type listings with variants", () => {
    const { fields, value } = validateCompletePayload(builderPayload(["flat-apartment", "duplex"]), {
      isBuilderPost: true,
    });

    expect(fields).toEqual({});
    expect(value.listings).toHaveLength(2);
    expect(value.listings[0].builder).toEqual({ listing: {}, specifications: [] });
  });

  it("requires the project and at least one variant", () => {
    const body = builderPayload();
    delete body.project;
    body.listings[0].variants = [];

    const { fields } = validateCompletePayload(body, { isBuilderPost: true });

    expect(Object.keys(fields)).toContain("project");
    expect(Object.keys(fields)).toContain("listings.0.variants");
  });

  it("does not need an expected price", () => {
    const body = builderPayload();
    body.listings[0].pricing = {};

    expect(validateCompletePayload(body, { isBuilderPost: true }).fields).toEqual({});
  });

  it("rejects duplicate sub types", () => {
    const { fields } = validateCompletePayload(builderPayload(["duplex", "duplex"]), { isBuilderPost: true });

    expect(Object.keys(fields)).toContain("listings.1.propertySubType");
  });

  it("rejects rent and PG builder listings", () => {
    const rent = { ...builderPayload(), listingType: "rent-lease" };
    const pg = { ...builderPayload(), propertyType: "pg-co-living" };

    expect(Object.keys(validateCompletePayload(rent, { isBuilderPost: true }).fields)).toContain("listingType");
    expect(Object.keys(validateCompletePayload(pg, { isBuilderPost: true }).fields)).toContain("listingType");
  });

  it("rejects a minimum price above the maximum", () => {
    const body = builderPayload();
    body.listings[0].builder = { listing: { priceMin: 10, priceMax: 5 } };

    expect(Object.keys(validateCompletePayload(body, { isBuilderPost: true }).fields)).toContain("listings.0.builder.listing.priceMin");
  });
});

describe("toRow", () => {
  const { toRow } = require("./property-payload.fields");

  it("maps camelCase keys to column names and skips undefined values", () => {
    expect(toRow({ addressLine2: "Near park", superBuiltUpArea: 10, landmark: undefined, isLeasedOut: false })).toEqual({
      address_line_2: "Near park",
      super_built_up_area: 10,
      is_leased_out: false,
    });
  });
});
