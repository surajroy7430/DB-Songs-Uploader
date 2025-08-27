const fs = require("fs");
const path = require("path");
const { Song, Album, Artist } = require("../models/song.model");
const { SongSummary } = require("../models/songSummary.model");
const { extractMetadata } = require("../services/metadata.service");
const {
  handleAudioCompression,
  uploadSongToS3,
} = require("../services/file.service");
const { extractAndUploadCover } = require("../services/coverImage.service");
const { saveSongToDB } = require("../services/song.service");
const { deleteFromS3, generateSignedUrl } = require("../utils/s3Upload");

const uploadFilePreview = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { path, size } = await handleAudioCompression(
      req.file.path,
      req.file.mimetype
    );
    const metadata = await extractMetadata(path, req.file.originalname);

    res.json({ ...metadata, fileSize: size, tempPath: path });
  } catch (error) {
    console.log("Error preview file", error.message);
    res.status(500).json({ error: "Failed to extract metadata" });
  }
};

const saveSong = async (req, res) => {
  let finalPath;

  try {
    const {
      tempPath,
      title,
      album: albumName,
      releasedYear,
      language,
      lyricsData,
      coverImageKey,
      albumCoverKey,
      clientCoverImageUrl,
      clientAlbumCoverUrl,
      singersInfo,
      ...rest
    } = req.body;

    if (!tempPath) return res.status(404).json({ error: "Missing file path" });

    finalPath = tempPath;

    // --------------- SONG KEY --------------------
    let songKey = path.basename(finalPath).replace("-compressed", "");
    songKey = `songs/${songKey}`;

    // ------------------- Check DB for Duplication -------------
    const existingSong = await Song.findOne({ title, releasedYear, language });

    if (existingSong) {
      return res
        .status(409)
        .json({ error: "Song already exists in DB", songId: existingSong._id });
    }

    // ------------------- Upload song to S3 (if not existed) --------------
    const songUrl = await uploadSongToS3(
      finalPath,
      songKey,
      req.file?.mimetype
    );

    // --------------- Cover Images -------------------
    const coverImageUrl = await extractAndUploadCover({
      filePath: finalPath,
      s3Key: coverImageKey,
      clientUrl: clientCoverImageUrl,
      checkExists: false,
    });
    const albumCoverUrl = await extractAndUploadCover({
      filePath: finalPath,
      s3Key: albumCoverKey,
      clientUrl: clientAlbumCoverUrl,
      checkExists: true,
    });

    // ------------- Parse Singers ------------------
    let artistsArray = [];
    if (typeof singersInfo === "string") {
      try {
        artistsArray = JSON.parse(singersInfo);
      } catch {
        artistsArray = [];
      }
    } else if (Array.isArray(singersInfo)) {
      artistsArray = singersInfo;
    }

    // --------------- Parse Lyrics ----------------
    let parsedLyricsData = {};
    if (lyricsData) {
      try {
        parsedLyricsData =
          typeof lyricsData === "string" ? JSON.parse(lyricsData) : lyricsData;
      } catch (error) {
        parsedLyricsData = {};
      }
    }

    // ----------------- DB SAVE -------------------
    const songId = await saveSongToDB({
      ...rest,
      title,
      albumName,
      releasedYear,
      language,
      songKey,
      songUrl,
      coverImageUrl,
      albumCoverUrl,
      artistsArray,
      lyricsData: parsedLyricsData,
    });

    res.status(201).json({ message: "Song Saved Successfully", songId });
  } catch (error) {
    console.error("error save song from backend", error);
    res.status(500).json({ error: "Failed to save song" });
  } finally {
    const deleteFile = (path) => {
      if (!path) return;
      try {
        fs.unlinkSync(path);
      } catch (error) {}
    };
    deleteFile(finalPath);
    deleteFile(req.file.path);
  }
};

const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find()
      .populate("album", "name")
      .populate("artists", "name");

    res.json({ count: songs.length, songs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("album", "name")
      .populate("artists", "name");

    if (!song) return res.status(404).json({ error: "Song Not Found" });

    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSongsByAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.albumId).populate({
      path: "songs",
      populate: [
        { path: "album", select: "name" },
        { path: "artists", select: "name" },
      ],
    });

    if (!album) return res.status(404).json({ error: "Album Not Found" });

    res.json({
      album: {
        _id: album._id,
        name: album.name,
        releaseYear: album.releaseYear,
        albumCoverUrl: album.albumCoverUrl,
      },
      songs: album.songs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSongsByArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.artistId).populate({
      path: "songs",
      populate: [
        { path: "album", select: "name" },
        { path: "artists", select: "name" },
      ],
    });

    if (!artist) return res.status(404).json({ error: "Artist Not Found" });

    res.json({
      artist: {
        _id: artist._id,
        name: artist.name,
        bio: artist.bio,
        artistCoverUrl: artist.artistCoverUrl,
      },
      songs: artist.songs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSongSummaryById = async (req, res) => {
  try {
    const summary = await SongSummary.findById(req.params.id).populate({
      path: "song",
      populate: [
        { path: "album", select: "name" },
        { path: "artists", select: "name artistCoverUrl" },
      ],
    });

    if (!summary)
      return res.status(404).json({ error: "Song Summary Not Found" });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDownloadLink = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song || !song.songUrl)
      return res
        .status(404)
        .json({ error: "Song not found or no url available" });

    const songKey = song.songUrl.split("/").pop();

    const downloadUrl = await generateSignedUrl(`songs/${songKey}`, {
      ResponseContentDisposition: `attachment; filename="${songKey}"`,
    });

    res.status(201).json({ downloadUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ error: "Song not found" });

    // Delete from aws s3
    if (song.songUrl) {
      const songKey = song.songUrl.split("/").pop();
      await deleteFromS3(`songs/${songKey}`);
    }
    if (song.coverImageUrl) {
      const coverKey = song.coverImageUrl.split("/").pop();
      await deleteFromS3(`covers/${coverKey}`);
    }

    // Handle Artists
    const artists = await Artist.find({ songs: song._id });
    for (const artist of artists) {
      if (
        artist.songs.length === 1 &&
        artist.songs[0].toString() === song._id.toString()
      ) {
        // delete from db
        await Artist.findByIdAndDelete(artist._id);
      } else {
        // remove song reference
        await Artist.findByIdAndUpdate(artist._id, {
          $pull: { songs: song._id },
        });
      }
    }

    // Handle Album
    if (song.album) {
      const album = await Album.findById(song.album);
      if (album) {
        if (
          album.songs.length === 1 &&
          album.songs[0].toString() === song._id.toString()
        ) {
          // delete cover from s3
          if (album.albumCoverUrl) {
            const albumKey = album.albumCoverUrl.split("/").pop();
            await deleteFromS3(`albums/${albumKey}`);
          }
          // delete from db
          await Album.findByIdAndDelete(album._id);
        } else {
          // remove song reference
          await Album.findByIdAndUpdate(album._id, {
            $pull: { songs: song._id },
          });
        }
      }
    }

    // Delete the song summary
    await SongSummary.deleteMany({ song: song._id });
    // Delete the song document
    await song.deleteOne();

    res.json({ message: "Song deleted successfully", song: song.title });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete song" });
  }
};

module.exports = {
  uploadFilePreview,
  saveSong,
  getAllSongs,
  getSongById,
  getSongsByAlbum,
  getSongsByArtist,
  getSongSummaryById,
  getDownloadLink,
  deleteSong,
};
