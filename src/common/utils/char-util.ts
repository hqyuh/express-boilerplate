export default class CharUtils {
  static removeEscapeChars = (str: string) => str.replaceAll('\r', '');

  static convertSnakeToCamelCase = (str: string) => {
    let convertedStr = '';
    let count = 0;
    let isSnake = false;

    for (const char of str) {
      if (count) {
        if (char === '_') {
          isSnake = true;
          continue;
        }

        if (isSnake) {
          convertedStr += char.toUpperCase();
          isSnake = false;
        } else {
          convertedStr += char.toLowerCase();
        }
      } else {
        convertedStr += char.toLowerCase();
      }

      count++;
    }

    return convertedStr;
  };

  static convertCamelToSnakeCase = (str: string) => {
    let convertedStr = '';
    let isSnake = false;

    for (const char of str) {
      if (char === '_') {
        isSnake = true;
      }

      convertedStr += isSnake ? char.toUpperCase() : char.toLowerCase();
      isSnake = false;
    }

    return convertedStr;
  };
}
