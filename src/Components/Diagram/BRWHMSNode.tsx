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
      className="relative w-25 h-fit bg-primary/50 border border-border-primary rounded-lg p-1 z-10"
      title={`
System Name : ${systemName}
Device Name : ${deviceName}
Organization Connection : ${organizationConnection}
Plant Connection : ${plantConnection}
Department Connection : ${departmentConnection}
System Connection : ${systemConnection}
Totalizer Reading : ${data?.totalizerReading} Ltr
Flow Rate : ${data?.avg} LPM
      `}
    >
      <div className="text-sm font-medium text-left text-wrap mb-1 px-1 text-text-primary leading-4">
        {deviceName}
      </div>

      <div className="flex justify-center items-center">
        <img
          src={brwhmsIcon}
          alt="brwhms"
          className="w-12 h-12 object-contain"
        />
      </div>

      <div
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          isActive ? "bg-status-success animate-pulse" : "bg-status-danger"
        }`}
      />

      <div className="flex items-center justify-center gap-1 absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="text-text-secondary font-roboto text-sm font-medium whitespace-nowrap">
          Flow :
        </div>
        <div className="text-status-info font-roboto text-sm truncate px-1">
          {data?.avg} LPM
        </div>
      </div>

      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-text-primary font-roboto text-sm flex items-center justify-center gap-1">
        <div className="text-text-secondary font-roboto text-sm whitespace-nowrap">
          Totalizer :{" "}
        </div>
        <div className="text-text-primary font-roboto text-sm whitespace-nowrap">
          {data?.max} Ltr
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
