import { ChevronsLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ReactFlow, {
  Background,
  BackgroundVariant,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
  type Position,
  type NodeDragHandler,
  Handle,
  Position as HandlePosition,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import { useState, useEffect, useCallback } from "react";
import { Success } from "../utils/toast";
import { useAppDispatch } from "../../store/store";
import { getProjectById, updateDiagramData } from "../../store/projectSlice";
import type { SingleProjectResult } from "../../model/single-project.interface";
import type { DeviceResult } from "../../model/devices.interface";
import { getDeviceByProjectId } from "../../store/deviceSlice";

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

const GroupNode = ({ data, id }: { data: GroupData; id: string }) => {
  const unit = data.unit || "kL";
  const { getNodes } = useReactFlow();
  const allNodes = getNodes();

  const calculateTotalStock = () => {
    const departmentTanks = allNodes.filter(
      (node) => node.type === "tank" && node.parentId === id
    );

    const totals = departmentTanks.reduce(
      (acc, tank) => {
        const tankData = tank.data as TankData;
        return {
          current: acc.current + (tankData.currentLevel || 0),
          capacity: acc.capacity + (tankData.capacity || 0),
        };
      },
      { current: 0, capacity: 0 }
    );

    return totals;
  };

  const calculateTotalInOut = () => {
    const departmentFMs = allNodes.filter(
      (node) => node.type === "fm" && node.parentId === id
    );

    const totals = departmentFMs.reduce(
      (acc, fm) => {
        const fmData = fm.data as FMData;
        const totalVolume = fmData.totalVolume || 0;

        if (data.label === "ENTC Department") {
          if (fm.id === "fm1" || fm.id === "fm2") {
            acc.totalIn += totalVolume;
          } else if (fm.id === "fm3" || fm.id === "fm4") {
            acc.totalOut += totalVolume;
          }
        } else if (data.label === "IT Department") {
          if (fm.id === "fm5") {
            acc.totalIn += totalVolume;
          } else if (fm.id === "fm6") {
            acc.totalOut += totalVolume;
          }
        }

        return acc;
      },
      { totalIn: 0, totalOut: 0 }
    );

    return totals;
  };

  const stockData = calculateTotalStock();
  const inOutData = calculateTotalInOut();
  const totalBalance = inOutData.totalOut - inOutData.totalIn;

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
                {stockData.current.toFixed(1)} {unit}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-text-muted">Total Capacity :</div>
              <div className="font-semibold text-text-primary">
                {stockData.capacity.toFixed(0)} {unit}
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
                  {totalBalance.toFixed(1)} {unit}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupNodeWrapper = ({ data, id }: { data: GroupData; id: string }) => {
  return <GroupNode data={data} id={id} />;
};

const nodeTypes = {
  tank: TankNode,
  fm: FMNode,
  group: GroupNodeWrapper,
};

// Static data removed - now loading dynamically from API

const STORAGE_KEYS = {
  NODES: "wms-diagram-nodes",
  EDGES: "wms-diagram-edges",
  LAST_SAVED: "wms-diagram-last-saved",
};

const DiagramPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const projectId = useParams().project_id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [projectData, setProjectData] = useState<SingleProjectResult | null>(
    null
  );
  const [deviceData, setDeviceData] = useState<DeviceResult[]>([]);

  const fetchDiagram = useCallback(async () => {
    await dispatch(getProjectById(projectId as string))
      .unwrap()
      .then((res) => {
        if (res.success) {
          setProjectData(res.data);
          // Load diagram data from API response
          if (res.data.nodes && res.data.edges) {
            setNodes(res.data.nodes);
            setEdges(res.data.edges);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching project data:", err);
      });
  }, [dispatch, projectId, setNodes, setEdges]);

  const fetchDeviceData = useCallback(async () => {
    await dispatch(getDeviceByProjectId(parseInt(projectId as string)))
      .unwrap()
      .then((res) => {
        if (res.success) {
          setDeviceData(res.data);
        }
      });
  }, [dispatch, projectId]);

  useEffect(() => {
    if (projectId) {
      fetchDiagram();
      fetchDeviceData();
    }
  }, [fetchDiagram, fetchDeviceData, projectId]);

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

  // Save diagram to API
  const saveDiagramToAPI = useCallback(async () => {
    if (!projectId) return;

    setIsSaving(true);
    try {
      const result = await dispatch(
        updateDiagramData({
          project_id: parseInt(projectId),
          nodes: nodes as any,
          edges: edges as any,
        })
      ).unwrap();

      console.log("API save result:", result);
      setHasChanges(false);
      Success("Diagram saved to server successfully!");
    } catch (error) {
      console.error("Failed to save diagram to server:", error);
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, projectId, nodes, edges]);

  const handleNodeDragStop: NodeDragHandler = () => {
    setHasChanges(true);
  };

  // Handle nodes change
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      setHasChanges(true);
    },
    [onNodesChange]
  );

  // Handle edges change
  const handleEdgesChange = useCallback(
    (changes: any) => {
      console.log("Edges changed:", changes);
      onEdgesChange(changes);
      setHasChanges(true);
    },
    [onEdgesChange]
  );

  const handleSaveDiagram = async () => {
    console.log("Save button clicked, hasChanges:", hasChanges);
    console.log("Current nodes:", nodes);
    console.log("Current edges:", edges);

    // Save to both localStorage and API
    saveDiagramToStorage();
    await saveDiagramToAPI();
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
                    disabled={!hasChanges || isSaving}
                    className={`px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-colors font-roboto ${
                      hasChanges && !isSaving
                        ? "bg-status-info hover:bg-status-info/80 text-white cursor-pointer"
                        : "bg-overlay/30 text-text-muted cursor-not-allowed"
                    }`}
                    title={
                      isSaving
                        ? "Saving to server..."
                        : hasChanges
                        ? "Save diagram to server"
                        : "No changes to save"
                    }
                  >
                    {isSaving ? "⏳ Saving..." : "💾 Save"}
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
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeDragStop={handleNodeDragStop}
              nodeTypes={nodeTypes}
            >
              <Background variant={BackgroundVariant.Dots} />
              <Controls />
            </ReactFlow>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DiagramPage;
