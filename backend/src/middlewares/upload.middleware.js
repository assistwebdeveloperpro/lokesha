const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {
  MAX_MEDIA_FILES,
  MAX_MEDIA_SIZE_BYTES,
  MAX_BROCHURE_SIZE_BYTES,
  MEDIA_MIME_TYPES,
  MEDIA_EXTENSIONS,
} = require("../modules/property/property.constants");

const OFFICE_PHOTOS_DIR = path.join(__dirname, "../../uploads/office-photos");
const MAX_OFFICE_PHOTOS = 10;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

const RERA_DOCUMENTS_DIR = path.join(__dirname, "../../uploads/rera-documents");
const MAX_RERA_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_RERA_DOCUMENT_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const COMPANY_LOGOS_DIR = path.join(__dirname, "../../uploads/company-logos");
const CONTACT_PERSON_PHOTOS_DIR = path.join(__dirname, "../../uploads/contact-person-photos");
const MAX_PROFILE_PHOTO_SIZE_BYTES = 1 * 1024 * 1024;
const ALLOWED_PROFILE_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
];

const PROPERTY_MEDIA_DIR = path.join(__dirname, "../../uploads/property-media");
const PROPERTY_BROCHURES_DIR = path.join(__dirname, "../../uploads/property-brochures");

fs.mkdirSync(PROPERTY_MEDIA_DIR, { recursive: true });
fs.mkdirSync(PROPERTY_BROCHURES_DIR, { recursive: true });
fs.mkdirSync(OFFICE_PHOTOS_DIR, { recursive: true });
fs.mkdirSync(RERA_DOCUMENTS_DIR, { recursive: true });
fs.mkdirSync(COMPANY_LOGOS_DIR, { recursive: true });
fs.mkdirSync(CONTACT_PERSON_PHOTOS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, OFFICE_PHOTOS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only jpeg, jpg, png, and gif formats are allowed"));
  }
  cb(null, true);
}

const officePhotosUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_OFFICE_PHOTOS },
}).array("officePhotos", MAX_OFFICE_PHOTOS);

function handleOfficePhotosUpload(req, res, next) {
  officePhotosUpload(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || "File upload failed" });
    }
    next();
  });
}

const reraDocumentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RERA_DOCUMENTS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

function reraDocumentFileFilter(req, file, cb) {
  if (!ALLOWED_RERA_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only jpeg, pdf, or doc files are allowed"));
  }
  cb(null, true);
}

const reraDocumentUpload = multer({
  storage: reraDocumentStorage,
  fileFilter: reraDocumentFileFilter,
  limits: { fileSize: MAX_RERA_DOCUMENT_SIZE_BYTES },
}).single("document");

function handleReraDocumentUpload(req, res, next) {
  reraDocumentUpload(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || "File upload failed" });
    }
    next();
  });
}

function profilePhotoFileFilter(req, file, cb) {
  if (!ALLOWED_PROFILE_PHOTO_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only jpg, gif, png, and bmp formats are allowed"));
  }
  cb(null, true);
}

function createProfilePhotoStorage(destination) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });
}

const companyLogoUpload = multer({
  storage: createProfilePhotoStorage(COMPANY_LOGOS_DIR),
  fileFilter: profilePhotoFileFilter,
  limits: { fileSize: MAX_PROFILE_PHOTO_SIZE_BYTES },
}).single("companyLogo");

function handleCompanyLogoUpload(req, res, next) {
  companyLogoUpload(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || "File upload failed" });
    }
    next();
  });
}

const contactPersonPhotoUpload = multer({
  storage: createProfilePhotoStorage(CONTACT_PERSON_PHOTOS_DIR),
  fileFilter: profilePhotoFileFilter,
  limits: { fileSize: MAX_PROFILE_PHOTO_SIZE_BYTES },
}).single("contactPersonPhoto");

function handleContactPersonPhotoUpload(req, res, next) {
  contactPersonPhotoUpload(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || "File upload failed" });
    }
    next();
  });
}

const propertyStorage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, file.fieldname === "brochure" ? PROPERTY_BROCHURES_DIR : PROPERTY_MEDIA_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

function propertyFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "brochure") {
    if (file.mimetype !== "application/pdf" || ext !== ".pdf") {
      return cb(new Error("Brochure must be a PDF file"));
    }
    return cb(null, true);
  }

  // heic often arrives with an empty or generic mime type
  const isHeicByExt =
    ext === ".heic" && (!file.mimetype || file.mimetype === "application/octet-stream");
  if (!MEDIA_EXTENSIONS.includes(ext) || !(MEDIA_MIME_TYPES.includes(file.mimetype) || isHeicByExt)) {
    return cb(new Error("Only jpg, jpeg, png, heic, and mp4 files are allowed"));
  }
  cb(null, true);
}

const propertyUpload = multer({
  storage: propertyStorage,
  fileFilter: propertyFileFilter,
  limits: { fileSize: MAX_BROCHURE_SIZE_BYTES, files: MAX_MEDIA_FILES + 1 },
}).fields([
  { name: "media", maxCount: MAX_MEDIA_FILES },
  { name: "brochure", maxCount: 1 },
]);

// Media cap is lower than the brochure cap, so it is enforced per file here
function handlePropertyUpload(req, res, next) {
  propertyUpload(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || "File upload failed" });
    }

    const oversized = (req.files?.media || []).some((file) => file.size > MAX_MEDIA_SIZE_BYTES);
    if (oversized) {
      return res.status(400).json({ message: "Each photo or video must be 50 MB or smaller" });
    }
    next();
  });
}

module.exports = {
  handlePropertyUpload,
  PROPERTY_MEDIA_DIR,
  PROPERTY_BROCHURES_DIR,
  handleOfficePhotosUpload,
  OFFICE_PHOTOS_DIR,
  handleReraDocumentUpload,
  RERA_DOCUMENTS_DIR,
  handleCompanyLogoUpload,
  COMPANY_LOGOS_DIR,
  handleContactPersonPhotoUpload,
  CONTACT_PERSON_PHOTOS_DIR,
};
