const repository = require("./user-contacted-properties.repository");
const {
  PUBLISHED_STATUS,
  findListingsByPropertyId,
  findUnavailableListingsByPropertyId,
  toUnavailableProperty,
} = require("../shared/published-listings");
const { isNewActivity } = require("../shared/new-activity");

function toContactedItem(lead, listings, now) {
  const isAvailable = lead.status === PUBLISHED_STATUS;
  const listing = listings.get(lead.property_id);
  // Unavailable rows keep their own title and number but still show the image and price
  const property = isAvailable ? listing : listing && { ...listing, ...toUnavailableProperty(lead) };

  return {
    id: lead.id,
    contactedAt: lead.created_at,
    isNew: isNewActivity(lead.created_at, now),
    contactRole: lead.lister_role,
    phoneRevealed: lead.phone_revealed,
    lister: {
      name: lead.lister_name,
      mobile: lead.phone_revealed ? lead.lister_mobile : null,
      listedBy: lead.lister_listed_by,
    },
    isAvailable,
    property: property ?? toUnavailableProperty(lead),
  };
}

async function listContactedProperties(userId, query) {
  const [leads, total, summary] = await Promise.all([
    repository.findContactedLeads(userId, query),
    repository.countContactedLeads(userId, query),
    repository.countContactedSummary(userId),
  ]);
  const [published, unavailable] = await Promise.all([
    findListingsByPropertyId(leads),
    findUnavailableListingsByPropertyId(leads),
  ]);
  const listings = new Map([...published, ...unavailable]);
  const now = Date.now();

  return {
    items: leads.map((lead) => toContactedItem(lead, listings, now)),
    page: query.page,
    limit: query.limit,
    total,
    summary: {
      total: summary.total,
      available: summary.available,
      phonesRevealed: summary.phonesRevealed,
      thisWeek: summary.recent,
    },
  };
}

module.exports = { listContactedProperties };
