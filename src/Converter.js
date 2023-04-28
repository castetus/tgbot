import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { removeFile } from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

class Converter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  convertToMP3(oggPath, userId) {
    try {
      const outputPath = resolve(dirname(oggPath), `${userId}.mp3`);
      return new Promise((res, rej) => {
        ffmpeg(oggPath)
          .inputOption('-t 30')
          .output(outputPath)
          .on('end', () => {
            res(outputPath);
            removeFile(oggPath);
          })
          .on('err', (err) => rej(err.message))
          .run();
      });
    } catch (error) {
      console.log(error)
    }
  }

  async create(url, fileName) {
      const oggPath = resolve(__dirname, '../voices', `${fileName}.ogg`)
      return new Promise((resolve, reject) => {
        const fileStream = createWriteStream(oggPath);
    
        https.get(url, (response) => {
          response.pipe(fileStream);
          fileStream.on('finish', () => {
            resolve(oggPath);
          });
        }).on('error', (error) => {
          console.error(error);
          reject(error);
        });
      });
  }
}

export default new Converter();