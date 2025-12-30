import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";
import { isRecordTimeOld } from "../../utils/utils";
import smartDeviceIcon from "../../assets/images/smart-logo.png";

interface SmartDeviceNodeProps {
  data: NodeData;
}

const SmartDeviceNode: React.FC<SmartDeviceNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const departmentConnection = data.departmentConnection || "";
  const plantConnection = data.plantConnection || "";
  const organizationConnection = data.organizationConnection || "";
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "";
  const deviceName = data.label || "";
  const lastRecordTime = data.lastRecordTime || "";
  const displayParams =
    data.displayParams?.filter(
      (param) => param.diagram_visible === 1 && param.report_visible !== 0
    ) || [];
  const recordTimeOld = isRecordTimeOld(lastRecordTime);
  const lastRecord = data.lastRecord || {};
  console.log("lastRecord", lastRecord);

  const connectionInfo = [
    `System Name : ${systemName}`,
    `Device Name : ${deviceName}`,
    organizationConnection ? `Org Conn. : ${organizationConnection}` : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    departmentConnection ? `Dep Conn. : ${departmentConnection}` : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  const borderColor = recordTimeOld
    ? "border-status-danger"
    : isActive
    ? "border-status-success"
    : "border-status-danger";

  return (
    <div
      className={`relative w-fit h-fit bg-primary/20 border border-border-primary rounded-md p-1 z-10 ${borderColor}`}
      title={connectionInfo}
    >
      <div className="text-sm font-normal text-left font-roboto text-wrap mb-1 px-1 text-text-primary leading-4">
        {deviceName}
      </div>

      <div className="flex justify-center items-center">
        <img
          src={smartDeviceIcon}
          alt="smart-device"
          className="w-12 h-12 object-contain"
        />
      </div>

      <div className="flex flex-col mt-1">
        {displayParams.map((param) => {
          const value =
            lastRecord && typeof lastRecord === "object"
              ? lastRecord[param.name]
              : null;
          return (
            <div
              key={param.display_name}
              className="text-sm font-normal text-left font-roboto text-wrap px-1 text-text-primary leading-4 whitespace-nowrap"
            >
              {param.display_name} :{" "}
              <span className="text-status-info">
                {value !== null && value !== undefined ? value.toFixed(2) : "-"}
              </span>
              <span className="italic text-xs">{param.unit}</span>
            </div>
          );
        })}
      </div>

      <div
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          recordTimeOld
            ? "bg-status-danger animate-pulse"
            : isActive
            ? "bg-status-success animate-pulse"
            : "bg-status-danger"
        }`}
      />

      <Handle
        type="target"
        position={HandlePosition.Left}
        className="w-3 h-3 bg-status-info"
      />
      <Handle
        type="source"
        position={HandlePosition.Right}
        className="w-3 h-3 bg-status-info"
      />
    </div>
  );
};

export default SmartDeviceNode;
