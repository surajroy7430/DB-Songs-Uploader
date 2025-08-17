const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const os = require("os");

const compressAudio = (inputBuffer, target = 128) => {
  return new Promise((resolve, reject) => {
    const tempInputPath = path.join(os.tmpdir(), `input-${Date.now()}.mp3`);
    const tempOutputPath = path.join(os.tmpdir(), `output-${Date.now()}.mp3`);

    fs.writeFileSync(tempInputPath, inputBuffer);

    ffmpeg.ffprobe(tempInputPath, (err, metadata) => {
      if (err) return reject(err);

      const currBitrate = Math.round(metadata.format.bit_rate / 1000);
      const bitrateTouse = Math.min(currBitrate, target);

      ffmpeg(tempInputPath)
        .audioCodec("libmp3lame")
        .audioBitrate(`${bitrateTouse}k`) // bitrate for compression
        .audioQuality(5)
        .format("mp3")
        .on("end", () => {
          try {
            const compressedBuffer = fs.readFileSync(tempOutputPath);
            fs.unlinkSync(tempInputPath);
            fs.unlinkSync(tempOutputPath);
            resolve(compressedBuffer);
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (err) => {
          console.error("FFMPEG ERROR:", err);
          fs.unlinkSync(tempInputPath);
          if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
          reject(err);
        })
        .save(tempOutputPath);
    });
  });
};

module.exports = compressAudio;
