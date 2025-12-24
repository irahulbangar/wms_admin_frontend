interface BRWHMSInputValues {
  sg: string;
  hmax: string;
  hmin: string;
  A: string;
  B: string;
  A1: string;
  B1: string;
}

interface BRWHMSParametersFormProps {
  brwhmsInputValues: BRWHMSInputValues;
  onBRWHMSParamsChange: (values: BRWHMSInputValues) => void;
  errors: Record<string, string>;
}

const BRWHMSParametersForm: React.FC<BRWHMSParametersFormProps> = ({
  brwhmsInputValues,
  onBRWHMSParamsChange,
  errors,
}) => {
  const handleInputChange = (field: keyof BRWHMSInputValues, value: string) => {
    onBRWHMSParamsChange({
      ...brwhmsInputValues,
      [field]: value,
    });
  };

  return (
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
            onChange={(e) => handleInputChange("sg", e.target.value)}
            placeholder="Enter Distance from Sensor to top of V- Notch"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.sg ? "border-status-danger" : "border-border-primary"
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
            onChange={(e) => handleInputChange("hmax", e.target.value)}
            placeholder="Enter Distance from sensor to V-cone"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.hmax ? "border-status-danger" : "border-border-primary"
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
            onChange={(e) => handleInputChange("hmin", e.target.value)}
            placeholder="Enter Distance from V-Cone to top of V-Notch"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.hmin ? "border-status-danger" : "border-border-primary"
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
            onChange={(e) => handleInputChange("A", e.target.value)}
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
            value={brwhmsInputValues.B}
            onChange={(e) => handleInputChange("B", e.target.value)}
            placeholder="Enter B"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.B ? "border-status-danger" : "border-border-primary"
            }`}
          />
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            A1
          </label>
          <input
            type="text"
            name="A1"
            value={brwhmsInputValues.A1}
            onChange={(e) => handleInputChange("A1", e.target.value)}
            placeholder="Enter A1"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.A1 ? "border-status-danger" : "border-border-primary"
            }`}
          />
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            B1
          </label>
          <input
            type="text"
            name="B1"
            value={brwhmsInputValues.B1}
            onChange={(e) => handleInputChange("B1", e.target.value)}
            placeholder="Enter B1"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.B1 ? "border-status-danger" : "border-border-primary"
            }`}
          />
        </div>
      </div>
    </>
  );
};

export default BRWHMSParametersForm;
