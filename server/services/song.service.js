const { Song, Artist, Album } = require("../models/song.model");
const { SongSummary } = require("../models/songSummary.model");
const { formatDuration } = require("../utils/utils");

const saveSongToDB = async ({
  title,
  albumName,
  artistsArray,
  language,
  duration,
  fileSize,
  releasedYear,
  genre,
  type,
  copyright,
  lyricsData,
  songUrl,
  coverImageUrl,
  albumCoverUrl,
  songKey,
}) => {
  try {
    // Handle Artists
    const artistIds = await Promise.all(
      artistsArray.map(async ({ name, bio, imageUrl }) => {
        let artist = await Artist.findOne({ name });
        if (!artist) {
          artist = await Artist.create({
            name,
            bio: bio || "",
            artistCoverUrl: imageUrl || "",
            songs: [],
            albums: []
          });
        } else {
          if (bio) artist.bio = bio;
          if (imageUrl) artist.artistCoverUrl = imageUrl;

          await artist.save();
        }
        return artist._id;
      })
    );

    // Handle Album
    let album = await Album.findOne({ name: albumName });
    if (!album) {
      album = await Album.create({
        name: albumName,
        songs: [],
        releaseYear: releasedYear,
        albumCoverUrl,
      });
    }
    const albumId = album._id;

    // Create Song
    const song = await Song.create({
      title,
      artists: artistIds,
      album: albumId,
      language,
      duration,
      releasedYear,
      type,
      songUrl,
      coverImageUrl,
      key: songKey,
    });

    // Update Preference
    await Promise.all([
      Artist.updateMany(
        { _id: { $in: artistIds } },
        { $addToSet: { songs: song._id, albums: albumId } }
      ),
      Album.findByIdAndUpdate(albumId, { $addToSet: { songs: song._id } }),
    ]);

    // Song Summary
    const artistNames = artistsArray.map((s) => s.name).join(", ");
    const descriptionData = {
      about: `About ${title}`,
      description: `Listen to ${title} online. ${title} is a ${language} language song and is sung by ${artistNames}. ${title}, from the album ${albumName}, was released in the year ${releasedYear}. The duration of the song is ${formatDuration(
        duration
      )}.`,
    };

    const playCount = Math.floor(Math.random() * (24626 - 5335 + 1)) + 5335;

    await SongSummary.create({
      _id: song._id,
      song: song._id,
      fileSize,
      playCount,
      genre,
      copyright,
      lyricsData,
      descriptionData,
    });

    return song._id;
  } catch (error) {
    console.error("Error saving song to DB:", error.message);
    throw new Error("Failed to save song to database");
  }
};

module.exports = { saveSongToDB };
