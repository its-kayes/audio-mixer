import fs from "node:fs";
import path from "node:path";

export class logger {

  #logsDir = path.join(process.env.PWD as string, "logs");

  #logFile = path.join(this.#logsDir, `20-toha-${new Date().toISOString()}.txt`);

  #store: string[] = [];

  constructor() { }

  writeLogs(message: string): void {
    const logEntry = `${message} - [${new Date().toISOString()}] \n`;


    this.#store.push(logEntry);
  }

  saveLogs() {
    let text = `<---------Start from here-----------> \n`;

    this.#store.forEach((line) => {
      text = text + line;
    });

    fs.mkdir(this.#logsDir, { recursive: true }, (err) => {
      if (err) {
        console.error("Error creating logs directory:", err);
      } else {
        fs.appendFile(this.#logFile, text, (err) => {
          if (err) {
            console.error("Error writing to log file:", err);
          }
        });
      }
    });
  }
}
