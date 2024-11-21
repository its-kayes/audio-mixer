import fs from "node:fs";
import path from "node:path";
import ffmpeg from "fluent-ffmpeg";
import { fileGuard } from "./file-validator";
import { logger } from "./logger";



class audioMerger {
  #logger;
  #formatter;
  #totalAyat;
  #containerPath;
  #toFormat;
  #outputPath;

  #tempOutputPath = path.join(process.env.PWD as string, "temp/temp_output.wav")

  constructor(containerPath: string, outputPath: string, totalAyat: number, toFormat: ".wav") {
    (this.#logger = new logger()), (this.#formatter = new fileGuard());

    this.#containerPath = containerPath;
    this.#outputPath = outputPath
    this.#totalAyat = totalAyat;
    this.#toFormat = toFormat;
  }

  merge() {

    const formattedName = this.#formatter.guard({
      folderPath: this.#containerPath,
      format: this.#toFormat,
      totalAyat: this.#totalAyat,
    });

    if (!formattedName) return;

    if (formattedName.length < 2) {
      this.#logger.writeLogs("Not enough audio files to merge")

      this.#logger.saveLogs();

    } else {
      const ffmpegConcat = ffmpeg();

      formattedName.forEach((file) => {
        ffmpegConcat.input(path.join(this.#containerPath, file.fileName));
      });

      const concatFilter =
        formattedName.map((_, index) => `[${index}:a]`).join("") +
        `concat=n=${formattedName.length}:v=0:a=1`;

      ffmpegConcat
        .complexFilter([concatFilter])
        .on("error", (err) => {

          this.#logger.writeLogs(`"Error during concatenation:", ${err.message}`)
        })
        .on("end", () => {
          console.log();

          this.#logger.writeLogs(`Concatenation complete. Converting to MP3...`)

          ffmpeg(this.#tempOutputPath)
            .audioCodec("libmp3lame")
            .audioBitrate("180k")
            .toFormat("mp3")
            .on("error", (err) => {
              this.#logger.writeLogs(`Error during MP3 conversion:", ${err.message}`)
            })
            .on("end", () => {

              console.log(
                `Successfully converted to MP3 and saved as ${this.#outputPath}`
              );

              this.#logger.writeLogs(`Successfully converted to MP3 and saved as ${this.#outputPath}`)

              fs.unlinkSync(this.#tempOutputPath);

              this.#logger.saveLogs();
            })
            .save(this.#outputPath);
        })
        .on("progress", (progress) => {
          console.log(`Processing: ${progress.targetSize} KB converted`);
        })
        .save(this.#tempOutputPath);

    }
  }
}

const folderPath = "/media/kayes/Kayes 2/PAIQ Audios/20.Toha";


const outputPath = path.join(
  "/media/kayes/Kayes 2/PAIQ Audios/compressed-surah",
  "20-toha.mp3"
);

const audioMergerInstance = new audioMerger(folderPath, outputPath, 135, ".wav");

audioMergerInstance.merge();


