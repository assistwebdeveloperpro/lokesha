const repository = require("./leads.repository");

const toLead = (row) => ({
  id: row.id,
  lead: { name: row.lead_name, mobile: row.lead_mobile, email: row.lead_email },
  property: {
    id: row.property_id,
    title: row.project_name || row.property_title,
    listingNumber: Number(row.listing_number),
    propertyType: row.property_type,
    listingType: row.listing_type,
    locality: row.locality,
    city: row.city,
  },
  lister: { name: row.lister_name, mobile: row.lister_mobile, listedBy: row.lister_listed_by },
  contactRole: row.lister_role,
  phoneRevealed: row.phone_revealed,
  verificationStatus: row.verification_status,
  createdAt: row.created_at,
});

async function listLeads(query) {
  const [rows, total] = await Promise.all([repository.findLeads(query), repository.countLeads(query)]);

  return { items: rows.map(toLead), page: query.page, limit: query.limit, total };
}

module.exports = { listLeads };
