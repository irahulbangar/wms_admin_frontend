import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface SourceNodeProps {
  data: NodeData;
}

const SourceNode: React.FC<SourceNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const deviceName = data.label || "";
  const flowRate = Number(data.flowRate) || 0;
  const totalizerReading = Number(data.totalizerReading) || 0;
  const unit = data.unit || "Ltr";

  return (
    <div
      className={`relative w-32 h-20 bg-gradient-to-br from-status-success to-status-success/80 border-2 rounded-xl p-2 z-10 ${
        isActive
          ? "border-status-success shadow-lg shadow-status-success/30"
          : "border-border-primary"
      }`}
      title={`
Device Name: ${deviceName}
Flow Rate: ${flowRate} LPM
Totalizer Reading: ${totalizerReading} ${unit}
Type: Source Node
      `}
    >

      {/* Device Name */}
      <div className="text-white font-roboto font-normal text-center mb-1 truncate px-1 text-sm">
        {deviceName}
      </div>

      {/* Flow Information */}
      <div className="text-white font-roboto font-normal text-sm mb-0.5 text-center">
        Source
      </div>

      {/* Output Handle */}
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
