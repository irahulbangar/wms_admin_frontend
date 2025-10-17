import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";
// import tankIcon from "../../assets/images/tank-logo.svg";

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
    <div className="relative">
      <div
        className="relative w-25 h-35 bg-primary/50 border border-status-info rounded-md overflow-hidden"
        title={`
System Name : ${systemName}
Device Name : ${deviceName}
Organization Connection : ${organizationConnection}
Plant Connection : ${plantConnection}
Department Connection : ${departmentConnection}
System Connection : ${systemConnection}
Current Level : ${currentLevel} ${unit}
Capacity : ${capacity} ${unit}
      `}
      >
        <div className="absolute inset-0 z-0">
          <div
            className="absolute bottom-0 left-0 right-0 bg-status-info transition-all duration-500 ease-in-out"
            style={{
              height: `${fillHeight}%`,
              width: "100%",
            }}
          />
        </div>

        <div className="text-left font-roboto text-sm text-wrap py-1 px-2 font-medium text-text-primary leading-4 z-10 relative">
          {deviceName}
        </div>

        {/* <div className="absolute inset-0 top-8 flex justify-center items-center z-20">
          <img src={tankIcon} alt="tank" className="w-12 h-12 object-contain" />
        </div> */}

        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-30">
          <span className="text-xs font-medium text-text-primary bg-secondary/90 px-1 rounded">
            {percentage.toFixed(1)}%
          </span>
        </div>

        <Handle
          type="target"
          position={HandlePosition.Left}
          className="w-3 h-3 bg-[rgb(67 191 235)] z-40"
        />
        <Handle
          type="source"
          position={HandlePosition.Right}
          className="w-3 h-3 bg-[rgb(67 191 235)] z-40"
        />
      </div>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-1 font-roboto">
        <div className="text-center font-medium font-roboto text-text-secondary text-sm whitespace-nowrap">
          Capacity : {" "}
        </div>
        <div className="text-center font-medium font-roboto text-text-primary text-sm whitespace-nowrap">
          {currentLevel}/{capacity} {unit}
        </div>
      </div>
    </div>
  );
};

export default TankNode;
