import React from "react";
import GroupNode from "./GroupNode";
import type { NodeData } from "../../../model/single-project.interface";

interface GroupNodeWrapperProps {
  data: NodeData;
  id: string;
}

const GroupNodeWrapper: React.FC<GroupNodeWrapperProps> = ({ data, id }) => {
  const deviceData = (window as any).deviceData || [];
  return <GroupNode data={data} id={id} deviceData={deviceData} />;
};

export default GroupNodeWrapper;
