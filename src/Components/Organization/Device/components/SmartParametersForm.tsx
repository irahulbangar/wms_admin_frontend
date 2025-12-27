import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X } from "lucide-react";

interface DisplayParam {
  name: string;
  report_visible: number;
  diagram_visible: number;
  display_name: string;
  unit: string;
}

interface SmartParametersFormProps {
  displayParams: DisplayParam[];
  onDisplayParamsChange: (params: DisplayParam[]) => void;
  errors: Record<string, string>;
}

const SmartParametersForm: React.FC<SmartParametersFormProps> = ({
  displayParams,
  onDisplayParamsChange,
  errors,
}) => {
  const [expandedParams, setExpandedParams] = useState<Record<number, boolean>>(
    {}
  );
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (displayParams.length > 0 && !hasInitialized.current) {
      setExpandedParams({ 0: true });
      hasInitialized.current = true;
    }
  }, [displayParams.length]);

  const toggleParam = (index: number) => {
    setExpandedParams((prev) => {
      if (prev[index]) {
        return {
          ...prev,
          [index]: false,
        };
      }
      return {
        [index]: true,
      };
    });
  };

  const handleAddParam = () => {
    const newParam: DisplayParam = {
      name: "",
      report_visible: 0,
      diagram_visible: 0,
      display_name: "",
      unit: "",
    };
    const newIndex = displayParams.length;
    onDisplayParamsChange([...displayParams, newParam]);
    if (newIndex === 0) {
      setExpandedParams({ 0: true });
    } else {
      setExpandedParams({ [newIndex]: true });
    }
  };

  const handleRemoveParam = (index: number) => {
    const updatedParams = displayParams.filter((_, i) => i !== index);
    onDisplayParamsChange(updatedParams);
    const newExpanded: Record<number, boolean> = {};
    Object.keys(expandedParams).forEach((key) => {
      const keyNum = parseInt(key);
      if (keyNum < index) {
        newExpanded[keyNum] = expandedParams[keyNum];
      } else if (keyNum > index) {
        newExpanded[keyNum - 1] = expandedParams[keyNum];
      }
    });
    setExpandedParams(newExpanded);
  };

  const handleParamChange = (
    index: number,
    field: keyof DisplayParam,
    value: string | number
  ) => {
    const updatedParams = displayParams.map((param, i) => {
      if (i === index) {
        return {
          ...param,
          [field]: value,
        };
      }
      return param;
    });
    onDisplayParamsChange(updatedParams);
  };

  return (
    <>
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
          Smart Device Parameters
        </label>
      </div>

      <div className="pt-4 space-y-3">
        {displayParams.map((param, index) => (
          <div
            key={index}
            className="border border-border-primary rounded-lg bg-primary"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-base font-normal text-text-primary font-roboto">
                  {param.display_name || `Parameter ${index + 1}`}
                </span>
                {param.name && (
                  <span className="text-sm text-text-secondary font-roboto">
                    ({param.name})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleParam(index)}
                  className="text-text-primary hover:text-text-primary transition-colors cursor-pointer"
                >
                  {expandedParams[index] ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
                {displayParams.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveParam(index)}
                    className="text-status-danger hover:text-status-danger/80 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {expandedParams[index] && (
              <div className="px-4 pb-4 space-y-4 border-t border-border-primary pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={param.report_visible === 1}
                      onChange={(e) =>
                        handleParamChange(
                          index,
                          "report_visible",
                          e.target.checked ? 1 : 0
                        )
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label className="text-base font-normal text-text-primary font-roboto">
                      Report Visible
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={param.diagram_visible === 1}
                      onChange={(e) =>
                        handleParamChange(
                          index,
                          "diagram_visible",
                          e.target.checked ? 1 : 0
                        )
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label className="text-base font-normal text-text-primary font-roboto">
                      Diagram Visible
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                      Name <span className="text-status-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) =>
                        handleParamChange(index, "name", e.target.value)
                      }
                      placeholder="Enter parameter name (e.g., 'a')"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary font-roboto ${
                        errors[`display_params.${index}.name`]
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                    {errors[`display_params.${index}.name`] && (
                      <p className="mt-1 text-sm text-status-danger font-roboto">
                        {errors[`display_params.${index}.name`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                      Display Name <span className="text-status-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={param.display_name}
                      onChange={(e) =>
                        handleParamChange(index, "display_name", e.target.value)
                      }
                      placeholder="Enter display name (e.g., 'Area')"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary font-roboto ${
                        errors[`display_params.${index}.display_name`]
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                    {errors[`display_params.${index}.display_name`] && (
                      <p className="mt-1 text-sm text-status-danger font-roboto">
                        {errors[`display_params.${index}.display_name`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={param.unit}
                      onChange={(e) =>
                        handleParamChange(index, "unit", e.target.value)
                      }
                      placeholder="Enter unit (e.g., 'm^2')"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary font-roboto ${
                        errors[`display_params.${index}.unit`]
                          ? "border-status-danger"
                          : "border-border-primary"
                      }`}
                    />
                    {errors[`display_params.${index}.unit`] && (
                      <p className="mt-1 text-sm text-status-danger font-roboto">
                        {errors[`display_params.${index}.unit`]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddParam}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-border-primary rounded-lg hover:bg-secondary transition-colors text-text-primary font-roboto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Parameter</span>
        </button>
      </div>
    </>
  );
};

export default SmartParametersForm;
