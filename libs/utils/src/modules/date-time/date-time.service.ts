import { SplittedtDateTime } from '../type';

export class DateTime {
  splitDateTime(date: Date): SplittedtDateTime {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
  }

  fetchPreviousTimeStamp(hr: number): Date {
    return new Date(new Date().getTime() - hr * 60 * 60 * 1000);
  }
}
