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
    .toLowerCase()
    .replace(/\s*\(.*?\)|\s*\[.*?\]|\s*\{.*?\}/g, "") // remove brackets with data
    .replace(/\./g, "") // remove dots
    .replace(/[\s_,]+/g, "-") // replace spaces/commas/underscores with "-"
    .replace(/-+/g, "-") // collapse multiple dashes
    .trim();
};

module.exports = { getFormatedDate, formatDuration, sanitizeName };
