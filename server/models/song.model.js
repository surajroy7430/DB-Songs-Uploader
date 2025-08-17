const mongoose = require("mongoose");

// Artists Schema
const artistSchema = new mongoose.Schema(
  {
    name: String,
    bio: String,
    artistCoverUrl: String,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  },
  { collection: "Artists", timestamps: true }
);
const Artist = mongoose.model("Artist", artistSchema);

// Album Schema
const albumSchema = new mongoose.Schema(
  {
    name: String,
    releaseYear: Number,
    albumCoverUrl: String,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  },
  { collection: "Albums", timestamps: true }
);
const Album = mongoose.model("Album", albumSchema);

// Song Schema
const songSchema = new mongoose.Schema(
  {
    title: String,
    artists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist" }],
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
    language: String,
    type: String,
    duration: Number,
    releasedYear: Number,
    songUrl: String,
    coverImageUrl: String,
  },
  { collection: "Songs", timestamps: true }
);
const Song = mongoose.model("Song", songSchema);

module.exports = { Song, Album, Artist };
