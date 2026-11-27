const { PRICE_MIN_SQL, PRICE_MAX_SQL } = require("../../../landing/property-search/property-search.filters");
const { LISTED_BY_FILTERS, LAUNCH_PERIOD_FILTERS } = require("./newly-launched-projects.constants");

const escapeLike = (value) => value.replace(/[\\%_]/g, "\\$&");
const contains = (value) => `%${escapeLike(value)}%`;
const marks = (values) => values.map(() => "?").join(", ");

// One condition per filter, each is met when any published property of the project meets it
function buildConditions({
  keyword,
  city,
  locality,
  builder,
  propertyType,
  bhk,
  priceMin,
  priceMax,
  possessionStatus,
  listedBy,
  launchPeriod,
}) {
  const conditions = [];
  const add = (sql, bindings = []) => conditions.push({ sql, bindings });

  if (keyword) {
    const pattern = contains(keyword);
    add("(bp.project_name ilike ? or bp.developer_name ilike ? or p.listing_number::text ilike ?)", [pattern, pattern, pattern]);
  }
  if (city) add("p.city ilike ?", [contains(city)]);
  if (locality) add("p.locality ilike ?", [contains(locality)]);
  if (builder) add("bp.developer_name ilike ?", [contains(builder)]);
  if (propertyType) add("p.property_type = ?", [propertyType]);
  if (possessionStatus) add("p.construction_status = ?", [possessionStatus]);
  if (listedBy) add(`p.listed_by in (${marks(LISTED_BY_FILTERS[listedBy])})`, LISTED_BY_FILTERS[listedBy]);
  if (launchPeriod) add(LAUNCH_PERIOD_FILTERS[launchPeriod]);
  if (priceMin !== undefined) add(`${PRICE_MAX_SQL} >= ?`, [priceMin]);
  if (priceMax !== undefined) add(`${PRICE_MIN_SQL} <= ?`, [priceMax]);
  if (bhk !== undefined) {
    add(
      `(exists (select 1 from residential_properties rp where rp.property_id = p.id and rp.bedrooms = ?)
        or exists (
          select 1 from property_variants v
          join residential_property_variants rv on rv.variant_id = v.id
          where v.property_id = p.id and rv.bhk = ?
        ))`,
      [bhk, bhk]
    );
  }

  return conditions;
}

// Keeps the projects that meet every condition, while the rows stay whole for the project totals
function havingAllConditions(query, filters) {
  for (const { sql, bindings } of buildConditions(filters)) {
    query.havingRaw(`bool_or(${sql})`, bindings);
  }
  return query;
}

module.exports = { buildConditions, havingAllConditions };
