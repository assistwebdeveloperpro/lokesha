const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

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

const {
  LIMITS: PROPERTY_LIMITS,
  STORAGE: PROPERTY_STORAGE,
  UPLOAD_MIME_TYPES: PROPERTY_MIME_TYPES,
} = require("../modules/landing/property/property.constants");
const { compressUploadedImage } = require("../utils/image-compress");

const PROPERTY_MAX_FILE_BYTES = {
  media: PROPERTY_LIMITS.maxMediaBytes,
  "floor-plan": PROPERTY_LIMITS.maxFloorPlanBytes,
  brochure: PROPERTY_LIMITS.maxBrochureBytes,
};

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

function createPropertyUpload(kind, resolveDestination) {
  const mimeTypes = PROPERTY_MIME_TYPES[kind];

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const destination = resolveDestination(req);
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
      },
      filename: (req, file, cb) =>
        cb(null, `${kind}-${crypto.randomUUID()}${mimeTypes[file.mimetype]}`),
    }),
    fileFilter: (req, file, cb) => {
      if (!mimeTypes[file.mimetype]) {
        return cb(new Error("This file format is not allowed"));
      }
      cb(null, true);
    },
    limits: { fileSize: PROPERTY_MAX_FILE_BYTES[kind], files: 1 },
  }).single("file");
}

function createPropertyUploadHandler(resolveDestination, resolveKind) {
  const uploads = Object.fromEntries(
    Object.keys(PROPERTY_MIME_TYPES).map((kind) => [
      kind,
      createPropertyUpload(kind, resolveDestination),
    ])
  );

  // The kind is validated by the route before this runs
  return (req, res, next) => {
    uploads[resolveKind(req)](req, res, async (error) => {
      if (error) {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        return res.status(status).json({ message: error.message || "File upload failed" });
      }

      try {
        if (req.file) await compressUploadedImage(req.file);
      } catch (compressError) {
        // An uncompressed upload is still valid, so keep the original
        console.error("Image compression failed:", compressError.message);
      }
      next();
    });
  };
}

const queryKind = (req) => req.validatedQuery.kind;

const handleDraftFileUpload = createPropertyUploadHandler(
  (req) => path.join(PROPERTY_STORAGE.tempDraftsDir, req.params.id),
  queryKind
);

// Posted listings keep their files in the public property folder
const handlePropertyFileUpload = createPropertyUploadHandler(
  (req) => path.join(PROPERTY_STORAGE.propertiesDir, req.params.id),
  queryKind
);

const handleFloorPlanUpload = createPropertyUploadHandler(
  (req) => path.join(PROPERTY_STORAGE.propertiesDir, req.params.id),
  () => "floor-plan"
);

module.exports = {
  handleDraftFileUpload,
  handlePropertyFileUpload,
  handleFloorPlanUpload,
  handleOfficePhotosUpload,
  OFFICE_PHOTOS_DIR,
  handleReraDocumentUpload,
  RERA_DOCUMENTS_DIR,
  handleCompanyLogoUpload,
  COMPANY_LOGOS_DIR,
  handleContactPersonPhotoUpload,
  CONTACT_PERSON_PHOTOS_DIR,
};
