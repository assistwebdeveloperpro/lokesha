const { db } = require("../../../../config/db");

const DRAFTS_TABLE = "property_form_drafts";

// owner is { userId } or { adminId }; the scope always goes into the where clause
function ownerScope(owner) {
  return owner.userId ? { user_id: owner.userId } : { admin_id: owner.adminId };
}

async function countDraftsByOwner(owner) {
  const [{ count }] = await db(DRAFTS_TABLE).where(ownerScope(owner)).count("id as count");
  return Number(count);
}

async function insertDraft(owner, data) {
  const [draft] = await db(DRAFTS_TABLE)
    .insert({
      ...ownerScope(owner),
      listed_by: owner.listedBy,
      form_data: JSON.stringify(data.formData),
      current_step: data.currentStep,
    })
    .returning("*");
  return draft;
}

async function findDraftsByOwner(owner) {
  return db(DRAFTS_TABLE)
    .where(ownerScope(owner))
    .select("id", "listed_by", "current_step", "created_at", "updated_at", "form_data")
    .orderBy("updated_at", "desc");
}

async function findDraftByIdForOwner(id, owner) {
  return db(DRAFTS_TABLE).where({ id, ...ownerScope(owner) }).first();
}

async function draftExistsForOwner(id, owner) {
  const draft = await db(DRAFTS_TABLE)
    .where({ id, ...ownerScope(owner) })
    .first("id");
  return Boolean(draft);
}

async function updateDraft(id, owner, data) {
  const [draft] = await db(DRAFTS_TABLE)
    .where({ id, ...ownerScope(owner) })
    .update({
      form_data: JSON.stringify(data.formData),
      current_step: data.currentStep,
      updated_at: db.fn.now(),
    })
    .returning("*");
  return draft;
}

async function touchDraft(id, owner) {
  return db(DRAFTS_TABLE)
    .where({ id, ...ownerScope(owner) })
    .update({ updated_at: db.fn.now() });
}

async function deleteDraft(id, owner) {
  return db(DRAFTS_TABLE)
    .where({ id, ...ownerScope(owner) })
    .del();
}

async function findStaleDraftIds(cutoff, limit) {
  return db(DRAFTS_TABLE).where("updated_at", "<", cutoff).orderBy("updated_at", "asc").limit(limit).pluck("id");
}

async function deleteDraftsByIds(ids) {
  return db(DRAFTS_TABLE).whereIn("id", ids).del();
}

async function findExistingDraftIds(ids) {
  return db(DRAFTS_TABLE).whereIn("id", ids).pluck("id");
}

module.exports = {
  findStaleDraftIds,
  deleteDraftsByIds,
  findExistingDraftIds,
  countDraftsByOwner,
  insertDraft,
  findDraftsByOwner,
  findDraftByIdForOwner,
  draftExistsForOwner,
  updateDraft,
  touchDraft,
  deleteDraft,
};
