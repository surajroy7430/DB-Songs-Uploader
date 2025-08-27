const musicMetadata = require("music-metadata");
const { uploadToS3, checkIfExistsInS3 } = require("../utils/s3Upload");

const extractAndUploadCover = async ({
  filePath,
  s3Key,
  clientUrl,
  checkExists,
}) => {
  let coverUrl = null;
  if (!filePath) return coverUrl;

  try {
    const metadata = await musicMetadata.parseFile(filePath);

    if (s3Key && filePath) {
      if (metadata.common?.picture?.length) {
        const img = metadata.common.picture[0];

        if (checkExists) {
          const exists = await checkIfExistsInS3(s3Key);
          if (!exists) {
            await uploadToS3({
              buffer: img.data,
              key: s3Key,
              mimetype: img.format,
            });
          }
        } else {
          await uploadToS3({
            buffer: img.data,
            key: s3Key,
            mimetype: img.format,
          });
        }
        coverUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      }
    } else if (!s3Key && clientUrl) {
      coverUrl = clientUrl;
    }

    return coverUrl;
  } catch (error) {
    console.error("Error uploading cover image:", error.message);
    return s3Key || null;
  }
};

module.exports = { extractAndUploadCover };
