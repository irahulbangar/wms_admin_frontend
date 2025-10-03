import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface ARGNodeProps {
  data: NodeData;
}

const ARGNode: React.FC<ARGNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const maxMm = Number(data.maxMm) || 0;
  const minMm = Number(data.minMm) || 0;
  const lastMm = Number(data.lastMm) || 0;
  const firstMm = Number(data.firstMm) || 0;
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "none";
  const departmentConnection = data.departmentConnection || "none";
  const plantConnection = data.plantConnection || "none";
  const organizationConnection = data.organizationConnection || "none";
  const deviceName = data.label || "";

  return (
    <div
      className={`relative w-24 h-20 bg-gradient-to-br from-purple-50 to-purple-100 border rounded-lg p-1 z-0 ${
        isActive ? "border-status-success" : "border-border-primary"
      }`}
      title={`
System Name : ${systemName}
Device Name : ${deviceName}
System Connection : ${systemConnection}
Department Connection : ${departmentConnection}
Plant Connection : ${plantConnection}
Organization Connection : ${organizationConnection}
      `}
    >
      <div className="text-xs font-bold text-center mb-1 truncate px-1 text-purple-800">
        {deviceName}
      </div>

      <div
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          isActive ? "bg-status-success animate-pulse" : "bg-status-danger"
        }`}
      />

      <div className="text-center mb-1">
        <div className="text-text-primary font-roboto text-xs font-semibold">
          Rain:
        </div>
        <div
          className="font-semibold text-purple-600 font-roboto text-[10px] truncate px-1"
          title={`${lastMm} mm`}
        >
          {lastMm} mm
        </div>
      </div>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-text-primary font-roboto max-w-32">
        <div
          className="truncate text-center"
          title={`Max: ${maxMm}mm, Min: ${minMm}mm, First: ${firstMm}mm`}
        >
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
