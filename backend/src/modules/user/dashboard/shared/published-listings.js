const searchRepository = require("../../../landing/property-search/property-search.repository");
const searchMapper = require("../../../landing/property-search/property-search.mapper");

const PUBLISHED_STATUS = "published";

const groupBy = (items, getKey) =>
  items.reduce((groups, item) => {
    const key = getKey(item);
    return { ...groups, [key]: [...(groups[key] ?? []), item] };
  }, {});

// Search cards of the published rows, keyed by the row's property id
async function findListingsByPropertyId(rows, enrich = (listing) => listing) {
  const published = rows.filter(({ status }) => status === PUBLISHED_STATUS);
  const byType = groupBy(published, ({ property_type: type }) => type);

  const cardGroups = await Promise.all(
    Object.entries(byType).map(([dbType, typeRows]) =>
      searchRepository.findCardsByPropertyIds(
        typeRows.map(({ property_id: id }) => id),
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
      return card ? [[id, enrich(searchMapper.toListing(card, extras), card, extras)]] : [];
    })
  );
}

function toUnavailableProperty(row) {
  return {
    id: row.property_id,
    title: row.title,
    listingNumber: row.listing_number,
    listingType: row.listing_type,
    propertyType: searchMapper.FORM_TYPE_BY_DB_TYPE[row.property_type],
    locality: row.locality,
    city: row.city,
  };
}

module.exports = { PUBLISHED_STATUS, findListingsByPropertyId, toUnavailableProperty };
