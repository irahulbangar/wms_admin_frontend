import { ChevronsLeft, RotateCw } from "lucide-react";
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

type NodeDirection = "left" | "right" | "up" | "down" | "bidirectional";

interface ExtendedNode extends Node {
  data: {
    label: string;
    type: string;
    direction?: NodeDirection;
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
    data: { label: "FM1", type: "output", direction: "right" },
    position: { x: 20, y: 20 },
    parentId: "1",
    sourcePosition: "right" as Position,
    targetPosition: "right" as Position,
  },
  {
    id: "fm2",
    data: { label: "FM2", type: "output", direction: "right" },
    position: { x: 20, y: 270 },
    parentId: "1",
    sourcePosition: "right" as Position,
    targetPosition: "right" as Position,
  },
  {
    id: "tank1",
    data: { label: "Tank", type: "bidirectional", direction: "bidirectional" },
    position: { x: 280, y: 150 },
    parentId: "1",
    targetPosition: "left" as Position,
    sourcePosition: "right" as Position,
  },
  {
    id: "fm3",
    data: { label: "FM3", type: "input", direction: "left" },
    position: { x: 500, y: 20 },
    parentId: "1",
    sourcePosition: "left" as Position,
    targetPosition: "left" as Position,
  },
  {
    id: "fm4",
    data: { label: "FM4", type: "input", direction: "left" },
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
    data: { label: "FM5", type: "input", direction: "left" },
    position: { x: 20, y: 150 },
    parentId: "2",
    sourcePosition: "right" as Position,
    targetPosition: "left" as Position,
  },
  {
    id: "fm6",
    data: { label: "FM6", type: "input", direction: "left" },
    position: { x: 500, y: 150 },
    parentId: "2",
    sourcePosition: "left" as Position,
    targetPosition: "left" as Position,
  },
  {
    id: "tank2",
    data: { label: "Tank", type: "bidirectional", direction: "bidirectional" },
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

  const calculateNewPosition = (
    node: ExtendedNode,
    newDirection: NodeDirection,
    parentNode?: ExtendedNode
  ) => {
    const currentPos = { ...node.position };
    const parentWidth = (parentNode?.style?.width as number) || 700;
    const parentHeight = (parentNode?.style?.height as number) || 350;

    let newX = currentPos.x;
    let newY = currentPos.y;

    switch (newDirection) {
      case "left":
        newX = 20;
        newY = currentPos.y;
        break;
      case "right":
        newX = parentWidth - 80;
        newY = currentPos.y;
        break;
      case "up":
        newX = currentPos.x;
        newY = 20;
        break;
      case "down":
        newX = currentPos.x;
        newY = parentHeight - 80;
        break;
      case "bidirectional":
        newX = (parentWidth - 80) / 2;
        newY = (parentHeight - 80) / 2;
        break;
    }

    // Ensure position stays within parent boundaries
    newX = Math.max(20, Math.min(newX, parentWidth - 80));
    newY = Math.max(20, Math.min(newY, parentHeight - 80));

    return { x: newX, y: newY };
  };

  const updateNodePositions = (
    node: ExtendedNode,
    newDirection: NodeDirection
  ) => {
    let sourcePosition: Position = "right" as Position;
    let targetPosition: Position = "left" as Position;

    switch (newDirection) {
      case "left":
        sourcePosition = "left" as Position;
        targetPosition = "right" as Position;
        break;
      case "right":
        sourcePosition = "right" as Position;
        targetPosition = "left" as Position;
        break;
      case "up":
        sourcePosition = "top" as Position;
        targetPosition = "bottom" as Position;
        break;
      case "down":
        sourcePosition = "bottom" as Position;
        targetPosition = "top" as Position;
        break;
      case "bidirectional":
        sourcePosition = "right" as Position;
        targetPosition = "left" as Position;
        break;
    }

    return { sourcePosition, targetPosition };
  };

  const changeNodeDirection = (nodeId: string, newDirection: NodeDirection) => {
    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        if (node.id === nodeId) {
          const parentNode = prevNodes.find((n) => n.id === node.parentId);
          const newPosition = calculateNewPosition(
            node as ExtendedNode,
            newDirection,
            parentNode as ExtendedNode
          );
          const { sourcePosition, targetPosition } = updateNodePositions(
            node as ExtendedNode,
            newDirection
          );

          return {
            ...node,
            position: newPosition,
            data: {
              ...node.data,
              direction: newDirection,
            },
            sourcePosition,
            targetPosition,
          };
        }
        return node;
      });
    });
    setHasChanges(true);
  };

  const getNextDirection = (currentDirection: NodeDirection): NodeDirection => {
    const directions: NodeDirection[] = ["left", "right", "up", "down"];
    const currentIndex = directions.indexOf(currentDirection);
    return directions[(currentIndex + 1) % directions.length];
  };

  const handleDirectionChange = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId) as ExtendedNode;
    if (
      node &&
      node.data.direction &&
      node.data.direction !== "bidirectional"
    ) {
      const currentDirection = node.data.direction;
      const newDirection = getNextDirection(currentDirection);
      changeNodeDirection(nodeId, newDirection);
    }
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
          <div className="pl-4 pt-4 w-fit">
            <button
              onClick={handleBack}
              className="w-full px-4 py-2 bg-secondary border border-border-primary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer font-roboto flex items-center gap-2"
            >
              <ChevronsLeft />
              Back
            </button>
          </div>

          <div className="px-4 py-2 bg-secondary/20 border-b border-border-primary">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">Diagram Controls</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDiagram}
                  disabled={!hasChanges}
                  className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 transition-colors ${
                    hasChanges
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      : "bg-gray-500 text-gray-300 cursor-not-allowed"
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
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs transition-colors"
                  title="Reset diagram to initial state"
                >
                  🔄 Reset
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {nodes
                .filter(
                  (node) =>
                    node.type !== "group" &&
                    node.data.direction !== "bidirectional"
                )
                .map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleDirectionChange(node.id)}
                    className="px-3 py-1 bg-secondary border border-border-primary rounded-md hover:bg-secondary/80 transition-colors text-xs flex items-center gap-1"
                    title={`Change ${node.data.label} direction`}
                  >
                    <RotateCw size={12} />
                    {node.data.label} ({node.data.direction})
                  </button>
                ))}
            </div>

            <div className="mt-2 text-xs text-gray-400">
              {hasChanges && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  Unsaved changes detected
                  {isDragging && (
                    <span className="text-blue-400">(Dragging...)</span>
                  )}
                </div>
              )}
              {!hasChanges && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  All changes saved
                </div>
              )}
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
