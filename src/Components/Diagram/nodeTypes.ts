import TankNode from "./TankNode";
import FMNode from "./FMNode";
import BRWHMSNode from "./BRWHMSNode";
import PHMCNode from "./PHMCNode";
import ARGNode from "./ARGNode";
import GroupNodeWrapper from "./GroupNodeWrapper";
import SourceNode from "./SourceNode";
import SinkNode from "./SinkNode";

export const nodeTypes = {
  tank: TankNode,
  fm: FMNode,
  brwhms: BRWHMSNode,
  phmc: PHMCNode,
  arg: ARGNode,
  group: GroupNodeWrapper,
  source: SourceNode,
  sink: SinkNode,
};
