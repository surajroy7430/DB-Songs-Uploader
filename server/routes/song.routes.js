const express = require("express");
const multerUpload = require("../middlewares/upload.middleware");
const router = express.Router();
const {
  uploadFilePreview,
  getAllSongs,
  saveSong,
  getSongById,
  getSongsByAlbum,
  getSongsByArtist,
  getSongSummaryById,
  getDownloadLink,
  deleteSong,
} = require("../controllers/song.controller");

router.post("/preview", multerUpload.single("song"), uploadFilePreview);
router.post("/save", multerUpload.single("song"), saveSong);

router.get("/songs", getAllSongs);
router.get("/song/:id", getSongById);

router.get("/album/:albumId", getSongsByAlbum);
router.get("/artist/:artistId", getSongsByArtist);
router.get("/song_summary/:id", getSongSummaryById);

router.get("/download/:id", getDownloadLink);

router.delete("/delete_song/:id", deleteSong);

module.exports = router;
