const musicMetadata = require("music-metadata");
const sharp = require("sharp");
const { getFormatedDate, sanitizeName } = require("../utils/utils");

const extractMetadata = async (fileBuffer, fileName) => {
  try {
    const metadata = await musicMetadata.parseBuffer(fileBuffer);

    const fileBaseName = fileName
      .toLowerCase()
      .replace(/\s*\(.*?\)|\s*\[.*?\]|\s*\{.*?\}/g, "") // remove brackets
      .replace(/[\s_,]+/g, "-") // replace spaces/commas/underscores with "-"
      .replace(/-+/g, "-") // collapse multiple dashes
      .replace(/\.[a-zA-Z0-9]+$/, "") // string extension
      .trim();

      
    const title = metadata?.common?.title || fileBaseName;
    const album = metadata?.common?.album || "";
    const artists = metadata?.common?.artists || [];
    const releasedYear = metadata.common?.year || null;
    const genre = metadata.common?.genre || [];
    const language = metadata.common?.language || "";
    const duration = metadata.format?.duration || 0;
    const type = fileName.split(".").pop();
      
    let coverImageKey = null;
    let albumCoverKey = null;
    const newTitle = sanitizeName(title);
    const newAlbum = sanitizeName(album);

    if (metadata?.common?.picture?.length) {
      try {
        const img = metadata.common.picture[0];
        const imageExt = img.format.split("/")[1] || "jpg";
        const { width, height } = await sharp(img.data).metadata();

        coverImageKey = `covers/${newTitle}-${language}-${releasedYear}-${getFormatedDate()}-${width}x${height}.${imageExt}`;
        albumCoverKey = `albums/${newAlbum}-${language}-${releasedYear}-${width}x${height}.${imageExt}`;
      } catch (error) {
        console.error("Error processing cover image:", error.message);
      }

      return {
        title,
        album,
        artists,
        releasedYear,
        genre,
        language,
        duration,
        type,
        coverImageKey,
        albumCoverKey,
      };
    }
  } catch (error) {
    console.error("Error extracting metadata:", error.message);
    return {
      title: fileName.replace(/\.[a-zA-Z0-9]+$/, ""),
      album: "",
      artists: [],
      releasedYear: null,
      genre: [],
      language: "",
      duration: 0,
      type: fileName.split(".").pop(),
      coverImageKey: null,
      albumCoverKey: null,
    };
  }
};

module.exports = { extractMetadata };
