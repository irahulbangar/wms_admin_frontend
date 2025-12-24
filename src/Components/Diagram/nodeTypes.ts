import TankNode from "./TankNode";
import FMNode from "./FMNode";
import BRWHMSNode from "./BRWHMSNode";
import BDWFMSNode from "./BDWFMSNode";
import PHMCNode from "./PHMCNode";
import ARGNode from "./ARGNode";
import DWLRNode from "./DWLRNode";
import GroupNodeWrapper from "./GroupNodeWrapper";
import SourceNode from "./SourceNode";
import SinkNode from "./SinkNode";
import VirtualNode from "./VirtualNode";
import ResultantNode from "./ResultantNode";

export const nodeTypes = {
  tank: TankNode,
  fm: FMNode,
  brwhms: BRWHMSNode,
  bdwfms: BDWFMSNode,
  phmc: PHMCNode,
  arg: ARGNode,
  dwlr: DWLRNode,
  group: GroupNodeWrapper,
  source: SourceNode,
  sink: SinkNode,
  virtual: VirtualNode,
  resultant: ResultantNode,
};
