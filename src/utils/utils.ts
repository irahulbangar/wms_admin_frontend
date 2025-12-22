import type { DeviceResult } from "../../model/devices.interface";

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

/**
 * Converts a date string to dd/mm/yyyy format with time (dd/mm/yyyy HH:mm)
 * @param dateString - The date string to convert
 * @returns Formatted date string in dd/mm/yyyy HH:mm format
 */
export const formatDateForCSV = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date for CSV:", error);
    return dateString;
  }
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

export const parseCSV = (
  csvText: string
): { headers: string[]; data: Record<string, string>[] } => {
  const lines = csvText.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) {
    return { headers: [], data: [] };
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = i + 1 < line.length ? line[i + 1] : "";

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }

    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]).map((header) =>
    header.replace(/^"|"$/g, "")
  );

  const data: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map((value) =>
      value.replace(/^"|"$/g, "")
    );

    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      data.push(row);
    } else {
      console.warn(
        `Row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`
      );
    }
  }

  return { headers, data };
};

export const flowUnit = (
  reportType: string,
  reportTypeDuration: string,
  device: DeviceResult | null | undefined
): string => {
  const unit = device?.unit;
  if (reportType === "custom") {
    const isCubicMeter = unit === "M^3";
    switch (reportTypeDuration) {
      case "15min":
        return isCubicMeter ? "m³/M" : "LPM";
      case "1hour":
        return isCubicMeter ? "m³/H" : "LPH";
      case "1day":
        return isCubicMeter ? "m³/D" : "LPD";
      default:
        return unit === "M^3" ? "m³" : "Ltr";
    }
  }
  return unit === "M^3" ? "m³" : "Ltr";
};
