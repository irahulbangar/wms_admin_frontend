import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";
import brwhmsIcon from "../../assets/images/brwhms-logo.png";

interface BRWHMSNodeProps {
  data: NodeData;
}

const BRWHMSNode: React.FC<BRWHMSNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const departmentConnection = data.departmentConnection || "none";
  const plantConnection = data.plantConnection || "none";
  const organizationConnection = data.organizationConnection || "none";
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "none";
  const deviceName = data.label || "";

  return (
    <div
      className={`relative w-25 h-fit bg-secondary border rounded-lg p-1 z-10 ${
        isActive ? "border-status-success" : "border-border-primary"
      }`}
      title={`
System Name : ${systemName}
Device Name : ${deviceName}
System Connection : ${systemConnection}
Department Connection : ${departmentConnection}
Plant Connection : ${plantConnection}
Organization Connection : ${organizationConnection}
Totalizer Reading : ${data?.totalizerReading} Ltr
Flow Rate : ${data?.avg} LPM
      `}
    >
      <div className="text-xs font-medium text-left text-wrap mb-1 px-1 text-text-primary">
        {deviceName}
      </div>

      <div className="flex justify-center items-center">
        <img src={brwhmsIcon} alt="brwhms" className="w-8 h-8 object-contain" />
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
          {data?.avg} LPM
        </div>
      </div>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-text-primary font-roboto max-w-32">
        <div className="truncate text-center font-medium font-roboto text-xs">
          Totalizer : {data?.max} Ltr
        </div>
      </div>

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

export default BRWHMSNode;
