import { Editor } from "@monaco-editor/react";
import DevicePathList from "./DevicePathList";
import type { DeviceResult } from "../../../../../model/devices.interface";
import type { DepartmentResult } from "../../../../../model/department.interface";
import type { SystemResult } from "../../../../../model/system.interface";

interface VirtualReporting {
  report_name: string;
  report_unit: string;
  report_formula: string;
}

interface VirtualReportingFormProps {
  reportData: VirtualReporting;
  onReportDataChange: (data: VirtualReporting) => void;
  systemDevices: DeviceResult[];
  departmentData: DepartmentResult[];
  systemData: SystemResult[];
}

const VirtualReportingForm: React.FC<VirtualReportingFormProps> = ({
  reportData,
  onReportDataChange,
  systemDevices,
  departmentData,
  systemData,
}) => {
  return (
    <>
      <div>
        <label className="block text-xl font-normal text-text-primary font-roboto border-b border-border-primary pb-2 pt-4">
          Resultant Reporting
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Report Name
          </label>
          <input
            type="text"
            name="report_name"
            value={reportData.report_name}
            onChange={(e) =>
              onReportDataChange({
                ...reportData,
                report_name: e.target.value,
              })
            }
            className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
            placeholder="Enter report name"
          />
        </div>
        <div>
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Report Unit
          </label>
          <input
            type="text"
            name="report_unit"
            value={reportData.report_unit}
            onChange={(e) =>
              onReportDataChange({
                ...reportData,
                report_unit: e.target.value,
              })
            }
            className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
            placeholder="Enter report unit"
          />
        </div>
      </div>
      <div>
        <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
          Report Formula
        </label>
        {systemDevices.length > 0 && (
          <DevicePathList
            systemDevices={systemDevices}
            departmentData={departmentData}
            systemData={systemData}
            reportFormula={reportData.report_formula}
            onPathSelect={(path) => {
              const currentValue = reportData.report_formula || "";
              onReportDataChange({
                ...reportData,
                report_formula: currentValue
                  ? `${currentValue}\n${path}`
                  : path,
              });
            }}
          />
        )}
        <Editor
          height="80%"
          width="100%"
          value={reportData.report_formula}
          onChange={(value) =>
            onReportDataChange({
              ...reportData,
              report_formula: value ? value : "",
            })
          }
          language="javascript"
          className="w-full h-[150px] px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
          onMount={(_editor, monaco) => {
            if (!monaco) return;
            
            // Get device paths for autocomplete
            const devicePaths: { path: string; device: DeviceResult }[] = [];
            systemDevices
              .filter((device) => {
                const isVirtual =
                  device.device_family_type === "virtual" ||
                  device.device_family?.toLowerCase().includes("virtual");
                return !isVirtual;
              })
              .forEach((device) => {
                const department = departmentData.find(
                  (d) => d.department_id === device.department_id
                );
                const departmentName = department?.department_name || "";

                const system = systemData.find((s) => s.system_id === device.system_id);
                const systemName = system?.system_name || "";

                const deviceName = device.device_name || "";

                if (departmentName && systemName && deviceName) {
                  devicePaths.push({
                    path: `plant['${departmentName}']['${systemName}']['${deviceName}']`,
                    device: device,
                  });
                }
              });

            monaco.languages.registerCompletionItemProvider("javascript", {
              provideCompletionItems: () => {
                const suggestions = devicePaths.map((item) => ({
                  label: item.path,
                  kind: monaco.languages.CompletionItemKind.Variable,
                  insertText: item.path,
                  documentation: `Device path: ${item.path}`,
                  detail: "System Device",
                }));

                return { suggestions };
              },
              triggerCharacters: ["p", "l", "a", "n", "t", "[", "'"],
            });

            monaco.languages.registerHoverProvider("javascript", {
              provideHover: (model: any, position: any) => {
                const word = model.getWordAtPosition(position);
                if (word) {
                  const devicePath = devicePaths.find((item) =>
                    item.path.includes(word.word)
                  );
                  if (devicePath) {
                    return {
                      range: new monaco.Range(
                        position.lineNumber,
                        word.startColumn,
                        position.lineNumber,
                        word.endColumn
                      ),
                      contents: [
                        {
                          value: `**Device Path:**\n\`${devicePath.path}\``,
                        },
                      ],
                    };
                  }
                }
                return null;
              },
            });
          }}
        />
      </div>
    </>
  );
};

export default VirtualReportingForm;

