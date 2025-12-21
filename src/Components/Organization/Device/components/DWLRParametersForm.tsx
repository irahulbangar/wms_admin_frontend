import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

interface SensorParam {
  enable: boolean;
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
}

interface DeviceParams {
  serial: string;
  identifier: string;
  cable_length: string;
  lat: string;
  lng: string;
  installation_date: string;
  daily_msgs_count: string;
  undermentance: boolean;
  sitename: string;
  address: string;
}

interface DWLRParams {
  device_params: DeviceParams;
  water_column: SensorParam;
  water_temperature: SensorParam;
  water_pressure: SensorParam;
  ambient_temperature: SensorParam;
  ambient_pressure: SensorParam;
  msg_time: SensorParam;
  water_column_from_ground: SensorParam;
  sensor_voltage: SensorParam;
  battery_voltage: SensorParam;
  param_1: SensorParam;
  param_2: SensorParam;
  param_3: SensorParam;
  param_4: SensorParam;
  param_5: SensorParam;
  param_6: SensorParam;
}

interface DWLRParametersFormProps {
  dwlrParams: DWLRParams;
  onDWLRParamsChange: (params: DWLRParams) => void;
  errors: Record<string, string>;
}

const DWLRParametersForm: React.FC<DWLRParametersFormProps> = ({
  dwlrParams,
  onDWLRParamsChange,
  errors,
}) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    device_params: true,
    water_column: false,
    water_temperature: false,
    water_pressure: false,
    ambient_temperature: false,
    ambient_pressure: false,
    msg_time: false,
    water_column_from_ground: false,
    sensor_voltage: false,
    battery_voltage: false,
    param_1: false,
    param_2: false,
    param_3: false,
    param_4: false,
    param_5: false,
    param_6: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDeviceParamChange = (
    field: keyof DeviceParams,
    value: string | boolean
  ) => {
    onDWLRParamsChange({
      ...dwlrParams,
      device_params: {
        ...dwlrParams.device_params,
        [field]: value,
      },
    });
  };

  const handleSensorParamChange = (
    sensorKey: keyof DWLRParams,
    field: keyof SensorParam,
    value: string | boolean
  ) => {
    onDWLRParamsChange({
      ...dwlrParams,
      [sensorKey]: {
        ...(dwlrParams[sensorKey] as SensorParam),
        [field]: value,
      },
    });
  };

  const renderDeviceParams = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Serial
          </label>
          <input
            type="text"
            value={dwlrParams.device_params.serial}
            onChange={(e) => handleDeviceParamChange("serial", e.target.value)}
            placeholder="Enter serial"
            maxLength={50}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors["device_params.serial"]
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Sitename
          </label>
          <input
            type="text"
            value={dwlrParams.device_params.sitename}
            onChange={(e) =>
              handleDeviceParamChange("sitename", e.target.value)
            }
            placeholder="Enter sitename"
            maxLength={100}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors["device_params.sitename"]
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Address
          </label>
          <input
            type="text"
            value={dwlrParams.device_params.address}
            onChange={(e) => handleDeviceParamChange("address", e.target.value)}
            placeholder="Enter address"
            maxLength={100}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors["device_params.address"]
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Identifier
          </label>
          <input
            type="text"
            value={dwlrParams.device_params.identifier}
            onChange={(e) =>
              handleDeviceParamChange("identifier", e.target.value)
            }
            placeholder="Enter identifier"
            maxLength={100}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors["device_params.identifier"]
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Cable Length
          </label>
          <input
            type="number"
            step="0.01"
            value={dwlrParams.device_params.cable_length}
            onChange={(e) =>
              handleDeviceParamChange("cable_length", e.target.value)
            }
            placeholder="Enter cable length"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors["device_params.cable_length"]
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Latitude
          </label>
          <input
            type="number"
            step="0.00000001"
            value={dwlrParams.device_params.lat}
            onChange={(e) => handleDeviceParamChange("lat", e.target.value)}
            placeholder="Enter latitude"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors["device_params.lat"]
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Longitude
          </label>
          <input
            type="number"
            step="0.00000001"
            value={dwlrParams.device_params.lng}
            onChange={(e) => handleDeviceParamChange("lng", e.target.value)}
            placeholder="Enter longitude"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors["device_params.lng"]
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Installation Date
          </label>
          <input
            type="date"
            value={dwlrParams.device_params.installation_date}
            onChange={(e) =>
              handleDeviceParamChange("installation_date", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors["device_params.installation_date"]
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Daily Message Count
          </label>
          <input
            type="number"
            value={dwlrParams.device_params.daily_msgs_count}
            onChange={(e) =>
              handleDeviceParamChange("daily_msgs_count", e.target.value)
            }
            placeholder="Enter daily message count"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors["device_params.daily_msgs_count"]
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Undermentance
          </label>
          <input
            type="checkbox"
            checked={dwlrParams.device_params.undermentance}
            onChange={(e) =>
              handleDeviceParamChange("undermentance", e.target.checked)
            }
            className="w-4 h-4"
          />
        </div>
      </div>
    </div>
  );

  const renderSensorParam = (sensorKey: keyof DWLRParams, label: string) => {
    const sensor = dwlrParams[sensorKey] as SensorParam;
    const isExpanded = expandedSections[sensorKey];

    const sensorsWithoutNameUnit = [
      "water_column",
      "water_temperature",
      "water_pressure",
      "water_column_from_ground",
    ];
    const shouldHideNameUnit = sensorsWithoutNameUnit.includes(
      sensorKey as string
    );

    return (
      <div
        key={sensorKey}
        className="border border-border-primary rounded-lg p-4"
      >
        <button
          type="button"
          onClick={() => toggleSection(sensorKey)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <label className="block text-lg font-normal text-text-primary font-roboto">
            {label}
          </label>
          <span className="text-text-primary">
            {isExpanded ? (
              <MinusIcon className="w-3 h-3 text-text-primary cursor-pointer font-bold" />
            ) : (
              <PlusIcon className="w-3 h-3 text-text-primary cursor-pointer font-bold" />
            )}
          </span>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sensor.enable}
                onChange={(e) =>
                  handleSensorParamChange(sensorKey, "enable", e.target.checked)
                }
                className="w-4 h-4"
              />
              <label className="text-base font-normal text-text-primary font-roboto">
                Enable
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!shouldHideNameUnit && (
                <div>
                  <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                    Name
                  </label>
                  <input
                    type="text"
                    value={sensor.name}
                    onChange={(e) =>
                      handleSensorParamChange(sensorKey, "name", e.target.value)
                    }
                    placeholder="Enter name"
                    maxLength={50}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                      errors[`${sensorKey}.name`]
                        ? "border-status-danger"
                        : "border-border-primary"
                    }`}
                  />
                </div>
              )}

              {!shouldHideNameUnit && (
                <div>
                  <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={sensor.unit}
                    onChange={(e) =>
                      handleSensorParamChange(sensorKey, "unit", e.target.value)
                    }
                    placeholder="Enter unit"
                    maxLength={20}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                      errors[`${sensorKey}.unit`]
                        ? "border-status-danger"
                        : "border-border-primary"
                    }`}
                  />
                </div>
              )}

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  Multiplier
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sensor.multipliers}
                  onChange={(e) =>
                    handleSensorParamChange(
                      sensorKey,
                      "multipliers",
                      e.target.value
                    )
                  }
                  placeholder="Enter multiplier value"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors[`${sensorKey}.multipliers`]
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  Min
                </label>
                <input
                  type="number"
                  value={sensor.min}
                  onChange={(e) =>
                    handleSensorParamChange(sensorKey, "min", e.target.value)
                  }
                  placeholder="Enter min"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors[`${sensorKey}.min`]
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  Max
                </label>
                <input
                  type="number"
                  value={sensor.max}
                  onChange={(e) =>
                    handleSensorParamChange(sensorKey, "max", e.target.value)
                  }
                  placeholder="Enter max"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors[`${sensorKey}.max`]
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  Set Limit
                </label>
                <input
                  type="number"
                  value={sensor.set_limit}
                  onChange={(e) =>
                    handleSensorParamChange(
                      sensorKey,
                      "set_limit",
                      e.target.value
                    )
                  }
                  placeholder="Enter set limit"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors[`${sensorKey}.set_limit`]
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  Set Min
                </label>
                <input
                  type="number"
                  value={sensor.set_min}
                  onChange={(e) =>
                    handleSensorParamChange(
                      sensorKey,
                      "set_min",
                      e.target.value
                    )
                  }
                  placeholder="Enter set min"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors[`${sensorKey}.set_min`]
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  Set Max
                </label>
                <input
                  type="number"
                  value={sensor.set_max}
                  onChange={(e) =>
                    handleSensorParamChange(
                      sensorKey,
                      "set_max",
                      e.target.value
                    )
                  }
                  placeholder="Enter set max"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors[`${sensorKey}.set_max`]
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  Ref Val
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sensor.ref_val}
                  onChange={(e) =>
                    handleSensorParamChange(
                      sensorKey,
                      "ref_val",
                      e.target.value
                    )
                  }
                  placeholder="Enter ref val"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors[`${sensorKey}.ref_val`]
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                  Ref Percent
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sensor.ref_percent}
                  onChange={(e) =>
                    handleSensorParamChange(
                      sensorKey,
                      "ref_percent",
                      e.target.value
                    )
                  }
                  placeholder="Enter ref percent"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                    errors[`${sensorKey}.ref_percent`]
                      ? "border-status-danger"
                      : "border-border-primary"
                  }`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-2">
          DWLR Parameters
        </label>
      </div>

      <div className="pt-1 flex flex-col gap-4">
        <div className="border border-border-primary rounded-lg p-4">
          <button
            type="button"
            onClick={() => toggleSection("device_params")}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <label className="block text-lg font-normal text-text-primary font-roboto">
              Device Parameter
            </label>
            <span className="text-text-primary">
              {expandedSections.device_params ? (
                <MinusIcon className="w-3 h-3 text-text-primary cursor-pointer font-bold" />
              ) : (
                <PlusIcon className="w-3 h-3 text-text-primary cursor-pointer font-bold" />
              )}
            </span>
          </button>
          {expandedSections.device_params && (
            <div className="mt-4">{renderDeviceParams()}</div>
          )}
        </div>

        {renderSensorParam("water_column", "Water Column")}
        {renderSensorParam("water_temperature", "Water Temperature")}
        {renderSensorParam("water_pressure", "Water Pressure")}
        {renderSensorParam(
          "water_column_from_ground",
          "Water Column From Ground"
        )}
        {renderSensorParam("param_1", "Parameter 1")}
        {renderSensorParam("param_2", "Parameter 2")}
        {renderSensorParam("param_3", "Parameter 3")}
        {renderSensorParam("param_4", "Parameter 4")}
        {renderSensorParam("param_5", "Parameter 5")}
        {renderSensorParam("param_6", "Parameter 6")}
      </div>
    </>
  );
};

export default DWLRParametersForm;
