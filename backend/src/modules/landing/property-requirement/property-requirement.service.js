const repository = require("./property-requirement.repository");

async function createRequirement(userId, data) {
  const { id, created_at: createdAt } = await repository.createRequirement(userId, data);
  return { id, createdAt };
}

module.exports = { createRequirement };
