import React, { useState } from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-project.interface";

interface PHMCNodeProps {
  data: NodeData;
}

const PHMCNode: React.FC<PHMCNodeProps> = ({ data }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isActive = data.isActive !== false;
  const pumpStatus = data.pumpStatus || "0";
  const voltage = data.voltage || 0;
  const current = data.current || 0;
  const frequency = data.frequency || 0;
  const power = data.power || 0;
  const departmentConnection = data.departmentConnection || "none";
  const projectConnection = data.projectConnection || "none";
  const organizationConnection = data.organizationConnection || "none";
  const departmentName = data.departmentName || "";

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
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
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

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
          <div className="text-center">
            <div className="font-bold text-yellow-300 mb-1">
              Department: {departmentName}
            </div>
            <div>Dept Connection: {departmentConnection}</div>
            <div>Project Connection: {projectConnection}</div>
            <div>Organization Connection: {organizationConnection}</div>
            <div>Pump Status: {getPumpStatusText(pumpStatus)}</div>
            <div>Voltage: {voltage}V | Current: {current}A</div>
            <div>Frequency: {frequency}Hz | Power: {power}W</div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default PHMCNode;
