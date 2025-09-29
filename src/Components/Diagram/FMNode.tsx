import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface FMNodeProps {
  data: NodeData;
}

const FMNode: React.FC<FMNodeProps> = ({ data }) => {
  const unit = data.unit || "Ltr";
  const isActive = data.isActive !== false;
  const totalizerReading = Number(data.totalizerReading) || 0;
  const flowRate = Number(data.flowRate) || 0;
  const departmentConnection = data.departmentConnection || "none";
  const organizationConnection = data.organizationConnection || "none";
  const plantConnection = data.plantConnection || "none";
  const departmentName = data.departmentName || "none";

  return (
    <div
      className={`relative w-24 h-16 bg-secondary border rounded-lg p-1 z-10 ${
        isActive ? "border-status-success" : "border-border-primary"
      }`}
      title={`
        Dept Name : ${departmentName}
Dept Connection : ${departmentConnection}
Plant Connection : ${plantConnection}
Organization Connection : ${organizationConnection}
Totalizer Reading : ${totalizerReading} ${unit}
Flow Rate : ${flowRate} LPM
        `}
    >
      <div className="text-xs font-bold text-center mb-1 truncate px-1">
        {data.label}
      </div>

      <div
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          isActive ? "bg-status-success animate-pulse" : "bg-status-danger"
        }`}
      />

      <div className="text-center mb-1">
        <div className="text-text-primary font-roboto text-xs font-medium">
          Flow:
        </div>
        <div className="font-medium text-status-info font-roboto text-[10px] truncate px-1">
          {flowRate} LPM
        </div>
      </div>

      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-text-primary font-roboto max-w-32">
        <div className="truncate text-center">
          Totalizer : {totalizerReading} {unit}
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
