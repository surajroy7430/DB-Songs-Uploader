const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    let songKey = file.originalname
      .toLowerCase()
      .replace(/\s*\(.*?\)|\s*\[.*?\]|\s*\{.*?\}/g, "") // remove brackets data
      .replace(/[\s_,]+/g, "-") // replace spaces/commas/underscores with "-"
      .replace(/-+/g, "-") // collapse multiple dashes
      .trim();

    cb(null, songKey);
  },
});

const multerUpload = multer({ storage });

module.exports = multerUpload;
