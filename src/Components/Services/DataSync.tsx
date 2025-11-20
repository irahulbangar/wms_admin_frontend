import { Database, Upload, Loader2, FileText, X } from "lucide-react";
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

  useEffect(() => {
    if (devices.length === 0) {
      refreshDevices();
    }
  }, [refreshDevices]);

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
    getDeviceFamily();
  }, [getDeviceFamily]);

  const [deviceId, setDeviceId] = useState("");
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [jsonData, setJsonData] = useState<object>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDevices = deviceFamilyId
    ? devices.filter(
        (device) =>
          device.device_family_id.toString() === deviceFamilyId.toString()
      )
    : [];

  const selectedDevice = filteredDevices.find(
    (device) => device.device_id.toString() === deviceId.toString()
  );

  useEffect(() => {
    setDeviceId("");
    setCsvData([]);
    setCsvHeaders([]);
    setJsonData({});
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [deviceFamilyId]);

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
      Success(`CSV file loaded successfully. ${data.length} rows found.`);
    };

    reader.onerror = () => {
      Error("Failed to read CSV file");
    };

    reader.readAsText(file);
  };

  // Handle upload/sync
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
          if (res.success || res.status === 200) {
            Success(res.message || "Data synced successfully!");
            setCsvData([]);
            setCsvHeaders([]);
            setJsonData({});
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } else {
            Error(res?.data?.errors?.[0]?.message || "Failed to sync data");
          }
        })
        .catch((err) => {
          Error(err?.data?.errors?.[0]?.message || "Failed to sync data");
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
            {deviceFamily.map((family) => (
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
          <select
            id="deviceId"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            disabled={!deviceFamilyId}
            className="w-60 md:w-48 px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {deviceFamilyId
                ? filteredDevices.length === 0
                  ? "No devices found"
                  : "Select Device"
                : "Select Device Family first"}
            </option>
            {filteredDevices.map((device) => (
              <option key={device.device_id} value={device.device_id}>
                {device.device_name}
              </option>
            ))}
          </select>
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
            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-roboto"
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
        <div className="bg-primary border border-border-primary rounded-xl p-4 sm:p-6 shadow-sm">
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
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-text-primary rounded-lg hover:bg-hover-bg-primary transition-colors font-roboto"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm text-left rtl:text-right text-text-primary min-w-full">
                <thead className="text-xs text-text-primary uppercase bg-secondary border-b border-border-primary sticky top-0 z-10">
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
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 100).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="bg-primary border-b border-border-primary hover:bg-secondary transition-colors"
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.length > 100 && (
                <div className="mt-2 text-sm text-text-secondary text-center font-roboto">
                  Showing first 100 rows of {csvData.length} total rows
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
