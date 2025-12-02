/**
 * Utility function to get date from one week ago
 */
export const getOneWeekAgoDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split("T")[0];
};

/**
 * Utility function to get today's date in ISO format
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Report type duration mapping
 */
export const reportTypeDurationMap: Record<"1day" | "15min" | "1hour", string> =
  {
    "1day": "1day",
    "15min": "15min",
    "1hour": "1hour",
  };

/**
 * Calculate numeric average of first and last record values
 * @param firstValue - Value from first_record
 * @param lastValue - Value from last_record
 * @returns Numeric average value, or null if invalid
 */
export const calculateNumericAverage = (
  firstValue: string | undefined,
  lastValue: string | undefined
): number | null => {
  const first = Number(firstValue);
  const last = Number(lastValue);

  if (isNaN(first) || isNaN(last)) {
    return null;
  }

  return (first + last) / 2;
};

/**
 * Calculate average of first and last record values
 * @param firstValue - Value from first_record
 * @param lastValue - Value from last_record
 * @param unit - Unit to display (e.g., "V", "A", "Hz")
 * @returns Formatted string with average value and unit, or "-" if invalid
 */
export const calculateAverageValue = (
  firstValue: string | undefined,
  lastValue: string | undefined,
  unit: string
): string => {
  const average = calculateNumericAverage(firstValue, lastValue);

  if (average === null) {
    return "-";
  }

  return `${average} ${unit}`;
};
