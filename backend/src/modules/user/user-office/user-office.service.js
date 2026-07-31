const repository = require("./user-office.repository");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function saveOfficeDetails(userId, payload) {
  const data = {
    state: payload.state,
    city: payload.city,
    locality: payload.locality,
    address: payload.address || null,
    postal_code: payload.postalCode || null,
    contact_person_name: payload.contactPersonName,
    hide_person_name: payload.hidePersonName,
    agency_company_name: payload.agencyCompanyName,
    company_website: payload.companyWebsite || null,
    office_photos: payload.officePhotos,
  };

  return repository.upsertOfficeDetails(userId, data);
}

async function getOfficeDetails(userId) {
  const officeDetail = await repository.findByUserId(userId);
  if (!officeDetail) {
    throw new AppError("Office details not found", 404);
  }

  return officeDetail;
}

async function uploadContactPersonPhoto(userId, file) {
  if (!file) {
    throw new AppError("Contact person photo file is required", 400);
  }

  const contactPersonPhotoPath = `/uploads/contact-person-photos/${file.filename}`;
  return repository.upsertContactPersonPhoto(userId, contactPersonPhotoPath);
}

module.exports = { saveOfficeDetails, getOfficeDetails, uploadContactPersonPhoto, AppError };
