import { Database } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import type { DeviceFamilyResult } from "../../../model/device-family.interface";
import { getDeviceFamiliy } from "../../../store/deviceFamilySlice";
import { Error } from "../../utils/toast";

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
  const filteredDevices = deviceFamilyId
    ? devices.filter(
        (device) =>
          device.device_family_id.toString() === deviceFamilyId.toString()
      )
    : [];

  useEffect(() => {
    setDeviceId("");
  }, [deviceFamilyId]);
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
            Upload File
          </label>
          <input
            type="file"
            id="file"
            className="w-60 md:w-48 px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info"
          />
        </div>
        <div className="flex flex-col justify-end gap-1 h-full items-end">
          
          <button className="w-60 md:w-48 px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none focus:ring-1 focus:ring-status-info">
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSync;
