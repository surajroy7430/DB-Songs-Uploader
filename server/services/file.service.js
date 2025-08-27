const fs = require("fs");
const path = require("path");
const compressAudio = require("../utils/compressAudio");
const { uploadToS3, checkIfExistsInS3 } = require("../utils/s3Upload");

const handleAudioCompression = async (filePath, mimetype) => {
  try {
    let size = fs.statSync(filePath).size;

    console.log("file size before:", size);

    if (mimetype.startsWith("audio/")) {
      if (size >= 6 * 1024 * 1024) {
        try {
          const dir = path.dirname(filePath);
          const ext = path.extname(filePath);
          const base = path.basename(filePath, ext);
          const outputPath = path.join(dir, `${base}-compressed${ext}`);
          await compressAudio(filePath, outputPath);

          size = fs.statSync(outputPath).size;
          console.log("compressed to:", size);

          fs.unlinkSync(filePath);

          return { path: outputPath, size };
        } catch (error) {
          console.log("compressed failed:", error.message);
          return { path: filePath, size };
        }
      } else {
        console.log("skipped compression");
        return { path: filePath, size };
      }
    }

    return { path: filePath, size };
  } catch (error) {
    console.error("Error in handleAudioCompression:", error.message);
    return { path: filePath, size: 0 };
  }
};

const uploadSongToS3 = async (filePath, key, mimetype) => {
  try {
    const exists = await checkIfExistsInS3(key);

    if (!exists) {
      const buffer = fs.readFileSync(filePath);

      const songUrl = await uploadToS3({
        buffer,
        key,
        mimetype,
      });

      return songUrl;
    } else {
      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
  } catch (error) {
    console.error("Error in uploadSongToS3:", error.message);
    throw new Error("Failed to upload song to S3");
  }
};

module.exports = { handleAudioCompression, uploadSongToS3 };
