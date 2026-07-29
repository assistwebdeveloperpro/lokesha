const repository = require("./user-business.repository");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function mergeUnique(main = [], others = []) {
  return Array.from(new Set([...(main || []), ...(others || [])]));
}

function toBoolean(value) {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

async function saveBusinessDetails(userId, payload) {
  const data = {
    dealing_in: payload.dealingIn,
    property_type: payload.propertyType,
    transaction_type: mergeUnique(payload.transactionType, payload.transactionTypeOthers),
    residential_property: mergeUnique(
      payload.residentialProperty,
      payload.residentialPropertyOthers
    ),
    commercial_property: mergeUnique(
      payload.commercialProperty,
      payload.commercialPropertyOthers
    ),
    operating_since: Number(payload.operatingSince),
    expertise_in: payload.expertiseIn,
    business_description: payload.businessDescription,
    authorized_agents: payload.authorizedAgents || null,
    property_registry: toBoolean(payload.propertyRegistry),
    loan_facility: toBoolean(payload.loanFacility),
  };

  return repository.upsertBusinessDetails(userId, data, payload.clients);
}

async function getBusinessDetails(userId) {
  const businessDetail = await repository.findByUserId(userId);
  if (!businessDetail) {
    throw new AppError("Business details not found", 404);
  }

  const clients = await repository.findClientsByBusinessDetailId(businessDetail.id);
  return { ...businessDetail, clients };
}

module.exports = { saveBusinessDetails, getBusinessDetails, AppError };
