import { ChevronsLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  Background,
  BackgroundVariant,
  useEdgesState,
  useNodesState,
  type Node,
  type Position,
  type NodeDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { useState, useEffect } from "react";
import { Success } from "../utils/toast";

interface ExtendedNode extends Node {
  data: {
    label: string;
    type: string;
  };
}

const initialNodes: ExtendedNode[] = [
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
    sourcePosition: "right" as Position,
    targetPosition: "right" as Position,
  },
  {
    id: "fm2",
    data: { label: "FM2", type: "output" },
    position: { x: 20, y: 270 },
    parentId: "1",
    sourcePosition: "right" as Position,
    targetPosition: "right" as Position,
  },
  {
    id: "tank1",
    data: { label: "Tank", type: "bidirectional" },
    position: { x: 280, y: 150 },
    parentId: "1",
    targetPosition: "left" as Position,
    sourcePosition: "right" as Position,
  },
  {
    id: "fm3",
    data: { label: "FM3", type: "input" },
    position: { x: 500, y: 20 },
    parentId: "1",
    sourcePosition: "left" as Position,
    targetPosition: "left" as Position,
  },
  {
    id: "fm4",
    data: { label: "FM4", type: "input" },
    position: { x: 500, y: 270 },
    parentId: "1",
    sourcePosition: "right" as Position,
    targetPosition: "left" as Position,
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
    sourcePosition: "right" as Position,
    targetPosition: "left" as Position,
  },
  {
    id: "fm6",
    data: { label: "FM6", type: "input" },
    position: { x: 500, y: 150 },
    parentId: "2",
    sourcePosition: "left" as Position,
    targetPosition: "left" as Position,
  },
  {
    id: "tank2",
    data: { label: "Tank", type: "bidirectional" },
    position: { x: 270, y: 150 },
    parentId: "2",
    sourcePosition: "right" as Position,
    targetPosition: "left" as Position,
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

const STORAGE_KEYS = {
  NODES: "wms-diagram-nodes",
  EDGES: "wms-diagram-edges",
  LAST_SAVED: "wms-diagram-last-saved",
};

const DiagramPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadSavedDiagram();
  }, []);

  const loadSavedDiagram = () => {
    try {
      const savedNodes = localStorage.getItem(STORAGE_KEYS.NODES);
      const savedEdges = localStorage.getItem(STORAGE_KEYS.EDGES);

      if (savedNodes) {
        const parsedNodes = JSON.parse(savedNodes);
        setNodes(parsedNodes);
      }

      if (savedEdges) {
        const parsedEdges = JSON.parse(savedEdges);
        setEdges(parsedEdges);
      }
    } catch (error) {
      console.error("Error loading saved diagram:", error);
    }
  };

  const saveDiagramToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
      localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving diagram to storage:", error);
    }
  };

  const handleNodeDragStart: NodeDragHandler = () => {
    setIsDragging(true);
  };

  const handleNodeDragStop: NodeDragHandler = () => {
    setIsDragging(false);
    setHasChanges(true);
  };

  const handleSaveDiagram = () => {
    saveDiagramToStorage();
    alert(
      "Diagram saved successfully! Your changes will be restored on page reload."
    );
  };

  const handleResetDiagram = () => {
    if (
      confirm(
        "Are you sure you want to reset the diagram to its initial state? This will clear all saved positions."
      )
    ) {
      Success("Diagram reset successfully!");
      setNodes(initialNodes);
      setEdges(initialEdges);
      localStorage.removeItem(STORAGE_KEYS.NODES);
      localStorage.removeItem(STORAGE_KEYS.EDGES);
      localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);
      setHasChanges(false);
    }
  };

  const handleBack = () => {
    navigate("/organization/plants");
  };

  return (
    <div className="bg-primary text-text-primary h-screen w-full">
      <div className="h-full w-full flex">
        <main className="flex-1 flex flex-col h-full w-full">
          <div className="flex items-center px-4 py-2 bg-secondary/20 border-b border-border-primary gap-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-secondary border border-border-primary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer font-roboto flex items-center gap-2"
            >
              <ChevronsLeft />
              Back
            </button>

            <div className="w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold">Diagram Controls</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDiagram}
                    disabled={!hasChanges}
                    className={`px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-colors font-roboto ${
                      hasChanges
                        ? "bg-status-info hover:bg-status-info/80 text-white cursor-pointer"
                        : "bg-overlay/30 text-text-muted cursor-not-allowed"
                    }`}
                    title={
                      hasChanges
                        ? "Save diagram to browser storage"
                        : "No changes to save"
                    }
                  >
                    💾 Save
                  </button>

                  <button
                    onClick={handleResetDiagram}
                    className="px-3 py-1 bg-status-danger hover:bg-status-danger/80 text-white rounded-md text-sm transition-colors font-roboto"
                    title="Reset diagram to initial state"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>

              <div className="text-xs text-text-muted">
                {hasChanges && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-status-warning rounded-full animate-pulse"></span>
                    Unsaved changes detected
                    {isDragging && (
                      <span className="text-status-info">(Dragging...)</span>
                    )}
                  </div>
                )}
                {!hasChanges && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-status-success rounded-full"></span>
                    All changes saved
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-full w-full p-4">
            <ReactFlow
              className="h-full w-full"
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDragStart={handleNodeDragStart}
              onNodeDragStop={handleNodeDragStop}
              onNodeDrag={handleNodeDragStop}
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
