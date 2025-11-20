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
import {
  dataSyncForFMDevices,
  getAllDevices,
  setDevices,
} from "../../../store/deviceSlice";
import { Error, Success } from "../../utils/toast";

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
          Error(res.message || "Failed to get devices");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get devices");
      });
  }, [dispatch]);

  const getDeviceFamily = useCallback(async () => {
    await dispatch(getDeviceFamiliy())
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          setDeviceFamily(res.data);
        } else {
          Error(res.message || "Failed to get device families");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get device families");
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deviceDropdownRef = useRef<HTMLDivElement>(null);

  const flowMeterFamilies = deviceFamily.filter(
    (family) =>
      family.name.toLowerCase().includes("flow") ||
      family.type?.toLowerCase() === "fm"
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

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is CSV
    if (!file.name.toLowerCase().endsWith(".csv")) {
      Error("Please upload a CSV file");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers, data } = parseCSV(text);

      if (headers.length === 0 || data.length === 0) {
        Error("CSV file is empty or invalid");
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
      Error("Failed to read CSV file");
    };

    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!selectedDevice) {
      Error("Please select a device");
      return;
    }

    if (!selectedFile || csvData.length === 0) {
      Error("Please upload a CSV file first");
      return;
    }

    if (!monthYear) {
      Error("Please select a month");
      return;
    }

    const [year, month] = monthYear.split("-");
    const plant_id = selectedDevice.plant_id.toString();

    if (!plant_id) {
      Error("Device does not have a plant ID");
      return;
    }

    setIsUploading(true);

    try {
      await dispatch(
        dataSyncForFMDevices({
          device_id: Number(deviceId),
          year,
          month,
          data: jsonData,
        })
      )
        .unwrap()
        .then((res) => {
          if (res?.success) {
            const errors: Record<number, string> = {};
            if (res?.data?.errors && Array.isArray(res?.data?.errors)) {
              res?.data?.errors?.forEach(
                (error: { index: number; message: string }) => {
                  errors[error?.index] = error?.message;
                }
              );
            }
            const errorCount = Object.keys(errors).length;
            setIsSyncCompleted(true);
            
            if (errorCount > 0) {
              const updateCount = res?.data?.updateCount || 0;
              const insertCount = res?.data?.insertCount || 0;
              const skipCount = res?.data?.skipCount || 0;

              Success(
                `Data synced! Updated: ${updateCount}, Inserted: ${insertCount}, Skipped: ${skipCount}, Errors: ${errorCount}`
              );

              setRowErrors(errors);
            } else {
              Success(res?.message || "Data synced successfully!");
              setCsvData([]);
              setCsvHeaders([]);
              setJsonData({});
              setSelectedFile(null);
              setRowErrors({});
              setIsSyncCompleted(false);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }
          } else {
            Error(res?.message || "Failed to sync data");
          }
        })
        .catch((err) => {
          Error(err?.message || "Failed to sync data");
        });
    } catch {
      Error("An error occurred while syncing data");
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
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary cursor-pointer text-text-primary rounded-lg hover:bg-hover-bg-primary transition-colors font-roboto"
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
