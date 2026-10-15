const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {
  MAX_MEDIA_FILES,
  MAX_MEDIA_SIZE_BYTES,
  MAX_BROCHURE_SIZE_BYTES,
  MEDIA_MIME_TYPES,
  MEDIA_EXTENSIONS,
} = require("../../../landing/property/property.constants");
const {
  MAX_FLOOR_PLANS,
  MAX_FLOOR_PLAN_SIZE_BYTES,
  FLOOR_PLAN_MIME_TYPES,
  FLOOR_PLAN_EXTENSIONS,
} = require("./admin-post-property.constants");

const UPLOADS_ROOT = path.join(__dirname, "../../../../../uploads");
const MEDIA_DIR = path.join(UPLOADS_ROOT, "property-media");
const BROCHURES_DIR = path.join(UPLOADS_ROOT, "property-brochures");
const FLOOR_PLANS_DIR = path.join(UPLOADS_ROOT, "property-floor-plans");

[MEDIA_DIR, BROCHURES_DIR, FLOOR_PLANS_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

const DESTINATIONS = {
  media: MEDIA_DIR,
  brochure: BROCHURES_DIR,
  floorPlans: FLOOR_PLANS_DIR,
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DESTINATIONS[file.fieldname]),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

// heic often arrives with an empty or generic mime type
function isHeicWithoutMime(ext, file) {
  return ext === ".heic" && (!file.mimetype || file.mimetype === "application/octet-stream");
}

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "brochure") {
    if (file.mimetype !== "application/pdf" || ext !== ".pdf") {
      return cb(new Error("Brochure must be a PDF file"));
    }
    return cb(null, true);
  }

  if (file.fieldname === "floorPlans") {
    const validMime = FLOOR_PLAN_MIME_TYPES.includes(file.mimetype) || isHeicWithoutMime(ext, file);
    if (!FLOOR_PLAN_EXTENSIONS.includes(ext) || !validMime) {
      return cb(new Error("Floor plans must be jpg, jpeg, png, or heic files"));
    }
    return cb(null, true);
  }

  const validMime = MEDIA_MIME_TYPES.includes(file.mimetype) || isHeicWithoutMime(ext, file);
  if (!MEDIA_EXTENSIONS.includes(ext) || !validMime) {
    return cb(new Error("Only jpg, jpeg, png, heic, and mp4 files are allowed"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BROCHURE_SIZE_BYTES, files: MAX_MEDIA_FILES + MAX_FLOOR_PLANS + 1 },
}).fields([
  { name: "media", maxCount: MAX_MEDIA_FILES },
  { name: "brochure", maxCount: 1 },
  { name: "floorPlans", maxCount: MAX_FLOOR_PLANS },
]);

// Media and floor plan caps are lower than the brochure cap, so they are enforced per file here
function handleAdminPropertyUpload(req, res, next) {
  upload(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || "File upload failed" });
    }

    if ((req.files?.media || []).some((file) => file.size > MAX_MEDIA_SIZE_BYTES)) {
      return res.status(400).json({ message: "Each photo or video must be 50 MB or smaller" });
    }
    if ((req.files?.floorPlans || []).some((file) => file.size > MAX_FLOOR_PLAN_SIZE_BYTES)) {
      return res.status(400).json({ message: "Each floor plan must be 10 MB or smaller" });
    }
    next();
  });
}

module.exports = { handleAdminPropertyUpload };
