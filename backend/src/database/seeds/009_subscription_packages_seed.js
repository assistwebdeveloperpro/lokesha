const PACKAGES = [
  {
    code: "free",
    name: "Free",
    display_title: "Free Package",
    description:
      "Start listing your properties at no cost. Every verified Lokesha account receives two complimentary property listings to reach genuine buyers and tenants.",
    benefits: [
      "2 complimentary property listings",
      "Each listing stays live for 1 month",
      "Up to 2 buyer or tenant leads per listing",
    ],
    display_order: 1,
    price_per_listing_month: 0,
    gst_percent: 0,
    min_listings: 1,
    max_listings: 1,
    min_months: 1,
    max_months: 1,
    allow_custom_quantity: false,
    allow_custom_duration: false,
    free_credits: 2,
    free_lead_limit: 2,
    free_property_validity_days: 30,
  },
  {
    code: "standard",
    name: "Standard",
    display_title: "Standard Package",
    description:
      "Grow your reach with the number of listings and the duration that suit your business. Choose a plan, pay securely online and publish with confidence.",
    benefits: [
      "Choose the number of property listings you need",
      "Flexible subscription duration of up to 12 months",
      "Unlimited buyer and tenant leads on every listing",
      "Listings stay live for the entire subscription period",
    ],
    display_order: 2,
    price_per_listing_month: 100000,     // Amounts are stored in paise
    gst_percent: 18,
    min_listings: 1,
    max_listings: 50,
    min_months: 1,
    max_months: 12,
    allow_custom_quantity: true,
    allow_custom_duration: true,
    free_credits: null,
    free_lead_limit: null,
    free_property_validity_days: null,
  },
];

/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  // Existing rows are kept so admin edits survive a re-run
  await knex("subscription_packages")
    .insert(PACKAGES.map((item) => ({ ...item, benefits: JSON.stringify(item.benefits) })))
    .onConflict("code")
    .ignore();

  // Placeholder business details, the accounts team fills the real values
  await knex("subscription_settings").insert({ id: 1 }).onConflict("id").ignore();
};
