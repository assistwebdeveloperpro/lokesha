const repository = require("./user-rera.repository");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function buildDocumentData(file) {
  return {
    document_path: `/uploads/rera-documents/${file.filename}`,
    document_original_name: file.originalname,
  };
}

async function listReraDetails(userId) {
  return repository.findAllByUserId(userId);
}

async function createReraDetail(userId, payload, file) {
  if (!file) {
    throw new AppError("Supporting document is required", 400);
  }

  const existing = await repository.findByUserIdAndState(userId, payload.state);
  if (existing) {
    throw new AppError("RERA details for this state already exist", 409);
  }

  const data = {
    state: payload.state,
    rera_id: payload.reraId,
    validity_month: payload.validityMonth,
    validity_year: payload.validityYear,
    verification_link: payload.verificationLink || null,
    ...buildDocumentData(file),
  };

  return repository.create(userId, data);
}

async function updateReraDetail(userId, id, payload, file) {
  const existing = await repository.findByIdForUser(id, userId);
  if (!existing) {
    throw new AppError("RERA details not found", 404);
  }

  const duplicate = await repository.findByUserIdAndState(userId, payload.state, id);
  if (duplicate) {
    throw new AppError("RERA details for this state already exist", 409);
  }

  const data = {
    state: payload.state,
    rera_id: payload.reraId,
    validity_month: payload.validityMonth,
    validity_year: payload.validityYear,
    verification_link: payload.verificationLink || null,
    ...(file ? buildDocumentData(file) : {}),
  };

  return repository.update(id, data);
}

async function deleteReraDetail(userId, id) {
  const existing = await repository.findByIdForUser(id, userId);
  if (!existing) {
    throw new AppError("RERA details not found", 404);
  }

  await repository.remove(id, userId);
}

module.exports = {
  listReraDetails,
  createReraDetail,
  updateReraDetail,
  deleteReraDetail,
  AppError,
};
