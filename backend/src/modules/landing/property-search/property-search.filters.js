const c = require("./property-search.constants");

const PRICE_MIN_SQL = "coalesce(bld.price_min, p.price)";
const PRICE_MAX_SQL = "coalesce(bld.price_max, p.price)";
const PROJECT_NAME_SQL = "coalesce(bp.project_name, p.project_name)";

const normalizedSql = (column) => `lower(trim(regexp_replace(coalesce(${column}, ''), '[^[:alnum:]]+', ' ', 'g')))`;
const normalizeText = (value) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const toKey = (value) => value.toLowerCase().trim().replace(/\s+/g, "-");

const marks = (values) => values.map(() => "?").join(", ");

function whereCity(query, city) {
  query.whereRaw(`${normalizedSql("p.city")} = ?`, [normalizeText(city)]);
}

function whereAnyOf(query, sql, values) {
  if (values.length) query.whereRaw(`${sql} in (${marks(values)})`, values);
}

function whereSelectionIn(query, group, keys) {
  if (!keys.length) return;
  query.whereRaw(
    `exists (
      select 1 from property_selections s
      join property_options o on o.id = s.option_id
      where s.property_id = p.id and o.option_group = ? and o.option_key in (${marks(keys)})
    )`,
    [group, ...keys]
  );
}


function whereHasAllAmenities(query, kind, keys) {
  if (!keys.length) return;
  query.whereRaw(
    `(select count(distinct pa.amenity_key) from property_amenities pa
      where pa.property_id = p.id and pa.kind = ? and pa.amenity_key in (${marks(keys)})) = ?`,
    [kind, ...keys, keys.length]
  );
}

function whereBedrooms(query, dbType, bedrooms) {
  if (!bedrooms.length || !c.ROOMED_TYPES.includes(dbType)) return;

  query.where((builder) => {
    builder.whereRaw(`t.bedrooms in (${marks(bedrooms)})`, bedrooms);
    if (dbType === "residential") {
      builder.orWhereRaw(
        `exists (
          select 1 from property_variants v
          join residential_property_variants rv on rv.variant_id = v.id
          where v.property_id = p.id and rv.bhk in (${marks(bedrooms)})
        )`,
        bedrooms
      );
    }
  });
}

function wherePostedSince(query, postedSince) {
  const interval = c.POSTED_SINCE_INTERVALS[postedSince];
  if (interval) query.whereRaw(`coalesce(p.published_at, p.created_at) >= now() - interval '${interval}'`);
}

function whereAvailableFrom(query, availableFrom) {
  if (!availableFrom) return;

  const days = availableFrom === "immediate" ? 0 : c.AVAILABLE_WITHIN_DAYS[availableFrom];
  query.where((builder) =>
    builder.whereNull("p.available_from").orWhereRaw("p.available_from <= current_date + ?::int", [days])
  );
}

function whereMedia(query, mediaType) {
  query.whereRaw("exists (select 1 from property_media m where m.property_id = p.id and m.media_type = ?)", [mediaType]);
}

function whereRera(query) {
  query.where((builder) =>
    builder
      .whereRaw(
        "exists (select 1 from property_sale_details sd where sd.property_id = p.id and coalesce(sd.rera_number, '') <> '')"
      )
      .orWhereRaw("coalesce(bp.rera_link, '') <> ''")
  );
}

function wherePriceNegotiable(query) {
  query.whereRaw(
    `(exists (select 1 from property_sale_details sd where sd.property_id = p.id and sd.price_negotiable)
      or exists (select 1 from property_rent_details rd where rd.property_id = p.id and rd.price_negotiable))`
  );
}

function whereColumnFilters(query, filters, dbType) {
  for (const [key, { column, numeric, types }] of Object.entries(c.COLUMN_FILTERS)) {
    const values = filters[key];
    if (!values.length || !types.includes(dbType)) continue;

    if (numeric) whereAnyOf(query, `t.${column}`, values);
    else whereAnyOf(query, `lower(t.${column})`, values.map(toKey));
  }

  for (const [key, { column, types }] of Object.entries(c.FLAG_FILTERS)) {
    if (filters[key] && types.includes(dbType)) query.whereRaw(`t.${column} = true`);
  }
}

function applySearchFilters(query, filters) {
  const dbType = c.CATEGORY_TO_DB[filters.category];

  query.where({ "p.status": "published", "p.listing_type": filters.listingType, "p.property_type": dbType });

  if (filters.city) whereCity(query, filters.city);
  whereAnyOf(query, normalizedSql("p.locality"), filters.localities.map(normalizeText));
  whereAnyOf(query, normalizedSql(PROJECT_NAME_SQL), filters.projects.map(normalizeText));
  whereAnyOf(query, "st.slug", filters.subTypes.map(toKey));
  whereAnyOf(query, "p.construction_status", filters.constructionStatuses.map(toKey));
  whereAnyOf(query, "lower(p.facing)", filters.facings.map(toKey));
  whereAnyOf(query, c.POSTED_BY_SQL, filters.postedBy);
  whereBedrooms(query, dbType, filters.bedrooms);

  if (c.SALE_TYPE_TYPES.includes(dbType)) {
    whereAnyOf(query, "lower(t.property_transaction)", filters.saleTypes.map(toKey));
  }
  if (dbType === "pg") {
    whereSelectionIn(query, "occupancy", filters.occupancies.map(toKey));
    whereAnyOf(query, "t.pg_gender", filters.genders.map(toKey));
  }

  if (filters.budgetMin !== undefined) query.whereRaw(`${PRICE_MAX_SQL} >= ?`, [filters.budgetMin]);
  if (filters.budgetMax !== undefined) query.whereRaw(`${PRICE_MIN_SQL} <= ?`, [filters.budgetMax]);
  if (filters.areaMin !== undefined) query.where("p.area_sqft", ">=", filters.areaMin);
  if (filters.areaMax !== undefined) query.where("p.area_sqft", "<=", filters.areaMax);

  wherePostedSince(query, filters.postedSince);
  whereAvailableFrom(query, filters.availableFrom);
  if (filters.hasPhotos) whereMedia(query, "image");
  if (filters.hasVideos) whereMedia(query, "video");
  if (filters.hasRera) whereRera(query);
  if (filters.priceNegotiable) wherePriceNegotiable(query);
  if (filters.carParkingAvailable && c.COLUMN_FILTERS.carParkings.types.includes(dbType)) {
    query.whereRaw("t.car_parking_count > 0");
  }

  whereHasAllAmenities(query, "amenity", filters.amenities.map(toKey));
  whereHasAllAmenities(query, "furnishing", filters.furnishingItems.map(toKey));
  for (const [key, group] of Object.entries(c.SELECTION_FILTERS)) {
    whereSelectionIn(query, group, filters[key].map(toKey));
  }
  whereColumnFilters(query, filters, dbType);

  return query;
}

module.exports = { applySearchFilters, whereCity, normalizedSql, normalizeText, PRICE_MIN_SQL, PRICE_MAX_SQL, PROJECT_NAME_SQL };