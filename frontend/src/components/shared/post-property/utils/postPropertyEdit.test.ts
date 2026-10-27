import { describe, expect, it } from "vitest";
import {
  createAvailableSizeRow,
  createInitialProjectDetails,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import type {
  PropertyDetailResponse,
  PropertyFloorPlanDto,
  PropertyMediaFileDto,
} from "@/services/property.service";
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
import { mapDetailToForm } from "./postPropertyEdit";
import {
  buildPropertyPayload,
  type ListingFormInput,
  type PropertyPayloadInput,
} from "./postPropertyPayload";

const address = {
  ...INITIAL_ADDRESS_LOCATION,
  projectName: "Sky Towers",
  blockNo: "B",
  flatNumber: "402",
  locality: "Vesu",
  addressLine2: "Near park",
  landmark: "Mall",
  pinCode: "395007",
  city: "Surat",
  state: "Gujarat" as const,
  propertyDescription: "A bright place",
};

const sale = { ...INITIAL_PRICING_OTHERS, expectedPrice: "5000000", bookingAmount: "100000" };
const rent = { ...INITIAL_PRICING_OTHERS, monthlyRent: "20000", depositAmount: "40000", noticePeriod: "2" };

const flatDetails = {
  ...INITIAL_PROPERTY_DETAILS,
  carpetAreaNumber: "1000.5",
  carpetAreaType: "sq-ft" as const,
  superBuildUpNumber: "1300",
  superBuildUpType: "sq-ft" as const,
  bedrooms: "3",
  balcony: "2",
  bathrooms: "2",
  lift: "2",
  basementFloors: "2B",
  totalFloors: "12",
  floorNumber: "Ground Floor",
  propertyTransaction: "resale" as const,
  constructionStatus: "ready-to-move" as const,
  possessionDate: "2027-03-01",
  ageOfConstruction: "1-to-2" as const,
  availableFrom: "2027-05-01",
};

const listing = (subType: string, overrides: Partial<ListingFormInput> = {}): ListingFormInput => ({
  subType,
  details: { ...INITIAL_PROPERTY_DETAILS },
  amenities: { ...INITIAL_AMENITIES },
  pricing: { ...INITIAL_PRICING_OTHERS },
  photos: createEmptyPhotosVideosValues(),
  ...overrides,
});

const uploaded = (id: string, name = `${id}.jpg`): PropertyMediaFile => ({
  id,
  name,
  type: "image",
  status: "uploaded",
  remote: { id, path: `/uploads/properties/p1/${id}.jpg` },
  previewUrl: "",
});

const toMediaDto = (media: PropertyMediaFile, category: string): PropertyMediaFileDto => ({
  id: media.id,
  path: media.remote!.path,
  category,
  mediaType: category === "brochure" ? "document" : "image",
  originalName: media.name,
  mimeType: "image/jpeg",
  size: 1,
});

// What the server sends back: the saved payload as JSON, plus its stored files
function toDetail(
  input: PropertyPayloadInput,
  media: PropertyMediaFileDto[] = [],
  floorPlans: PropertyFloorPlanDto[] = [],
): PropertyDetailResponse {
  const payload = JSON.parse(JSON.stringify(buildPropertyPayload(input)));

  return {
    property: {
      id: "p1",
      listingNumber: 100001,
      status: "draft",
      title: "t",
      price: null,
      rejectionReason: null,
      createdAt: "",
      updatedAt: "",
      publishedAt: null,
    },
    payload,
    media,
    floorPlans,
    listingFiles: [{ propertyId: "p1", media, floorPlans }],
  };
}

// The same input the form hook builds from the loaded values
function toInput(detail: PropertyDetailResponse): PropertyPayloadInput {
  const { form, postingAs } = mapDetailToForm(detail);

  return {
    listingType: form.listingType,
    propertyType: form.propertyType,
    address: form.addressLocation,
    postingAsBuilder: postingAs === "builder",
    builderProject: detail.payload.project ? form.projectDetails : undefined,
    listings: [
      {
        subType: form.propertySubTypes[0],
        details: form.propertyDetails,
        amenities: form.amenities,
        pricing: form.pricingOthers,
        photos: form.photosVideos,
        project: detail.payload.project ? form.projectDetails : undefined,
      },
    ],
  };
}

function expectRoundTrip(input: PropertyPayloadInput, media: PropertyMediaFileDto[] = [], floorPlans: PropertyFloorPlanDto[] = []) {
  const detail = toDetail(input, media, floorPlans);

  expect(JSON.parse(JSON.stringify(buildPropertyPayload(toInput(detail))))).toEqual(detail.payload);
}

describe("mapDetailToForm round trip", () => {
  it("residential sale with every common field", () => {
    expectRoundTrip({
      listingType: "sale",
      propertyType: "residential",
      address,
      listings: [
        listing("flat-apartment", {
          details: flatDetails,
          amenities: {
            ...INITIAL_AMENITIES,
            status: "furnished",
            furnishing: ["tv", "sofa"],
            amenities: ["lift", "gym"],
            facing: "North - East",
            carParkingAvailable: true,
            carParking: "2",
            clubMembership: true,
            reraNumber: "RERA-1",
            openSides: "2",
          },
          pricing: { ...sale, priceInclusion: ["car-parking", "plc"], priceNegotiable: true, benefitsRemarks: "Free" },
        }),
      ],
    });
  });

  it("residential rent", () => {
    expectRoundTrip({
      listingType: "rent-lease",
      propertyType: "residential",
      address,
      listings: [
        listing("flat-apartment", {
          details: {
            ...INITIAL_PROPERTY_DETAILS,
            bedrooms: "2",
            balcony: "1",
            bathrooms: "2",
            totalFloors: "5",
            floorNumber: "3",
            ageOfConstruction: "lt-1",
            availableFrom: "2027-05-01",
            fullHouse: true,
            interiorModificationAllowed: true,
            tenantPreferences: ["family", "bachelor"],
          },
          pricing: rent,
        }),
      ],
    });
  });

  it("penthouse and villa extras", () => {
    expectRoundTrip({
      listingType: "sale",
      propertyType: "residential",
      address,
      listings: [
        listing("penthouse", {
          details: {
            ...flatDetails,
            terraceAreaNumber: "400",
            terraceAreaType: "sq-ft",
            penthouseType: "Duplex",
            terraceEntry: ["Drawing", "Passage"],
            plotAreaNumber: "200",
            plotAreaType: "sq-yd",
            plotLengthNumber: "20",
            plotLengthType: "sq-m",
            floorsAllowed: "3",
            roadWidth: "12",
          },
          pricing: sale,
        }),
      ],
    });
  });

  it("PG", () => {
    expectRoundTrip({
      listingType: "rent-lease",
      propertyType: "pg-co-living",
      address,
      listings: [
        listing("", {
          details: {
            ...INITIAL_PROPERTY_DETAILS,
            pgName: "Sunrise PG",
            pgGender: "Female",
            pgPresentIn: "Independent Building",
            pgOperationSince: "2019",
            entryTill: "10:30 PM",
            occupancies: ["Single", "Triple+"],
            foods: ["breakfast", "non-veg"],
            pgRules: ["no-smoking"],
            tenantPreferences: ["student"],
            managedBy: "Care Taker",
          },
          pricing: { ...INITIAL_PRICING_OTHERS, monthlyRent: "9000" },
        }),
      ],
    });
  });

  it("commercial sale with a lease and business types", () => {
    expectRoundTrip({
      listingType: "sale",
      propertyType: "commercial",
      address,
      listings: [
        listing("shop", {
          details: {
            ...INITIAL_PROPERTY_DETAILS,
            carpetAreaNumber: "300",
            carpetAreaType: "sq-ft",
            propertyTransaction: "new",
            constructionStatus: "ready-to-move",
            cabins: "2",
            entranceWidth: "3.5",
            currentlyLeasedOut: true,
            leaseContractTill: "2029-01-01",
          },
          amenities: {
            ...INITIAL_AMENITIES,
            washrooms: "2",
            roadFacing: "Main Road",
            pantry: true,
            cornerShop: true,
            businessTypes: ["shop", "bank"],
          },
          pricing: { ...sale, leaseAmount: "20000", yearlyIncrement: "5", assuredReturn: "8" },
        }),
      ],
    });
  });

  it("plot and land", () => {
    expectRoundTrip({
      listingType: "sale",
      propertyType: "plot",
      address,
      listings: [
        listing("residential-plot", {
          details: {
            ...INITIAL_PROPERTY_DETAILS,
            plotAreaNumber: "150",
            plotAreaType: "sq-yd",
            floorsAllowed: "2",
            propertyTransaction: "new",
            managedBy: "Landlord",
            anyConstruction: true,
            boundaryWallMade: true,
            cornerPlot: true,
            availableFrom: "2027-06-01",
          },
          amenities: { ...INITIAL_AMENITIES, facing: "East", roadFacing: "Side Road", openSides: "3" },
          pricing: sale,
        }),
      ],
    });

    expectRoundTrip({
      listingType: "rent-lease",
      propertyType: "land",
      address,
      listings: [
        listing("agriculture-land", {
          details: { ...INITIAL_PROPERTY_DETAILS, plotAreaNumber: "2", plotAreaType: "acres", managedBy: "Professional" },
          pricing: rent,
        }),
      ],
    });
  });

  it("keeps stored photos, the brochure and no browser data", () => {
    const photos = createEmptyPhotosVideosValues();
    photos.mediaByCategory.exterior = [uploaded("a")];
    photos.mediaByCategory.kitchen = [uploaded("b")];
    photos.brochure = uploaded("c", "brochure.pdf");

    const input: PropertyPayloadInput = {
      listingType: "sale",
      propertyType: "residential",
      address,
      listings: [listing("flat-apartment", { details: flatDetails, pricing: sale, photos })],
    };
    const media = [
      toMediaDto(photos.mediaByCategory.kitchen[0], "kitchen"),
      toMediaDto(photos.mediaByCategory.exterior[0], "exterior"),
      toMediaDto(photos.brochure, "brochure"),
    ];
    const { form } = mapDetailToForm(toDetail(input, media));

    expect(form.photosVideos.mediaByCategory.exterior[0]).toMatchObject({
      id: "a",
      status: "uploaded",
      remote: { id: "a", path: "/uploads/properties/p1/a.jpg", kind: "media" },
    });
    expect(form.photosVideos.mediaByCategory.exterior[0].previewUrl).toContain("/uploads/properties/p1/a.jpg");
    expect(form.photosVideos.brochure).toMatchObject({ name: "brochure.pdf", remote: { kind: "brochure" } });
    expectRoundTrip(input, media);
  });
});

describe("mapDetailToForm builder", () => {
  const project: ProjectDetailsValues = {
    ...createInitialProjectDetails("Flat/Apartment"),
    projectType: "Ready to Move",
    developerName: "Acme",
    launchDate: "2026-01-01",
    totalUnits: "120",
    totalBlocks: "4",
    projectArea: "5",
    openSpacePercent: "30",
    areaUnit: "sq yd",
    approvedBy: "Bank",
    reraLink: "https://rera.example.com/x",
    virtualTourLink: "https://tour.example.com/x",
    videoLink: "https://video.example.com/x",
    paymentPlan: "Flexi Payment",
    priceMin: "4000000",
    priceMax: "6000000",
    projectSize: "20",
    avgPrice: "5000000",
    pricePerSqft: "4500",
    carpetAreaMax: "900",
    infrastructure: ["Park / Green Space", "Internal Roads"],
    irrigationSources: ["Borewell"],
    conversionStatus: "In Process",
    naConversionDone: true,
    starCategory: "3 Star",
    distanceFromCity: "12",
    projectHighlights: [{ id: "h1", text: "Near metro" }],
    primeLocationHighlights: [{ id: "p1", place: "Airport", distance: "5 km" }],
    faqs: [{ id: "f1", question: "Q?", answer: "A." }],
    specifications: [
      {
        id: "g1",
        title: "",
        items: [
          { id: "i1", label: "Flooring", value: "Vitrified", custom: false },
          { id: "i2", label: "Extra", value: "Yes", custom: true },
        ],
      },
    ],
    availableSizes: [
      { ...createAvailableSizeRow("Flat/Apartment"), bhk: "2 BHK", size: "1000", price: "4000000", unitsAvailable: "10" },
      { ...createAvailableSizeRow("Flat/Apartment"), bhk: "6+ BHK", size: "3", price: "6000000", sizeUnit: "Acres" },
    ],
    bhkCarParking: { "2 BHK": { available: true, count: "1", clubMembership: true } },
    bhkCharges: {
      "2 BHK": { transferFee: "5000", bookingAmount: "", maintenanceCharges: "300", benefitsRemarks: "Free parking" },
    },
    brochureImages: [{ id: "bi1", name: "p.jpg", previewUrl: "", status: "uploaded", remote: { id: "bi1", path: "/uploads/properties/p1/bi1.jpg" } }],
    floorPlans: [
      { id: "fp1", label: "2 BHK Flat/Apartment", planType: "3d", file: null, previewUrl: "", status: "uploaded", remote: { id: "fp1", path: "/uploads/properties/p1/fp1.png" } },
    ],
  };

  const input: PropertyPayloadInput = {
    listingType: "sale",
    propertyType: "residential",
    address,
    postingAsBuilder: true,
    builderProject: project,
    listings: [
      listing("flat-apartment", {
        details: { ...INITIAL_PROPERTY_DETAILS, ageOfConstruction: "lt-1" },
        pricing: { ...INITIAL_PRICING_OTHERS, assuredReturn: "7" },
        project,
      }),
    ],
  };

  const media: PropertyMediaFileDto[] = [
    {
      id: "bi1",
      path: "/uploads/properties/p1/bi1.jpg",
      category: "brochure-images",
      mediaType: "image",
      originalName: "p.jpg",
      mimeType: "image/jpeg",
      size: 1,
    },
  ];
  const floorPlans: PropertyFloorPlanDto[] = [
    { id: "fp1", path: "/uploads/properties/p1/fp1.png", label: "2 BHK Flat/Apartment", planType: "3d", originalName: null, mimeType: "image/png", size: 1 },
  ];

  it("restores the project, variants, specifications and project files", () => {
    const { form, postingAs } = mapDetailToForm(toDetail(input, media, floorPlans));
    const restored = form.projectDetails;

    expect(postingAs).toBe("builder");
    expect(restored.projectType).toBe("Ready to Move");
    expect(restored.paymentPlan).toBe("Flexi Payment");
    expect(restored.areaUnit).toBe("sq yd");
    expect(restored.starCategory).toBe("3 Star");
    expect(restored.conversionStatus).toBe("In Process");
    expect(restored.infrastructure).toEqual(["Park / Green Space", "Internal Roads"]);
    expect(restored.availableSizes.map((row) => [row.bhk, row.unitType, row.sizeUnit])).toEqual([
      ["2 BHK", "Flat/Apartment", "sq ft"],
      ["6+ BHK", "Flat/Apartment", "Acres"],
    ]);
    expect(restored.bhkCarParking["2 BHK"]).toEqual({ available: true, count: "1", clubMembership: true });
    expect(restored.bhkCharges["2 BHK"].benefitsRemarks).toBe("Free parking");
    expect(restored.projectHighlights.map((row) => row.text)).toEqual(["Near metro"]);
    expect(restored.primeLocationHighlights[0]).toMatchObject({ place: "Airport", distance: "5 km" });
    expect(restored.brochureImages[0]).toMatchObject({ id: "bi1", status: "uploaded", remote: { kind: "media" } });
    expect(restored.floorPlans[0]).toMatchObject({ planType: "3d", remote: { id: "fp1", kind: "floor-plan" } });

    const flooring = restored.specifications[0].items.find((item) => item.label === "Flooring");
    expect(flooring?.value).toBe("Vitrified");
    expect(restored.specifications[0].items.some((item) => item.custom && item.label === "Extra")).toBe(true);
  });

  it("builds the same payload again", () => {
    expectRoundTrip(input, media, floorPlans);
  });

  it("restores every sub type into its own tab with its own photos", () => {
    const duplexProject: ProjectDetailsValues = {
      ...project,
      availableSizes: [
        ...project.availableSizes,
        { ...createAvailableSizeRow("Duplex"), bhk: "4 BHK", size: "2400", price: "9000000" },
      ],
    };
    const multiInput: PropertyPayloadInput = {
      ...input,
      builderProject: duplexProject,
      listings: [
        listing("flat-apartment", { details: { ...INITIAL_PROPERTY_DETAILS, ageOfConstruction: "lt-1" }, project: duplexProject }),
        listing("duplex", { details: { ...INITIAL_PROPERTY_DETAILS, ageOfConstruction: "1-to-2" }, project: duplexProject }),
      ],
    };
    const duplexPhoto: PropertyMediaFileDto = {
      id: "m2",
      path: "/uploads/properties/p2/m2.jpg",
      category: "main-photo",
      mediaType: "image",
      originalName: "duplex.jpg",
      mimeType: "image/jpeg",
      size: 1,
    };
    const detail = toDetail(multiInput, media, floorPlans);
    detail.payload.listings[0].propertyId = "p1";
    detail.payload.listings[1].propertyId = "p2";
    detail.listingFiles = [
      { propertyId: "p1", media, floorPlans },
      { propertyId: "p2", media: [duplexPhoto], floorPlans: [] },
    ];

    const { form, tabs } = mapDetailToForm(detail);

    expect(form.propertySubTypes).toEqual(["flat-apartment", "duplex"]);
    expect(tabs.details["flat-apartment"].ageOfConstruction).toBe("lt-1");
    expect(tabs.details.duplex.ageOfConstruction).toBe("1-to-2");
    expect(tabs.photos.duplex.mediaByCategory["main-photo"][0]).toMatchObject({ remote: { id: "m2" } });
    expect(tabs.photos["flat-apartment"].mediaByCategory["main-photo"]).toHaveLength(0);
    expect(form.projectDetails.availableSizes.map((row) => [row.bhk, row.unitType])).toEqual([
      ["2 BHK", "Flat/Apartment"],
      ["6+ BHK", "Flat/Apartment"],
      ["4 BHK", "Duplex"],
    ]);
  });
});

describe("mapDetailToForm defaults", () => {
  it("fills what the server leaves out with empty form values", () => {
    const detail = toDetail({
      listingType: "sale",
      propertyType: "residential",
      address: { ...INITIAL_ADDRESS_LOCATION, locality: "Vesu", pinCode: "395007", state: "Gujarat" },
      listings: [listing("flat-apartment", { pricing: sale })],
    });

    const { form } = mapDetailToForm(detail);

    expect(form.addressLocation.landmark).toBe("");
    expect(form.propertyDetails.bedrooms).toBe("");
    expect(form.propertyDetails.basementFloors).toBe("None");
    expect(form.amenities.carParkingAvailable).toBe(false);
    expect(form.pricingOthers.monthlyRent).toBe("");
    expect(form.propertySubTypes).toEqual(["flat-apartment"]);
  });

  it("gives PG listings the empty sub type the form uses", () => {
    const detail = toDetail({
      listingType: "rent-lease",
      propertyType: "pg-co-living",
      address,
      listings: [listing("", { pricing: { ...INITIAL_PRICING_OTHERS, monthlyRent: "9000" } })],
    });

    expect(mapDetailToForm(detail).form.propertySubTypes).toEqual([""]);
  });
});
