import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-project.interface";

interface PHMCNodeProps {
  data: NodeData;
}

const PHMCNode: React.FC<PHMCNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const pumpStatus = data.pumpStatus || "0";
  const voltage = data.voltage || 0;
  const current = data.current || 0;
  const frequency = data.frequency || 0;
  const power = data.power || 0;

  const getPumpStatusColor = (status: string) => {
    return status === "1" ? "text-status-success" : "text-status-danger";
  };

  const getPumpStatusText = (status: string) => {
    return status === "1" ? "ON" : "OFF";
  };

  return (
    <div
      className={`relative w-32 h-24 bg-gradient-to-br from-green-50 to-green-100 border rounded-lg p-1 ${
        isActive ? "border-status-success" : "border-border-primary"
      }`}
    >
      <div
        className="text-xs font-bold text-center mb-1 truncate px-1 text-green-800"
        title={data.label}
      >
        {data.label}
      </div>

      <div
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          isActive ? "bg-status-success animate-pulse" : "bg-status-danger"
        }`}
      />

      <div className="grid grid-cols-2 gap-1 text-center">
        <div>
          <div className="text-text-primary font-roboto text-[9px] font-semibold">
            Pump:
          </div>
          <div
            className={`font-semibold font-roboto text-[9px] ${getPumpStatusColor(
              pumpStatus
            )}`}
          >
            {getPumpStatusText(pumpStatus)}
          </div>
        </div>
        <div>
          <div className="text-text-primary font-roboto text-[9px] font-semibold">
            Voltage:
          </div>
          <div className="font-semibold text-green-600 font-roboto text-[9px]">
            {voltage}V
          </div>
        </div>
        <div>
          <div className="text-text-primary font-roboto text-[9px] font-semibold">
            Current:
          </div>
          <div className="font-semibold text-green-600 font-roboto text-[9px]">
            {current}A
          </div>
        </div>
        <div>
          <div className="text-text-primary font-roboto text-[9px] font-semibold">
            Freq:
          </div>
          <div className="font-semibold text-green-600 font-roboto text-[9px]">
            {frequency}Hz
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-text-primary font-roboto max-w-32">
        <div
          className="truncate text-center"
          title={`Power: ${power}W`}
        >
          Power: {power}W
        </div>
      </div>

      <Handle
        type="target"
        position={HandlePosition.Left}
        className="w-3 h-3 bg-green-500"
      />
      <Handle
        type="source"
        position={HandlePosition.Right}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
};

export default PHMCNode;
