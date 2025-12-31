interface ComplianceLimit {
  enable: number;
  start_date: string;
  end_date: string;
  absolute_limit: string;
}

interface ComplianceLimits {
  day_wise: ComplianceLimit;
  month_wise: ComplianceLimit;
  year_wise: ComplianceLimit;
}

interface ComplianceLimitsFormProps {
  complianceLimits: ComplianceLimits;
  onComplianceLimitsChange: (limits: ComplianceLimits) => void;
  errors: Record<string, string>;
}

const ComplianceLimitsForm: React.FC<ComplianceLimitsFormProps> = ({
  complianceLimits,
  onComplianceLimitsChange,
  errors,
}) => {
  const handleLimitChange = (
    period: "day_wise" | "month_wise" | "year_wise",
    field: keyof ComplianceLimit,
    value: string | number
  ) => {
    let formattedValue = value;

    if (
      field === "start_date" &&
      (period === "month_wise" || period === "year_wise")
    ) {
      if (typeof value === "string" && value) {
        formattedValue = `${value}T00:00:00`;
      }
    } else if (
      field === "end_date" &&
      (period === "month_wise" || period === "year_wise")
    ) {
      if (typeof value === "string" && value) {
        formattedValue = `${value}T23:59:59`;
      }
    }

    onComplianceLimitsChange({
      ...complianceLimits,
      [period]: {
        ...(complianceLimits[period] || {
          enable: 0,
          start_date: "",
          end_date: "",
          absolute_limit: "",
        }),
        [field]: formattedValue,
      },
    });
  };

  const getDateValue = (
    dateTimeString: string,
    period: "day_wise" | "month_wise" | "year_wise"
  ) => {
    if (!dateTimeString) return "";

    if (period === "day_wise") {
      return dateTimeString;
    } else {
      const datePart = dateTimeString.split("T")[0];
      return datePart || "";
    }
  };

  const renderLimitSection = (
    period: "day_wise" | "month_wise" | "year_wise",
    label: string
  ) => {
    const limit = complianceLimits[period] || {
      enable: 0,
      start_date: "",
      end_date: "",
      absolute_limit: "",
    };

    return (
      <div className="pt-4 border-t border-border-primary">
        <label className="block text-lg font-normal text-text-primary mb-3 font-roboto">
          {label}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-2">
            <label className="block text-base font-normal text-text-primary font-roboto">
              Enable
            </label>
            <input
              type="checkbox"
              checked={limit.enable === 1}
              onChange={(e) =>
                handleLimitChange(period, "enable", e.target.checked ? 1 : 0)
              }
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Start Date
            </label>
            <input
              type={period === "day_wise" ? "datetime-local" : "date"}
              value={getDateValue(limit.start_date, period)}
              onChange={(e) =>
                handleLimitChange(period, "start_date", e.target.value)
              }
              disabled={limit.enable === 0}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors[`${period}_start_date`]
                  ? "border-status-danger"
                  : "border-border-primary"
              } ${limit.enable === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {errors[`${period}_start_date`] && (
              <p className="mt-1 text-sm text-status-danger font-roboto">
                {errors[`${period}_start_date`]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              End Date
            </label>
            <input
              type={period === "day_wise" ? "datetime-local" : "date"}
              value={getDateValue(limit.end_date, period)}
              onChange={(e) =>
                handleLimitChange(period, "end_date", e.target.value)
              }
              disabled={limit.enable === 0}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors[`${period}_end_date`]
                  ? "border-status-danger"
                  : "border-border-primary"
              } ${limit.enable === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {errors[`${period}_end_date`] && (
              <p className="mt-1 text-sm text-status-danger font-roboto">
                {errors[`${period}_end_date`]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Absolute Limit
            </label>
            <input
              type="text"
              value={limit.absolute_limit}
              onChange={(e) =>
                handleLimitChange(period, "absolute_limit", e.target.value)
              }
              placeholder="Enter absolute limit"
              disabled={limit.enable === 0}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                errors[`${period}_absolute_limit`]
                  ? "border-status-danger"
                  : "border-border-primary"
              } ${limit.enable === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {errors[`${period}_absolute_limit`] && (
              <p className="mt-1 text-sm text-status-danger font-roboto">
                {errors[`${period}_absolute_limit`]}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto pb-2 pt-4">
          Compliance Limits
        </label>
      </div>

      {renderLimitSection("day_wise", "Day Wise")}
      {renderLimitSection("month_wise", "Month Wise")}
      {renderLimitSection("year_wise", "Year Wise")}
    </>
  );
};

export default ComplianceLimitsForm;
