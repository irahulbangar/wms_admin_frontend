import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";
import { isRecordTimeOld } from "../../utils/utils";

interface DWLRNodeProps {
  data: NodeData;
}

const DWLRNode: React.FC<DWLRNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const departmentConnection = data.departmentConnection || "";
  const plantConnection = data.plantConnection || "";
  const organizationConnection = data.organizationConnection || "";
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "";
  const deviceName = data.label || "";
  const lastRecordTime = data.lastRecordTime || "";

  const waterColumn = data.currentLevel || data.reportValue || 0;
  const unit = data.unit || "mm";
  const batteryVoltage = data.voltageR || 0;

  const connectionInfo = [
    `System Name : ${systemName}`,
    `Device Name : ${deviceName}`,
    organizationConnection ? `Org Conn. : ${organizationConnection}` : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    departmentConnection ? `Dep Conn. : ${departmentConnection}` : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
    `Water Column : ${waterColumn} ${unit}`,
    `Battery Voltage : ${batteryVoltage / 10}V`,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  const recordTimeOld = isRecordTimeOld(lastRecordTime);

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
      <div className="text-sm font-normal text-left text-wrap font-roboto mb-1 px-1 leading-4 text-text-primary">
        {data.label}
      </div>

      <div className="flex justify-center items-center">
        <div className="w-12 h-12 flex items-center justify-center bg-primary/30 rounded border border-border-primary">
          <span className="text-text-primary font-roboto text-xs font-semibold">
            DWLR
          </span>
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

      <div className="flex items-center justify-center gap-1 absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="text-text-secondary font-roboto text-sm font-normal whitespace-nowrap">
          Water Column :
        </div>
        <div className="text-status-info font-roboto text-sm truncate px-1">
          {waterColumn} {unit}
        </div>
      </div>

      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-text-primary font-roboto text-sm flex items-center justify-center gap-1">
        <div className="text-text-secondary font-roboto text-sm whitespace-nowrap">
          Battery :{" "}
        </div>
        <div className="text-text-primary font-roboto text-sm whitespace-nowrap">
          {batteryVoltage / 10}V
        </div>
      </div>

      <Handle
        type="target"
        position={HandlePosition.Left}
        className="w-3 h-3 bg-status-success"
      />
      <Handle
        type="source"
        position={HandlePosition.Right}
        className="w-3 h-3 bg-status-success"
      />
    </div>
  );
};

export default DWLRNode;
