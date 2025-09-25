import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-project.interface";

interface BRWHMSNodeProps {
  data: NodeData;
}

const BRWHMSNode: React.FC<BRWHMSNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const flowRate = Number(data.flowRate) || 0;
  const avg = Number(data.avg) || 0;
  const max = Number(data.max) || 0;
  const min = Number(data.min) || 0;

  return (
    <div
      className={`relative w-28 h-20 bg-gradient-to-br from-blue-50 to-blue-100 border rounded-lg p-1 ${
        isActive ? "border-status-success" : "border-border-primary"
      }`}
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
          title={`Avg: ${avg}, Max: ${max}, Min: ${min}`}
        >
          Avg: {avg} | Max: {max} | Min: {min}
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
