import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface PHMCNodeProps {
  data: NodeData;
}

const PHMCNode: React.FC<PHMCNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const voltageR = data.voltageR || 0;
  const voltageY = data.voltageY || 0;
  const voltageB = data.voltageB || 0;
  const currentR = data.currentR || 0;
  const currentY = data.currentY || 0;
  const currentB = data.currentB || 0;
  const frequency = data.frequency || 0;
  const departmentConnection = data.departmentConnection || "none";
  const plantConnection = data.plantConnection || "none";
  const organizationConnection = data.organizationConnection || "none";
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "none";
  const deviceName = data.label || "";

  return (
    <div
      className={`relative w-32 h-30 bg-secondary border rounded-lg p-1 z-10 ${
        isActive ? "border-status-success" : "border-border-primary"
      }`}
      title={`
System Name : ${systemName}
Device Name : ${deviceName}
System Connection : ${systemConnection}
Department Connection : ${departmentConnection}
Plant Connection : ${plantConnection}
Organization Connection : ${organizationConnection}
Voltage (R) : ${voltageR / 10}V | Current (R) : ${currentR}A
Voltage (Y) : ${voltageY / 10}V | Current (Y) : ${currentY}A
Voltage (B) : ${voltageB / 10}V | Current (B) : ${currentB}A
Frequency : ${frequency}Hz
      `}
    >
      <div className="text-xs font-bold text-center mb-1 truncate px-1 text-text-primary">
        {deviceName}
      </div>

      <div
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          isActive ? "bg-status-success animate-pulse" : "bg-status-danger"
        }`}
      />

      <div className="flex flex-col gap-0.5 text-center">
        <div className="flex flex-col gap-0.5">
          <div className="text-text-primary font-roboto text-[9px] font-medium text-center">
            Voltage
          </div>
          <div className="flex items-center justify-around gap-3">
            <div className="flex flex-col gap-0.5">
              <div className="text-text-primary font-roboto text-[9px] font-medium">
                R
              </div>
              <div className="font-medium font-roboto text-[9px] text-status-danger">
                {voltageR / 10} V
              </div>
            </div>
            <div className="flex flex-col gap-0.5 text-center">
              <div className="text-text-primary font-roboto text-[9px] font-medium">
                Y
              </div>
              <div className="font-medium text-status-warning font-roboto text-[9px]">
                {voltageY / 10} V
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-text-primary font-roboto text-[9px] font-medium">
                B
              </div>
              <div className="font-medium text-status-info font-roboto text-[9px]">
                {voltageB / 10} V
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="text-text-primary font-roboto text-[9px] font-medium text-center">
            Current
          </div>
          <div className="flex items-center justify-around gap-3">
            <div className="flex flex-col gap-0.5">
              <div className="text-text-primary font-roboto text-[9px] font-medium whitespace-nowrap">
                R
              </div>
              <div className="font-medium text-status-danger font-roboto text-[9px]">
                {currentR}A
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-text-primary font-roboto text-[9px] font-medium whitespace-nowrap">
                Y
              </div>
              <div className="font-medium text-status-warning font-roboto text-[9px]">
                {currentY}A
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-text-primary font-roboto text-[9px] font-medium whitespace-nowrap">
                B
              </div>
              <div className="font-medium text-status-info font-roboto text-[9px]">
                {currentB}A
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default PHMCNode;
