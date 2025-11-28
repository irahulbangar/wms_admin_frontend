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
