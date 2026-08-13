const { Song, Artist, Album, Genre, Label } = require("../models/song.model");
const { formatDuration, formatArtists } = require("../utils/utils");
const { SongSummary } = require("../models/songSummary.model");

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
  labelData,
  lyricsData,
  songUrl,
  coverImageUrl,
  albumCoverUrl,
  songKey,
}) => {
  try {
    // Handle Artists
    const artistIds = await Promise.all(
      artistsArray.map(async ({ name, role, bio, imageUrl }) => {
        let artist = await Artist.findOne({ name });
        if (!artist) {
          artist = await Artist.create({
            name,
            role: role || "",
            bio: bio || "",
            artistCoverUrl: imageUrl || "",
            songs: [],
            albums: [],
          });
        } else {
          if (role) artist.role = role;
          if (bio) artist.bio = bio;
          if (imageUrl) artist.artistCoverUrl = imageUrl;

          await artist.save();
        }
        return artist._id;
      }),
    );

    // Handle Label
    let labelId = null;
    if (labelData?.name) {
      let label = await Label.findOne({ name: labelData.name });
      if (!label) {
        label = await Label.create({
          name: labelData.name,
          logoUrl: labelData.logoUrl || "",
          copyright: labelData.copyright || "",
          songs: [],
          albums: [],
        });
      } else {
        let changed = false;
        if (labelData.logoUrl && labelData.logoUrl !== label.logoUrl) {
          label.logoUrl = labelData.logoUrl;
          changed = true;
        }
        if (
          labelData.copyright &&
          labelData.copyright !== label.copyright
        ) {
          label.copyright = labelData.copyright;
          changed = true;
        }
        if (changed) await label.save();
      }
      labelId = label._id;
    }

    // Handle Album
    let album = await Album.findOne({ name: albumName });
    if (!album) {
      album = await Album.create({
        name: albumName,
        songs: [],
        artists: artistIds,
        releaseYear: releasedYear,
        albumCoverUrl,
        label: labelId,
      });
    } else {
      await Album.updateOne(
        { _id: album._id },
        { $addToSet: { artists: { $each: artistIds } } },
      );
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

    // Update Artists + Album + Label
    await Promise.all([
      Artist.updateMany(
        { _id: { $in: artistIds } },
        { $addToSet: { songs: song._id, albums: albumId } },
      ),
      Album.findByIdAndUpdate(albumId, { $addToSet: { songs: song._id } }),
      labelId
        ? Label.findByIdAndUpdate(labelId, {
            $addToSet: { songs: song._id, albums: albumId },
          })
        : Promise.resolve(),
    ]);

    // Genre Handling
    const genreList = Array.isArray(genre)
      ? genre
      : typeof genre === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(genre);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [genre];
            }
          })()
        : [];

    const normalizedGenres = genreList
      .map((g) => String(g).trim())
      .filter(Boolean);

    await Promise.all(
      normalizedGenres.map(async (genreName) => {
        await Genre.findOneAndUpdate(
          { genre_name: genreName },
          {
            $addToSet: {
              songs: song._id,
            },
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          },
        );
      }),
    );

    // Song Summary
    const artistNames = formatArtists(artistsArray, 4);
    const descriptionData = {
      about: `About ${title}`,
      description: `${title} is a ${language} language song performed by ${artistNames}. The track is from the album ${albumName}, which was released in ${releasedYear}. The duration of the song is ${formatDuration(
        duration,
      )}. Listen to ${title} online. `,
    };

    const playCount = Math.floor(Math.random() * (24626 - 5335 + 1)) + 5335;

    await SongSummary.create({
      _id: song._id,
      song: song._id,
      fileSize,
      playCount,
      genre,
      label: labelId,
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
