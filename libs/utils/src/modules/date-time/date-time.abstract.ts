import { SplittedtDateTime } from '../type';

export abstract class IDateTimeService {
  abstract splitDateTime(date: Date): SplittedtDateTime;
  abstract fetchPreviousTimeStamp(hr: number): Date;
}
