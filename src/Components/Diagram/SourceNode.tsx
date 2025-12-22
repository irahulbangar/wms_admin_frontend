import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface SourceNodeProps {
  data: NodeData;
}

const SourceNode: React.FC<SourceNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const deviceName = data.label || "";

  return (
    <div
      className={`relative w-32 h-20 bg-gradient-to-br from-status-success to-status-success/80 border-2 rounded-xl p-2 z-10 flex items-center justify-center ${
        isActive
          ? "border-status-success shadow-lg shadow-status-success/30"
          : "border-border-primary"
      }`}
      title={`
Device Name: ${deviceName}
      `}
    >
      <div className="text-white font-roboto font-normal text-start px-1 text-sm">
        {deviceName}
      </div>

      <Handle
        type="source"
        position={HandlePosition.Right}
        id="source-output"
        className="w-3 h-3 bg-status-success border-2 border-status-success"
        style={{
          right: -6,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />

      {/* Label */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-status-success font-normal font-roboto bg-white px-2 py-1 rounded shadow">
        SOURCE
      </div>
    </div>
  );
};

export default SourceNode;
