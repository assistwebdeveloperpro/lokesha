// [slug, name]; ids match the post property form config
const SUB_TYPES = {
  residential: [
    ["flat-apartment", "Flat/Apartment"],
    ["bungalow-villa", "Bungalow/Villa"],
    ["studio-apartment", "Studio Apartment"],
    ["weekend-homes", "Weekend Homes"],
    ["farm-house", "Farm House"],
    ["residential-land", "Residential Land"],
    ["penthouse", "Penthouse"],
    ["duplex", "Duplex"],
  ],
  commercial: [
    ["shop", "Shop"],
    ["office", "Office"],
    ["showroom", "Showroom"],
    ["cold-storage", "Cold Storage"],
    ["industrial-shed", "Industrial Shed"],
    ["guest-house", "Guest House"],
    ["hotel-resort", "Hotel/Resort"],
    ["warehouse-godown", "Warehouse/Godown"],
    ["co-working-space", "Co-working Space/Business Centre"],
  ],
  pg: [
    ["pg", "PG"],
    ["hostel", "Hostel"],
  ],
  plot: [
    ["residential-plot", "Residential Plot"],
    ["industrial-plot", "Industrial Plot"],
    ["commercial-plot", "Commercial Plot"],
  ],
  land: [
    ["agriculture-land", "Agriculture Land"],
    ["non-agriculture-land", "Non-Agriculture Land"],
    ["commercial-land", "Commercial Land"],
    ["residential-land", "Residential Land"],
    ["industrial-land", "Industrial Land"],
  ],
};

function buildRows() {
  return Object.entries(SUB_TYPES).flatMap(([property_type, items]) =>
    items.map(([slug, name], index) => ({
      property_type,
      slug,
      name,
      sort_order: index + 1,
    }))
  );
}

/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  await knex("property_sub_types")
    .insert(buildRows())
    .onConflict(["property_type", "slug"])
    .merge(["name", "sort_order", "updated_at"]);
};
