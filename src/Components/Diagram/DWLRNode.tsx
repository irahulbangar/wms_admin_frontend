import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";
import { isRecordTimeOld } from "../../utils/utils";
import dwlrLogo from "../../assets/images/dwlr-logo.png";
interface DWLRNodeProps {
  data: NodeData;
}

const DWLRNode: React.FC<DWLRNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const departmentConnection = data.departmentConnection || "";
  const plantConnection = data.plantConnection || "";
  const organizationConnection = data.organizationConnection || "";
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "";
  const deviceName = data.label || "";
  const lastRecordTime = data.lastRecordTime || "";
  const waterColumn = Number(data.waterColumn) || 0;
  const waterTemperature = data.waterTemperature || 0;
  const waterPressure = data.waterPressure || 0;
  const batteryVoltage = data.batteryVoltage || 0;

  const connectionInfo = [
    `System Name : ${systemName}`,
    `Device Name : ${deviceName}`,
    organizationConnection ? `Org Conn. : ${organizationConnection}` : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    departmentConnection ? `Dep Conn. : ${departmentConnection}` : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
    `Water Column : ${waterColumn?.toFixed(2)} mWc`,
    `Water Temperature : ${waterTemperature?.toFixed(1)}°C`,
    `Water Pressure : ${waterPressure?.toFixed(2)} Bar`,
    `Battery Voltage : ${batteryVoltage?.toFixed(2)}V`,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  const recordTimeOld = isRecordTimeOld(lastRecordTime);

  const borderColor = recordTimeOld
    ? "border-status-danger"
    : isActive
    ? "border-status-success"
    : "border-status-danger";

  return (
    <div
      className={`relative w-20 h-fit bg-primary/20 border border-border-primary rounded-md p-1 z-10 ${borderColor}`}
      title={connectionInfo}
    >
      <div className="text-sm font-normal text-left text-wrap font-roboto mb-1 px-1 leading-4 text-text-primary">
        {data.label}
      </div>

      <div className="flex items-center justify-center">
        <img
          src={dwlrLogo}
          alt="DWLR"
          className="w-16 h-16 object-contain flex items-center justify-center"
        />
      </div>

      <div
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          recordTimeOld
            ? "bg-status-danger animate-pulse"
            : isActive
            ? "bg-status-success animate-pulse"
            : "bg-status-danger"
        }`}
      />

      <div className="flex items-start justify-start absolute -bottom-14 flex-col left-1/2 transform -translate-x-1/2 w-full px-1">
        <div className="flex items-center justify-center gap-1 whitespace-nowrap">
          <div className="text-text-secondary font-roboto text-xs">
            Water Col:
          </div>
          <div className="text-status-info font-roboto text-xs truncate">
            {waterColumn.toFixed(2)} (mWc)
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 whitespace-nowrap">
          <div className="text-text-secondary font-roboto text-xs">Temp:</div>
          <div className="text-text-primary font-roboto text-xs">
            {waterTemperature.toFixed(1)}°C
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 whitespace-nowrap">
          <div className="text-text-secondary font-roboto text-xs">
            Pressure:
          </div>
          <div className="text-text-primary font-roboto text-xs">
            {waterPressure.toFixed(2)}(Bar)
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

export default DWLRNode;
