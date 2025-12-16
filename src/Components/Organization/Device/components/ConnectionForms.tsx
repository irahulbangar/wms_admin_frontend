import type { CreateDevicePayload } from "../../../../../store/deviceSlice";
import type { PlantResult } from "../../../../../model/plant.interface";
import type { DepartmentResult } from "../../../../../model/department.interface";
import type { SystemResult } from "../../../../../model/system.interface";
import type { ReportTypeResult } from "../../../../../model/report-type.interface";

interface ConnectionFormsProps {
  formData: CreateDevicePayload;
  onFormDataChange: (data: CreateDevicePayload) => void;
  plantData: PlantResult[];
  departmentData: DepartmentResult[];
  systemData: SystemResult[];
  reportTypes: ReportTypeResult[];
  organizationId: number;
  plant_id: number | null;
  isInReportType: boolean;
  isOutReportType: boolean;
  isStorageReportType: boolean;
}

const ConnectionForms: React.FC<ConnectionFormsProps> = ({
  formData,
  onFormDataChange,
  plantData,
  departmentData,
  systemData,
  reportTypes,
  organizationId,
  plant_id,
  isInReportType,
  isOutReportType,
  isStorageReportType,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    const fieldMappings: Record<string, string> = {
      plant_in: "in_plant_id",
      plant_out: "out_plant_id",
      department_in: "in_department_id",
      department_out: "out_department_id",
      system_in: "in_system_id",
      system_out: "out_system_id",
    };

    const actualFieldName = fieldMappings[name] || name;

    if (fieldMappings[name]) {
      const numericValue = value === "null" ? -1 : parseInt(value) || 0;
      onFormDataChange({
        ...formData,
        [actualFieldName]: numericValue,
      });
    } else if (name === "report_type_id") {
      const reportTypeId = parseInt(value) || 0;
      const selectedReportType = reportTypes.find(
        (rt) => rt.report_type_id === reportTypeId
      );

      const inReportType = ["Rainfall", "Regeneration", "Re-use"];
      const outReportType = [
        "Evaporation",
        "Consumption",
        "Wastage",
        "Percolation",
      ];

      const isInType = selectedReportType
        ? inReportType.includes(selectedReportType.report_type_name)
        : false;
      const isOutType = selectedReportType
        ? outReportType.includes(selectedReportType.report_type_name)
        : false;

      const updatedData: CreateDevicePayload = {
        ...formData,
        report_type_id: reportTypeId,
      };

      if (isInType) {
        updatedData.out_plant_id = -1;
        updatedData.out_department_id = -1;
        updatedData.out_system_id = -1;
      } else if (isOutType) {
        updatedData.in_plant_id = -1;
        updatedData.in_department_id = -1;
        updatedData.in_system_id = -1;
      }

      onFormDataChange(updatedData);
    } else {
      onFormDataChange({
        ...formData,
        [actualFieldName]: value,
      });
    }
  };

  return (
    <>
      {/* Device Connection */}
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
          Device Connection
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Device Visibility
          </label>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
          >
            <option value="0">Select Visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Report Type
          </label>
          <select
            name="report_type_id"
            value={formData.report_type_id || ""}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
          >
            <option value="0">Select Report Type</option>
            {reportTypes.map((reportType) => (
              <option
                key={reportType.report_type_id}
                value={reportType.report_type_id}
              >
                {reportType.report_type_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Organization Connection
          </label>
          <select
            name="organization_connection"
            value={formData.organization_connection}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
          >
            <option value="0">Select Organization Connection</option>
            <option value="none">None</option>
            <option value="in">In</option>
            <option value="out">Out</option>
          </select>
        </div>

        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Device Flow Direction
          </label>
          <select
            name="device_flow_direction"
            value={formData.device_flow_direction}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary"
          >
            <option value="0">Select Device Flow Direction</option>
            <option value="none">None</option>
            <option value="single">Single Way</option>
            <option value="multi">Multi Way</option>
          </select>
        </div>
      </div>

      {/* Plant Connection */}
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
          Plant Connection
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            {isStorageReportType ? "Select Plant" : "Plant In"}
          </label>
          <select
            name="plant_in"
            value={
              formData.in_plant_id === null || formData.in_plant_id === -1
                ? "null"
                : formData.in_plant_id || "0"
            }
            onChange={handleInputChange}
            disabled={isOutReportType}
            className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              isOutReportType ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="0">Select Plant</option>
            <option value="null">None</option>
            {plantData
              .filter(
                (plant) =>
                  plant.organization_id === organizationId &&
                  plant.plant_id === plant_id
              )
              .map((plant) => (
                <option key={plant.plant_id} value={plant.plant_id}>
                  {plant.plant_name}
                </option>
              ))}
          </select>
        </div>

        {!isStorageReportType && (
          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Plant Out
            </label>
            <select
              name="plant_out"
              value={
                formData.out_plant_id === null || formData.out_plant_id === -1
                  ? "null"
                  : formData.out_plant_id || "0"
              }
              onChange={handleInputChange}
              disabled={isInReportType}
              className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                isInReportType ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="0">Select Plant</option>
              <option value="null">None</option>
              {plantData
                .filter(
                  (plant) =>
                    plant.organization_id === organizationId &&
                    plant.plant_id === plant_id
                )
                .map((plant) => (
                  <option key={plant.plant_id} value={plant.plant_id}>
                    {plant.plant_name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Department Connection */}
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
          {!isStorageReportType &&
          formData.in_department_id !== null &&
          formData.in_department_id !== -1 &&
          formData.in_department_id !== 0 &&
          formData.out_department_id !== null &&
          formData.out_department_id !== -1 &&
          formData.out_department_id !== 0
            ? "Department Connection (Both)"
            : "Department Connection"}
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            {isStorageReportType ? "Select Department" : "Department In"}
          </label>
          <select
            name="department_in"
            value={
              formData.in_department_id === null ||
              formData.in_department_id === -1
                ? "null"
                : formData.in_department_id || "0"
            }
            onChange={handleInputChange}
            disabled={isOutReportType}
            className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              isOutReportType ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="0">Select Department</option>
            <option value="null">None</option>
            {departmentData
              .filter(
                (department) =>
                  department.plant_id === plant_id &&
                  department.organization_id === organizationId
              )
              .map((department) => (
                <option
                  key={department.department_id}
                  value={department.department_id}
                >
                  {department.department_name}
                </option>
              ))}
          </select>
        </div>

        {!isStorageReportType && (
          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              Department Out
            </label>
            <select
              name="department_out"
              value={
                formData.out_department_id === null ||
                formData.out_department_id === -1
                  ? "null"
                  : formData.out_department_id || "0"
              }
              onChange={handleInputChange}
              disabled={isInReportType}
              className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                isInReportType ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="0">Select Department</option>
              <option value="null">None</option>
              {departmentData
                .filter(
                  (department) =>
                    department.plant_id === plant_id &&
                    department.organization_id === organizationId
                )
                .map((department) => (
                  <option
                    key={department.department_id}
                    value={department.department_id}
                  >
                    {department.department_name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* System Connection */}
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
          {!isStorageReportType &&
          formData.in_system_id !== null &&
          formData.in_system_id !== -1 &&
          formData.in_system_id !== 0 &&
          formData.out_system_id !== null &&
          formData.out_system_id !== -1 &&
          formData.out_system_id !== 0
            ? "System Connection (Both)"
            : "System Connection"}
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            {isStorageReportType ? "Select System" : "System In"}
          </label>
          <select
            name="system_in"
            value={
              formData.in_system_id === null || formData.in_system_id === -1
                ? "null"
                : formData.in_system_id || "0"
            }
            onChange={handleInputChange}
            disabled={isOutReportType}
            className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
              isOutReportType ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="0">Select System</option>
            <option value="null">None</option>
            {systemData
              .filter(
                (system) =>
                  system.plant_id === plant_id &&
                  system.organization_id === organizationId
              )
              .map((system) => (
                <option key={system.system_id} value={system.system_id}>
                  {system.system_name}
                </option>
              ))}
          </select>
        </div>

        {!isStorageReportType && (
          <div>
            <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
              System Out
            </label>
            <select
              name="system_out"
              value={
                formData.out_system_id === null || formData.out_system_id === -1
                  ? "null"
                  : formData.out_system_id || "0"
              }
              onChange={handleInputChange}
              disabled={isInReportType}
              className={`w-full px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary ${
                isInReportType ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="0">Select System</option>
              <option value="null">None</option>
              {systemData
                .filter(
                  (system) =>
                    system.plant_id === plant_id &&
                    system.organization_id === organizationId
                )
                .map((system) => (
                  <option key={system.system_id} value={system.system_id}>
                    {system.system_name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
    </>
  );
};

export default ConnectionForms;
