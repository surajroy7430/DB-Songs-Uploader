const mongoose = require("mongoose");

// Song Summaries Schema
const songSummarySchema = new mongoose.Schema(
  {
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
    fileSize: Number,
    playCount: Number,
    genre: [String],
    copyright: String,
    lyricsData: {
      hasLyrics: { type: Boolean, default: false },
      lyrics: [String],
      writers: String,
      poweredBy: String,
    },
    descriptionData: {
      about: String,
      description: String,
    },
    key: String,
  },
  { collection: "SongSummaries", timestamps: true }
);

songSummarySchema.pre("save", function (next) {
  if (!this.lyricsData.hasLyrics) {
    this.lyricsData.hasLyrics = undefined;
    this.lyricsData.writers = undefined;
    this.lyricsData.poweredBy = undefined;
  }
  next();
});

const SongSummary = mongoose.model("SongSummary", songSummarySchema);

module.exports = { SongSummary };
