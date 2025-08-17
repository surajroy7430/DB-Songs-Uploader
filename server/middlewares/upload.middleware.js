const multer = require("multer");

const multerUpload = multer({ storage: multer.memoryStorage() });

module.exports = multerUpload;
