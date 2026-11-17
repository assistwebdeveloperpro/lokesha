const repository = require("./user-contacted-properties.repository");
const searchRepository = require("../../../landing/property-search/property-search.repository");
const searchMapper = require("../../../landing/property-search/property-search.mapper");

const PUBLISHED_STATUS = "published";
const NEW_CONTACT_WINDOW_MS = 48 * 60 * 60 * 1000;

const groupBy = (items, getKey) =>
  items.reduce((groups, item) => {
    const key = getKey(item);
    return { ...groups, [key]: [...(groups[key] ?? []), item] };
  }, {});

// Search cards of the published leads, keyed by the lead's property id
async function findListingsByPropertyId(leads) {
  const published = leads.filter(({ status }) => status === PUBLISHED_STATUS);
  const byType = groupBy(published, ({ property_type: type }) => type);

  const cardGroups = await Promise.all(
    Object.entries(byType).map(([dbType, typeLeads]) =>
      searchRepository.findCardsByPropertyIds(
        typeLeads.map(({ property_id: id }) => id),
        dbType
      )
    )
  );
  const cards = cardGroups.flat();
  if (!cards.length) return new Map();

  const extras = await searchRepository.findCardExtras(cards.flatMap((card) => card.member_ids));

  return new Map(
    published.flatMap(({ property_id: id }) => {
      const card = cards.find((item) => item.member_ids.includes(id));
      return card ? [[id, searchMapper.toListing(card, extras)]] : [];
    })
  );
}

function toUnavailableProperty(lead) {
  return {
    id: lead.property_id,
    title: lead.title,
    listingNumber: lead.listing_number,
    listingType: lead.listing_type,
    propertyType: searchMapper.FORM_TYPE_BY_DB_TYPE[lead.property_type],
    locality: lead.locality,
    city: lead.city,
  };
}

function toContactedItem(lead, listings, now) {
  const isAvailable = lead.status === PUBLISHED_STATUS;
  const property = isAvailable ? listings.get(lead.property_id) : null;

  return {
    id: lead.id,
    contactedAt: lead.created_at,
    isNew: now - new Date(lead.created_at).getTime() < NEW_CONTACT_WINDOW_MS,
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
  const listings = await findListingsByPropertyId(leads);
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
