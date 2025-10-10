import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface SinkNodeProps {
  data: NodeData;
}

const SinkNode: React.FC<SinkNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const deviceName = data.label || "";
  const flowRate = Number(data.flowRate) || 0;
  const totalizerReading = Number(data.totalizerReading) || 0;
  const unit = data.unit || "Ltr";

  return (
    <div
      className={`relative w-32 h-20 bg-gradient-to-br from-status-danger to-status-danger/80 border-2 rounded-xl p-2 z-10 ${
        isActive ? "border-status-danger shadow-lg shadow-status-danger/30" : "border-border-primary"
      }`}
      title={`
Device Name: ${deviceName}
Flow Rate: ${flowRate} LPM
Totalizer Reading: ${totalizerReading} ${unit}
Type: Sink Node
      `}
    >
      {/* Status Indicator */}
      <div
        className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
          isActive ? "bg-status-danger animate-pulse" : "bg-border-secondary"
        }`}
      />

      {/* Device Name */}
      <div className="text-white font-roboto font-medium text-center mb-1 truncate px-1 text-sm">
        {deviceName}
      </div>

      {/* Flow Information */}
      <div className="text-center">
        <div className="text-white font-roboto font-medium text-xs mb-0.5">
          Sink
        </div>
        <div className="text-white font-roboto font-medium text-[10px] truncate px-1">
          Flow: {flowRate} LPM
        </div>
      </div>

      {/* Totalizer Reading */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium max-w-32">
        <div className="truncate text-center bg-status-danger px-2 py-1 rounded">
          Total: {totalizerReading} {unit}
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={HandlePosition.Left}
        id="sink-input"
        className="w-3 h-3 bg-red-300 border-2 border-red-600"
        style={{
          left: -6,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />

      {/* Label */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-red-600 font-semibold bg-white px-2 py-1 rounded shadow">
        SINK
      </div>
    </div>
  );
};

export default SinkNode;
