import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-project.interface";

interface BRWHMSNodeProps {
  data: NodeData;
}

const BRWHMSNode: React.FC<BRWHMSNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const departmentConnection = data.departmentConnection || "none";
  const projectConnection = data.projectConnection || "none";
  const organizationConnection = data.organizationConnection || "none";
  const departmentName = data.departmentName || "";


  return (
    <div
      className={`relative w-28 h-20 bg-gradient-to-br from-blue-50 to-blue-100 border rounded-lg p-1 z-10 ${
        isActive ? "border-status-success" : "border-border-primary"
      }`}
      title={`
Dept Name : ${departmentName}
Dept Connection : ${departmentConnection}
Project Connection : ${projectConnection}
Organization Connection : ${organizationConnection}
Totalizer Reading : ${data?.totalizerReading} Ltr
Flow Rate : ${data?.avg} LPM
      `}
    >
      <div
        className="text-xs font-bold text-center mb-1 truncate px-1 text-blue-800"
        title={data.label}
      >
        {data.label}
      </div>

      <div
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          isActive ? "bg-status-success animate-pulse" : "bg-status-danger"
        }`}
      />

      <div className="text-center mb-1">
        <div className="text-text-primary font-roboto text-xs font-semibold">
          Flow:
        </div>
        <div
          className="font-semibold text-blue-600 font-roboto text-[10px] truncate px-1"
        >
          {data?.avg} LPM
        </div>
      </div>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-text-primary font-roboto max-w-32">
        <div
          className="truncate text-center"
        >
          Totalizer : {data?.max} Ltr
        </div>
       
      </div>

      <Handle
        type="target"
        position={HandlePosition.Left}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={HandlePosition.Right}
        className="w-3 h-3 bg-blue-500"
      />

    </div>
  );
};

export default BRWHMSNode;
