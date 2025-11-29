interface TankInputValues {
  height: string;
  storageCapacity: string;
  sensorPostion: string;
  crossSectionArea: string;
}

interface TankParametersFormProps {
  tankInputValues: TankInputValues;
  onTankParamsChange: (values: TankInputValues) => void;
  errors: Record<string, string>;
}

const TankParametersForm: React.FC<TankParametersFormProps> = ({
  tankInputValues,
  onTankParamsChange,
  errors,
}) => {
  const handleInputChange = (
    field: keyof TankInputValues,
    value: string
  ) => {
    onTankParamsChange({
      ...tankInputValues,
      [field]: value,
    });
  };

  return (
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
            onChange={(e) => handleInputChange("height", e.target.value)}
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
            onChange={(e) =>
              handleInputChange("storageCapacity", e.target.value)
            }
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
            onChange={(e) =>
              handleInputChange("sensorPostion", e.target.value)
            }
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
            onChange={(e) =>
              handleInputChange("crossSectionArea", e.target.value)
            }
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
  );
};

export default TankParametersForm;

