import { Database } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import type { DeviceFamilyResult } from "../../../model/device-family.interface";
import { getDeviceFamiliy } from "../../../store/deviceFamilySlice";

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
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Database className="w-6 h-6 text-text-primary" />
        <h1 className="text-2xl font-normal text-text-primary font-roboto">
          Database Data Sync
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <form>
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
          <div>
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
              className="w-full px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none"
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

          <div>
            <label
              htmlFor="deviceId"
              className="text-sm font-medium text-text-secondary font-roboto"
            >
              Device ID
            </label>
            <select
              id="deviceId"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full px-3 py-1.5 border border-border-primary bg-primary text-text-primary rounded-md focus:outline-none"
            >
              <option value="">Select Device</option>
              {devices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.device_name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataSync;
