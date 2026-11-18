const repository = require("./user-leads.repository");
const {
  PUBLISHED_STATUS,
  findListingsByPropertyId,
  toUnavailableProperty,
} = require("../shared/published-listings");
const { isNewActivity } = require("../shared/new-activity");

// Single place to apply a future subscription gate on the enquirer's contact details
function toEnquirer(lead) {
  return { name: lead.lead_name, mobile: lead.lead_mobile, email: lead.lead_email };
}

function toLeadItem(lead, listings, now) {
  const isAvailable = lead.status === PUBLISHED_STATUS;
  const property = isAvailable ? listings.get(lead.property_id) : null;

  return {
    id: lead.id,
    sentAt: lead.sent_at,
    isNew: isNewActivity(lead.sent_at, now),
    enquiryDate: lead.created_at,
    enquirer: toEnquirer(lead),
    phoneRevealed: lead.phone_revealed,
    contactRole: lead.lister_role,
    isAvailable,
    property: property ?? toUnavailableProperty(lead),
  };
}

// A requested lead moves the list to the page holding it; unknown leads keep the requested page
async function resolvePage(userId, { page, limit, leadId }) {
  if (!leadId) return page;

  const leadsBefore = await repository.countLeadsBefore(userId, leadId);
  return leadsBefore === null ? page : Math.floor(leadsBefore / limit) + 1;
}

async function listLeads(userId, query) {
  const page = await resolvePage(userId, query);
  const [leads, total] = await Promise.all([
    repository.findSentLeads(userId, { page, limit: query.limit }),
    repository.countSentLeads(userId),
  ]);
  const listings = await findListingsByPropertyId(leads);
  const now = Date.now();

  return { items: leads.map((lead) => toLeadItem(lead, listings, now)), page, limit: query.limit, total };
}

module.exports = { listLeads };
