import fs from "node:fs";
import { logger } from "./logger";

type IPayload = {
  folderPath: string;
  totalAyat: number;
  format: ".wav";
};

export class fileGuard {
  #logger;

  constructor() {
    this.#logger = new logger();
  }

  guard(payload: IPayload) {

    const audioFiles = fs
      .readdirSync(payload.folderPath)
      .filter((file) => file.endsWith(payload.format));

    const filesWithFormattedName = audioFiles
      .map((ayat) => {
        const ayatNumber = +ayat?.split("-")[3]?.split(".")[0];

        if (!ayatNumber) return null;

        return {
          fileName: ayat,
          ayatNumber,
        };
      })
      .filter(
        (ayat): ayat is { fileName: string; ayatNumber: number } =>
          ayat !== null
      )
      .sort((a, b) => a.ayatNumber - b.ayatNumber);

    const ayatRange = Array.from(
      { length: payload.totalAyat },
      (_, i) => i + 1
    );

    const ayatNumbers = filesWithFormattedName.map(
      ({ ayatNumber }) => ayatNumber
    );

    const missingAyats = ayatRange.filter((num) => !ayatNumbers.includes(num));

    const duplicates = ayatNumbers.filter(
      (num, index, self) => self.indexOf(num) !== index
    );

    const extras = ayatNumbers.filter(
      (num) => num < 1 || num > payload.totalAyat
    );

    if (missingAyats.length || duplicates.length || extras.length) {

      this.#logger.writeLogs("Problems in Ayat");


      if (missingAyats.length) {

        this.#logger.writeLogs(`Missing ayat numbers:, ${missingAyats}`);

        throw new Error(`Missing ayat numbers:, ${missingAyats}`);
      }



      if (duplicates.length) {
        const duplicateFiles = filesWithFormattedName
          .filter(({ ayatNumber }) => duplicates.includes(ayatNumber))
          .map(({ fileName }) => fileName);

        this.#logger.writeLogs(`Duplicate ayat numbers:", ${duplicates}, Duplicate files:, ${duplicateFiles}`);

        throw new Error(
          `Duplicate ayat numbers:", ${duplicates}, Duplicate files:, ${duplicateFiles}`
        );
      }

      if (extras.length) {
        const extraFiles = filesWithFormattedName
          .filter(({ ayatNumber }) => extras.includes(ayatNumber))
          .map(({ fileName }) => fileName);

        this.#logger.writeLogs(`Extra ayat numbers:", ${extras}, Extra files:", ${extraFiles}`);

        throw new Error(
          `Extra ayat numbers:", ${extras}, Extra files:", ${extraFiles}`
        );
      }
    } else {

      this.#logger.writeLogs("File Validator passed successfully !");

      return filesWithFormattedName;
    }
  }
}
