const PROPERTY_TYPES = [
  ["residential", "Residential"],
  ["commercial", "Commercial"],
  ["pg", "PG/Co-Living"],
  ["plot", "Plot"],
  ["land", "Land"],
];

/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  await knex("property_types")
    .insert(
      PROPERTY_TYPES.map(([slug, name], index) => ({
        slug,
        name,
        sort_order: index + 1,
      }))
    )
    .onConflict("slug")
    .merge(["name", "sort_order", "updated_at"]);
};
