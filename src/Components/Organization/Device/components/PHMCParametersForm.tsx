import type { DeviceResult } from "../../../../../model/devices.interface";

interface PHMCParams {
  lower_tank: {
    enable: number;
    tank_id: number;
    min_level: string;
    max_level: string;
  };
  upper_tank: {
    enable: number;
    tank_id: number;
    min_level: string;
    max_level: string;
  };
}

interface PHMCParametersFormProps {
  phmcParams: PHMCParams;
  onPHMCParamsChange: (params: PHMCParams) => void;
  errors: Record<string, string>;
  tankDevices: DeviceResult[];
}

const PHMCParametersForm: React.FC<PHMCParametersFormProps> = ({
  phmcParams,
  onPHMCParamsChange,
  errors,
  tankDevices,
}) => {
  console.log(tankDevices);
  const handleLowerTankChange = (
    field: keyof PHMCParams["lower_tank"],
    value: string | number
  ) => {
    onPHMCParamsChange({
      ...phmcParams,
      lower_tank: {
        ...phmcParams.lower_tank,
        [field]: value,
      },
    });
  };

  const handleUpperTankChange = (
    field: keyof PHMCParams["upper_tank"],
    value: string | number
  ) => {
    onPHMCParamsChange({
      ...phmcParams,
      upper_tank: {
        ...phmcParams.upper_tank,
        [field]: value,
      },
    });
  };

  return (
    <>
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
          PHMC Parameters
        </label>
      </div>

      {/* Lower Tank Section */}
      <div className="pt-4">
        <label className="block text-lg font-normal text-text-primary mb-3 font-roboto">
          Lower Tank
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-2">
            <label className="text-base font-normal text-text-primary font-roboto">
              Enable
            </label>
            <input
              type="checkbox"
              checked={phmcParams.lower_tank.enable === 1}
              onChange={(e) =>
                handleLowerTankChange("enable", e.target.checked ? 1 : 0)
              }
              className="w-4 h-4"
            />
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Select Tank
            </label>
            <select
              value={phmcParams.lower_tank.tank_id || ""}
              onChange={(e) =>
                handleLowerTankChange(
                  "tank_id",
                  e.target.value ? parseInt(e.target.value) : 0
                )
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.lower_tank_tank_id
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            >
              <option value="">Select a tank</option>
              {tankDevices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.device_name}
                </option>
              ))}
            </select>
            {errors.lower_tank_tank_id && (
              <p className="mt-1 text-sm text-status-danger font-roboto">
                {errors.lower_tank_tank_id}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Min Level
            </label>
            <input
              type="text"
              value={phmcParams.lower_tank.min_level}
              onChange={(e) =>
                handleLowerTankChange("min_level", e.target.value)
              }
              placeholder="Enter min level"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.lower_tank_min_level
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            />
            {errors.lower_tank_min_level && (
              <p className="mt-1 text-sm text-status-danger font-roboto">
                {errors.lower_tank_min_level}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Max Level
            </label>
            <input
              type="text"
              value={phmcParams.lower_tank.max_level}
              onChange={(e) =>
                handleLowerTankChange("max_level", e.target.value)
              }
              placeholder="Enter max level"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.lower_tank_max_level
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            />
            {errors.lower_tank_max_level && (
              <p className="mt-1 text-sm text-status-danger font-roboto">
                {errors.lower_tank_max_level}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upper Tank Section */}
      <div className="pt-6">
        <label className="block text-lg font-normal text-text-primary mb-3 font-roboto">
          Upper Tank
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-2">
            <label className="text-base font-normal text-text-primary font-roboto">
              Enable
            </label>
            <input
              type="checkbox"
              checked={phmcParams.upper_tank.enable === 1}
              onChange={(e) =>
                handleUpperTankChange("enable", e.target.checked ? 1 : 0)
              }
              className="w-4 h-4"
            />
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Select Tank
            </label>
            <select
              value={phmcParams.upper_tank.tank_id || ""}
              onChange={(e) =>
                handleUpperTankChange(
                  "tank_id",
                  e.target.value ? parseInt(e.target.value) : 0
                )
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.upper_tank_tank_id
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            >
              <option value="">Select a tank</option>
              {tankDevices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.device_name}
                </option>
              ))}
            </select>
            {errors.upper_tank_tank_id && (
              <p className="mt-1 text-sm text-status-danger font-roboto">
                {errors.upper_tank_tank_id}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Min Level
            </label>
            <input
              type="text"
              value={phmcParams.upper_tank.min_level}
              onChange={(e) =>
                handleUpperTankChange("min_level", e.target.value)
              }
              placeholder="Enter min level"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.upper_tank_min_level
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            />
            {errors.upper_tank_min_level && (
              <p className="mt-1 text-sm text-status-danger font-roboto">
                {errors.upper_tank_min_level}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Max Level
            </label>
            <input
              type="text"
              value={phmcParams.upper_tank.max_level}
              onChange={(e) =>
                handleUpperTankChange("max_level", e.target.value)
              }
              placeholder="Enter max level"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors.upper_tank_max_level
                  ? "border-status-danger"
                  : "border-border-primary"
              }`}
            />
            {errors.upper_tank_max_level && (
              <p className="mt-1 text-sm text-status-danger font-roboto">
                {errors.upper_tank_max_level}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PHMCParametersForm;
