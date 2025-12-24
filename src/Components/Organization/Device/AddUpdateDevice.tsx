import { useState, useEffect, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import type { DeviceFamilyResult } from "../../../../model/device-family.interface";
import type { DeviceTypeResult } from "../../../../model/device-type.interface";
import {
  createDevice,
  getDeviceById,
  getDeviceBySystemId,
  updateDevice,
  type CreateDevicePayload,
} from "../../../../store/deviceSlice";

import { Error, Success } from "../../../utils/toast";
import { setSystems } from "../../../../store/systemSlice";
import AddUpdateSystem from "../System/AddUpdateSystem";
import type { SystemResult } from "../../../../model/system.interface";
import type { ReportTypeResult } from "../../../../model/report-type.interface";
import { getAllReportTypes } from "../../../../store/reportTypeSlice";
import type { PlantResult } from "../../../../model/plant.interface";
import type { DepartmentResult } from "../../../../model/department.interface";
import { ApiError } from "../../../utils/errorHandler";
import { useGetAllSystemsQuery } from "../../../../store/rtkQuery";
import type { DeviceResult } from "../../../../model/devices.interface";
import DeviceDetailsForm from "./components/DeviceDetailsForm";
import ConnectionForms from "./components/ConnectionForms";
import VirtualReportingForm from "./components/VirtualReportingForm";
import CommonParametersForm from "./components/CommonParametersForm";
import TankParametersForm from "./components/TankParametersForm";
import BRWHMSParametersForm from "./components/BRWHMSParametersForm";
import BDWFMSParametersForm from "./components/BDWFMSParametersForm";
import DWLRParametersForm from "./components/DWLRParametersForm";

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
  });
  const [showAddSystemPopup, setShowAddSystemPopup] = useState(false);
  const [reportTypes, setReportTypes] = useState<ReportTypeResult[]>([]);
  const [_lastRecord, setLastRecord] = useState<Record<string, any> | null>(
    null
  );
  const { organizations } = useAppSelector((state) => state.organization);
  const [systemDevices, setSystemDevices] = useState<DeviceResult[]>([]);

  const {
    data: systemsData,
    isLoading: isFetchingSystems,
    refetch: refetchSystems,
  } = useGetAllSystemsQuery();

  const fetchSystemDevices = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getDeviceBySystemId(systemId))
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          setSystemDevices(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get system devices");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, systemId]);

  useEffect(() => {
    if (systemId) {
      fetchSystemDevices();
    }
  }, [systemId]);

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
    refValue: 0,
    refPercent: 0,
    shifter: "",
    A: "0",
    B: "0",
    C: "1",
    D: "0",
    overWrite: 0,
  });

  const [commonInputValues, setCommonInputValues] = useState({
    maxThreshold: "",
    lowerLimit: "",
    upperLimit: "",
    refValue: 0,
    refPercent: 0,
    multiplier: "",
    shifter: "",
    A: "0",
    B: "0",
    C: "1",
    D: "0",
    overWrite: 0,
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
    A1: "",
    B1: "",
  });

  const [bdwfmsParams, setBdwfmsParams] = useState<object>({
    sg: "",
    hmax: "",
    hmin: "",
    A: "",
    B: "",
    A1: "",
    B1: "",
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
    A1: "",
    B1: "",
  });

  const [bdwfmsInputValues, setBdwfmsInputValues] = useState({
    sg: "",
    hmax: "",
    hmin: "",
    A: "",
    B: "",
    A1: "",
    B1: "",
  });

  const createDefaultSensorParam = (): {
    enable: number;
    name: string;
    unit: string;
    multipliers: string;
    min: string;
    max: string;
    set_limit: string;
    set_min: string;
    set_max: string;
    ref_val: string;
    ref_percent: string;
  } => ({
    enable: 0,
    name: "",
    unit: "",
    multipliers: "",
    min: "",
    max: "",
    set_limit: "",
    set_min: "",
    set_max: "",
    ref_val: "",
    ref_percent: "",
  });

  const [dwlrParams, setDwlrParams] = useState({
    device_params: {
      sitename: "",
      address: "",
      serial: "",
      identifier: "",
      cable_length: "",
      lat: "",
      lng: "",
      installation_date: "",
      daily_msgs_count: "",
      undermentance: 0,
    },
    water_column: createDefaultSensorParam(),
    water_temperature: createDefaultSensorParam(),
    water_pressure: createDefaultSensorParam(),
    ambient_temperature: createDefaultSensorParam(),
    ambient_pressure: createDefaultSensorParam(),
    msg_time: createDefaultSensorParam(),
    water_column_from_ground: createDefaultSensorParam(),
    sensor_voltage: createDefaultSensorParam(),
    battery_voltage: createDefaultSensorParam(),
    param_1: createDefaultSensorParam(),
    param_2: createDefaultSensorParam(),
    param_3: createDefaultSensorParam(),
    param_4: createDefaultSensorParam(),
    param_5: createDefaultSensorParam(),
    param_6: createDefaultSensorParam(),
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
    getSelectedDeviceTypeName() === "Resultant Reporting";
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
      refValue: 0,
      refPercent: 0,
      multiplier: "",
      shifter: "",
      A: "0",
      B: "0",
      C: "1",
      D: "0",
      overWrite: 0,
    });
    setCommonInputValues({
      maxThreshold: "",
      lowerLimit: "",
      upperLimit: "",
      refValue: 0,
      refPercent: 0,
      multiplier: "",
      shifter: "",
      A: "",
      B: "",
      C: "",
      D: "",
      overWrite: 0,
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
      A1: "",
      B1: "",
    });
    setBrwhmsInputValues({
      sg: "",
      hmax: "",
      hmin: "",
      A: "",
      B: "",
      A1: "",
      B1: "",
    });
    setBdwfmsParams({
      sg: "",
      hmax: "",
      hmin: "",
      A: "",
      B: "",
      A1: "",
      B1: "",
    });
    setBdwfmsInputValues({
      sg: "",
      hmax: "",
      hmin: "",
      A: "",
      B: "",
      A1: "",
      B1: "",
    });
    setDwlrParams({
      device_params: {
        sitename: "",
        address: "",
        serial: "",
        identifier: "",
        cable_length: "",
        lat: "",
        lng: "",
        installation_date: "",
        daily_msgs_count: "",
        undermentance: 0,
      },
      water_column: createDefaultSensorParam(),
      water_temperature: createDefaultSensorParam(),
      water_pressure: createDefaultSensorParam(),
      ambient_temperature: createDefaultSensorParam(),
      ambient_pressure: createDefaultSensorParam(),
      msg_time: createDefaultSensorParam(),
      water_column_from_ground: createDefaultSensorParam(),
      sensor_voltage: createDefaultSensorParam(),
      battery_voltage: createDefaultSensorParam(),
      param_1: createDefaultSensorParam(),
      param_2: createDefaultSensorParam(),
      param_3: createDefaultSensorParam(),
      param_4: createDefaultSensorParam(),
      param_5: createDefaultSensorParam(),
      param_6: createDefaultSensorParam(),
    });
    setReportData({
      report_name: "",
      report_unit: "",
      report_formula: "",
    });
    setLastRecord(null);
    setErrors({});
  };

  const convertSensorParam = (
    param: {
      enable: number;
      name: string;
      unit: string;
      multipliers: string;
      min: string;
      max: string;
      set_limit: string;
      set_min: string;
      set_max: string;
      ref_val: string;
      ref_percent: string;
    },
    sensorKey?: string
  ) => {
    const sensorsWithoutNameUnit = [
      "water_column",
      "water_temperature",
      "water_pressure",
      "water_column_from_ground",
    ];
    const shouldExcludeNameUnit =
      sensorKey && sensorsWithoutNameUnit.includes(sensorKey);

    const baseResult = {
      enable: param.enable || 0,
      multipliers:
        param.multipliers === "" ? 0 : parseFloat(param.multipliers) || 0,
      min: param.min === "" ? 0 : parseInt(param.min) || 0,
      max: param.max === "" ? 0 : parseInt(param.max) || 0,
      set_limit: param.set_limit === "" ? 0 : parseInt(param.set_limit) || 0,
      set_min: param.set_min === "" ? 0 : parseInt(param.set_min) || 0,
      set_max: param.set_max === "" ? 0 : parseInt(param.set_max) || 0,
      ref_val: param.ref_val === "" ? 0 : parseFloat(param.ref_val) || 0,
      ref_percent:
        param.ref_percent === "" ? 0 : parseFloat(param.ref_percent) || 0,
    };

    if (!shouldExcludeNameUnit) {
      return {
        ...baseResult,
        name: param.name || "",
        unit: param.unit || "",
      };
    }

    return baseResult;
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
          ? { ...reportData, report_value: "0" }
          : {
              report_name: "",
              report_unit: "",
              report_formula: "",
              report_value: "",
            },
        params: (() => {
          const deviceFamilyName = getSelectedDeviceFamilyName();
          if (deviceFamilyName === "tank") {
            return { ...commonParams, ...tankParams };
          } else if (deviceFamilyName === "brwhms") {
            return { ...commonParams, ...brwhmsParams };
          } else if (deviceFamilyName === "BDWFMS") {
            return { ...commonParams, ...bdwfmsParams };
          } else if (deviceFamilyName === "dwlr") {
            const convertedDwlParams = {
              device_params: {
                sitename: dwlrParams.device_params.sitename || "",
                address: dwlrParams.device_params.address || "",
                serial: dwlrParams.device_params.serial || "",
                identifier: dwlrParams.device_params.identifier || "",
                cable_length:
                  dwlrParams.device_params.cable_length === ""
                    ? 0
                    : parseFloat(dwlrParams.device_params.cable_length) || 0,
                lat:
                  dwlrParams.device_params.lat === ""
                    ? 0
                    : parseFloat(dwlrParams.device_params.lat) || 0,
                lng:
                  dwlrParams.device_params.lng === ""
                    ? 0
                    : parseFloat(dwlrParams.device_params.lng) || 0,
                installation_date:
                  dwlrParams.device_params.installation_date || "",
                daily_msgs_count:
                  dwlrParams.device_params.daily_msgs_count === ""
                    ? 0
                    : parseInt(dwlrParams.device_params.daily_msgs_count) || 0,
                undermentance: dwlrParams.device_params.undermentance || 0,
              },
              water_column: convertSensorParam(
                dwlrParams.water_column,
                "water_column"
              ),
              water_temperature: convertSensorParam(
                dwlrParams.water_temperature,
                "water_temperature"
              ),
              water_pressure: convertSensorParam(
                dwlrParams.water_pressure,
                "water_pressure"
              ),
              ambient_temperature: convertSensorParam(
                dwlrParams.ambient_temperature
              ),
              ambient_pressure: convertSensorParam(dwlrParams.ambient_pressure),
              msg_time: convertSensorParam(dwlrParams.msg_time),
              water_column_from_ground: convertSensorParam(
                dwlrParams.water_column_from_ground,
                "water_column_from_ground"
              ),
              sensor_voltage: convertSensorParam(dwlrParams.sensor_voltage),
              battery_voltage: convertSensorParam(dwlrParams.battery_voltage),
              param_1: convertSensorParam(dwlrParams.param_1),
              param_2: convertSensorParam(dwlrParams.param_2),
              param_3: convertSensorParam(dwlrParams.param_3),
              param_4: convertSensorParam(dwlrParams.param_4),
              param_5: convertSensorParam(dwlrParams.param_5),
              param_6: convertSensorParam(dwlrParams.param_6),
            };
            return convertedDwlParams;
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
              maxThreshold: deviceData.params?.maxThreshold,
              lowerLimit: deviceData.params?.lowerLimit,
              upperLimit: deviceData.params?.upperLimit,
              multiplier: deviceData.params?.multiplier,
              shifter: deviceData.params?.shifter,
              refValue: deviceData.params?.refValue,
              refPercent: deviceData.params?.refPercent,
              A: deviceData.params?.A,
              B: deviceData.params?.B,
              C: deviceData.params?.C,
              D: deviceData.params?.D,
              overWrite: deviceData.params?.overWrite,
            };
            setCommonParams(commonData);
            setCommonInputValues({
              maxThreshold: commonData?.maxThreshold,
              lowerLimit: commonData?.lowerLimit,
              upperLimit: commonData?.upperLimit,
              refValue: commonData?.refValue,
              refPercent: commonData?.refPercent,
              multiplier: commonData?.multiplier,
              shifter: commonData?.shifter,
              A: commonData?.A,
              B: commonData?.B,
              C: commonData?.C,
              D: commonData?.D,
              overWrite: commonData?.overWrite,
            });

            if (familyName === "tank") {
              const tankData = {
                height: deviceData.params?.height,
                storageCapacity: deviceData.params?.storageCapacity,
                sensorPostion: deviceData.params?.sensorPostion,
                crossSectionArea: deviceData.params?.crossSectionArea,
              };
              setTankParams(tankData);
              setTankInputValues({
                height: tankData?.height,
                storageCapacity: tankData?.storageCapacity,
                sensorPostion: tankData?.sensorPostion,
                crossSectionArea: tankData?.crossSectionArea,
              });
            } else if (familyName === "brwhms") {
              const brwhmsData = {
                sg: deviceData?.params?.sg,
                hmax: deviceData?.params?.hmax,
                hmin: deviceData?.params?.hmin,
                A: deviceData?.params?.A,
                B: deviceData?.params?.B,
                A1: deviceData?.params?.A1,
                B1: deviceData?.params?.B1,
              };
              setBrwhmsParams(brwhmsData);
              setBrwhmsInputValues({
                sg: brwhmsData?.sg,
                hmax: brwhmsData?.hmax,
                hmin: brwhmsData?.hmin,
                A: brwhmsData?.A,
                B: brwhmsData?.B,
                A1: brwhmsData?.A1,
                B1: brwhmsData?.B1,
              });
            } else if (familyName === "BDWFMS") {
              const bdwfmsData = {
                sg: deviceData?.params?.sg,
                hmax: deviceData?.params?.hmax,
                hmin: deviceData?.params?.hmin,
                A: deviceData?.params?.A,
                B: deviceData?.params?.B,
                A1: deviceData?.params?.A1,
                B1: deviceData?.params?.B1,
              };
              setBdwfmsParams(bdwfmsData);
              setBdwfmsInputValues({
                sg: bdwfmsData?.sg,
                hmax: bdwfmsData?.hmax,
                hmin: bdwfmsData?.hmin,
                A: bdwfmsData?.A,
                B: bdwfmsData?.B,
                A1: bdwfmsData?.A1,
                B1: bdwfmsData?.B1,
              });
            } else if (familyName === "dwlr") {
              const convertSensorParam = (param: any) => ({
                enable: param?.enable || 0,
                name: param?.name,
                unit: param?.unit,
                multipliers: param?.multipliers,
                min: param?.min,
                max: param?.max,
                set_limit: param?.set_limit,
                set_min: param?.set_min,
                set_max: param?.set_max,
                ref_val: param?.ref_val,
                ref_percent: param?.ref_percent,
              });

              const dwlrData = {
                device_params: {
                  sitename: deviceData.params?.device_params?.sitename,
                  address: deviceData.params?.device_params?.address,
                  serial: deviceData.params?.device_params?.serial,
                  identifier: deviceData.params?.device_params?.identifier,
                  cable_length: deviceData.params?.device_params?.cable_length,
                  lat: deviceData.params?.device_params?.lat,
                  lng: deviceData.params?.device_params?.lng,
                  installation_date:
                    deviceData.params?.device_params?.installation_date,
                  daily_msgs_count:
                    deviceData.params?.device_params?.daily_msgs_count,
                  undermentance:
                    deviceData.params?.device_params?.undermentance,
                },
                water_column: convertSensorParam(
                  deviceData.params?.water_column
                ),
                water_temperature: convertSensorParam(
                  deviceData.params?.water_temperature
                ),
                water_pressure: convertSensorParam(
                  deviceData.params?.water_pressure
                ),
                ambient_temperature: convertSensorParam(
                  deviceData.params?.ambient_temperature
                ),
                ambient_pressure: convertSensorParam(
                  deviceData.params?.ambient_pressure
                ),
                msg_time: convertSensorParam(deviceData.params?.msg_time),
                water_column_from_ground: convertSensorParam(
                  deviceData.params?.water_column_from_ground
                ),
                sensor_voltage: convertSensorParam(
                  deviceData.params?.sensor_voltage
                ),
                battery_voltage: convertSensorParam(
                  deviceData.params?.battery_voltage
                ),
                param_1: convertSensorParam(deviceData.params?.param_1),
                param_2: convertSensorParam(deviceData.params?.param_2),
                param_3: convertSensorParam(deviceData.params?.param_3),
                param_4: convertSensorParam(deviceData.params?.param_4),
                param_5: convertSensorParam(deviceData.params?.param_5),
                param_6: convertSensorParam(deviceData.params?.param_6),
              };
              setDwlrParams(dwlrData);
            }

            if (deviceData.device_reporting) {
              setReportData({
                report_name: deviceData.device_reporting?.report_name,
                report_unit: deviceData.device_reporting?.report_unit,
                report_formula: deviceData.device_reporting?.report_formula,
              });
            }

            if (deviceData.last_record) {
              setLastRecord(deviceData.last_record);
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
      setLastRecord(null);
    }
  }, [type, deviceId, dispatch, familyData, organizationId]);

  useEffect(() => {
    if (type === "update" && deviceId) {
      resetForm();
    }
  }, [deviceId, type]);

  const fetchSystems = useCallback(() => {
    if (isFetchingSystems) return;
    refetchSystems();
  }, [isFetchingSystems, refetchSystems]);

  useEffect(() => {
    if (systemsData?.success && systemsData?.data) {
      dispatch(setSystems(systemsData.data));
    }
  }, [systemsData, dispatch]);

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

                  return `${organizationName} / ${plantName} / ${departmentName} / ${systemName}`;
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
            <DeviceDetailsForm
              formData={formData}
              onFormDataChange={setFormData}
              errors={errors}
              familyData={familyData}
              typeData={typeData}
            />

            <ConnectionForms
              formData={formData}
              onFormDataChange={setFormData}
              plantData={plantData}
              departmentData={departmentData}
              systemData={systemData}
              reportTypes={reportTypes}
              organizationId={organizationId}
              plant_id={plant_id}
              isInReportType={isInReportType}
              isOutReportType={isOutReportType}
              isStorageReportType={isStorageReportType}
            />

            {isVirtualReporting && (
              <VirtualReportingForm
                reportData={reportData}
                onReportDataChange={setReportData}
                systemDevices={systemDevices}
                departmentData={departmentData}
                systemData={systemData}
              />
            )}

            {!isVirtualReporting && (
              <CommonParametersForm
                commonInputValues={commonInputValues}
                onCommonParamsChange={(values) => {
                  setCommonInputValues(values);
                  setCommonParams(values);
                }}
                errors={errors}
                isBRWHMS={getSelectedDeviceFamilyName() === "brwhms"}
                isBDWFMS={getSelectedDeviceFamilyName() === "BDWFMS"}
              />
            )}

            {getSelectedDeviceFamilyName() === "tank" && (
              <TankParametersForm
                tankInputValues={tankInputValues}
                onTankParamsChange={(values) => {
                  setTankInputValues(values);
                  setTankParams({
                    height:
                      values.height === "" ? 0 : parseFloat(values.height),
                    storageCapacity:
                      values.storageCapacity === ""
                        ? 0
                        : parseFloat(values.storageCapacity),
                    sensorPostion:
                      values.sensorPostion === ""
                        ? 0
                        : parseFloat(values.sensorPostion),
                    crossSectionArea:
                      values.crossSectionArea === ""
                        ? 0
                        : parseFloat(values.crossSectionArea),
                  });
                }}
                errors={errors}
              />
            )}

            {getSelectedDeviceFamilyName() === "brwhms" && (
              <BRWHMSParametersForm
                brwhmsInputValues={brwhmsInputValues}
                onBRWHMSParamsChange={(values) => {
                  setBrwhmsInputValues(values);
                  setBrwhmsParams({
                    sg: values.sg === "" ? 0 : parseFloat(values.sg),
                    hmax: values.hmax === "" ? 0 : parseFloat(values.hmax),
                    hmin: values.hmin === "" ? 0 : parseFloat(values.hmin),
                    A: values.A === "" ? 0 : parseFloat(values.A),
                    B: values.B === "" ? 0 : parseFloat(values.B),
                    A1: values.A1 === "" ? 0 : parseFloat(values.A1),
                    B1: values.B1 === "" ? 0 : parseFloat(values.B1),
                  });
                }}
                errors={errors}
              />
            )}

            {getSelectedDeviceFamilyName() === "BDWFMS" && (
              <BDWFMSParametersForm
                bdwfmsInputValues={bdwfmsInputValues}
                onBDWFMSParamsChange={(values) => {
                  setBdwfmsInputValues(values);
                  setBdwfmsParams({
                    sg: values.sg === "" ? 0 : parseFloat(values.sg),
                    hmax: values.hmax === "" ? 0 : parseFloat(values.hmax),
                    hmin: values.hmin === "" ? 0 : parseFloat(values.hmin),
                    A: values.A === "" ? 0 : parseFloat(values.A),
                    B: values.B === "" ? 0 : parseFloat(values.B),
                    A1: values.A1 === "" ? 0 : parseFloat(values.A1),
                    B1: values.B1 === "" ? 0 : parseFloat(values.B1),
                  });
                }}
                errors={errors}
              />
            )}

            {getSelectedDeviceFamilyName() === "dwlr" && (
              <DWLRParametersForm
                dwlrParams={dwlrParams}
                onDWLRParamsChange={setDwlrParams}
                errors={errors}
              />
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
            fetchSystems();
          }}
        />
      )}
    </div>
  );
};

export default AddUpdateDevice;
