const PAYMENT_PLANS = ["construction-linked", "down-payment", "flexi-payment", "possession-linked"];

const UNIT_TYPES = [
  "Flat/Apartment",
  "Duplex",
  "Villa",
  "Penthouse",
  "Studio",
  "Builder Floor",
  "Independent House",
];

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6+ BHK"];

const MAX_LIST_ITEMS = 20;

const MAX_FLOOR_PLANS = 20;
const MAX_FLOOR_PLAN_SIZE_BYTES = 10 * 1024 * 1024;
const FLOOR_PLAN_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/heic"];
const FLOOR_PLAN_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic"];

const SALE_ONLY_PROJECT_FIELDS = ["priceMin", "priceMax", "pricePerSqft", "paymentPlan"];

module.exports = {
  PAYMENT_PLANS,
  UNIT_TYPES,
  BHK_OPTIONS,
  MAX_LIST_ITEMS,
  MAX_FLOOR_PLANS,
  MAX_FLOOR_PLAN_SIZE_BYTES,
  FLOOR_PLAN_MIME_TYPES,
  FLOOR_PLAN_EXTENSIONS,
  SALE_ONLY_PROJECT_FIELDS,
};
