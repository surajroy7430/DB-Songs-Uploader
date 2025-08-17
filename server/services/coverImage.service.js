const musicMetadata = require("music-metadata");
const { uploadToS3, checkIfExistsInS3 } = require("../utils/s3Upload");

const handleCoverImage = async (
  reqFile,
  coverImageKey,
  clientCoverImageUrl
) => {
  try {
    let coverImageUrl = null;
    if (!reqFile) return coverImageUrl;

    const metadata = await musicMetadata.parseBuffer(reqFile.buffer);

    if (coverImageKey && reqFile) {
      try {
        if (metadata.common?.picture?.length) {
          const img = metadata.common.picture[0];
          await uploadToS3({
            buffer: img.data,
            key: coverImageKey,
            mimetype: img.format,
          });
          coverImageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${coverImageKey}`;
        }
      } catch (error) {
        console.error("Error uploading cover image:", error.message);
        return coverImageUrl;
      }
    } else if (!coverImageKey && clientCoverImageUrl) {
      coverImageUrl = clientCoverImageUrl;
    }

    return coverImageUrl;
  } catch (error) {
    console.error("Error handling cover image:", error.message);
    return coverImageKey;
  }
};

const handleAlbumCover = async (
  reqFile,
  albumCoverKey,
  clientAlbumCoverUrl
) => {
  try {
    let albumCoverUrl = null;
    if (!reqFile) return albumCoverUrl;

    const metadata = await musicMetadata.parseBuffer(reqFile.buffer);

    if (albumCoverKey && reqFile) {
      try {
        if (metadata.common?.picture?.length) {
          const img = metadata.common.picture[0];
          const exists = await checkIfExistsInS3(albumCoverKey);
          if (!exists) {
            await uploadToS3({
              buffer: img.data,
              key: albumCoverKey,
              mimetype: img.format,
            });
          }
          albumCoverUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${albumCoverKey}`;
        }
      } catch (error) {
        console.error("Error uploading album cover:", error.message);
        return albumCoverUrl;
      }
    } else if (!albumCoverKey && clientAlbumCoverUrl) {
      albumCoverUrl = clientAlbumCoverUrl;
    }

    return albumCoverUrl;
  } catch (error) {
    console.error("Error handling album cover:", error.message);
    return albumCoverKey;
  }
};

module.exports = { handleCoverImage, handleAlbumCover };
