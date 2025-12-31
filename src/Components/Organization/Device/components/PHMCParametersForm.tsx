import { CirclePlus, Trash2 } from "lucide-react";
import type { DeviceResult } from "../../../../../model/devices.interface";

interface UpperTankParam {
  enable: number;
  tank_id: number;
  min_level: string;
  max_level: string;
}

interface PHMCParams {
  lower_tank: {
    enable: number;
    tank_id: number;
    min_level: string;
  };
  upper_tank_params?: UpperTankParam[];
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
  const upperTankParams = phmcParams.upper_tank_params || [];

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

  const handleAddUpperTankParam = () => {
    const newParam: UpperTankParam = {
      enable: 0,
      tank_id: 0,
      min_level: "",
      max_level: "",
    };
    onPHMCParamsChange({
      ...phmcParams,
      upper_tank_params: [...upperTankParams, newParam],
    });
  };

  const handleRemoveUpperTankParam = (index: number) => {
    const updatedParams = upperTankParams.filter((_, i) => i !== index);
    onPHMCParamsChange({
      ...phmcParams,
      upper_tank_params: updatedParams,
    });
  };

  const handleUpperTankParamChange = (
    index: number,
    field: keyof UpperTankParam,
    value: string | number
  ) => {
    const updatedParams = upperTankParams.map((param, i) =>
      i === index ? { ...param, [field]: value } : param
    );
    onPHMCParamsChange({
      ...phmcParams,
      upper_tank_params: updatedParams,
    });
  };

  return (
    <>
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
          Level Controlling Parameters
        </label>
      </div>

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
              className="w-4 h-4 cursor-pointer"
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

        </div>
      </div>

      {/* Upper Tank Parameters Section */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-lg font-normal text-text-primary font-roboto">
            Upper Tank Parameters
          </label>
          <button
            type="button"
            onClick={handleAddUpperTankParam}
            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-roboto text-sm cursor-pointer flex items-center gap-1"
          >
            <CirclePlus className="w-4 h-4" />
            Add Parameter
          </button>
        </div>
      </div>

      {upperTankParams.map((param, index) => (
        <div key={index} className="pt-6 border-t border-border-primary">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-lg font-normal text-text-primary font-roboto">
              Upper Tank Param {index + 1}
            </label>
            <button
              type="button"
              onClick={() => handleRemoveUpperTankParam(index)}
              className="px-3 py-2 bg-status-danger text-white rounded-lg hover:shadow-lg transition-all duration-200 font-roboto text-sm cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-start gap-2">
              <label className="text-base font-normal text-text-primary font-roboto">
                Enable
              </label>
              <input
                type="checkbox"
                checked={param.enable === 1}
                onChange={(e) =>
                  handleUpperTankParamChange(
                    index,
                    "enable",
                    e.target.checked ? 1 : 0
                  )
                }
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                Select Tank
              </label>
              <select
                value={param.tank_id || ""}
                onChange={(e) =>
                  handleUpperTankParamChange(
                    index,
                    "tank_id",
                    e.target.value ? parseInt(e.target.value) : 0
                  )
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                  errors[`upper_tank_param_${index}_tank_id`]
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
              {errors[`upper_tank_param_${index}_tank_id`] && (
                <p className="mt-1 text-sm text-status-danger font-roboto">
                  {errors[`upper_tank_param_${index}_tank_id`]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                Min Level
              </label>
              <input
                type="text"
                value={param.min_level}
                onChange={(e) =>
                  handleUpperTankParamChange(index, "min_level", e.target.value)
                }
                placeholder="Enter min level"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                  errors[`upper_tank_param_${index}_min_level`]
                    ? "border-status-danger"
                    : "border-border-primary"
                }`}
              />
              {errors[`upper_tank_param_${index}_min_level`] && (
                <p className="mt-1 text-sm text-status-danger font-roboto">
                  {errors[`upper_tank_param_${index}_min_level`]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                Max Level
              </label>
              <input
                type="text"
                value={param.max_level}
                onChange={(e) =>
                  handleUpperTankParamChange(index, "max_level", e.target.value)
                }
                placeholder="Enter max level"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                  errors[`upper_tank_param_${index}_max_level`]
                    ? "border-status-danger"
                    : "border-border-primary"
                }`}
              />
              {errors[`upper_tank_param_${index}_max_level`] && (
                <p className="mt-1 text-sm text-status-danger font-roboto">
                  {errors[`upper_tank_param_${index}_max_level`]}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PHMCParametersForm;
