import { ChevronsLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  Background,
  BackgroundVariant,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    data: { label: "Group A", type: "output" },
    position: { x: 50, y: 50 },
    style: { width: 700, height: 350, borderRadius: 10 },
    type: "group",
  },
  {
    id: "fm1",
    data: { label: "FM1", type: "output" },
    position: { x: 20, y: 20 },
    parentId: "1",
    sourcePosition: "right",
    targetPosition: "right",
  },
  {
    id: "fm2",
    data: { label: "FM2", type: "output" },
    position: { x: 20, y: 270 },
    parentId: "1",
    sourcePosition: "right",
    targetPosition: "right",
  },
  {
    id: "tank1",
    data: { label: "Tank", type: "bidirectional" },
    position: { x: 280, y: 150 },
    parentId: "1",
    targetPosition: "left",
    sourcePosition: "right",
  },
  {
    id: "fm3",
    data: { label: "FM3", type: "input" },
    position: { x: 500, y: 20 },
    parentId: "1",
    sourcePosition: "right",
    targetPosition: "left",
  },
  {
    id: "fm4",
    data: { label: "FM4", type: "input" },
    position: { x: 500, y: 270 },
    parentId: "1",
    sourcePosition: "right",
    targetPosition: "left",
  },
  {
    id: "2",
    data: { label: "Group B", type: "output" },
    position: { x: 800, y: 50 },
    style: { width: 700, height: 350, borderRadius: 10 },
    type: "group",
  },
  {
    id: "fm5",
    data: { label: "FM5", type: "input" },
    position: { x: 20, y: 150 },
    parentId: "2",
    sourcePosition: "right",
    targetPosition: "left",
  },
  {
    id: "fm6",
    data: { label: "FM6", type: "input" },
    position: { x: 500, y: 150 },
    parentId: "2",
    sourcePosition: "right",
    targetPosition: "left",
  },
  {
    id: "tank2",
    data: { label: "Tank", type: "bidirectional" },
    position: { x: 270, y: 150 },
    parentId: "2",
    sourcePosition: "right",
    targetPosition: "left",
  },
];

const initialEdges = [
  { id: "fm1-tank1", source: "fm1", target: "tank1", animated: true },
  { id: "fm2-tank1", source: "fm2", target: "tank1", animated: true },
  { id: "tank1-fm3", source: "tank1", target: "fm3", animated: true },
  { id: "tank1-fm4", source: "tank1", target: "fm4", animated: true },
  { id: "fm4-fm5", source: "fm4", target: "fm5", animated: true },
  { id: "fm5-tank2", source: "fm5", target: "tank2", animated: true },
  { id: "tank2-fm6", source: "tank2", target: "fm6", animated: true },
];

const DiagramPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/organization/plants");
  };

  return (
    <div className="bg-primary text-text-primary h-screen w-full">
      <div className="h-full w-full flex">
        <main className="flex-1 flex flex-col h-full w-full">
          <div className="pl-4 pt-4 w-fit">
            <button
              onClick={handleBack}
              className="w-full px-4 py-2 bg-secondary border border-border-primary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer font-roboto flex items-center gap-2"
            >
              <ChevronsLeft />
              Back
            </button>
          </div>
          <div className="h-full w-full p-4">
            <ReactFlow
              className="h-full w-full"
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
            >
              <Background variant={BackgroundVariant.Dots} />
            </ReactFlow>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DiagramPage;
