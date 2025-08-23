import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useAppDispatch } from "../../../store/store";
import type { DeviceFamilyResult } from "../../../model/device-family.interface";
import type { DeviceTypeResult } from "../../../model/device-type.interface";
import {
  createDevice,
  getDeviceById,
  updateDevice,
  type CreateDevicePayload,
} from "../../../store/deviceSlice";

import { Error, Success } from "../../utils/toast";
import type { DepartmentResult } from "../../../model/department.interface";
import AddUpdateDepartment from "./AddUpdateDepartment";

interface AddUpdateDeviceProps {
  setShowAddModal: (show: boolean) => void;
  type: "add" | "update";
  deviceId: number;
  onUpdateSuccess?: (data: {
    success: boolean;
    data?: Record<string, unknown>;
  }) => void;
  project_id: number | null;
  familyData: DeviceFamilyResult[];
  typeData: DeviceTypeResult[];
  departmentData: DepartmentResult[];
  departmentId: number;
}

const AddUpdateDevice: React.FC<AddUpdateDeviceProps> = ({
  setShowAddModal,
  type,
  deviceId,
  onUpdateSuccess,
  project_id,
  familyData,
  typeData,
  departmentData,
  departmentId,
}) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateDevicePayload>({
    project_id: project_id || 0,
    deviceFId: 0,
    deviceTypeId: 0,
    device_name: "",
    device_status: "Online",
    imeiNo: "",
    department_id: departmentId,
  });
  const [showAddDepartmentPopup, setShowAddDepartmentPopup] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "deviceFId" || name === "deviceTypeId") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
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
    if (formData.imeiNo && formData.imeiNo.length !== 15) {
      newErrors.imeiNo = "IMEI number must be exactly 15 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const deviceData = {
        project_id: project_id || 0,
        deviceFId: formData.deviceFId,
        deviceTypeId: formData.deviceTypeId,
        device_name: formData.device_name,
        device_status: formData.device_status,
        imeiNo: formData.imeiNo,
        department_id: formData.department_id,
      };

      if (type === "add") {
        const result = await dispatch(createDevice(deviceData)).unwrap();
        if (result.success) {
          Success("Device added successfully");
          setShowAddModal(false);
          onUpdateSuccess?.(result);
        }
      } else {
        const result = await dispatch(
          updateDevice({ device_id: deviceId, ...deviceData })
        ).unwrap();
        if (result.success) {
          Success("Device updated successfully");
          setShowAddModal(false);
          onUpdateSuccess?.(result);
        }
      }
    } catch (error) {
      console.error("Error submitting device:", error);
      Error("Failed to submit device");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (type === "update" && deviceId) {
      dispatch(getDeviceById(deviceId))
        .unwrap()
        .then((res) => {
          if (res.success) {
            const deviceData = res.data;
            setFormData({
              project_id: project_id || 0,
              deviceFId: deviceData.devicefid,
              deviceTypeId: deviceData.devicetypeid,
              device_name: deviceData.device_name,
              device_status: deviceData.device_status,
              imeiNo: deviceData.imeino,
              department_id: deviceData.departmentid,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (type === "add") {
      setFormData({
        project_id: project_id || 0,
        deviceFId: 0,
        deviceTypeId: 0,
        device_name: "",
        device_status: "Online",
        imeiNo: "",
        department_id: departmentId,
      });
    }
  }, [type, deviceId, dispatch, project_id, departmentId]);

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary sticky top-0 bg-primary z-10">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {type === "update" ? "Update Device" : "Add New Device"}
          </h2>
          <button
            onClick={() => {
              setShowAddModal(false);
              setErrors({});
            }}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                Device Family
              </label>
              <select
                name="deviceFId"
                value={formData.deviceFId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                  errors.deviceFId
                    ? "border-status-danger"
                    : "border-border-primary"
                }`}
              >
                <option value="0">Select Device Family</option>
                {familyData.map((family) => (
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                  errors.deviceTypeId
                    ? "border-status-danger"
                    : "border-border-primary"
                }`}
              >
                <option value="0">Select Device Type</option>
                {typeData.map((type) => (
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
                value={formData.device_name}
                onChange={handleInputChange}
                placeholder="Enter device name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
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
                className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* IMEI Number */}
            <div>
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                IMEI Number
              </label>
              <input
                type="text"
                name="imeiNo"
                value={formData.imeiNo}
                onChange={handleInputChange}
                placeholder="Enter IMEI number"
                maxLength={15}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
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
            </div>
            <div>
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                Department
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "add_new") {
                    setShowAddDepartmentPopup(true);
                    setFormData((prev) => ({ ...prev, department_id: 0 }));
                  } else {
                    setShowAddDepartmentPopup(false);
                    setFormData((prev) => ({
                      ...prev,
                      department_id: parseInt(value) || 0,
                    }));
                  }
                }}
                className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
              >
                <option value="0">Select Department</option>
                {departmentData.map((department) => (
                  <option
                    key={department.department_id}
                    value={department.department_id}
                  >
                    {department.department_name}
                  </option>
                ))}
                <option
                  value="add_new"
                  className="text-status-info font-medium cursor-pointer bg-overlay/10 rounded-lg p-2.5"
                >
                  + Add New
                </option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setErrors({});
              }}
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
              {type === "update" ? "Update Device" : "Add Device"}
            </button>
          </div>
        </form>
      </div>

      {/* Add Department Popup */}
      {showAddDepartmentPopup && (
        <AddUpdateDepartment
          setShowAddDepartmentPopup={setShowAddDepartmentPopup}
          type="add"
          projectId={project_id || 0}
          departmentId={departmentId}
          onUpdateSuccess={() => {
            setShowAddDepartmentPopup(false);
            onUpdateSuccess?.({
              success: true,
              data: { department_id: departmentId },
            });
          }}
        />
      )}
    </div>
  );
};

export default AddUpdateDevice;
