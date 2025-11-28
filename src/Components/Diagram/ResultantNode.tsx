import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface ResultantNodeProps {
  data: NodeData;
}

const ResultantNode: React.FC<ResultantNodeProps> = ({ data }) => {
  return (
    <>
      <div
        className="relative w-auto min-w-[100px] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg py-2 px-4 z-10 flex items-center justify-center"
        title={`
Device Name: ${data.label}
        `}
      >
        <div className="flex flex-col">
          <div className="text-white font-roboto font-normal truncate px-1 text-xs">
            {data.label}
          </div>
          <div className="text-white font-roboto font-normal truncate px-1 text-xs">
            Result : {data.reportValue} {data.unit}
          </div>
        </div>

        <Handle
          type="target"
          position={HandlePosition.Left}
          id="resultant-input"
          className="w-3 h-3 bg-status-info border-2 border-status-info"
          style={{
            left: -6,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />

        <Handle
          type="source"
          position={HandlePosition.Right}
          id="resultant-output"
          className="w-3 h-3 bg-status-info border-2 border-status-info"
          style={{
            right: -6,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </>
  );
};

export default ResultantNode;
