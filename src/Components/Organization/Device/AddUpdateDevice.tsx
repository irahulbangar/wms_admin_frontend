import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import type { DeviceFamilyResult } from "../../../../model/device-family.interface";
import type { DeviceTypeResult } from "../../../../model/device-type.interface";
import {
  createDevice,
  getDeviceById,
  updateDevice,
  type CreateDevicePayload,
} from "../../../../store/deviceSlice";

import { Error, Success } from "../../../utils/toast";
import { getAllSystems } from "../../../../store/systemSlice";
import AddUpdateSystem from "../System/AddUpdateSystem";
import type { SystemResult } from "../../../../model/system.interface";
import type { ReportTypeResult } from "../../../../model/report-type.interface";
import { getAllReportTypes } from "../../../../store/reportTypeSlice";
import type { PlantResult } from "../../../../model/plant.interface";
import type { DepartmentResult } from "../../../../model/department.interface";
import { ApiError } from "../../../utils/errorHandler";

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
  plantData: PlantResult[];
  departmentData: DepartmentResult[];
}

interface VirtualReporting {
  report_name: string;
  report_unit: string;
  report_formula: string;
  neutrality_formula: string;
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
  plantData,
  departmentData,
}) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateDevicePayload>({
    device_family_id: 0,
    device_type_id: 0,
    device_name: "",
    device_status: "",
    hwid: "",
    organization_id: organizationId,
    visibility: "",
    report_type_id: 0,
    system_id: systemId,
    in_system_id: 0,
    out_system_id: 0,
    in_department_id: 0,
    out_department_id: 0,
    in_plant_id: 0,
    out_plant_id: 0,
    organization_connection: "",
    device_flow_direction: "",
    params: {},
    plant_id: plant_id,
    department_id: departmentId,
    device_reporting: null,
  });
  const [reportData, setReportData] = useState<VirtualReporting>({
    report_name: "",
    report_unit: "",
    report_formula: "",
    neutrality_formula: "",
  });
  const [showAddSystemPopup, setShowAddSystemPopup] = useState(false);
  const [reportTypes, setReportTypes] = useState<ReportTypeResult[]>([]);
  const { organizations } = useAppSelector((state) => state.organization);

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

  const getSelectedDeviceTypeName = () => {
    const selectedType = typeData.find(
      (type) => type.device_type_id === formData.device_type_id
    );
    return selectedType?.device_type_name || "";
  };

  const [commonParams, setCommonParams] = useState<object>({
    maxThreshold: "",
    lowerLimit: "",
    upperLimit: "",
    multiplier: "",
    A: "0",
    B: "0",
    C: "1",
    D: "0",
  });

  const [commonInputValues, setCommonInputValues] = useState({
    maxThreshold: "",
    lowerLimit: "",
    upperLimit: "",
    multiplier: "",
    shifter: "",
    A: "0",
    B: "0",
    C: "1",
    D: "0",
  });

  const [tankParams, setTankParams] = useState<object>({
    height: "",
    storageCapacity: "",
    sensorPostion: "",
    crossSectionArea: "",
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
    crossSectionArea: "",
  });

  const [brwhmsInputValues, setBrwhmsInputValues] = useState({
    sg: "",
    hmax: "",
    hmin: "",
    A: "",
    B: "",
  });
  const inReportType = ["Rainfall", "Regeneration", "Re-use"];
  const outReportType = [
    "Evaporation",
    "Consumption",
    "Wastage",
    "Percolation",
  ];
  const flowReportType = "Storage";

  const selectedReportType = reportTypes.find(
    (rt) => rt.report_type_id === formData.report_type_id
  );

  const isInReportType = selectedReportType
    ? inReportType.includes(selectedReportType.report_type_name)
    : false;
  const isOutReportType = selectedReportType
    ? outReportType.includes(selectedReportType.report_type_name)
    : false;
  const isStorageReportType = selectedReportType
    ? selectedReportType.report_type_name === flowReportType
    : false;
  const isVirtualReporting =
    getSelectedDeviceFamilyName() === "virtual" &&
    getSelectedDeviceTypeName() === "System Report";
  const resetForm = () => {
    setFormData({
      device_family_id: 0,
      device_type_id: 0,
      device_name: "",
      device_status: "",
      hwid: "",
      params: {},
      organization_id: organizationId,
      visibility: "",
      report_type_id: 0,
      system_id: systemId,
      in_system_id: 0,
      out_system_id: 0,
      in_department_id: 0,
      out_department_id: 0,
      in_plant_id: 0,
      out_plant_id: 0,
      organization_connection: "",
      device_flow_direction: "",
      plant_id: plant_id,
      department_id: departmentId,
      device_reporting: null,
    });

    setCommonParams({
      maxThreshold: "",
      lowerLimit: "",
      upperLimit: "",
      A: "0",
      B: "0",
      C: "1",
      D: "0",
    });
    setCommonInputValues({
      maxThreshold: "",
      lowerLimit: "",
      upperLimit: "",
      multiplier: "",
      shifter: "",
      A: "",
      B: "",
      C: "",
      D: "",
    });

    setTankParams({
      height: "",
      storageCapacity: "",
      sensorPostion: "",
      crossSectionArea: "",
    });
    setTankInputValues({
      height: "",
      storageCapacity: "",
      sensorPostion: "",
      crossSectionArea: "",
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
    setReportData({
      report_name: "",
      report_unit: "",
      report_formula: "",
      neutrality_formula: "",
    });
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const fieldMappings: Record<string, string> = {
      plant_in: "in_plant_id",
      plant_out: "out_plant_id",
      department_in: "in_department_id",
      department_out: "out_department_id",
      system_in: "in_system_id",
      system_out: "out_system_id",
    };

    const actualFieldName = fieldMappings[name] || name;

    if (name === "device_family_id" || name === "device_type_id") {
      setFormData((prev) => ({
        ...prev,
        [actualFieldName]: parseInt(value) || 0,
      }));
    } else if (fieldMappings[name]) {
      const numericValue = value === "null" ? -1 : parseInt(value) || 0;
      setFormData((prev) => ({ ...prev, [actualFieldName]: numericValue }));
    } else if (name === "report_type_id") {
      const reportTypeId = parseInt(value) || 0;
      const selectedReportType = reportTypes.find(
        (rt) => rt.report_type_id === reportTypeId
      );

      const isInType = selectedReportType
        ? inReportType.includes(selectedReportType.report_type_name)
        : false;
      const isOutType = selectedReportType
        ? outReportType.includes(selectedReportType.report_type_name)
        : false;

      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [actualFieldName]: reportTypeId,
        };

        if (isInType) {
          updatedData.out_plant_id = -1;
          updatedData.out_department_id = -1;
          updatedData.out_system_id = -1;
        } else if (isOutType) {
          updatedData.in_plant_id = -1;
          updatedData.in_department_id = -1;
          updatedData.in_system_id = -1;
        }

        return updatedData;
      });
    } else {
      setFormData((prev) => ({ ...prev, [actualFieldName]: value }));
    }

    if (errors[actualFieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[actualFieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const deviceData = {
        device_family_id: formData.device_family_id,
        device_type_id: formData.device_type_id,
        device_name: formData.device_name,
        device_status: formData.device_status,
        hwid: formData.hwid,
        organization_id: formData.organization_id || organizationId,
        visibility: formData.visibility,
        in_department_id:
          formData.in_department_id === -1 ? 0 : formData.in_department_id,
        out_department_id:
          formData.out_department_id === -1 ? 0 : formData.out_department_id,
        report_type_id: formData.report_type_id,
        system_id: formData.system_id || systemId,
        in_system_id: formData.in_system_id === -1 ? 0 : formData.in_system_id,
        out_system_id:
          formData.out_system_id === -1 ? 0 : formData.out_system_id,
        in_plant_id: formData.in_plant_id === -1 ? 0 : formData.in_plant_id,
        out_plant_id: formData.out_plant_id === -1 ? 0 : formData.out_plant_id,
        organization_connection: formData.organization_connection,
        plant_id: formData.plant_id,
        department_id: formData.department_id,
        device_reporting: isVirtualReporting
          ? reportData
          : {
              report_name: "",
              report_unit: "",
              report_formula: "",
              neutrality_formula: "",
            },
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
            if (res.success || res.status === 200) {
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
            if (res.success || res.status === 200) {
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
      Error(
        error instanceof ApiError ? error.message : "Failed to submit device"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (type === "update" && deviceId) {
      dispatch(getDeviceById(deviceId))
        .unwrap()
        .then((res) => {
          if (res.success || res.status === 200) {
            const deviceData = res.data;
            setFormData({
              device_family_id: deviceData.device_family_id,
              device_type_id: deviceData.device_type_id,
              device_name: deviceData.device_name,
              device_status: deviceData.device_status,
              hwid: deviceData.hwid,
              organization_id: deviceData.organization_id,
              params: deviceData.params,
              visibility: deviceData.visibility,
              in_department_id: deviceData.in_department_id,
              out_department_id: deviceData.out_department_id,
              report_type_id: deviceData.report_type_id,
              system_id: deviceData.system_id || systemId,
              in_system_id: deviceData.in_system_id,
              out_system_id: deviceData.out_system_id,
              in_plant_id: deviceData.in_plant_id,
              out_plant_id: deviceData.out_plant_id,
              organization_connection: deviceData.organization_connection,
              device_flow_direction: deviceData.device_flow_direction,
              plant_id: deviceData.plant_id,
              department_id: deviceData.department_id,
              device_reporting: deviceData.device_reporting,
            });

            const selectedFamily = familyData.find(
              (f) => f.device_family_id === deviceData.device_family_id
            );
            const familyName =
              selectedFamily?.type?.toLowerCase() ||
              selectedFamily?.name?.toLowerCase() ||
              "";

            const commonData = {
              maxThreshold: deviceData.params?.maxThreshold || "",
              lowerLimit: deviceData.params?.lowerLimit || "",
              upperLimit: deviceData.params?.upperLimit || "",
              multiplier: deviceData.params?.multiplier || "",
              shifter: deviceData.params?.shifter || "",
              A: deviceData.params?.A || "",
              B: deviceData.params?.B || "",
              C: deviceData.params?.C || "",
              D: deviceData.params?.D || "",
            };
            setCommonParams(commonData);
            setCommonInputValues({
              maxThreshold: commonData?.maxThreshold?.toString() || "",
              lowerLimit: commonData?.lowerLimit?.toString() || "",
              upperLimit: commonData?.upperLimit?.toString() || "",
              multiplier: commonData?.multiplier?.toString() || "",
              shifter: commonData?.shifter?.toString() || "",
              A: commonData?.A?.toString() || "",
              B: commonData?.B?.toString() || "",
              C: commonData?.C?.toString() || "",
              D: commonData?.D?.toString() || "",
            });

            if (familyName === "tank") {
              const tankData = {
                height: deviceData.params?.height || 0,
                storageCapacity: deviceData.params?.storageCapacity || 0,
                sensorPostion: deviceData.params?.sensorPostion || 0,
                crossSectionArea: deviceData.params?.crossSectionArea || 0,
              };
              setTankParams(tankData);
              setTankInputValues({
                height: tankData?.height?.toString() || "",
                storageCapacity: tankData?.storageCapacity?.toString() || "",
                sensorPostion: tankData?.sensorPostion?.toString() || "",
                crossSectionArea: tankData?.crossSectionArea?.toString() || "",
              });
            } else if (familyName === "brwhms") {
              const brwhmsData = {
                sg: deviceData?.params?.sg || 0,
                hmax: deviceData?.params?.hmax || 0,
                hmin: deviceData?.params?.hmin || 0,
                A: deviceData?.params?.A || 0,
                B: deviceData?.params?.B || 0,
              };
              setBrwhmsParams(brwhmsData);
              setBrwhmsInputValues({
                sg: brwhmsData?.sg?.toString() || "",
                hmax: brwhmsData?.hmax?.toString() || "",
                hmin: brwhmsData?.hmin?.toString() || "",
                A: brwhmsData?.A?.toString() || "",
                B: brwhmsData?.B?.toString() || "",
              });
            }

            if (deviceData.device_reporting) {
              setReportData({
                report_name: deviceData.device_reporting?.report_name || "",
                report_unit: deviceData.device_reporting?.report_unit || "",
                report_formula:
                  deviceData.device_reporting?.report_formula || "",
                neutrality_formula:
                  deviceData.device_reporting?.neutrality_formula || "",
              });
            }
          } else {
            Error(res.message || "Failed to get device data");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get device data");
        });
    } else if (type === "add") {
      setFormData({
        device_family_id: 0,
        device_type_id: 0,
        device_name: "",
        device_status: "active",
        hwid: "",
        organization_id: organizationId,
        params: {},
        visibility: "",
        in_department_id: 0,
        out_department_id: 0,
        report_type_id: 0,
        system_id: systemId,
        in_system_id: 0,
        out_system_id: 0,
        in_plant_id: 0,
        out_plant_id: 0,
        organization_connection: "",
        device_flow_direction: "",
        plant_id: plant_id,
        department_id: departmentId,
        device_reporting: null,
      });
    }
  }, [type, deviceId, dispatch, familyData, organizationId]);

  useEffect(() => {
    if (type === "update" && deviceId) {
      resetForm();
    }
  }, [deviceId, type]);

  const refreshSystemData = async () => {
    await dispatch(getAllSystems())
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          setShowAddSystemPopup(false);
          onUpdateSuccess?.({
            success: true,
            data: { refreshSystems: true },
          });
        } else {
          Error(res.message || "Failed to refresh system data");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to refresh system data");
      });
  };

  useEffect(() => {
    dispatch(getAllReportTypes())
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          setReportTypes(res.data);
        } else {
          Error(res.message || "Failed to fetch report types");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to fetch report types");
      });
  }, [dispatch]);

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary sticky top-0 bg-primary z-10">
          <div className="flex flex-col">
            <h2 className="text-2xl font-normal text-text-primary font-roboto">
              {type === "update" ? "Update Device" : "Add New Device"}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
              <span className="font-normal font-roboto">
                {(() => {
                  const plant = plantData.find((p) => p.plant_id === plant_id);
                  const plantName = plant?.plant_name || "Unknown Plant";

                  const department = departmentData.find(
                    (d) => d.department_id === departmentId
                  );
                  const departmentName =
                    department?.department_name || "Unknown Department";

                  const organizationName =
                    organizations.find(
                      (o) => o.organization_id === organizationId
                    )?.organization_name || "Unknown Organization";

                  const system = systemData.find(
                    (s) => s.system_id === systemId
                  );
                  const systemName = system?.system_name || "Unknown System";

                  return `${organizationName} > ${plantName} > ${departmentName} > ${systemName}`;
                })()}
              </span>
            </div>
          </div>
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
              <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2">
                Device Details
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
              </div>
            </div>

            <div>
              <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                Device Connection
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                </select>
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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

            <div>
              <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                Plant Connection
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  {isStorageReportType ? "Select Plant" : "Plant In"}
                </label>
                <select
                  name="plant_in"
                  value={
                    formData.in_plant_id === null || formData.in_plant_id === -1
                      ? "null"
                      : formData.in_plant_id || "0"
                  }
                  onChange={handleInputChange}
                  disabled={isOutReportType}
                  className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    isOutReportType ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="0">Select Plant</option>
                  <option value="null">None</option>
                  {plantData
                    .filter((plant) => plant.organization_id === organizationId)
                    .map((plant) => (
                      <option key={plant.plant_id} value={plant.plant_id}>
                        {plant.plant_name}
                      </option>
                    ))}
                </select>
              </div>

              {!isStorageReportType && (
                <div>
                  <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                    Plant Out
                  </label>
                  <select
                    name="plant_out"
                    value={
                      formData.out_plant_id === null ||
                      formData.out_plant_id === -1
                        ? "null"
                        : formData.out_plant_id || "0"
                    }
                    onChange={handleInputChange}
                    disabled={isInReportType}
                    className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                      isInReportType ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="0">Select Plant</option>
                    <option value="null">None</option>
                    {plantData
                      .filter(
                        (plant) => plant.organization_id === organizationId
                      )
                      .map((plant) => (
                        <option key={plant.plant_id} value={plant.plant_id}>
                          {plant.plant_name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                Department Connection
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  {isStorageReportType ? "Select Department" : "Department In"}
                </label>
                <select
                  name="department_in"
                  value={
                    formData.in_department_id === null ||
                    formData.in_department_id === -1
                      ? "null"
                      : formData.in_department_id || "0"
                  }
                  onChange={handleInputChange}
                  disabled={isOutReportType}
                  className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    isOutReportType ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="0">Select Department</option>
                  <option value="null">None</option>
                  {departmentData
                    .filter(
                      (department) =>
                        department.plant_id === plant_id &&
                        department.organization_id === organizationId
                    )
                    .map((department) => (
                      <option
                        key={department.department_id}
                        value={department.department_id}
                      >
                        {department.department_name}
                      </option>
                    ))}
                </select>
              </div>

              {!isStorageReportType && (
                <div>
                  <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                    Department Out
                  </label>
                  <select
                    name="department_out"
                    value={
                      formData.out_department_id === null ||
                      formData.out_department_id === -1
                        ? "null"
                        : formData.out_department_id || "0"
                    }
                    onChange={handleInputChange}
                    disabled={isInReportType}
                    className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                      isInReportType ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="0">Select Department</option>
                    <option value="null">None</option>
                    {departmentData
                      .filter(
                        (department) =>
                          department.plant_id === plant_id &&
                          department.organization_id === organizationId
                      )
                      .map((department) => (
                        <option
                          key={department.department_id}
                          value={department.department_id}
                        >
                          {department.department_name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                System Connection
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  {isStorageReportType ? "Select System" : "System In"}
                </label>
                <select
                  name="system_in"
                  value={
                    formData.in_system_id === null ||
                    formData.in_system_id === -1
                      ? "null"
                      : formData.in_system_id || "0"
                  }
                  onChange={handleInputChange}
                  disabled={isOutReportType}
                  className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    isOutReportType ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="0">Select System</option>
                  <option value="null">None</option>
                  {systemData
                    .filter(
                      (system) =>
                        system.plant_id === plant_id &&
                        system.organization_id === organizationId
                    )
                    .map((system) => (
                      <option key={system.system_id} value={system.system_id}>
                        {system.system_name}
                      </option>
                    ))}
                </select>
              </div>

              {!isStorageReportType && (
                <div>
                  <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                    System Out
                  </label>
                  <select
                    name="system_out"
                    value={
                      formData.out_system_id === null ||
                      formData.out_system_id === -1
                        ? "null"
                        : formData.out_system_id || "0"
                    }
                    onChange={handleInputChange}
                    disabled={isInReportType}
                    className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                      isInReportType ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="0">Select System</option>
                    <option value="null">None</option>
                    {systemData
                      .filter(
                        (system) =>
                          system.plant_id === plant_id &&
                          system.organization_id === organizationId
                      )
                      .map((system) => (
                        <option key={system.system_id} value={system.system_id}>
                          {system.system_name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Virtual device reporting parameters */}
            {isVirtualReporting && (
              <>
                <div>
                  <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                    Virtual Reporting
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                      Report Name
                    </label>
                    <input
                      type="text"
                      name="report_name"
                      value={reportData.report_name}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          report_name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
                      placeholder="Enter report name"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                      Report Unit
                    </label>
                    <select
                      name="report_unit"
                      value={reportData.report_unit}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          report_unit: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
                    >
                      <option value="Ltr">Ltr</option>
                      <option value="M^3">m³</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                      Report Formula
                    </label>
                    <input
                      type="text"
                      name="report_formula"
                      value={reportData.report_formula}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          report_formula: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
                      placeholder="Enter report formula"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                      Report Neutrality Formula
                    </label>
                    <input
                      type="text"
                      name="report_neutrality_formula"
                      value={reportData.neutrality_formula}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          neutrality_formula: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
                      placeholder="Enter report neutrality formula"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Common Parameters */}
            <div>
              <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                Common Parameters
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  Lower Limit
                </label>
                <input
                  type="text"
                  name="lowerLimit"
                  value={commonInputValues.lowerLimit}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setCommonInputValues((prev) => ({
                      ...prev,
                      lowerLimit: inputValue,
                    }));

                    setCommonParams((prev) => ({
                      ...prev,
                      lowerLimit: inputValue,
                    }));
                  }}
                  placeholder="Enter lower limit"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors.lowerLimit
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  Upper Limit
                </label>
                <input
                  type="text"
                  name="upperLimit"
                  value={commonInputValues.upperLimit}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setCommonInputValues((prev) => ({
                      ...prev,
                      upperLimit: inputValue,
                    }));

                    setCommonParams((prev) => ({
                      ...prev,
                      upperLimit: inputValue,
                    }));
                  }}
                  placeholder="Enter upper limit"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors.upperLimit
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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

                    setCommonParams((prev) => ({
                      ...prev,
                      multiplier: inputValue,
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
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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

                    setCommonParams((prev) => ({
                      ...prev,
                      shifter: inputValue,
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
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
              </div>
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  A
                </label>
                <input
                  type="text"
                  name="A"
                  value={commonInputValues.A}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setCommonInputValues((prev) => ({
                      ...prev,
                      A: inputValue,
                    }));

                    setCommonParams((prev) => ({
                      ...prev,
                      A: inputValue,
                    }));
                  }}
                  placeholder="Enter A"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors.A ? "border-status-danger" : "border-border-primary"
                  }`}
                />
              </div>
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  B
                </label>
                <input
                  type="text"
                  name="B"
                  value={commonInputValues.B}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setCommonInputValues((prev) => ({
                      ...prev,
                      B: inputValue,
                    }));

                    setCommonParams((prev) => ({
                      ...prev,
                      B: inputValue,
                    }));
                  }}
                  placeholder="Enter B"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors.B ? "border-status-danger" : "border-border-primary"
                  }`}
                />
              </div>
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  C
                </label>
                <input
                  type="text"
                  name="C"
                  value={commonInputValues.C}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setCommonInputValues((prev) => ({
                      ...prev,
                      C: inputValue,
                    }));

                    setCommonParams((prev) => ({
                      ...prev,
                      C: inputValue,
                    }));
                  }}
                  placeholder="Enter C"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors.C ? "border-status-danger" : "border-border-primary"
                  }`}
                />
              </div>
              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  D
                </label>
                <input
                  type="text"
                  name="D"
                  value={commonInputValues.D}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setCommonInputValues((prev) => ({
                      ...prev,
                      D: inputValue,
                    }));

                    setCommonParams((prev) => ({
                      ...prev,
                      D: inputValue,
                    }));
                  }}
                  placeholder="Enter D"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors.D ? "border-status-danger" : "border-border-primary"
                  }`}
                />
              </div>
            </div>

            {/* Tank Parameters */}
            {getSelectedDeviceFamilyName() === "tank" && (
              <>
                <div>
                  <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                    Tank Parameters
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                  <div>
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                      Cross Section Area
                    </label>
                    <input
                      type="text"
                      name="crossSectionArea"
                      value={tankInputValues.crossSectionArea}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setTankInputValues((prev) => ({
                          ...prev,
                          crossSectionArea: inputValue,
                        }));

                        const numericValue =
                          inputValue === "" ? 0 : parseFloat(inputValue) || 0;
                        setTankParams((prev) => ({
                          ...prev,
                          crossSectionArea: numericValue,
                        }));
                      }}
                      placeholder="Enter cross section area"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                        errors.crossSectionArea
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
                  <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
                    BRWHMS Parameters
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
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
              className="px-4 py-1.5 text-text-primary border border-border-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-roboto cursor-pointer"
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
