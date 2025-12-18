import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";
import fmIcon from "../../assets/images/fm-logo.svg";
import { isRecordTimeOld } from "../../utils/utils";

interface FMNodeProps {
  data: NodeData;
}

const FMNode: React.FC<FMNodeProps> = ({ data }) => {
  const unit = data.unit || "Ltr";
  const isActive = data.isActive !== false;
  const totalizerReading = Number(data.totalizerReading) || 0;
  const flowRate = Number(data.flowRate) || 0;
  const departmentConnection = data.departmentConnection || "";
  const organizationConnection = data.organizationConnection || "";
  const plantConnection = data.plantConnection || "";
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "";
  const deviceName = data.label || "";
  const lastRecordTime = data.lastRecordTime || "";

  const connectionInfo = [
    `System Name : ${systemName}`,
    `Device Name : ${deviceName}`,
    organizationConnection ? `Org Conn. : ${organizationConnection}` : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    departmentConnection ? `Dep Conn. : ${departmentConnection}` : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
    `Totalizer : ${totalizerReading} ${unit}`,
    `Flow Rate : ${flowRate} LPM`,
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
        <img src={fmIcon} alt="fm" className="w-12 h-12 object-contain" />
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
          Flow :
        </div>
        <div className="text-status-info font-roboto text-sm truncate px-1">
          {flowRate} LPM
        </div>
      </div>

      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-text-primary font-roboto text-sm flex items-center justify-center gap-1">
        <div className="text-text-secondary font-roboto text-sm whitespace-nowrap">
          Totalizer :{" "}
        </div>
        <div className="text-text-primary font-roboto text-sm whitespace-nowrap">
          {totalizerReading} {unit}
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

export default FMNode;
