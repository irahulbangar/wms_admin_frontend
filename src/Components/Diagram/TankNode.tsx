import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface TankNodeProps {
  data: NodeData;
}

const TankNode: React.FC<TankNodeProps> = ({ data }) => {
  const currentLevel = Number(data.currentLevel) || 0;
  const capacity = Number(data.capacity) || 0;
  const height = Number(data.height) || 0;

  const percentage = capacity > 0 ? (currentLevel * 100) / height : 0;
  const fillHeight = Math.min(percentage, 100);
  const unit = data.unit || "Ltr";
  const departmentConnection = data.departmentConnection || "";
  const plantConnection = data.plantConnection || "";
  const organizationConnection = data.organizationConnection || "";
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "";
  const deviceName = data.label || "";

  return (
    <>
      <div
        className="relative w-20 h-24 bg-secondary border border-border-primary rounded-lg overflow-hidden"
        title={`
System Name : ${systemName}
Device Name : ${deviceName}
System Connection : ${systemConnection}
Department Connection : ${departmentConnection}
Plant Connection : ${plantConnection}
Organization Connection : ${organizationConnection}
Current Level : ${currentLevel} ${unit}
Capacity : ${capacity} ${unit}
      `}
      >
        <div className="absolute inset-0 flex flex-col">
          <div
            className="w-full bg-status-info/70 transition-all duration-500 ease-in-out"
            style={{
              height: `${fillHeight}%`,
              marginTop: "auto",
            }}
          />
        </div>

        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs font-roboto text-text-primary max-w-16">
          <div className="truncate text-center">{deviceName}</div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-text-primary bg-secondary/80 px-1 rounded">
            {percentage.toFixed(2)}%
          </span>
        </div>

        <Handle
          type="target"
          position={HandlePosition.Left}
          className="w-3 h-3 bg-[rgb(67 191 235)]"
        />
        <Handle
          type="source"
          position={HandlePosition.Right}
          className="w-3 h-3 bg-[rgb(67 191 235)]"
        />
      </div>
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-roboto text-text-primary max-w-20">
        <div
          className="truncate text-center font-medium font-roboto text-xs"
          title={`${currentLevel}/${capacity} ${unit}`}
        >
          {currentLevel}/{capacity} {unit}
        </div>
      </div>
    </>
  );
};

export default TankNode;
