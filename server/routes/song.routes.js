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
  getAlbumsByArtist,
  getSongSummaryById,
  getDownloadLink,
  deleteSong,
} = require("../controllers/song.controller");

router.post("/preview", multerUpload.single("song"), uploadFilePreview);
router.post("/save", multerUpload.single("song"), saveSong);

// Songs
router.get("/songs", getAllSongs);
router.get("/song/:id", getSongById);
// Song Details
router.get("/song_summary/:id", getSongSummaryById);

// Albums
router.get("/album/:albumId", getSongsByAlbum);

// Artists
router.get("/artist/:artistId/songs", getSongsByArtist);
router.get("/artist/:artistId/albums", getAlbumsByArtist);

// Download Link
router.get("/download/:id", getDownloadLink);

// Delete Song
router.delete("/delete_song/:id", deleteSong);

module.exports = router;
