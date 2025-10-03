import React from "react";
import GroupNode from "./GroupNode";
import type { NodeData } from "../../../model/single-plant.interface";
import type { DiagramEdge } from "./utils/diagramCalculations";

interface GroupNodeWrapperProps {
  data: NodeData;
  id: string;
  edges?: DiagramEdge[];
}

const GroupNodeWrapper: React.FC<GroupNodeWrapperProps> = ({
  data,
  id,
  edges = [],
}) => {
  const deviceData = (window as any).deviceData || [];
  
  return (
    <GroupNode data={data} id={id} deviceData={deviceData} edges={edges} />
  );
};

export default GroupNodeWrapper;
