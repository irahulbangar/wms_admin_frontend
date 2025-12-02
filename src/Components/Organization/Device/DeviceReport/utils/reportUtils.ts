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
