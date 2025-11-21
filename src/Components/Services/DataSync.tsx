import {
  Database,
  Upload,
  Loader2,
  FileText,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import type { DeviceFamilyResult } from "../../../model/device-family.interface";
import { getDeviceFamiliy } from "../../../store/deviceFamilySlice";
import { getAllDevices, setDevices } from "../../../store/deviceSlice";
import { Error as ErrorToast, Success } from "../../utils/toast";

const DataSync = () => {
  const getCurrentMonthYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };
  const initialMonthYear = useRef(getCurrentMonthYear());
  const [monthYear, setMonthYear] = useState(initialMonthYear.current);
  const { devices } = useAppSelector((state) => state.device);
  const [deviceFamily, setDeviceFamily] = useState<DeviceFamilyResult[]>([]);
  const [deviceFamilyId, setDeviceFamilyId] = useState("");
  const dispatch = useAppDispatch();

  const refreshDevices = useCallback(async () => {
    dispatch(getAllDevices())
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          dispatch(setDevices(res?.data));
        } else {
          ErrorToast(res.message || "Failed to get devices");
        }
      })
      .catch((err) => {
        console.log(err);
        ErrorToast(err.message || "Failed to get devices");
      });
  }, [dispatch]);

  const getDeviceFamily = useCallback(async () => {
    await dispatch(getDeviceFamiliy())
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          setDeviceFamily(res.data);
        } else {
          ErrorToast(res.message || "Failed to get device families");
        }
      })
      .catch((err) => {
        console.log(err);
        ErrorToast(err.message || "Failed to get device families");
      });
  }, [dispatch]);

  useEffect(() => {
    if (devices.length === 0) {
      refreshDevices();
    }
    getDeviceFamily();
  }, [getDeviceFamily, refreshDevices, devices]);

  const [deviceId, setDeviceId] = useState("");
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [jsonData, setJsonData] = useState<object>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [isSyncCompleted, setIsSyncCompleted] = useState(false);
  const [deviceSearchTerm, setDeviceSearchTerm] = useState("");
  const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);
  const [progress, setProgress] = useState<{
    progress: number;
    total: number;
    percent: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deviceDropdownRef = useRef<HTMLDivElement>(null);
  const chunkBufferRef = useRef<string>("");

  const flowMeterFamilies = deviceFamily.filter(
    (family) =>
      family.name.toLowerCase().includes("flow") ||
      family.type?.toLowerCase() === "fm" ||
      family.type?.toLowerCase() === "brwhms" ||
      family.type?.toLowerCase() === "tank"
  );

  const filteredDevices = deviceFamilyId
    ? devices.filter(
        (device) =>
          device.device_family_id.toString() === deviceFamilyId.toString()
      )
    : [];

  const searchedDevices = deviceSearchTerm
    ? filteredDevices.filter(
        (device) =>
          device.device_name
            .toLowerCase()
            .includes(deviceSearchTerm.toLowerCase()) ||
          device.hwid.toLowerCase().includes(deviceSearchTerm.toLowerCase())
      )
    : filteredDevices;

  const selectedDevice = filteredDevices.find(
    (device) => String(device.device_id) === String(deviceId)
  );

  useEffect(() => {
    setDeviceId("");
    setCsvData([]);
    setCsvHeaders([]);
    setJsonData({});
    setSelectedFile(null);
    setRowErrors({});
    setIsSyncCompleted(false);
    setDeviceSearchTerm("");
    setIsDeviceDropdownOpen(false);
    setProgress(null);
    chunkBufferRef.current = "";
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [deviceFamilyId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        deviceDropdownRef.current &&
        !deviceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDeviceDropdownOpen(false);
        setDeviceSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const parseCSV = (
    csvText: string
  ): { headers: string[]; data: Record<string, string>[] } => {
    const lines = csvText.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) {
      return { headers: [], data: [] };
    }

    const headers = lines[0]
      .split(",")
      .map((header) => header.trim().replace(/^"|"$/g, ""));

    const data: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(",")
        .map((value) => value.trim().replace(/^"|"$/g, ""));

      if (values.length === headers.length) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        data.push(row);
      }
    }

    return { headers, data };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      ErrorToast("Please upload a CSV file");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers, data } = parseCSV(text);

      if (headers.length === 0 || data.length === 0) {
        ErrorToast("CSV file is empty or invalid");
        return;
      }

      setCsvHeaders(headers);
      setCsvData(data);
      setJsonData(data);
      setRowErrors({});
      setIsSyncCompleted(false);
      Success(`CSV file loaded successfully. ${data.length} rows found.`);
    };

    reader.onerror = () => {
      ErrorToast("Failed to read CSV file");
    };

    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!selectedDevice) {
      ErrorToast("Please select a device");
      return;
    }

    if (!selectedFile || csvData.length === 0) {
      ErrorToast("Please upload a CSV file first");
      return;
    }

    if (!monthYear) {
      ErrorToast("Please select a month");
      return;
    }

    const [year, month] = monthYear.split("-");

    setIsUploading(true);

    const selectedFamily = deviceFamily.find(
      (f) => String(f.device_family_id) === String(deviceFamilyId)
    );
    const isBrwhms = selectedFamily?.type?.toLowerCase() === "brwhms";
    const isTank = selectedFamily?.type?.toLowerCase() === "tank";

    setProgress(null);
    chunkBufferRef.current = "";

    // Determine the API endpoint
    const endpoint = isBrwhms
      ? `/brwhms/device/brwhms-new-data-sync/${deviceId}`
      : isTank
      ? `/tank/device/tank-new-data-sync/${deviceId}`
      : `/fm/device/fm-new-data-sync/${deviceId}`;

    const baseURL =
      document.location.hostname === "localhost"
        ? import.meta.env.VITE_API_URL
        : document.location.origin + "/api";
    const url = `${baseURL}${endpoint}`;

    try {
      // Use fetch API for streaming support
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          year,
          month,
          data: jsonData,
        }),
      });

      if (!response.ok) {
        const errorMsg = `HTTP error! status: ${response.status}`;
        throw new globalThis.Error(errorMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        const errorMsg = "Response body is not readable";
        throw new globalThis.Error(errorMsg);
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          try {
            const finalData = buffer.trim();
            if (finalData) {
              let parsedData;
              try {
                parsedData = JSON.parse(finalData);
              } catch {
                const lastJsonMatch = finalData.match(/\{[\s\S]*\}$/);
                if (lastJsonMatch) {
                  parsedData = JSON.parse(lastJsonMatch[0]);
                } else {
                  parsedData = { message: finalData };
                }
              }

              if (parsedData?.success || parsedData?.status === 200) {
                const errors: Record<number, string> = {};
                if (
                  parsedData?.data?.errors &&
                  Array.isArray(parsedData.data.errors)
                ) {
                  parsedData.data.errors.forEach(
                    (error: { index: number; message: string }) => {
                      errors[error?.index] = error?.message;
                    }
                  );
                }
                const errorCount = Object.keys(errors).length;
                setIsSyncCompleted(true);

                if (parsedData?.status === 200 || parsedData?.success) {
                  if (parsedData?.message) {
                    Success(parsedData.message);
                  } else if (errorCount > 0) {
                    const updateCount = parsedData?.data?.updateCount || 0;
                    const insertCount = parsedData?.data?.insertCount || 0;
                    const skipCount = parsedData?.data?.skipCount || 0;
                    Success(
                      `Data synced! Updated: ${updateCount}, Inserted: ${insertCount}, Skipped: ${skipCount}, Errors: ${errorCount}`
                    );
                  } else {
                    Success("Data synced successfully!");
                  }
                }

                if (errorCount > 0) {
                  setRowErrors(errors);
                } else {
                  setRowErrors({});
                  setCsvData([]);
                  setCsvHeaders([]);
                  setJsonData({});
                  setSelectedFile(null);
                  setIsSyncCompleted(false);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }
              } else {
                ErrorToast(parsedData?.message || "Failed to sync data");
              }
            }
          } catch (error) {
            console.error("Error parsing final response:", error);
            ErrorToast("Failed to parse response");
          }
          break;
        }

        const chunkText = decoder.decode(value, { stream: true });
        buffer += chunkText;

        // Debug: log chunks to see what we're receiving
        console.log("Received chunk:", chunkText);

        // Try to parse newline-delimited JSON first
        const lines = buffer.split(/\r?\n/);

        // Process complete lines (all except the last one which might be incomplete)
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const parsed = JSON.parse(line);
              console.log("Parsed JSON:", parsed);

              // Check if it's a progress update
              if (
                parsed.Progress !== undefined &&
                parsed.Total !== undefined &&
                parsed.Percent !== undefined
              ) {
                console.log("Setting progress:", parsed);
                setProgress({
                  progress: parsed.Progress,
                  total: parsed.Total,
                  percent: parsed.Percent,
                });
              }
            } catch (e) {
              // Not valid JSON, might be part of final response
              console.log("Failed to parse line as JSON:", line, e);
            }
          }
        }

        // Keep the last line in buffer (might be incomplete)
        let remainingBuffer = lines[lines.length - 1];

        // Also try to parse JSON objects that might not be newline-delimited
        // Look for complete JSON objects in the remaining buffer
        while (remainingBuffer.length > 0) {
          const jsonStart = remainingBuffer.indexOf("{");
          if (jsonStart === -1) break;

          let braceCount = 0;
          let jsonEnd = -1;
          for (let i = jsonStart; i < remainingBuffer.length; i++) {
            if (remainingBuffer[i] === "{") braceCount++;
            if (remainingBuffer[i] === "}") {
              braceCount--;
              if (braceCount === 0) {
                jsonEnd = i + 1;
                break;
              }
            }
          }

          if (jsonEnd === -1) {
            // Incomplete JSON, keep from start position
            buffer = remainingBuffer.substring(jsonStart);
            break;
          }

          const jsonStr = remainingBuffer.substring(jsonStart, jsonEnd);
          try {
            const parsed = JSON.parse(jsonStr);
            console.log("Parsed JSON object:", parsed);

            // Check if it's a progress update
            if (
              parsed.Progress !== undefined &&
              parsed.Total !== undefined &&
              parsed.Percent !== undefined
            ) {
              console.log("Setting progress from object:", parsed);
              setProgress({
                progress: parsed.Progress,
                total: parsed.Total,
                percent: parsed.Percent,
              });
            }
          } catch (e) {
            console.log("Failed to parse JSON object:", jsonStr, e);
          }

          // Move past this JSON object and any whitespace
          remainingBuffer = remainingBuffer.substring(jsonEnd).trim();
        }

        buffer = remainingBuffer;
      }

      setProgress(null);
      chunkBufferRef.current = "";
    } catch (err: any) {
      setProgress(null);
      chunkBufferRef.current = "";
      ErrorToast(err?.message || "Failed to sync data");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearPreview = () => {
    setCsvData([]);
    setCsvHeaders([]);
    setJsonData({});
    setSelectedFile(null);
    setRowErrors({});
    setIsSyncCompleted(false);
    setProgress(null);
    chunkBufferRef.current = "";
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Database className="w-6 h-6 text-text-primary" />
        <h1 className="text-2xl font-normal text-text-primary font-roboto">
          Database Data Sync
        </h1>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="monthYear"
            className="text-sm font-medium text-text-secondary font-roboto"
          >
            Select Month
          </label>
          <input
            id="monthYear"
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            className="w-60 md:w-48 px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="deviceId"
            className="text-sm font-medium text-text-secondary font-roboto"
          >
            Device Family
          </label>
          <select
            id="deviceFamilyId"
            value={deviceFamilyId}
            onChange={(e) => setDeviceFamilyId(e.target.value)}
            className="w-60 md:w-48 px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info"
          >
            <option value="">Select Device Family</option>
            {flowMeterFamilies.map((family) => (
              <option
                key={family.device_family_id}
                value={family.device_family_id}
              >
                {family.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="deviceId"
            className="text-sm font-medium text-text-secondary font-roboto"
          >
            Device Name
          </label>
          <div className="relative w-60 md:w-48" ref={deviceDropdownRef}>
            <button
              type="button"
              onClick={() => {
                if (deviceFamilyId) {
                  setIsDeviceDropdownOpen(!isDeviceDropdownOpen);
                }
              }}
              disabled={!deviceFamilyId}
              className="w-full px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between font-roboto text-left"
            >
              <span className="truncate">
                {deviceId && deviceFamilyId
                  ? (() => {
                      const selected = filteredDevices.find(
                        (d) => String(d.device_id) === String(deviceId)
                      );
                      return selected
                        ? `${selected.device_name}`
                        : "Select Device";
                    })()
                  : deviceFamilyId
                  ? filteredDevices.length === 0
                    ? "No devices found"
                    : "Select Device"
                  : "Select Device Family first"}
              </span>
              <ChevronDown
                className={`w-4 h-4 flex-shrink-0 transition-transform ${
                  isDeviceDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDeviceDropdownOpen && deviceFamilyId && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search by name or HWID..."
                      value={deviceSearchTerm}
                      onChange={(e) => setDeviceSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>

                {searchedDevices.length > 0 ? (
                  searchedDevices.map((device) => {
                    const deviceIdStr = String(device.device_id);
                    const isSelected = deviceIdStr === String(deviceId);

                    return (
                      <div
                        key={device.device_id}
                        className={`px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary ${
                          isSelected ? "bg-secondary" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeviceId(deviceIdStr);
                          setIsDeviceDropdownOpen(false);
                          setDeviceSearchTerm("");
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <div className="font-medium text-sm font-roboto">
                          {device.device_name}
                        </div>
                        <div className="text-xs text-text-secondary font-roboto">
                          HWID: {device.hwid}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-text-secondary text-sm text-center font-roboto">
                    No devices found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="file"
            className="text-sm font-medium text-text-secondary font-roboto"
          >
            Upload CSV File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-60 md:w-48 px-3 py-1 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-roboto file:bg-secondary file:text-text-primary hover:file:bg-hover-bg-primary"
          />
        </div>
        <div className="flex flex-col justify-end gap-1 h-15 items-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={
              !deviceId ||
              !selectedFile ||
              csvData.length === 0 ||
              isUploading ||
              !selectedDevice
            }
            className="px-3 py-1.5 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-roboto"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Sync Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="bg-primary border border-border-primary rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-status-info" />
              <span className="text-sm font-medium text-text-primary font-roboto">
                Syncing Data...
              </span>
            </div>
            {progress ? (
              <span className="text-sm font-medium text-text-secondary font-roboto">
                {progress.progress} / {progress.total} (
                {parseFloat(progress.percent).toFixed(2)}%)
              </span>
            ) : (
              <span className="text-sm font-medium text-text-secondary font-roboto">
                Processing...
              </span>
            )}
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{
                width: progress
                  ? `${Math.min(parseFloat(progress.percent), 100)}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      )}

      {csvData.length > 0 && (
        <div className="bg-primary border border-border-primary rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-text-primary" />
              <h2 className="text-lg font-normal text-text-primary font-roboto">
                CSV Data Preview ({csvData.length} rows)
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClearPreview}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-status-danger/80 cursor-pointer text-white rounded-lg hover:bg-status-danger/50 transition-colors font-roboto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="h-[calc(100vh-335px)] table-scrollbar">
              <table className="w-full text-sm text-left rtl:text-right text-text-primary min-w-full">
                <thead className="text-xs text-text-primary capitalize bg-secondary border-b border-border-primary sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-text-primary whitespace-nowrap text-center text-sm font-roboto font-normal">
                      Sr No
                    </th>
                    {csvHeaders.map((header, index) => (
                      <th
                        key={index}
                        className="p-3 text-text-primary whitespace-nowrap text-center text-sm font-roboto font-normal"
                      >
                        {header}
                      </th>
                    ))}
                    {Object.keys(rowErrors).length > 0 && (
                      <th className="p-3 text-text-primary whitespace-nowrap text-center text-sm font-roboto font-normal bg-status-danger/10">
                        Error
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 3000).map((row, rowIndex) => {
                    const hasError = rowErrors[rowIndex] !== undefined;
                    const getRowBackgroundClass = () => {
                      if (!isSyncCompleted) {
                        return "bg-secondary";
                      }
                      if (hasError) {
                        return "bg-status-danger/5";
                      }
                      return "bg-status-success/5";
                    };

                    return (
                      <tr
                        key={rowIndex}
                        className={`border-b border-border-primary hover:bg-secondary transition-colors ${getRowBackgroundClass()}`}
                      >
                        <td className="p-3 text-text-primary whitespace-nowrap text-center text-sm font-roboto">
                          {rowIndex + 1}
                        </td>
                        {csvHeaders.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className="p-3 text-text-primary whitespace-nowrap text-center text-sm font-roboto"
                          >
                            {row[header] || "-"}
                          </td>
                        ))}
                        {Object.keys(rowErrors).length > 0 && (
                          <td className="p-3 text-status-danger whitespace-nowrap text-center text-sm font-roboto">
                            {rowErrors[rowIndex] || "-"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {csvData.length > 3000 && (
                <div className="mt-2 text-sm text-text-secondary text-center font-roboto">
                  Showing first 3000 rows of {csvData.length} total rows
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSync;
