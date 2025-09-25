import React, { useState } from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-project.interface";

interface FMNodeProps {
  data: NodeData;
}

const FMNode: React.FC<FMNodeProps> = ({ data }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const unit = data.unit || "Ltr";
  const isActive = data.isActive !== false;
  const totalizerReading = Number(data.totalizerReading) || 0;
  const flowRate = Number(data.flowRate) || 0;
  const departmentConnection = data.departmentConnection || "none";
  const organizationConnection = data.organizationConnection || "none";
  const projectConnection = data.projectConnection || "none";
  const departmentName = data.departmentName || "none";

  return (
    <div
      className={`relative w-24 h-16 bg-secondary border rounded-lg p-1 z-10 ${
        isActive ? "border-status-success" : "border-border-primary"
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="text-xs font-bold text-center mb-1 truncate px-1"
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
          className="font-semibold text-status-info font-roboto text-[10px] truncate px-1"
        >
          {flowRate} LPM
        </div>
      </div>

      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-text-primary font-roboto max-w-32">
        <div
          className="truncate text-center"
        >
          Totalizer: {totalizerReading} {unit}
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

      {/* Custom Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
          <div className="text-center">
            <div className="font-bold text-yellow-300 mb-1">
              Department : {departmentName}
            </div>
            <div>Dept Connection : {departmentConnection}</div>
            <div>Project Connection : {projectConnection}</div>
            <div>Organization Connection : {organizationConnection}</div>
            <div>Totalizer Reading : {totalizerReading} {unit}</div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default FMNode;
