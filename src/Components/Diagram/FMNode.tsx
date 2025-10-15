import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";
import fmIcon from "../../assets/images/fm-logo.svg";

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
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "none";
  const deviceName = data.label || "";

  return (
    <div
      className="relative w-25 h-fit bg-primary/50 border border-border-primary rounded-lg p-1 z-10"
      title={`
System Name : ${systemName}
Device Name : ${deviceName}
System Connection : ${systemConnection}
Department Connection : ${departmentConnection}
Plant Connection : ${plantConnection}
Organization Connection : ${organizationConnection}
Totalizer Reading : ${totalizerReading} ${unit}
Flow Rate : ${flowRate} LPM
        `}
    >
      <div className="text-sm font-medium text-left text-wrap mb-1 px-1 leading-4 text-text-primary">
        {data.label}
      </div>

      <div className="flex justify-center items-center">
        <img src={fmIcon} alt="fm" className="w-12 h-12 object-contain" />
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
        <div className="truncate text-center font-medium">
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
