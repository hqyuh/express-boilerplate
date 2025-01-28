/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-len */
import moment from 'moment';

import { EDateUnit } from '../constants/date-unit';
import type { TNullable } from '../interfaces/entity-type';

export class DateUtils {
  static localNowWithTz = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;

    return new Date(now.getTime() - offsetMs);
  };

  static dateTimeWithTzPostgres = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ') + '+00';

  static dateWithTz = (date: Date) => {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;

    return new Date(date.getTime() - offsetMs);
  };

  /**
   * Returns true if the currentDate is between dateStart and dateEnd, false otherwise.
   * @param {Date} dateStart - The start date of the range.
   * @param {Date} dateEnd - The end date of the range.
   * @param {Date} currentDate - The date to check if it's between the start and end dates.
   * @returns A boolean value.
   */
  static hasBetween(dateStart: Date, dateEnd: Date, currentDate: Date): boolean {
    if (dateStart.getTime() > dateEnd.getTime()) {
      return false;
    }

    return currentDate.getTime() >= dateStart.getTime() && currentDate.getTime() <= dateEnd.getTime();
  }

  static sortDate = <T>(objArray: T[], key: string, order?: 'asc' | 'desc'): T[] => {
    if (order === 'asc' || order === undefined) {
      return objArray.sort((prev, curr) => new Date(prev[key]).getTime() - new Date(curr[key]).getTime());
    }

    return objArray.sort((prev, curr) => new Date(curr[key]).getTime() - new Date(prev[key]).getTime());
  };

  /**
   * Given a date, return a new date that is the last day of the month of the given date.
   * @param {Date} date - The date to get the last day of the month for.
   * @returns The last day of the month.
   */
  static getLastDateOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  /**
   * The function adds a specified number of days to a given date.
   * @param {Date} date - The `date` parameter is a `Date` object representing a specific date and time.
   * @param {number} numberOfDays - The `numberOfDays` parameter is a number that represents the number
   * of days to add to the given date.
   * @returns a new Date object that is the result of adding the specified number of days to the input
   * date. If the result is a valid date, it will be returned. Otherwise, null will be returned.
   */
  static addDate(date: Date, numberOfDays: number) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unsafe-argument
    return moment(date).add(numberOfDays, EDateUnit.DAY).toDate() || null;
  }

  /**
   * The function `getMostRecentDate` returns the greater of two given dates.
   * @param {Date} date - The "date" parameter is a Date object representing a specific date and time.
   * @param {Date} dateCompare - The `dateCompare` parameter is a `Date` object that is used to compare
   * with the `date` parameter. The function checks if the `date` is greater than `dateCompare` and
   * returns the greater of the two dates.
   * @returns the greater of the two input dates.
   */
  static getMostRecentDate(date: Date, dateCompare: Date) {
    if (date.getTime() > dateCompare.getTime()) {
      return date;
    }

    return dateCompare;
  }

  /**
   * The function `getDateValid` takes a TNullable `Date` object and returns a formatted string
   * representation of the date using the moment library.
   * @param date - The `date` parameter is of type `TNullable<Date>`
   * @returns if date exists return formatted date string, otherwise return null
   */
  static getDateValid(date: TNullable<Date>) {
    return date && moment(date).format();
  }

  /**
   * The function returns the last date of a given month and year.
   * @param {number} month - The month parameter is a number representing the month of the year.
   * @param {number} year - The "year" parameter
   * @returns the last date of the specified month and year as a Date object.
   */
  static getLastDateByMonthAndYear(month: number, year: number): Date {
    const firstDayOfNextMonth = moment({ year, month });
    const lastDayOfMonth = firstDayOfNextMonth.endOf('month').set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    return lastDayOfMonth.toDate();
  }
}
