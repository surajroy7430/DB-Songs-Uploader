const getFormatedDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  const randomNum = String(Math.floor(100000 + Math.random() * 900000)); // Generates 6-digit random number

  return `${year}${month}${day}${randomNum}`;
};

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const sanitizeName = (str) => {
  return str
    .replace(/\s*\(.*?\)|\s*\[.*?\]|\s*\{.*?\}/g, "") // remove brackets texts
    .replace(/\./g, "") // remove dots
    .replace(/[\s_,]+/g, "-") // replace spaces/commas/underscores with "-"
    .replace(/-+/g, "-") // collapse multiple dashes
    .trim();
};

const formatArtists = (artists, limit = 4) => {
  if (!artists || artists.length === 0) return "";

  const names = artists.map(a => a.name);

  // If number of names is small → natural language formatting
  if (names.length <= limit) {
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  }

  // More than limit → show first (limit - 1) and "others"
  return `${names.slice(0, limit - 1).join(", ")}, and others`;
};

module.exports = { getFormatedDate, formatDuration, sanitizeName, formatArtists };
