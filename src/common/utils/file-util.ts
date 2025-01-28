/* eslint-disable max-len */
import fs from 'fs';
import path from 'path';

import CharUtils from './char-util';

interface IKeyCaseOptions {
  case: 'snakeCase' | 'camelCase';
}

export default class Files {
  static readFileCsv<T>(link: string, options?: IKeyCaseOptions): T[] {
    const data = fs.readFileSync(link, 'utf8');

    return Files.parseCSVData<T>(data, options);
  }

  static readFileCsvAsync<T>(link: string, options?: IKeyCaseOptions): Promise<T[]> {
    return new Promise<T[]>((res, rej) => {
      fs.readFile(link, { encoding: 'utf8' }, (error, data) => {
        if (error) {
          rej(error);
        }

        const parsedData = Files.parseCSVData<T>(data, options);
        res(parsedData);
      });
    });
  }

  static parseCSVData<T>(data: string, options?: IKeyCaseOptions): T[] {
    const keyCase = options?.case || 'camelCase';

    const arrData = data.split('\n');
    let headers: string[] = [];

    let convertFn: typeof CharUtils.convertSnakeToCamelCase | typeof CharUtils.convertCamelToSnakeCase;

    switch (keyCase) {
      case 'camelCase': {
        convertFn = CharUtils.convertSnakeToCamelCase;
        break;
      }

      case 'snakeCase': {
        convertFn = CharUtils.convertCamelToSnakeCase;
        break;
      }
    }

    const output = arrData
      .filter((row, i) => {
        if (!i) {
          headers = row.split(',');

          return null;
        }

        return row.trim().length;
      })
      .map((row) => {
        const commaSplittedRows = row.split(',');

        return Object.fromEntries(
          headers.map((incoming, i) => [convertFn(incoming.trim()), commaSplittedRows[i].trim()])
        );
      });

    return output as T[];
  }

  static readDirAsync(link: string, ext = ''): Promise<string[]> {
    return new Promise<string[]>((res, rej) => {
      fs.readdir(link, { encoding: 'utf8' }, (error, files) => {
        if (error) {
          rej(error);
        }

        res(files.filter((file) => path.extname(file) === ext));
      });
    });
  }

  /**
   * The function "joinDir" takes a string parameter "link" and returns a string that represents the
   * joined directory path.
   * @param {string} link - The `link` parameter is a string representing the path or directory
   * @returns the result of joining the `__dirname` and `link` using the `path.join` method.
   */
  static joinDir(link: string): string {
    return path.join(__dirname, link);
  }

  /**
   * The function reads a file asynchronously and returns a promise that resolves to the parsed JSON
   * data.
   * @param {string} link - The `link` parameter is a string that represents the file path or URL of the file
   * @returns a Promise that resolves to a value of type T.
   */
  static readFileAsync<T>(link: string): Promise<T> {
    return JSON.parse(fs.readFileSync(link, 'utf8'));
  }

  /**
   * The function writes data to a file
   * @param {string} link - The "link" parameter is a string that represents the file path where the
   * data will be written to. It should include the file name and extension (e.g., "data.json").
   * @param {T} data - The `data` parameter is the data that write to the file. It can be
   * of any type `T`.
   */
  static writeFileAsync<T>(link: string, data: T): void {
    fs.writeFileSync(link, JSON.stringify(data));
  }
}
