const fs = require("fs/promises");
const sharp = require("sharp");

const MAX_DIMENSION_PX = 1920;
const JPEG_QUALITY = 80;
const PNG_COMPRESSION_LEVEL = 9;
const PNG_PALETTE_QUALITY = 80;

// Formats sharp can re-encode without changing the file extension
const COMPRESSORS = {
  "image/jpeg": (image) => image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }),
  "image/png": (image) =>
    image.png({
      compressionLevel: PNG_COMPRESSION_LEVEL,
      palette: true,
      quality: PNG_PALETTE_QUALITY,
    }),
  "image/webp": (image) => image.webp({ quality: JPEG_QUALITY }),
};

// Compresses an uploaded image in place; other file types are left untouched
async function compressUploadedImage(file) {
  const compress = COMPRESSORS[file.mimetype];
  if (!compress) return file;

  const original = await fs.readFile(file.path);
  const resized = sharp(original, { failOn: "none" })
    .rotate()
    .resize({
      width: MAX_DIMENSION_PX,
      height: MAX_DIMENSION_PX,
      fit: "inside",
      withoutEnlargement: true,
    });
  const compressed = await compress(resized).toBuffer();

  // Keep the original when re-encoding does not make it smaller
  if (compressed.length >= original.length) return file;

  await fs.writeFile(file.path, compressed);
  file.size = compressed.length;
  return file;
}

module.exports = { compressUploadedImage };
