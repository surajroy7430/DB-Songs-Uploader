const ffmpeg = require("fluent-ffmpeg");

const compressAudio = (inputPath, outputPath, target = 128) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);

      const currBitrate = Math.round(metadata.format.bit_rate / 1000);
      const bitrateTouse = Math.min(currBitrate, target);

      ffmpeg(inputPath)
        .audioCodec("libmp3lame")
        .audioBitrate(`${bitrateTouse}k`) // bitrate for compression
        .audioQuality(5)
        .format("mp3")
        .on("end", () => resolve(outputPath))
        .on("error", (err) => {
          console.error("FFMPEG ERROR:", err);
          reject(err);
        })
        .save(outputPath);
    });
  });
};

module.exports = compressAudio;
