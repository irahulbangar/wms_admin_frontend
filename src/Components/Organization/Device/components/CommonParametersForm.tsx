interface CommonParams {
  maxThreshold: string;
  lowerLimit: string;
  upperLimit: string;
  refValue: number;
  refPercent: number;
  multiplier: string;
  shifter: string;
  A: string;
  B: string;
  C: string;
  D: string;
  overWrite: number;
}

interface CommonParametersFormProps {
  commonInputValues: CommonParams;
  onCommonParamsChange: (params: CommonParams) => void;
  errors: Record<string, string>;
  isBRWHMS: boolean;
  isBDWFMS: boolean;
}

const CommonParametersForm: React.FC<CommonParametersFormProps> = ({
  commonInputValues,
  onCommonParamsChange,
  errors,
  isBRWHMS,
  isBDWFMS,
}) => {
  const handleInputChange = (
    field: keyof CommonParams,
    value: string | number
  ) => {
    onCommonParamsChange({
      ...commonInputValues,
      [field]: value,
    });
  };

  return (
    <>
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
          Common Parameters
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Over Write
          </label>
          <input
            type="checkbox"
            checked={commonInputValues.overWrite === 1}
            onChange={(e) =>
              handleInputChange("overWrite", e.target.checked ? 1 : 0)
            }
            className="w-4 h-4 cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Ref Value
          </label>
          <input
            type="text"
            value={commonInputValues.refValue}
            onChange={(e) => handleInputChange("refValue", e.target.value)}
            placeholder="Enter ref value"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.refValue ? "border-status-danger" : "border-border-primary"
            }`}
          />
        </div>
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Ref Percent
          </label>
          <input
            type="text"
            value={commonInputValues.refPercent}
            onChange={(e) => handleInputChange("refPercent", e.target.value)}
            placeholder="Enter ref percent"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.refPercent
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Lower Limit
          </label>
          <input
            type="text"
            value={commonInputValues.lowerLimit}
            onChange={(e) => handleInputChange("lowerLimit", e.target.value)}
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
            value={commonInputValues.upperLimit}
            onChange={(e) => handleInputChange("upperLimit", e.target.value)}
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
            value={commonInputValues.multiplier}
            onChange={(e) => handleInputChange("multiplier", e.target.value)}
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
            value={commonInputValues.shifter}
            onChange={(e) => handleInputChange("shifter", e.target.value)}
            placeholder="Enter shifter"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.shifter ? "border-status-danger" : "border-border-primary"
            }`}
          />
        </div>
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Max Threshold
          </label>
          <input
            type="text"
            value={commonInputValues.maxThreshold}
            onChange={(e) => handleInputChange("maxThreshold", e.target.value)}
            placeholder="Enter max threshold"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.maxThreshold
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />
        </div>

        {!isBRWHMS && !isBDWFMS && (
          <>
            <div>
              <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                A
              </label>
              <input
                type="text"
                value={commonInputValues.A}
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
                value={commonInputValues.B}
                onChange={(e) => handleInputChange("B", e.target.value)}
                placeholder="Enter B"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                  errors.B ? "border-status-danger" : "border-border-primary"
                }`}
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            C
          </label>
          <input
            type="text"
            value={commonInputValues.C}
            onChange={(e) => handleInputChange("C", e.target.value)}
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
            value={commonInputValues.D}
            onChange={(e) => handleInputChange("D", e.target.value)}
            placeholder="Enter D"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              errors.D ? "border-status-danger" : "border-border-primary"
            }`}
          />
        </div>
      </div>
    </>
  );
};

export default CommonParametersForm;
