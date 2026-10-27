const IMAGE_DIR = "/assets/images";

// [option_key, name, image path or null]
const OPTIONS = {
  tenant_preference: [
    ["family", "Family", null],
    ["bachelor", "Bachelor", `${IMAGE_DIR}/tenant-preferences/bachelor.svg`],
    ["student", "Student", `${IMAGE_DIR}/tenant-preferences/student.svg`],
    ["professional", "Professional", `${IMAGE_DIR}/tenant-preferences/professional.svg`],
  ],
  food: [
    ["breakfast", "Breakfast", `${IMAGE_DIR}/foods/breakfast.svg`],
    ["lunch", "Lunch", `${IMAGE_DIR}/foods/lunch.svg`],
    ["dinner", "Dinner", `${IMAGE_DIR}/foods/dinner.svg`],
    ["veg", "Veg", `${IMAGE_DIR}/foods/veg.svg`],
    ["non-veg", "Non Veg", `${IMAGE_DIR}/foods/non_veg.svg`],
    ["not-available", "Not Available", `${IMAGE_DIR}/foods/not_available.svg`],
  ],
  pg_rule: [
    ["only-veg", "Only veg", `${IMAGE_DIR}/pg-rules/only_veg.svg`],
    ["no-smoking", "No smoking", `${IMAGE_DIR}/pg-rules/no_smoking.svg`],
    ["no-alcohol", "No alcohol", `${IMAGE_DIR}/pg-rules/no_alcohol.svg`],
    [
      "cross-gender-not-allowed",
      "Cross gender not allowed",
      `${IMAGE_DIR}/pg-rules/cross_gender_not_allowed.svg`,
    ],
  ],
  occupancy: [
    ["single", "Single", null],
    ["double", "Double", null],
    ["triple", "Triple", null],
    ["triple-plus", "Triple+", null],
  ],
  business_type: [
    ["bank", "Bank", `${IMAGE_DIR}/businesses/bank.svg`],
    ["bank-atm", "Bank ATM", `${IMAGE_DIR}/businesses/bank_atm.svg`],
    ["business-house", "Business house", `${IMAGE_DIR}/businesses/business_house.svg`],
    ["business-mall", "Business mall", `${IMAGE_DIR}/businesses/business_mall.svg`],
    ["call-center", "Call Center", `${IMAGE_DIR}/businesses/call_centre.svg`],
    ["classes", "Classes", `${IMAGE_DIR}/businesses/classes.svg`],
    ["clinic", "Clinic", `${IMAGE_DIR}/businesses/clinic.svg`],
    ["factory", "Factory", `${IMAGE_DIR}/businesses/factory.svg`],
    ["gym", "GYM", `${IMAGE_DIR}/businesses/gym.svg`],
    ["hospital", "Hospital", `${IMAGE_DIR}/businesses/hospital.svg`],
    ["hotel", "Hotel", `${IMAGE_DIR}/businesses/hotel.svg`],
    ["medical-shop", "Medical Shop", `${IMAGE_DIR}/businesses/medical_shop.svg`],
    ["multiplex", "Multiplex", `${IMAGE_DIR}/businesses/multiplex.svg`],
    ["office", "Office", `${IMAGE_DIR}/businesses/office.svg`],
    ["parlor", "Parlor", `${IMAGE_DIR}/businesses/parlor.svg`],
    ["petrol-pump", "Petrol Pump", `${IMAGE_DIR}/businesses/petrol_pump.svg`],
    ["resort", "Resort", `${IMAGE_DIR}/businesses/resort.svg`],
    ["restaurant", "Restaurant", `${IMAGE_DIR}/businesses/restaurant.svg`],
    ["school", "School", `${IMAGE_DIR}/businesses/school.svg`],
    ["service-station", "Service station", `${IMAGE_DIR}/businesses/service_station.svg`],
    ["shop", "Shop", `${IMAGE_DIR}/businesses/shop.svg`],
    ["showroom", "Showroom", `${IMAGE_DIR}/businesses/showroom.svg`],
    ["store", "Store", `${IMAGE_DIR}/businesses/store.svg`],
  ],
  terrace_entry: [
    ["drawing", "Drawing", null],
    ["kitchen", "Kitchen", null],
    ["bedroom", "Bedroom", null],
    ["passage", "Passage", null],
  ],
  infrastructure: [
    ["internal-roads", "Internal Roads", null],
    ["drainage", "Drainage", null],
    ["water-supply", "Water Supply", null],
    ["electricity", "Electricity", null],
    ["street-lights", "Street Lights", null],
    ["sewage", "Sewage", null],
    ["park-green-space", "Park / Green Space", null],
  ],
  irrigation_source: [
    ["borewell", "Borewell", null],
    ["canal", "Canal", null],
    ["well", "Well", null],
    ["river", "River", null],
    ["none", "None", null],
  ],
};

function buildRows() {
  return Object.entries(OPTIONS).flatMap(([option_group, items]) =>
    items.map(([option_key, name, image_path], index) => ({
      option_group,
      option_key,
      name,
      image_path,
      sort_order: index + 1,
    }))
  );
}

/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  await knex("property_options")
    .insert(buildRows())
    .onConflict(["option_group", "option_key"])
    .merge(["name", "image_path", "sort_order", "updated_at"]);
};
