import { describe, expect, it } from "vitest";
import {
  createAvailableSizeRow,
  createInitialProjectDetails,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import {
  createEmptyPhotosVideosValues,
  type PropertyMediaFile,
} from "../config/postPropertyForm.shared";
import {
  INITIAL_ADDRESS_LOCATION,
  INITIAL_AMENITIES,
  INITIAL_PRICING_OTHERS,
  INITIAL_PROPERTY_DETAILS,
} from "../state/postPropertyInitialValues";
import {
  buildPropertyPayload,
  type ListingFormInput,
  type PropertyPayloadInput,
} from "./postPropertyPayload";

const address = {
  ...INITIAL_ADDRESS_LOCATION,
  projectName: "Sky Towers",
  locality: " Vesu ",
  pinCode: "395007",
  city: "Surat",
  state: "Gujarat" as const,
  propertyDescription: "  A bright flat  ",
};

const uploaded = (id: string, category = "exterior"): PropertyMediaFile => ({
  id,
  name: `${id}.jpg`,
  type: "image",
  status: "uploaded",
  remote: { id: `${id}-file.jpg`, path: `temp/drafts/d/${id}-file.jpg` },
  previewUrl: `blob:${category}`,
});

function listing(overrides: Partial<ListingFormInput> = {}): ListingFormInput {
  return {
    subType: "flat-apartment",
    details: { ...INITIAL_PROPERTY_DETAILS },
    amenities: { ...INITIAL_AMENITIES },
    pricing: { ...INITIAL_PRICING_OTHERS },
    photos: createEmptyPhotosVideosValues(),
    ...overrides,
  };
}

function build(overrides: Partial<PropertyPayloadInput> = {}) {
  return buildPropertyPayload({
    listingType: "sale",
    propertyType: "residential",
    address,
    listings: [listing()],
    ...overrides,
  });
}

describe("buildPropertyPayload address and header", () => {
  it("trims the address, leaves empty fields out and moves the description to the listing", () => {
    const payload = build();

    expect(payload.address).toEqual({
      projectName: "Sky Towers",
      locality: "Vesu",
      pinCode: "395007",
      city: "Surat",
      state: "Gujarat",
    });
    expect(payload.listings[0].description).toBe("A bright flat");
    expect(payload).not.toHaveProperty("project");
    expect(payload).not.toHaveProperty("postingAs");
  });

  it("marks builder posts made by staff", () => {
    expect(build({ postingAsBuilder: true }).postingAs).toBe("builder");
  });
});

describe("buildPropertyPayload sale listings", () => {
  it("maps numbers, units, slugs and booleans", () => {
    const payload = build({
      listings: [
        listing({
          details: {
            ...INITIAL_PROPERTY_DETAILS,
            carpetAreaNumber: "1,200",
            carpetAreaType: "sq-ft",
            superBuildUpNumber: "1500",
            superBuildUpType: "sq-ft",
            bedrooms: "3",
            balcony: "2",
            bathrooms: "2",
            totalFloors: "12",
            floorNumber: "Ground Floor",
            propertyTransaction: "resale",
            constructionStatus: "ready-to-move",
            possessionDate: "2027-03-01",
            ageOfConstruction: "1-to-2",
            availableFrom: "2027-04-01",
          },
          amenities: {
            ...INITIAL_AMENITIES,
            status: "furnished",
            furnishing: ["tv"],
            amenities: ["lift", "gym"],
            facing: "North - East",
            carParkingAvailable: true,
            carParking: "2",
            clubMembership: true,
            reraNumber: " RERA-1 ",
            openSides: "2",
          },
          pricing: {
            ...INITIAL_PRICING_OTHERS,
            expectedPrice: "5000000",
            priceNegotiable: true,
            priceInclusion: ["car-parking", "plc"],
            bookingAmount: "100000",
          },
        }),
      ],
    });
    const [item] = payload.listings;

    expect(item.facing).toBe("north-east");
    expect(item.availableFrom).toBe("2027-04-01");
    expect(item.construction).toEqual({ status: "ready-to-move", possessionDate: "2027-03-01" });
    expect(item.details).toMatchObject({
      carpetArea: 1200,
      carpetAreaUnit: "sq-ft",
      superBuiltUpArea: 1500,
      bedrooms: 3,
      balconies: 2,
      totalFloors: 12,
      floorNumber: 0,
      propertyTransaction: "resale",
      ageOfConstruction: "1-to-2",
      furnishingStatus: "furnished",
      carParkingCount: 2,
      clubMembership: true,
      openSides: 2,
    });
    expect(item.pricing).toEqual({
      expectedPrice: 5000000,
      priceNegotiable: true,
      bookingAmount: 100000,
      includesCarParking: true,
      includesClubMembership: false,
      includesPlc: true,
      reraNumber: "RERA-1",
    });
    expect(item.amenities).toEqual({ amenities: ["lift", "gym"], furnishing: ["tv"] });
  });

  it("drops furnishing items unless the property is furnished", () => {
    const payload = build({
      listings: [listing({ amenities: { ...INITIAL_AMENITIES, status: "unfurnished", furnishing: ["tv"] } })],
    });

    expect(payload.listings[0].amenities?.furnishing).toEqual([]);
  });

  it("sets no parking to zero cars", () => {
    expect(build().listings[0].details?.carParkingCount).toBe(0);
  });

  it("sends the lease details of a commercial sale", () => {
    const payload = build({
      propertyType: "commercial",
      listings: [
        listing({
          subType: "shop",
          details: { ...INITIAL_PROPERTY_DETAILS, currentlyLeasedOut: true, leaseContractTill: "2028-01-01" },
          pricing: { ...INITIAL_PRICING_OTHERS, leaseAmount: "25000", yearlyIncrement: "5" },
        }),
      ],
    });

    expect(payload.listings[0].details).toMatchObject({
      isLeasedOut: true,
      leaseContractTill: "2028-01-01",
      leaseAmount: 25000,
      leaseYearlyIncrementPercent: 5,
    });
  });
});

describe("buildPropertyPayload rent listings", () => {
  const rent = (overrides: Partial<ListingFormInput> = {}) =>
    build({
      listingType: "rent-lease",
      listings: [
        listing({
          details: {
            ...INITIAL_PROPERTY_DETAILS,
            propertyTransaction: "new",
            constructionStatus: "ready-to-move",
            fullHouse: true,
            interiorModificationAllowed: true,
            tenantPreferences: ["family", "bachelor"],
          },
          amenities: { ...INITIAL_AMENITIES, clubMembership: true, reraNumber: "R-1" },
          pricing: {
            ...INITIAL_PRICING_OTHERS,
            monthlyRent: "20000",
            depositAmount: "40000",
            noticePeriod: "2",
            expectedPrice: "999",
          },
          ...overrides,
        }),
      ],
    });

  it("uses the rent fields and ignores sale only values", () => {
    const [item] = rent().listings;

    expect(item.pricing).toEqual({
      monthlyRent: 20000,
      depositAmount: 40000,
      noticePeriodMonths: 2,
      priceNegotiable: false,
      interiorModificationAllowed: true,
    });
    expect(item.construction).toEqual({});
    expect(item.details).toMatchObject({ isFullHouse: true });
    expect(item.details).not.toHaveProperty("propertyTransaction");
    expect(item.details).not.toHaveProperty("clubMembership");
    expect(item.selections?.tenantPreference).toEqual(["family", "bachelor"]);
  });

  it("sends no tenant preference for a sale", () => {
    const payload = build({
      listings: [listing({ details: { ...INITIAL_PROPERTY_DETAILS, tenantPreferences: ["family"] } })],
    });

    expect(payload.listings[0].selections?.tenantPreference).toEqual([]);
  });
});

describe("buildPropertyPayload PG listings", () => {
  it("maps the PG fields and defaults the sub type", () => {
    const payload = build({
      listingType: "rent-lease",
      propertyType: "pg-co-living",
      listings: [
        listing({
          subType: "",
          details: {
            ...INITIAL_PROPERTY_DETAILS,
            pgName: " Sunrise PG ",
            pgGender: "Male",
            pgPresentIn: "Independent Building",
            pgOperationSince: "2019",
            entryTill: "10:30 PM",
            occupancies: ["Single", "Triple+"],
            foods: ["breakfast", "non-veg"],
            pgRules: ["no-smoking"],
          },
          pricing: { ...INITIAL_PRICING_OTHERS, monthlyRent: "9000" },
        }),
      ],
    });
    const [item] = payload.listings;

    expect(item.propertySubType).toBe("pg");
    expect(item.details).toMatchObject({
      pgName: "Sunrise PG",
      pgGender: "male",
      pgPresentIn: "independent-building",
      operatingSinceYear: 2019,
      entryTill: "22:30",
    });
    expect(item.selections).toMatchObject({
      occupancy: ["single", "triple-plus"],
      food: ["breakfast", "non-veg"],
      pgRule: ["no-smoking"],
    });
  });

  it("converts the entry time at midnight and noon", () => {
    const entry = (entryTill: string) =>
      build({
        propertyType: "pg-co-living",
        listings: [listing({ subType: "pg", details: { ...INITIAL_PROPERTY_DETAILS, entryTill } })],
      }).listings[0].details?.entryTill;

    expect(entry("12:00 AM")).toBe("00:00");
    expect(entry("12:30 PM")).toBe("12:30");
    expect(entry("")).toBeUndefined();
  });
});

describe("buildPropertyPayload plots and land", () => {
  it("builds the plot area block", () => {
    const payload = build({
      propertyType: "land",
      listings: [
        listing({
          subType: "agriculture-land",
          details: {
            ...INITIAL_PROPERTY_DETAILS,
            plotAreaNumber: "2",
            plotAreaType: "acres",
            plotLengthNumber: "100",
            plotLengthType: "sq-m",
            roadWidth: "12",
            floorsAllowed: "3",
            managedBy: "Care Taker",
            anyConstruction: true,
          },
          amenities: { ...INITIAL_AMENITIES, roadFacing: "Main Road" },
        }),
      ],
      builderProject: undefined,
    });
    const [item] = payload.listings;

    expect(item.plotDetails).toEqual({
      plotArea: 2,
      plotAreaUnit: "acres",
      plotLength: 100,
      plotLengthUnit: "sq-m",
      roadWidthM: 12,
      floorsAllowed: 3,
    });
    expect(item.details).toMatchObject({ managedBy: "care-taker", roadFacing: "main-road", anyConstruction: true });
  });
});

describe("buildPropertyPayload files", () => {
  it("sends the stored paths by category and the brochure", () => {
    const photos = createEmptyPhotosVideosValues();
    photos.mediaByCategory.exterior = [uploaded("a")];
    photos.mediaByCategory.kitchen = [uploaded("b")];
    photos.brochure = { ...uploaded("c"), name: "brochure.pdf" };
    const local: PropertyMediaFile = { ...uploaded("d"), status: "uploading", remote: undefined };
    photos.mediaByCategory.balcony = [local];

    const { files } = build({ listings: [listing({ photos })] }).listings[0];

    // Files still uploading are not sent; the rest follow the category order of the form
    expect(files?.media).toEqual([
      { path: "temp/drafts/d/b-file.jpg", category: "kitchen", originalName: "b.jpg" },
      { path: "temp/drafts/d/a-file.jpg", category: "exterior", originalName: "a.jpg" },
    ]);
    expect(files?.brochure).toEqual({ path: "temp/drafts/d/c-file.jpg", originalName: "brochure.pdf" });
  });
});

describe("buildPropertyPayload builder posts", () => {
  const remote = { id: "x-file.jpg", path: "temp/drafts/d/x-file.jpg" };

  function builderProject(): ProjectDetailsValues {
    const project = createInitialProjectDetails();
    return {
      ...project,
      projectType: "Ready to Move",
      developerName: "Acme",
      totalUnits: "120",
      projectArea: "5",
      areaUnit: "sq yd",
      paymentPlan: "Flexi Payment",
      priceMin: "3000000",
      priceMax: "6000000",
      carpetAreaMax: "900",
      infrastructure: ["Park / Green Space", "Internal Roads"],
      irrigationSources: ["Borewell"],
      conversionStatus: "In Process",
      starCategory: "3 Star",
      projectHighlights: [
        { id: "1", text: "Near metro" },
        { id: "2", text: " " },
      ],
      primeLocationHighlights: [
        { id: "1", place: "Airport", distance: "5 km" },
        { id: "2", place: "", distance: "" },
      ],
      faqs: [
        { id: "1", question: "Q?", answer: "A." },
        { id: "2", question: "Only question", answer: "" },
      ],
      specifications: [
        {
          id: "g",
          title: "",
          items: [
            { id: "i1", label: "Flooring", value: "Vitrified", custom: false },
            { id: "i2", label: "Colour", value: "", custom: false },
            { id: "i3", label: "Extra", value: "Yes", custom: true },
          ],
        },
      ],
      availableSizes: [
        { ...createAvailableSizeRow("Flat/Apartment"), bhk: "2 BHK", size: "1000", price: "4000000", unitsAvailable: "10" },
        { ...createAvailableSizeRow("Duplex"), bhk: "6+ BHK", size: "3000", price: "9000000" },
        { ...createAvailableSizeRow("Flat/Apartment"), bhk: "3 BHK", size: "1400", price: "6000000", sizeUnit: "sq m" },
      ],
      bhkCarParking: { "2 BHK": { available: true, count: "1", clubMembership: true } },
      bhkCharges: {
        "2 BHK": { transferFee: "5000", bookingAmount: "", maintenanceCharges: "", benefitsRemarks: "Free parking" },
      },
      brochureImages: [{ id: "b1", name: "p.jpg", previewUrl: "", status: "uploaded", remote }],
      floorPlans: [
        { id: "f1", label: "2 BHK Flat/Apartment", planType: "3d", file: null, previewUrl: "", status: "uploaded", remote },
        { id: "f2", label: "Empty", planType: "2d", file: null, previewUrl: "" },
      ],
    };
  }

  function buildBuilder() {
    const project = builderProject();
    return buildPropertyPayload({
      listingType: "sale",
      propertyType: "residential",
      address,
      builderProject: project,
      listings: [
        listing({ subType: "flat-apartment", project: { ...project, carpetAreaMax: "900" } }),
        listing({ subType: "duplex", project: { ...project, carpetAreaMax: "2500" } }),
      ],
    });
  }

  it("builds the project block from the form", () => {
    const { project } = buildBuilder();

    expect(project).toEqual({
      projectName: "Sky Towers",
      projectType: "ready",
      developerName: "Acme",
      totalUnits: 120,
      projectAreaAcres: 5,
      paymentPlan: "flexi-payment",
      highlights: [{ text: "Near metro" }],
      primeLocations: [{ text: "Airport", distance: "5 km" }],
      faqs: [{ question: "Q?", answer: "A." }],
    });
  });

  it("falls back to the locality when the project has no name", () => {
    const payload = buildPropertyPayload({
      listingType: "sale",
      propertyType: "residential",
      address: { ...address, projectName: "" },
      builderProject: builderProject(),
      listings: [listing()],
    });

    expect(payload.project?.projectName).toBe("Vesu");
  });

  it("gives each sub type its own variants and maximum areas", () => {
    const [flat, duplex] = buildBuilder().listings;

    expect(flat.variants).toEqual([
      {
        label: "2 BHK Flat/Apartment",
        size: 1000,
        sizeUnit: "sq-ft",
        price: 4000000,
        unitsAvailable: 10,
        details: { bhk: 2 },
        charges: { carParkingAvailable: true, carParkingCount: 1, clubMembership: true, transferFee: 5000, benefitsRemarks: "Free parking" },
      },
      { label: "3 BHK Flat/Apartment", size: 1400, sizeUnit: "sq-m", price: 6000000, details: { bhk: 3 } },
    ]);
    expect(duplex.variants).toEqual([
      { label: "6+ BHK Duplex", size: 3000, sizeUnit: "sq-ft", price: 9000000, details: { bhk: 6 } },
    ]);
    expect(flat.builder?.listing).toMatchObject({ carpetAreaMax: 900, areaUnit: "sq-yd", priceMin: 3000000, conversionStatus: "in-process" });
    expect(duplex.builder?.listing).toMatchObject({ carpetAreaMax: 2500 });
  });

  it("maps specifications and project selections", () => {
    const [flat] = buildBuilder().listings;

    expect(flat.builder?.specifications).toEqual([
      { groupTitle: "General", label: "Flooring", value: "Vitrified", isCustom: false },
      { groupTitle: "General", label: "Extra", value: "Yes", isCustom: true },
    ]);
    expect(flat.selections).toMatchObject({
      infrastructure: ["park-green-space", "internal-roads"],
      irrigationSource: ["borewell"],
    });
    expect(flat.details).toMatchObject({ starCategory: 3 });
  });

  it("attaches the project wide files to the first listing only", () => {
    const [flat, duplex] = buildBuilder().listings;

    expect(flat.files?.media).toEqual([
      { path: remote.path, category: "brochure-images", originalName: "p.jpg" },
    ]);
    expect(flat.files?.floorPlans).toEqual([{ path: remote.path, label: "2 BHK Flat/Apartment", planType: "3d" }]);
    expect(duplex.files).toEqual({ media: [], floorPlans: [] });
  });

  it("does not send variants for normal posts", () => {
    expect(build().listings[0]).not.toHaveProperty("variants");
    expect(build().listings[0]).not.toHaveProperty("builder");
  });
});
