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
  public static toBoolean({ value }) {
    if (value === null || value === undefined) return value;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  }
}
