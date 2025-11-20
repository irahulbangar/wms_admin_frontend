export const fromatDateWithTime = (date: string) => {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
};

export const handleStatus = (status: string) => {
  if (status === "Active" || status === "active") {
    return "bg-green-100 text-status-success";
  } else if (status === "Inactive" || status === "inactive") {
    return "bg-red-100 text-status-danger";
  } else {
    return "bg-yellow-100 text-status-warning";
  }
};

/**
 * Checks if a record time is older than 24 hours
 * @param lastRecordTime - The last record time as a string (can be "N/A" or a date string)
 * @returns true if the record time is older than 24 hours, false otherwise
 */
export const isRecordTimeOld = (
  lastRecordTime: string | undefined | null
): boolean => {
  if (!lastRecordTime || lastRecordTime === "N/A") return false;
  try {
    const recordDate = new Date(lastRecordTime);
    const now = new Date();
    const diffInMs = now.getTime() - recordDate.getTime();
    const hours24InMs = 24 * 60 * 60 * 1000;
    return diffInMs > hours24InMs;
  } catch {
    return false;
  }
};
