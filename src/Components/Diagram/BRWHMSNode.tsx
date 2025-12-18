import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";
import brwhmsIcon from "../../assets/images/brwhms-logo.png";
import { isRecordTimeOld } from "../../utils/utils";

interface BRWHMSNodeProps {
  data: NodeData;
}

const BRWHMSNode: React.FC<BRWHMSNodeProps> = ({ data }) => {
  const isActive = data.isActive !== false;
  const departmentConnection = data.departmentConnection || "";
  const plantConnection = data.plantConnection || "";
  const organizationConnection = data.organizationConnection || "";
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "";
  const deviceName = data.label || "";
  const lastRecordTime = data.lastRecordTime || "";

  const recordTimeOld = isRecordTimeOld(lastRecordTime);

  const connectionInfo = [
    `System Name : ${systemName}`,
    `Device Name : ${deviceName}`,
    organizationConnection ? `Org Conn. : ${organizationConnection}` : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    departmentConnection ? `Dep Conn. : ${departmentConnection}` : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
    `Totalizer : ${data?.totalizerReading ? data?.totalizerReading : 0} Ltr`,
    `Flow Rate : ${data?.avg} LPM`,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  const borderColor = recordTimeOld
    ? "border-status-danger"
    : isActive
    ? "border-status-success"
    : "border-status-danger";
  return (
    <div
      className={`relative w-25 h-fit bg-primary/20 border border-border-primary rounded-md p-1 z-10 ${borderColor}`}
      title={connectionInfo}
    >
      <div className="text-sm font-normal text-left font-roboto text-wrap mb-1 px-1 text-text-primary leading-4">
        {deviceName}
      </div>

      <div className="flex justify-center items-center">
        <img
          src={brwhmsIcon}
          alt="brwhms"
          className="w-12 h-12 object-contain"
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

      <div className="absolute -bottom-11 left-1/2 transform -translate-x-1/2 flex flex-col">
        <div className="flex items-center justify-center gap-1">
          <div className="text-text-secondary font-roboto text-sm font-normal whitespace-nowrap">
            Flow :
          </div>
          <div className="text-status-info font-roboto text-sm truncate px-1">
            {data?.avg} LPM
          </div>
        </div>

        <div className="flex items-center justify-center gap-1">
          <div className="text-text-secondary font-roboto text-sm whitespace-nowrap">
            Totalizer :{" "}
          </div>
          <div className="text-text-primary font-roboto text-sm whitespace-nowrap">
            {data?.max} Ltr
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={HandlePosition.Left}
        className="w-3 h-3 bg-status-info"
      />
      <Handle
        type="source"
        position={HandlePosition.Right}
        className="w-3 h-3 bg-status-info"
      />
    </div>
  );
};

export default BRWHMSNode;
