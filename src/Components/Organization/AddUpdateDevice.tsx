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
import { getDepartments } from "../../../store/departmentSlice";

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
    device_family_id: 0,
    device_type_id: 0,
    device_name: "",
    device_status: "active",
    hwid: "",
    department_id: departmentId,
  });
  const [showAddDepartmentPopup, setShowAddDepartmentPopup] = useState(false);

  const resetForm = () => {
    setFormData({
      project_id: project_id || 0,
      device_family_id: 0,
      device_type_id: 0,
      device_name: "",
      device_status: "active",
      hwid: "",
      department_id: departmentId,
    });
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "device_family_id" || name === "device_type_id") {
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

    if (!formData.device_family_id) {
      newErrors.device_family_id = "Device Family is required";
    }
    if (!formData.device_type_id) {
      newErrors.device_type_id = "Device Type is required";
    }
    if (!formData.device_name.trim()) {
      newErrors.device_name = "Device Name is required";
    }
    if (!formData.device_status) {
      newErrors.device_status = "Device Status is required";
    }
    if (formData.hwid && formData.hwid.length !== 15) {
      newErrors.hwid = "HWID number must be exactly 15 characters";
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
        device_family_id: formData.device_family_id,
        device_type_id: formData.device_type_id,
        device_name: formData.device_name,
        device_status: formData.device_status,
        hwid: formData.hwid,
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
              device_family_id: deviceData.device_family_id,
              device_type_id: deviceData.device_type_id,
              device_name: deviceData.device_name,
              device_status: deviceData.device_status,
              hwid: deviceData.hwid,
              department_id: deviceData.department_id,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (type === "add") {
      setFormData({
        project_id: project_id || 0,
        device_family_id: 0,
        device_type_id: 0,
        device_name: "",
        device_status: "active",
        hwid: "",
        department_id: departmentId,
      });
    }
  }, [type, deviceId, dispatch, project_id, departmentId]);

  useEffect(() => {
    if (type === "update" && deviceId) {
      resetForm();
    }
  }, [deviceId, type]);

  const refreshDepartmentData = async () => {
    await dispatch(getDepartments())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setShowAddDepartmentPopup(false);
          onUpdateSuccess?.({
            success: true,
            data: { refreshDepartments: true },
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

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
                name="device_family_id"
                value={formData.device_family_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                  errors.device_family_id
                    ? "border-status-danger"
                    : "border-border-primary"
                }`}
              >
                <option value="0">Select Device Family</option>
                {familyData.map((family) => (
                  <option
                    key={family.device_family_id}
                    value={family.device_family_id}
                  >
                    {family.name}
                  </option>
                ))}
              </select>
              {errors.device_family_id && (
                <p className="text-status-danger text-sm mt-1 font-roboto">
                  {errors.device_family_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                Device Type
              </label>
              <select
                name="device_type_id"
                value={formData.device_type_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                  errors.device_type_id
                    ? "border-status-danger"
                    : "border-border-primary"
                }`}
              >
                <option value="0">Select Device Type</option>
                {typeData.map((type) => (
                  <option key={type.device_type_id} value={type.device_type_id}>
                    {type.device_type_name}
                  </option>
                ))}
              </select>
              {errors.device_type_id && (
                <p className="text-status-danger text-sm mt-1 font-roboto">
                  {errors.device_type_id}
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* IMEI Number */}
            <div>
              <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                HWID Number
              </label>
              <input
                type="text"
                name="hwid"
                value={formData.hwid}
                onChange={handleInputChange}
                placeholder="Enter HWID number"
                maxLength={15}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                  errors.hwid ? "border-status-danger" : "border-border-primary"
                }`}
              />
              {errors.hwid && (
                <p className="text-status-danger text-sm mt-1 font-roboto">
                  {errors.hwid}
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
            refreshDepartmentData();
          }}
        />
      )}
    </div>
  );
};

export default AddUpdateDevice;
