export class TransformHelper {
  public static trim({ value }) {
    return value ? value.trim() : value;
  }
  public static toLowerCase({ value }) {
    return value ? value.toLowerCase() : value;
  }
  public static toUpperCase({ value }) {
    return value ? value.toUpperCase() : value;
  }
}
