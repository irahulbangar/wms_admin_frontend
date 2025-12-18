import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface ResultantNodeProps {
  data: NodeData;
}

const ResultantNode: React.FC<ResultantNodeProps> = ({ data }) => {
  const resultValue = data.reportValue ? data.reportValue.toFixed(2) : "0";
  const reportName = data.reportName || "";
  const unit = data.unit || "";

  return (
    <div
      className="relative w-auto min-w-[140px] bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 text-white rounded-xl border-2 border-purple-400/50 shadow-lg shadow-purple-500/30 py-3 px-4 z-10 flex items-center justify-center transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105"
      title={`Device Name: ${data.label}\nReport Type: ${data.reportType}\nResult: ${resultValue} ${unit}`}
    >
      <div className="flex flex-col items-center gap-1 w-full">
        <div className="text-white font-roboto font-medium truncate px-1 text-sm w-full text-center">
          {reportName}
        </div>

        <div className="flex flex-col items-center gap-0.5 w-full">
          <div className="text-white font-roboto font-bold text-base leading-tight">
            {resultValue}
            {unit && (
              <span className="text-white/80 font-normal text-xs ml-1">
                {unit}
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={HandlePosition.Left}
        id="resultant-input"
        className="w-3 h-3 bg-purple-400 border-2 border-white shadow-md"
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
        className="w-3 h-3 bg-purple-400 border-2 border-white shadow-md"
        style={{
          right: -6,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
    </div>
  );
};

export default ResultantNode;
