import type { DeviceFamilyResult } from "../../../../../model/device-family.interface";
import type { DeviceTypeResult } from "../../../../../model/device-type.interface";
import type { CreateDevicePayload } from "../../../../../store/deviceSlice";

interface DeviceDetailsFormProps {
  formData: CreateDevicePayload;
  onFormDataChange: (data: CreateDevicePayload) => void;
  errors: Record<string, string>;
  familyData: DeviceFamilyResult[];
  typeData: DeviceTypeResult[];
}

const DeviceDetailsForm: React.FC<DeviceDetailsFormProps> = ({
  formData,
  onFormDataChange,
  errors,
  familyData,
  typeData,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "device_family_id") {
      onFormDataChange({
        ...formData,
        device_family_id: parseInt(value) || 0,
        device_type_id: 0,
      });
    } else if (name === "device_type_id") {
      onFormDataChange({
        ...formData,
        device_type_id: parseInt(value) || 0,
      });
    } else {
      onFormDataChange({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <>
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
              onChange={handleInputChange}
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
            maxLength={20}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.hwid ? "border-status-danger" : "border-border-primary"
            }`}
          />
        </div>
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Hidden Data
          </label>
          <input
            type="checkbox"
            name="hide_data"
            checked={formData.hide_data}
            onChange={handleInputChange}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
      </div>
    </>
  );
};

export default DeviceDetailsForm;
