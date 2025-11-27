import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface ResultantNodeProps {
  data: NodeData;
}

const ResultantNode: React.FC<ResultantNodeProps> = ({ data }) => {
  const departmentConnection = data.departmentConnection || "";
  const plantConnection = data.plantConnection || "";
  const organizationConnection = data.organizationConnection || "";
  const systemName = data.systemName || "";
  const systemConnection = data.systemConnection || "";

  return (
    <>
      <div
        className="relative w-auto h-10 border border-status-warning bg-status-warning rounded-lg py-2 px-4 z-10 flex items-center justify-center"
        title={`
System Name: ${systemName}
Device Name: ${data.label}
Organization Connection: ${organizationConnection}
Plant Connection: ${plantConnection}
Department Connection: ${departmentConnection}
System Connection: ${systemConnection}
        `}
      >
        <div className="text-text-primary font-roboto font-normal text-center truncate px-1 text-xs">
          {data.label}
        </div>

        <Handle
          type="target"
          position={HandlePosition.Left}
          id="resultant-input"
          className="w-3 h-3 bg-status-info border-2 border-status-info"
          style={{
            left: -6,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />

        <Handle
          type="source"
          position={HandlePosition.Right}
          id="resultant-output"
          className="w-3 h-3 bg-status-info border-2 border-status-info"
          style={{
            right: -6,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </>
  );
};

export default ResultantNode;
