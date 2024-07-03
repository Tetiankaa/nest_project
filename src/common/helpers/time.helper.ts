import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc)
export class TimeHelper {
  public static subtractByParams(value: number, unit: dayjs.ManipulateType): Date {
    return dayjs().subtract(value, unit).toDate();
  }
  public static getCurrentDate(): string {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
  }
  public static getCurrentYear(): number {
    return dayjs().year();

  }
}
