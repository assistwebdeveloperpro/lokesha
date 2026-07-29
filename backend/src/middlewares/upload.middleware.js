const fs = require("fs");
const path = require("path");
const multer = require("multer");

const OFFICE_PHOTOS_DIR = path.join(__dirname, "../../uploads/office-photos");
const MAX_OFFICE_PHOTOS = 10;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

fs.mkdirSync(OFFICE_PHOTOS_DIR, { recursive: true });

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

module.exports = { handleOfficePhotosUpload, OFFICE_PHOTOS_DIR };
