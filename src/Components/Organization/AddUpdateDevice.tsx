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
import { getAllSystems } from "../../../store/systemSlice";
import AddUpdateSystem from "./AddUpdateSystem";
import type { SystemResult } from "../../../model/system.interface";
import type { ReportTypeResult } from "../../../model/report-type.interface";
import { getAllReportTypes } from "../../../store/reportTypeSlice";

interface AddUpdateDeviceProps {
  setShowAddModal: (show: boolean) => void;
  type: "add" | "update";
  deviceId: number;
  onUpdateSuccess?: (data: {
    success: boolean;
    data?: Record<string, unknown>;
  }) => void;
  plant_id: number | null;
  familyData: DeviceFamilyResult[];
  typeData: DeviceTypeResult[];
  systemData: SystemResult[];
  departmentId: number;
  organizationId: number;
  systemId: number;
}

const AddUpdateDevice: React.FC<AddUpdateDeviceProps> = ({
  setShowAddModal,
  type,
  deviceId,
  onUpdateSuccess,
  plant_id,
  familyData,
  typeData,
  systemData,
  departmentId,
  organizationId,
  systemId,
}) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateDevicePayload>({
    plant_id: plant_id || 0,
    device_family_id: 0,
    device_type_id: 0,
    device_name: "",
    device_status: "",
    hwid: "",
    department_id: departmentId,
    organization_id: organizationId,
    visibility: "",
    department_connection: "",
    report_type_id: 0,
    system_id: systemId,
    system_connection: "",
    plant_connection: "",
    organization_connection: "",
    device_flow_direction: "",
    params: {},
  });
  const [showAddSystemPopup, setShowAddSystemPopup] = useState(false);
  const [reportTypes, setReportTypes] = useState<ReportTypeResult[]>([]);

  const getSelectedDeviceFamilyName = () => {
    const selectedFamily = familyData.find(
      (family) => family.device_family_id === formData.device_family_id
    );
    return (
      selectedFamily?.type?.toLowerCase() ||
      selectedFamily?.name?.toLowerCase() ||
      ""
    );
  };

  const [commonParams, setCommonParams] = useState<object>({
    multiplier: "1",
    shifter: "0",
    maxThreshold: "",
  });

  const [commonInputValues, setCommonInputValues] = useState({
    multiplier: "1",
    shifter: "0",
    maxThreshold: "",
  });

  const [tankParams, setTankParams] = useState<object>({
    height: "",
    storageCapacity: "",
    sensorPostion: "",
  });

  const [brwhmsParams, setBrwhmsParams] = useState<object>({
    sg: "",
    hmax: "",
    hmin: "",
    A: "",
    B: "",
  });

  const [tankInputValues, setTankInputValues] = useState({
    height: "",
    storageCapacity: "",
    sensorPostion: "",
  });

  const [brwhmsInputValues, setBrwhmsInputValues] = useState({
    sg: "",
    hmax: "",
    hmin: "",
    A: "",
    B: "",
  });

  const resetForm = () => {
    setFormData({
      plant_id: plant_id || 0,
      device_family_id: 0,
      device_type_id: 0,
      device_name: "",
      device_status: "",
      hwid: "",
      department_id: departmentId,
      params: {},
      organization_id: organizationId,
      visibility: "",
      department_connection: "",
      report_type_id: 0,
      system_id: systemId,
      system_connection: "",
      plant_connection: "",
      organization_connection: "",
      device_flow_direction: "",
    });

    setCommonParams({
      multiplier: "1",
      shifter: "0",
      maxThreshold: "",
    });
    setCommonInputValues({
      multiplier: "1",
      shifter: "0",
      maxThreshold: "",
    });

    setTankParams({
      height: "",
      storageCapacity: "",
      sensorPostion: "",
    });
    setTankInputValues({
      height: "",
      storageCapacity: "",
      sensorPostion: "",
    });
    setBrwhmsParams({
      sg: "",
      hmax: "",
      hmin: "",
      A: "",
      B: "",
    });
    setBrwhmsInputValues({
      sg: "",
      hmax: "",
      hmin: "",
      A: "",
      B: "",
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
        plant_id: plant_id || 0,
        device_family_id: formData.device_family_id,
        device_type_id: formData.device_type_id,
        device_name: formData.device_name,
        device_status: formData.device_status,
        hwid: formData.hwid,
        department_id: formData.department_id,
        organization_id: formData.organization_id || organizationId,
        visibility: formData.visibility,
        department_connection: formData.department_connection,
        report_type_id: formData.report_type_id,
        system_id: formData.system_id || systemId,
        system_connection: formData.system_connection,
        plant_connection: formData.plant_connection,
        organization_connection: formData.organization_connection,
        params: (() => {
          const deviceFamilyName = getSelectedDeviceFamilyName();
          if (deviceFamilyName === "tank") {
            return { ...commonParams, ...tankParams };
          } else if (deviceFamilyName === "brwhms") {
            return { ...commonParams, ...brwhmsParams };
          } else {
            return { ...commonParams };
          }
        })(),
        device_flow_direction: formData.device_flow_direction,
      };

      if (type === "add") {
        await dispatch(createDevice(deviceData))
          .unwrap()
          .then((res) => {
            if (res.success) {
              Success(res.message || "Device added successfully");
              setShowAddModal(false);
              onUpdateSuccess?.(res);
            } else {
              Error(res.message || "Failed to add device");
            }
          })
          .catch((err) => {
            Error(err.message || "Failed to add device");
          });
      } else {
        await dispatch(updateDevice({ device_id: deviceId, ...deviceData }))
          .unwrap()
          .then((res) => {
            if (res.success) {
              Success(res.message || "Device updated successfully");
              setShowAddModal(false);
              onUpdateSuccess?.(res);
            } else {
              Error(res.message || "Failed to update device");
            }
          })
          .catch((err) => {
            Error(err.message || "Failed to update device");
          });
      }
    } catch (error) {
      console.error("Error submitting device:", error);
      Error((error as string) || "Failed to submit device");
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
              plant_id: plant_id || 0,
              device_family_id: deviceData.device_family_id,
              device_type_id: deviceData.device_type_id,
              device_name: deviceData.device_name,
              device_status: deviceData.device_status,
              hwid: deviceData.hwid,
              department_id: deviceData.department_id,
              organization_id: deviceData.organization_id,
              params: deviceData.params,
              visibility: deviceData.visibility,
              department_connection: deviceData.department_connection,
              report_type_id: deviceData.report_type_id,
              system_id: deviceData.system_id || systemId,
              system_connection: deviceData.system_connection,
              plant_connection: deviceData.plant_connection,
              organization_connection: deviceData.organization_connection,
              device_flow_direction: deviceData.device_flow_direction,
            });

            const selectedFamily = familyData.find(
              (f) => f.device_family_id === deviceData.device_family_id
            );
            const familyName =
              selectedFamily?.type?.toLowerCase() ||
              selectedFamily?.name?.toLowerCase() ||
              "";

            const commonData = {
              multiplier: deviceData.params?.multiplier || 0,
              shifter: deviceData.params?.shifter || 0,
              maxThreshold: deviceData.params?.maxThreshold || "",
            };
            setCommonParams(commonData);
            setCommonInputValues({
              multiplier: commonData.multiplier.toString(),
              shifter: commonData.shifter.toString(),
              maxThreshold: commonData.maxThreshold.toString(),
            });

            if (familyName === "tank") {
              const tankData = {
                height: deviceData.params?.height || 0,
                storageCapacity: deviceData.params?.storageCapacity || 0,
                sensorPostion: deviceData.params?.sensorPostion || 0,
              };
              setTankParams(tankData);
              setTankInputValues({
                height: tankData.height.toString(),
                storageCapacity: tankData.storageCapacity.toString(),
                sensorPostion: tankData.sensorPostion.toString(),
              });
            } else if (familyName === "brwhms") {
              const brwhmsData = {
                sg: deviceData.params?.sg || 0,
                hmax: deviceData.params?.hmax || 0,
                hmin: deviceData.params?.hmin || 0,
                A: deviceData.params?.A || 0,
                B: deviceData.params?.B || 0,
              };
              setBrwhmsParams(brwhmsData);
              setBrwhmsInputValues({
                sg: brwhmsData.sg.toString(),
                hmax: brwhmsData.hmax.toString(),
                hmin: brwhmsData.hmin.toString(),
                A: brwhmsData.A.toString(),
                B: brwhmsData.B.toString(),
              });
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (type === "add") {
      setFormData({
        plant_id: plant_id || 0,
        device_family_id: 0,
        device_type_id: 0,
        device_name: "",
        device_status: "active",
        hwid: "",
        department_id: departmentId,
        organization_id: organizationId,
        params: {},
        visibility: "",
        department_connection: "",
        report_type_id: 0,
        system_id: systemId,
        system_connection: "",
        plant_connection: "",
        organization_connection: "",
        device_flow_direction: "",
      });
    }
  }, [
    type,
    deviceId,
    dispatch,
    plant_id,
    departmentId,
    familyData,
    organizationId,
  ]);

  useEffect(() => {
    if (type === "update" && deviceId) {
      resetForm();
    }
  }, [deviceId, type]);

  const refreshSystemData = async () => {
    await dispatch(getAllSystems())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setShowAddSystemPopup(false);
          onUpdateSuccess?.({
            success: true,
            data: { refreshSystems: true },
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    dispatch(getAllReportTypes())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setReportTypes(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch]);

  console.log('reportTypes', reportTypes);

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary sticky top-0 bg-primary z-10">
          <h2 className="text-2xl font-semibold text-text-primary font-roboto">
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
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xl font-semibold text-text-primary font-roboto border-b border-border-primary pb-2">
                Device Details
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  Device Family
                </label>
                <div className="relative">
                  <select
                    name="device_family_id"
                    value={formData.device_family_id}
                    onChange={(e) => {
                      const value = e.target.value;

                      setFormData((prev) => ({
                        ...prev,
                        device_family_id: parseInt(value) || 0,
                        device_type_id: 0,
                      }));
                    }}
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
                </div>
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
                <div className="relative">
                  <select
                    name="device_type_id"
                    value={formData.device_type_id}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        device_type_id: parseInt(value) || 0,
                      }));
                    }}
                    disabled={!formData.device_family_id}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                      errors.device_type_id
                        ? "border-status-danger"
                        : "border-border-primary"
                    } ${
                      !formData.device_family_id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="0">
                      {formData.device_family_id
                        ? "Select Device Type"
                        : "Select Device Family First"}
                    </option>
                    {formData.device_family_id &&
                      typeData
                        .filter(
                          (type) =>
                            type.device_family_id === formData.device_family_id
                        )
                        .map((type) => (
                          <option
                            key={type.device_type_id}
                            value={type.device_type_id}
                          >
                            {type.device_type_name}
                          </option>
                        ))}
                  </select>
                </div>
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
                    errors.hwid
                      ? "border-status-danger"
                      : "border-border-primary"
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
                  System
                </label>
                <select
                  name="system_id"
                  value={formData.system_id}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "add_new") {
                      setShowAddSystemPopup(true);
                      setFormData((prev) => ({ ...prev, system_id: 0 }));
                    } else {
                      setShowAddSystemPopup(false);
                      setFormData((prev) => ({
                        ...prev,
                        system_id: parseInt(value) || 0,
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
                >
                  <option value="0">None</option>
                  {systemData.map((system) => (
                    <option key={system.system_id} value={system.system_id}>
                      {system.system_name}
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

            <div>
              <label className="block text-xl font-semibold text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                Device Connection
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  Device Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
                >
                  <option value="0">Select Visibility</option>
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  Report Type
                </label>
                <select
                  name="report_type_id"
                  value={formData.report_type_id || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
                >
                  <option value="0">Select Report Type</option>
                  {reportTypes.map((reportType) => (
                    <option
                      key={reportType.report_type_id}
                      value={reportType.report_type_id}
                    >
                      {reportType.report_type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  System Connection
                </label>
                <select
                  name="system_connection"
                  value={formData.system_connection}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
                >
                  <option value="0">Select System Connection</option>
                  <option value="none">None</option>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  Department Connection
                </label>
                <select
                  name="department_connection"
                  value={formData.department_connection}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
                >
                  <option value="0">Select Department Connection</option>
                  <option value="none">None</option>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  Plant Connection
                </label>
                <select
                  name="plant_connection"
                  value={formData.plant_connection}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
                >
                  <option value="0">Select Plant Connection</option>
                  <option value="none">None</option>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  Organization Connection
                </label>
                <select
                  name="organization_connection"
                  value={formData.organization_connection}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
                >
                  <option value="0">Select Organization Connection</option>
                  <option value="none">None</option>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  Device Flow Direction
                </label>
                <select
                  name="device_flow_direction"
                  value={formData.device_flow_direction}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
                >
                  <option value="0">Select Device Flow Direction</option>
                  <option value="none">None</option>
                  <option value="single">Single Way</option>
                  <option value="multi">Multi Way</option>
                </select>
              </div>
            </div>

            {/* Common Parameters */}
            <div>
              <label className="block text-xl font-semibold text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                Common Parameters
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  Multiplier
                </label>
                <input
                  type="text"
                  name="multiplier"
                  value={commonInputValues.multiplier}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setCommonInputValues((prev) => ({
                      ...prev,
                      multiplier: inputValue,
                    }));

                    const numericValue =
                      inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                    setCommonParams((prev) => ({
                      ...prev,
                      multiplier: numericValue,
                    }));
                  }}
                  placeholder="Enter multiplier"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors.multiplier
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  Shifter
                </label>
                <input
                  type="text"
                  name="shifter"
                  value={commonInputValues.shifter}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setCommonInputValues((prev) => ({
                      ...prev,
                      shifter: inputValue,
                    }));

                    const numericValue =
                      inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                    setCommonParams((prev) => ({
                      ...prev,
                      shifter: numericValue,
                    }));
                  }}
                  placeholder="Enter shifter"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors.shifter
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                  Max Threshold
                </label>
                <input
                  type="text"
                  name="maxThreshold"
                  value={commonInputValues.maxThreshold}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setCommonInputValues((prev) => ({
                      ...prev,
                      maxThreshold: inputValue,
                    }));

                    setCommonParams((prev) => ({
                      ...prev,
                      maxThreshold: inputValue,
                    }));
                  }}
                  placeholder="Enter max threshold"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors.maxThreshold
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
                {errors.maxThreshold && (
                  <p className="text-status-danger text-sm mt-1 font-roboto">
                    {errors.maxThreshold}
                  </p>
                )}
              </div>
            </div>

            {/* Tank Parameters */}
            {getSelectedDeviceFamilyName() === "tank" && (
              <>
                <div>
                  <label className="block text-xl font-semibold text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                    Tank Parameters
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div>
                    <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                      Height
                    </label>
                    <input
                      type="text"
                      name="height"
                      value={tankInputValues.height}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setTankInputValues((prev) => ({
                          ...prev,
                          height: inputValue,
                        }));

                        const numericValue =
                          inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                        setTankParams((prev) => ({
                          ...prev,
                          height: numericValue,
                        }));
                      }}
                      placeholder="Enter height"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                        errors.height
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                      Storage Capacity
                    </label>
                    <input
                      type="text"
                      name="storageCapacity"
                      value={tankInputValues.storageCapacity}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setTankInputValues((prev) => ({
                          ...prev,
                          storageCapacity: inputValue,
                        }));

                        const numericValue =
                          inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                        setTankParams((prev) => ({
                          ...prev,
                          storageCapacity: numericValue,
                        }));
                      }}
                      placeholder="Enter storage capacity"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                        errors.storageCapacity
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                      Sensor Position
                    </label>
                    <input
                      type="text"
                      name="sensorPostion"
                      value={tankInputValues.sensorPostion}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setTankInputValues((prev) => ({
                          ...prev,
                          sensorPostion: inputValue,
                        }));

                        const numericValue =
                          inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                        setTankParams((prev) => ({
                          ...prev,
                          sensorPostion: numericValue,
                        }));
                      }}
                      placeholder="Enter sensor position"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                        errors.sensorPostion
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                  </div>
                </div>
              </>
            )}

            {/* BRWHMS Parameters */}
            {getSelectedDeviceFamilyName() === "brwhms" && (
              <>
                <div>
                  <label className="block text-xl font-semibold text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                    BRWHMS Parameters
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div>
                    <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                      SG
                    </label>
                    <input
                      type="text"
                      name="sg"
                      value={brwhmsInputValues.sg}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setBrwhmsInputValues((prev) => ({
                          ...prev,
                          sg: inputValue,
                        }));

                        const numericValue =
                          inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                        setBrwhmsParams((prev) => ({
                          ...prev,
                          sg: numericValue,
                        }));
                      }}
                      placeholder="Enter Distance from Sensor to top of V- Notch"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                        errors.sg
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                      HMax
                    </label>
                    <input
                      type="text"
                      name="hmax"
                      value={brwhmsInputValues.hmax}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setBrwhmsInputValues((prev) => ({
                          ...prev,
                          hmax: inputValue,
                        }));

                        const numericValue =
                          inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                        setBrwhmsParams((prev) => ({
                          ...prev,
                          hmax: numericValue,
                        }));
                      }}
                      placeholder="Enter Distance from sensor to V-cone"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                        errors.hmax
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                      HMin
                    </label>
                    <input
                      type="text"
                      name="hmin"
                      value={brwhmsInputValues.hmin}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setBrwhmsInputValues((prev) => ({
                          ...prev,
                          hmin: inputValue,
                        }));

                        const numericValue =
                          inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                        setBrwhmsParams((prev) => ({
                          ...prev,
                          hmin: numericValue,
                        }));
                      }}
                      placeholder="Enter Distance from V-Cone to top of V-Notch"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                        errors.hmin
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                      A
                    </label>
                    <input
                      type="text"
                      name="A"
                      value={brwhmsInputValues.A}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setBrwhmsInputValues((prev) => ({
                          ...prev,
                          A: inputValue,
                        }));

                        const numericValue =
                          inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                        setBrwhmsParams((prev) => ({
                          ...prev,
                          A: numericValue,
                        }));
                      }}
                      placeholder="Enter A"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                        errors.A
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
                      B
                    </label>
                    <input
                      type="text"
                      name="B"
                      value={brwhmsInputValues.B}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setBrwhmsInputValues((prev) => ({
                          ...prev,
                          B: inputValue,
                        }));

                        const numericValue =
                          inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                        setBrwhmsParams((prev) => ({
                          ...prev,
                          B: numericValue,
                        }));
                      }}
                      placeholder="Enter B"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                        errors.B
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                  </div>
                </div>
              </>
            )}
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
      {showAddSystemPopup && (
        <AddUpdateSystem
          setShowAddSystemPopup={setShowAddSystemPopup}
          type="add"
          plantId={plant_id || 0}
          departmentId={departmentId}
          organizationId={organizationId}
          systemId={systemId || 0}
          onUpdateSuccess={() => {
            refreshSystemData();
          }}
        />
      )}
    </div>
  );
};

export default AddUpdateDevice;
