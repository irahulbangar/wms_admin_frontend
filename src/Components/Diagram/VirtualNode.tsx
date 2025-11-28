import React from "react";
import { Handle, Position as HandlePosition } from "reactflow";
import type { NodeData } from "../../../model/single-plant.interface";

interface VirtualNodeProps {
  data: NodeData;
}

const VirtualNode: React.FC<VirtualNodeProps> = ({ data }) => {

  return (
    <>
      <div
        className="relative w-auto h-10 border border-status-warning bg-status-warning rounded-lg py-2 px-4 z-10 flex items-center justify-center"
        title={`
Device Name: ${data.label}
        `}
      >
        <div className="text-text-primary font-roboto font-normal text-center truncate px-1 text-xs">
          {data.label}
        </div>

        <Handle
          type="target"
          position={HandlePosition.Left}
          id="virtual-input"
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
          id="virtual-output"
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

export default VirtualNode;
