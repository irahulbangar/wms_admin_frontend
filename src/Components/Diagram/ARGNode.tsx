import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";
import argIcon from "../../assets/images/arg-logo.png";
import { isRecordTimeOld } from "../../utils/utils";

interface ARGNodeProps {
  data: NodeData;
}

const ARGNode: React.FC<ARGNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const maxMm = Number(data.maxMm) || 0;
  const minMm = Number(data.minMm) || 0;
  const lastMm = Number(data.lastMm) || 0;
  // const firstMm = Number(data.firstMm) || 0;
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "none";
  const departmentConnection = data.departmentConnection || "none";
  const plantConnection = data.plantConnection || "none";
  const organizationConnection = data.organizationConnection || "none";
  const deviceName = data.label || "";
  const lastRecordTime = data.lastRecordTime || "";

  const recordTimeOld = isRecordTimeOld(lastRecordTime);
  
  const borderColor = recordTimeOld
    ? "border-status-danger"
    : isActive
    ? "border-status-success"
    : "border-status-danger";

  return (
    <div
      className={`relative w-25 h-fit bg-primary/20 border border-border-primary rounded-md p-1 z-0 ${borderColor}`}
      title={`
System Name : ${systemName}
Device Name : ${deviceName}
Organization Connection : ${organizationConnection}
Plant Connection : ${plantConnection}
Department Connection : ${departmentConnection}
System Connection : ${systemConnection}
      `}
    >
      <div className="text-sm font-normal text-left font-roboto text-wrap mb-1 px-1 text-purple-800 leading-4">
        {deviceName}
      </div>

      <div className="flex justify-center items-center">
        <img src={argIcon} alt="arg" className="w-12 h-12 object-contain" />
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

      <div className="text-center mb-1">
        <div className="text-text-primary font-roboto text-xs font-normal">
          Rain:
        </div>
        <div className="font-normal text-purple-600 font-roboto text-[10px] truncate px-1">
          {lastMm} mm
        </div>
      </div>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-text-primary font-roboto max-w-32">
        <div className="truncate text-center font-normal font-roboto text-xs">
          Max: {maxMm}mm | Min: {minMm}mm
        </div>
      </div>

      <Handle
        type="target"
        position={HandlePosition.Left}
        className="w-3 h-3 bg-purple-500"
      />
      <Handle
        type="source"
        position={HandlePosition.Right}
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
};

export default ARGNode;
