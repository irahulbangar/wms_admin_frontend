import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";
import { isRecordTimeOld } from "../../utils/utils";

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

  const recordTimeOld = isRecordTimeOld(lastRecordTime);

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
      className={`relative w-25 h-fit bg-primary/20 border border-border-primary rounded-md p-1 z-10 ${borderColor}`}
      title={connectionInfo}
    >
      <div className="text-sm font-normal text-left font-roboto text-wrap mb-1 px-1 text-text-primary leading-4">
        {deviceName}
      </div>

      <div className="flex justify-center items-center">
        <div className="w-12 h-12 flex items-center justify-center bg-status-info/20 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-status-info"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
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
