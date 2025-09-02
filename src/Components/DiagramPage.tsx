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
  Handle,
  Position as HandlePosition,
} from "reactflow";
import "reactflow/dist/style.css";
import { useState, useEffect, useCallback } from "react";
import { Success } from "../utils/toast";

type NodeDirection = "left" | "right" | "up" | "down" | "bidirectional";

interface TankData {
  label: string;
  type: string;
  direction?: NodeDirection;
  capacity?: number;
  currentLevel?: number;
  unit?: string;
}

interface FMData {
  label: string;
  type: string;
  direction?: NodeDirection;
  totalVolume?: number;
  totalizerReading?: number;
  flowRate?: number;
  unit?: string;
  isActive?: boolean;
}

interface GroupData {
  label: string;
  type: string;
  totalStock?: number;
  totalIn?: number;
  totalOut?: number;
  unit?: string;
}

interface ExtendedNode extends Node {
  data: TankData | FMData | GroupData;
}

const TankNode = ({ data }: { data: TankData }) => {
  const percentage =
    data.capacity && data.currentLevel
      ? Math.round((data.currentLevel / data.capacity) * 100)
      : 0;

  const fillHeight = Math.min(percentage, 100);
  const unit = data.unit || "kL";

  return (
    <>
      <div className="relative w-20 h-24 bg-secondary border border-border-primary rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col">
          <div
            className="w-full bg-status-info transition-all duration-500 ease-in-out"
            style={{
              height: `${fillHeight}%`,
              marginTop: "auto",
            }}
          />
        </div>

        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap font-roboto text-text-primary">
          {data.label}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-text-primary bg-secondary/80 px-1 rounded">
            {percentage}%
          </span>
        </div>

        <Handle
          type="target"
          position={HandlePosition.Left}
          className="w-3 h-3 bg-status-info"
        />
        <Handle
          type="source"
          position={HandlePosition.Right}
          className="w-3 h-3 bg-status-info"
        />
      </div>
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2  text-xs whitespace-nowrap font-roboto text-text-primary">
        {data.currentLevel || 0}/{data.capacity || 0} {unit}
      </div>
    </>
  );
};

