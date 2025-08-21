import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useAppDispatch } from "../../../store/store";
import type { DeviceFamilyResult } from "../../../model/device-family.interface";
import type { DeviceTypeResult } from "../../../model/device-type.interface";
import {
  getDeviceByFamilyWise,
  getDevicesByDeviceType,
} from "../../../store/deviceSlice";
import type { CreateDevicePayload } from "../../../store/deviceSlice";

interface AddUpdateDeviceProps {
  isOpen: boolean;
  onClose: () => void;
  device: CreateDevicePayload | null;
  isEdit?: boolean;
  onSubmit: (device: CreateDevicePayload | null) => void;
  project_id: number;
}

const AddUpdateDevice = ({
  isOpen,
  onClose,
  device,
  isEdit = false,
  onSubmit,
  project_id,
}: AddUpdateDeviceProps) => {
  const [formData, setFormData] = useState<CreateDevicePayload>({
    project_id: project_id,
    deviceFId: 0,
    imeiNo: "",
    deviceTypeId: 0,
    device_name: "",
    device_status: "Online",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dispatch = useAppDispatch();
  const [deviceFamily, setDeviceFamily] = useState<DeviceFamilyResult[]>([]);
  const [deviceType, setDeviceType] = useState<DeviceTypeResult[]>([]);

  const getDataFromDeviceFamily = async () => {
    await dispatch(getDeviceByFamilyWise())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setDeviceFamily(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getDataFromDeviceType = async () => {
    await dispatch(getDevicesByDeviceType())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setDeviceType(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getDataFromDeviceFamily();
    getDataFromDeviceType();
  }, []);

  useEffect(() => {
    if (device && isEdit) {
      setFormData(device);
    } else {
      setFormData({
        project_id: project_id,
        deviceFId: device?.deviceFId || 0,
        imeiNo: device?.imeiNo || "",
        deviceTypeId: device?.deviceTypeId || 0,
        device_name: device?.device_name || "",
        device_status: device?.device_status || "",
      });
    }
    setErrors({});
  }, [device, isEdit, project_id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "deviceFId" || name === "deviceTypeId") {
      setFormData((prev: CreateDevicePayload) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev: CreateDevicePayload) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.deviceFId) {
      newErrors.deviceFId = "Device Family is required";
    }
    if (!formData.deviceTypeId) {
      newErrors.deviceTypeId = "Device Type is required";
    }
    if (!formData.device_name.trim()) {
      newErrors.device_name = "Device Name is required";
    }
    if (!formData.device_status) {
      newErrors.device_status = "Device Status is required";
    }
    if (formData.imeiNo && formData.imeiNo.length !== 12) {
      newErrors.imeiNo = "IMEI number must be exactly 12 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting device:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {isEdit ? "Update Device" : "Add New Device"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                Device Family
              </label>
              <select
                name="deviceFId"
                value={formData.deviceFId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success bg-primary text-text-primary ${
                  errors.deviceFId
                    ? "border-status-danger"
                    : "border-border-primary"
                }`}
              >
                <option value="0">Select Device Family</option>
                {deviceFamily.map((family) => (
                  <option key={family.id} value={family.devicefamilyid}>
                    {family.name}
                  </option>
                ))}
              </select>
              {errors.deviceFId && (
                <p className="text-status-danger text-sm mt-1 font-roboto">
                  {errors.deviceFId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                Device Type
              </label>
              <select
                name="deviceTypeId"
                value={formData.deviceTypeId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success bg-primary text-text-primary ${
                  errors.deviceTypeId
                    ? "border-status-danger"
                    : "border-border-primary"
                }`}
              >
                <option value="0">Select Device Type</option>
                {deviceType.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.topics}
                  </option>
                ))}
              </select>
              {errors.deviceTypeId && (
                <p className="text-status-danger text-sm mt-1 font-roboto">
                  {errors.deviceTypeId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                Device Name
              </label>
              <input
                type="text"
                name="device_name"
                value=""
                placeholder="Enter device name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success bg-primary text-text-primary ${
                  errors.device_name
                    ? "border-status-danger"
                    : "border-border-primary"
                }`}
              />
              {errors.device_name && (
                <p className="text-status-danger text-sm mt-1 font-roboto">
                  {errors.device_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                Device Status
              </label>
              <select
                name="device_status"
                value={formData.device_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success bg-primary text-text-primary"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* IMEI Number */}
            <div className="md:col-span-2">
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                IMEI Number
              </label>
              <input
                type="text"
                name="imeiNo"
                value=""
                placeholder="Enter 12-digit IMEI number (optional)"
                maxLength={12}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success bg-primary text-text-primary ${
                  errors.imeiNo
                    ? "border-status-danger"
                    : "border-border-primary"
                }`}
              />
              {errors.imeiNo && (
                <p className="text-status-danger text-sm mt-1 font-roboto">
                  {errors.imeiNo}
                </p>
              )}
              <p className="text-text-muted text-xs mt-1 font-roboto">
                IMEI number is optional but must be exactly 12 characters if
                provided
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-roboto cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}

              {isEdit ? "Update Device" : "Add Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateDevice;
