import React, { useState } from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-project.interface";

interface BRWHMSNodeProps {
  data: NodeData;
}

const BRWHMSNode: React.FC<BRWHMSNodeProps> = ({ data }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isActive = data.isActive !== false;
  const flowRate = Number(data.flowRate) || 0;
  const avg = Number(data.avg) || 0;
  const max = Number(data.max) || 0;
  const min = Number(data.min) || 0;
  const departmentConnection = data.departmentConnection || "none";
  const projectConnection = data.projectConnection || "none";
  const organizationConnection = data.organizationConnection || "none";
  const departmentName = data.departmentName || "";

  return (
    <div
      className={`relative w-28 h-20 bg-gradient-to-br from-blue-50 to-blue-100 border rounded-lg p-1 ${
        isActive ? "border-status-success" : "border-border-primary"
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
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
          title={`${flowRate} LPM`}
        >
          {flowRate} LPM
        </div>
      </div>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-text-primary font-roboto max-w-32">
        <div
          className="truncate text-center"
        >
          Totalizer : {flowRate} Ltr
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

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
          <div className="text-center">
            <div className="font-bold text-yellow-300 mb-1">
              Department: {departmentName}
            </div>
            <div>Dept Connection : {departmentConnection}</div>
            <div>Project Connection : {projectConnection}</div>
            <div>Organization Connection : {organizationConnection}</div>
            <div>Totalizer Reading : {flowRate} LPM</div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default BRWHMSNode;