const FMNode = ({ data }: { data: FMData }) => {
  const unit = data.unit || "kL";
  const isActive = data.isActive !== false;

  return (
    <div
      className={`relative w-24 h-16 bg-secondary border rounded-lg p-1 ${
        isActive ? "border-status-success" : "border-border-primary"
      }`}
    >
      <div className="text-xs font-bold text-center mb-1">{data.label}</div>

      <div
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          isActive ? "bg-status-success animate-pulse" : "bg-status-danger"
        }`}
      />

      <div className="text-xs text-center mb-1">
        <div className="text-text-muted font-roboto">Flow:</div>
        <div className="font-semibold text-status-info font-roboto">
          {data.flowRate || 0} {unit}/h
        </div>
      </div>

      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-text-muted whitespace-nowrap font-roboto">
        <div>
          Total: {data.totalVolume || 0} {unit}
        </div>
        <div>
          Totalizer: {data.totalizerReading || 0} {unit}
        </div>
      </div>

      <Handle
        type="target"
        position={HandlePosition.Left}
        className="w-3 h-3 bg-status-success"
      />
      <Handle
        type="source"
        position={HandlePosition.Right}
        className="w-3 h-3 bg-status-success"
      />
    </div>
  );
};

const GroupNode = ({ data }: { data: GroupData }) => {
  const unit = data.unit || "kL";

  const stockData = { current: 2.5, capacity: 10 };
  const inOutData = { totalIn: 2140.8, totalOut: 3667.3 };

  return (
    <div className="relative w-full h-full bg-transparent rounded-lg">
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-secondary border border-border-primary rounded-md px-3 py-1 shadow-sm">
        <span className="text-sm font-semibold text-text-primary font-roboto">
          {data.label}
        </span>
      </div>

      <div className="">
        <div className="flex items-center justify-between w-full gap-6 text-xs font-roboto">
          <div className="text-center flex items-start flex-col">
            <div className="flex items-center gap-2">
              <div className="text-text-muted">Total Stock :</div>
              <div className="font-semibold text-text-primary">
                {stockData.capacity.toFixed(0)} {unit}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-text-muted">Total Capacity :</div>
              <div className="font-semibold text-text-primary">
                {stockData.current.toFixed(0)} {unit}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-muted">Total In :</div>
                <div className="font-semibold text-text-primary">
                  {inOutData.totalIn.toFixed(1)} {unit}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-muted">Total Out :</div>
                <div className="font-semibold text-text-primary">
                  {inOutData.totalOut.toFixed(1)} {unit}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-muted">Total Balance :</div>
                <div className="font-semibold text-text-primary">
                  {inOutData.totalOut.toFixed(1)} {unit}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupNodeWrapper = ({ data }: { data: GroupData }) => {
  return <GroupNode data={data} />;
};

const nodeTypes = {
  tank: TankNode,
  fm: FMNode,
  group: GroupNodeWrapper,
};

const initialNodes: ExtendedNode[] = [
  {
    id: "1",
    data: {
      label: "ENTC Department",
      type: "output",
      unit: "kL",
    },
    position: { x: 50, y: 50 },
    style: {
      width: 625,
      height: 350,
      borderRadius: 10,
      border: "2px dashed #ccc",
    },
    type: "group",
  },
  {
    id: "fm1",
    data: {
      label: "FM1",
      type: "output",
      direction: "right",
      totalVolume: 1250.5,
      totalizerReading: 1250.5,
      flowRate: 15.2,
      unit: "kL",
      isActive: true,
    },
    position: { x: 20, y: 70 },
    parentId: "1",
    sourcePosition: "right" as Position,
    targetPosition: "right" as Position,
    type: "fm",
  },
  {
    id: "fm2",
    data: {
      label: "FM2",
      type: "output",
      direction: "right",
      totalVolume: 890.3,
      totalizerReading: 890.3,
      flowRate: 8.7,
      unit: "kL",
      isActive: true,
    },
    position: { x: 20, y: 230 },
    parentId: "1",
    sourcePosition: "right" as Position,
    targetPosition: "right" as Position,
    type: "fm",
  },
  {
    id: "tank1",
    data: {
      label: "Tank 1",
      type: "bidirectional",
      direction: "bidirectional",
      capacity: 10,
      currentLevel: 2.5,
      unit: "kL",
    },
    position: { x: 280, y: 125 },
    parentId: "1",
    targetPosition: "left" as Position,
    sourcePosition: "right" as Position,
    type: "tank",
  },
  {
    id: "fm3",
    data: {
      label: "FM3",
      type: "input",
      direction: "left",
      totalVolume: 2100.8,
      totalizerReading: 2100.8,
      flowRate: 22.1,
      unit: "kL",
      isActive: true,
    },
    position: { x: 490, y: 70 },
    parentId: "1",
    sourcePosition: "left" as Position,
    targetPosition: "left" as Position,
    type: "fm",
  },
  {
    id: "fm4",
    data: {
      label: "FM4",
      type: "input",
      direction: "left",
      totalVolume: 1567.2,
      totalizerReading: 1567.2,
      flowRate: 12.5,
      unit: "kL",
      isActive: true,
    },
    position: { x: 490, y: 230 },
    parentId: "1",
    sourcePosition: "right" as Position,
    targetPosition: "left" as Position,
    type: "fm",
  },
  {
    id: "2",
    data: {
      label: "IT Department",
      type: "output",
      unit: "kL",
    },
    position: { x: 725, y: 50 },
    style: {
      width: 625,
      height: 350,
      borderRadius: 10,
      border: "2px dashed #ccc",
    },
    type: "group",
  },
  {
    id: "fm5",
    data: {
      label: "FM5",
      type: "input",
      direction: "left",
      totalVolume: 980.4,
      totalizerReading: 980.4,
      flowRate: 9.8,
      unit: "kL",
      isActive: true,
    },
    position: { x: 20, y: 150 },
    parentId: "2",
    sourcePosition: "right" as Position,
    targetPosition: "left" as Position,
    type: "fm",
  },
  {
    id: "fm6",
    data: {
      label: "FM6",
      type: "input",
      direction: "left",
      totalVolume: 3200.1,
      totalizerReading: 3200.1,
      flowRate: 28.5,
      unit: "kL",
      isActive: true,
    },
    position: { x: 500, y: 150 },
    parentId: "2",
    sourcePosition: "left" as Position,
    targetPosition: "left" as Position,
    type: "fm",
  },
  {
    id: "tank2",
    data: {
      label: "Tank 2",
      type: "bidirectional",
      direction: "bidirectional",
      capacity: 15,
      currentLevel: 7.5,
      unit: "kL",
    },
    position: { x: 270, y: 150 },
    parentId: "2",
    sourcePosition: "right" as Position,
    targetPosition: "left" as Position,
    type: "tank",
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

  const loadSavedDiagram = useCallback(() => {
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
  }, [setNodes, setEdges]);

  useEffect(() => {
    loadSavedDiagram();
  }, [loadSavedDiagram]);

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
    Success("Diagram saved successfully!");
  };

  const handleResetDiagram = () => {
    if (
      confirm(
        "Are you sure you want to reset the diagram to its initial state? This will clear all saved positions and data."
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
              nodeTypes={nodeTypes}
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
