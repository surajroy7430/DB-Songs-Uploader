const compressAudio = require("../utils/compressAudio");
const { uploadToS3, checkIfExistsInS3 } = require("../utils/s3Upload");

const handleAudioCompression = async (file) => {
  try {
    let buffer = file.buffer;
    let size = buffer.length || 0;

    console.log("file size before:", size);

    if (file.mimetype.startsWith("audio/")) {
      if (size >= 6 * 1024 * 1024) {
        try {
          buffer = await compressAudio(buffer);
          size = buffer.length;
          console.log("compressed to:", size);
        } catch (error) {
          console.log("compressed failed:", error.message);
        }
      } else {
        console.log("skipped compression");
      }
    }

    return { buffer, size };
  } catch (error) {
    console.error("Error in handleAudioCompression:", error.message);
    return { buffer: file.buffer, size: file.buffer.length || 0 };
  }
};

const uploadSongToS3 = async (file, key) => {
  try {
    const exists = await checkIfExistsInS3(key);

    if (!exists) {
      const songUrl = await uploadToS3({
        buffer: file.buffer,
        key: key,
        mimetype: file.mimetype,
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
