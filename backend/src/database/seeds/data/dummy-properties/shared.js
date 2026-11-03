// Amenity keys are filtered against amenity_property_types at seed time
const RESIDENTIAL_AMENITIES = [
  "lift",
  "cctv",
  "gym",
  "garden-park",
  "kids-play-area",
  "swimming-pool",
  "intercom",
  "gated-community",
  "security",
  "club-house",
  "community-hall",
  "regular-water-supply",
  "power-backup",
  "reserved-parking",
  "visitor-parking",
  "vaastu-compliant",
  "jogging-strolling-track",
];

const PREMIUM_AMENITIES = [
  ...RESIDENTIAL_AMENITIES,
  "sports-club",
  "outdoor-tennis-court",
  "banquet-hall",
  "indoor-games",
  "mini-theatre",
  "skydeck",
  "meditation-area",
  "kids-splash-pool",
  "solar-energy",
  "piped-gas",
];

const HOME_FURNISHING = [
  "dining-table",
  "tv",
  "sofa",
  "washing-machine",
  "fridge",
  "water-purifier",
  "ac",
  "beds",
  "geyser",
  "electric-fittings",
  "fan",
  "wardrobes",
  "stove",
  "microwave",
];

const BASIC_FURNISHING = ["electric-fittings", "fan", "geyser", "wardrobes"];

const COMMERCIAL_AMENITIES = [
  "lift",
  "cctv",
  "security",
  "power-backup",
  "generator",
  "fire-safety",
  "visitor-parking",
  "reserved-parking",
  "regular-water-supply",
  "wheelchair-access",
  "service-goods-lift",
];

const OFFICE_FURNISHING = [
  "work-station",
  "chairs",
  "tables",
  "reception-area",
  "conference-room",
  "waiting-area",
  "director-cabin",
  "cupboard",
  "partition",
  "ac",
  "electric-fittings",
  "fan",
];

const PG_FURNISHING = [
  "beds",
  "wardrobes",
  "fan",
  "ac",
  "geyser",
  "water-purifier",
  "tv",
  "fridge",
  "washing-machine",
  "electric-fittings",
  "wifi",
];

const BUILDER_SPECIFICATIONS = [
  {
    group_title: "General",
    label: "Structure",
    value: "Earthquake resistant RCC framed structure with 6 inch brick masonry walls.",
  },
  {
    group_title: "General",
    label: "Flooring",
    value: "Vitrified tiles in living, dining and bedrooms; anti-skid tiles in bathrooms and balconies.",
  },
  {
    group_title: "General",
    label: "Doors and Windows",
    value: "Decorative main door with laminate finish, flush internal doors, powder coated aluminium sliding windows.",
  },
  {
    group_title: "General",
    label: "Electrification",
    value: "Concealed copper wiring with ISI branded modular switches, TV and AC points in all bedrooms.",
  },
  {
    group_title: "Kitchen",
    label: "Platform",
    value: "Granite kitchen platform with stainless steel sink and glazed tile dado up to 2 feet.",
  },
  {
    group_title: "Bathroom",
    label: "Fittings",
    value: "Branded CP fittings and sanitary ware with concealed plumbing and geyser provision.",
  },
  {
    group_title: "Safety",
    label: "Security",
    value: "24x7 security with CCTV surveillance, video door phone and fire fighting system.",
  },
];

module.exports = {
  RESIDENTIAL_AMENITIES,
  PREMIUM_AMENITIES,
  HOME_FURNISHING,
  BASIC_FURNISHING,
  COMMERCIAL_AMENITIES,
  OFFICE_FURNISHING,
  PG_FURNISHING,
  BUILDER_SPECIFICATIONS,
};
