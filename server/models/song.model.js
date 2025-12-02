const mongoose = require("mongoose");

// Artists Schema
const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: String,
    artistCoverUrl: String,
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: "Album" }],
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  },
  { collection: "Artists", timestamps: true }
);
const Artist = mongoose.model("Artist", artistSchema);

// Album Schema
const albumSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    releaseYear: Number,
    albumCoverUrl: String,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  },
  { collection: "Albums", timestamps: true }
);
const Album = mongoose.model("Album", albumSchema);

// Genre Schema
const genreSchema = new mongoose.Schema(
  {
    genre_name: { type: String, required: true, unique: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  },
  { collection: "Genres", timestamps: true }
);
const Genre = mongoose.model("Genre", genreSchema);

// Song Schema
const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist" }],
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
    language: { type: String, required: true },
    type: { type: String, default: "mp3" },
    duration: { type: Number, required: true },
    releasedYear: { type: Number, required: true },
    songUrl: { type: String, required: true, unique: true },
    coverImageUrl: String,
  },
  { collection: "Songs", timestamps: true }
);

songSchema.index({ title: 1, releasedYear: 1, language: 1 }, { unique: true });

const Song = mongoose.model("Song", songSchema);

module.exports = { Song, Album, Artist, Genre };
