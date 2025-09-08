import { ChevronsLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ReactFlow, {
  Background,
  BackgroundVariant,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type NodeDragHandler,
  Handle,
  Position as HandlePosition,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { Success } from "../utils/toast";
import { useAppDispatch } from "../../store/store";
import { getProjectById, updateDiagramData } from "../../store/projectSlice";
import type {
  NodeData,
  SingleProjectResult,
} from "../../model/single-project.interface";
import type { DeviceResult } from "../../model/devices.interface";
import { getDeviceByProjectId } from "../../store/deviceSlice";

const TankNode = ({ data }: { data: NodeData }) => {
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

const FMNode = ({ data }: { data: NodeData }) => {
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

const GroupNode = ({ data, id }: { data: NodeData; id: string }) => {
  const unit = data.unit || "kL";
  const { getNodes } = useReactFlow();
  const allNodes = getNodes();

  const calculateTotalStock = () => {
    const departmentTanks = allNodes.filter(
      (node) => node.type === "tank" && node.parentId === id
    );

    const totals = departmentTanks.reduce(
      (acc, tank) => {
        const tankData = tank.data as NodeData;
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
        const fmData = fm.data as NodeData;
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

const GroupNodeWrapper = ({ data, id }: { data: NodeData; id: string }) => {
  return <GroupNode data={data} id={id} />;
};

const nodeTypes = {
  tank: TankNode,
  fm: FMNode,
  group: GroupNodeWrapper,
};

const DiagramPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDiagram, setIsLoadingDiagram] = useState(true);
  const projectId = useParams().project_id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [projectData, setProjectData] = useState<SingleProjectResult | null>(
    null
  );
  const [deviceData, setDeviceData] = useState<DeviceResult[]>([]);
  const diagramGeneratedRef = useRef(false);
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const convertDevicesToDiagram = useCallback((devices: DeviceResult[]) => {
    const nodes: any[] = [];
    const edges: any[] = [];

    const departmentGroups = devices.reduce((acc, device) => {
      const deptId = device.department_id.toString();
      if (!acc[deptId]) {
        acc[deptId] = {
          department_id: device.department_id,
          department_name:
            device.department_name || `Department ${device.department_id}`,
          devices: [],
        };
      }
      acc[deptId].devices.push(device);
      return acc;
    }, {} as Record<string, any>);

    Object.values(departmentGroups).forEach((group: any) => {
      group.devices.sort((a: DeviceResult, b: DeviceResult) => {
        const aIsTank = a.type === "tank" || a.name === "Tank Level";
        const bIsTank = b.type === "tank" || b.name === "Tank Level";
        if (aIsTank && !bIsTank) return -1;
        if (!aIsTank && bIsTank) return 1;
        return a.device_id - b.device_id;
      });
    });

    Object.values(departmentGroups).forEach((group: any, groupIndex) => {
      const groupId = group.department_id.toString();
      const groupX = groupIndex * 750 + 50;
      const groupY = 50;

      nodes.push({
        id: groupId,
        data: {
          label: group.department_name,
          type: "output",
          unit: "kL",
        },
        position: { x: groupX, y: groupY },
        style: {
          width: 700,
          height: 400,
          borderRadius: 10,
          border: "2px dashed #ccc",
        },
        type: "group",
        width: 700,
        height: 400,
      });

      const tanks = group.devices.filter(
        (device: DeviceResult) =>
          device.type === "tank" || device.name === "Tank Level"
      );
      const fms = group.devices.filter(
        (device: DeviceResult) =>
          device.type === "fm" || device.name === "Flow Meter"
      );

      tanks.forEach((device: DeviceResult, tankIndex: number) => {
        const deviceId = device.device_id.toString();
        const deviceX = 300 + tankIndex * 200;
        const deviceY = 150;

        const nodeData: NodeData = {
          label: device.device_name,
          type: "bidirectional",
          direction: "bidirectional",
          unit: "kL",
          isActive: device.device_status === "active",
          capacity: device.params?.storageCapacity || 10,
          currentLevel: device.params?.height || 2.5,
        };

        nodes.push({
          id: deviceId,
          data: nodeData,
          position: { x: deviceX, y: deviceY },
          parentId: groupId,
          sourcePosition: "right",
          targetPosition: "left",
          type: "tank",
          width: 80,
          height: 96,
        });
      });

      fms.forEach((device: DeviceResult, fmIndex: number) => {
        const deviceId = device.device_id.toString();
        const totalFMs = fms.length;
        const fmPerSide = Math.ceil(totalFMs / 2);

        let deviceX, deviceY;
        if (fmIndex < fmPerSide) {
          deviceX = 50;
          deviceY = 100 + fmIndex * 120;
        } else {
          deviceX = 550;
          deviceY = 100 + (fmIndex - fmPerSide) * 120;
        }

        const nodeData: NodeData = {
          label: device.device_name,
          type: fmIndex < fmPerSide ? "output" : "input",
          direction: fmIndex < fmPerSide ? "right" : "left",
          unit: "kL",
          isActive: device.device_status === "active",
          totalVolume: device.last_record?.hrs_max || 0,
          totalizerReading: device.last_record?.hrs_min || 0,
          flowRate: device.last_record?.min_avg || 0,
        };

        nodes.push({
          id: deviceId,
          data: nodeData,
          position: { x: deviceX, y: deviceY },
          parentId: groupId,
          sourcePosition: fmIndex < fmPerSide ? "right" : "left",
          targetPosition: fmIndex < fmPerSide ? "right" : "left",
          type: "fm",
          width: 96,
          height: 64,
        });
      });

      if (tanks.length > 0 && fms.length > 0) {
        const leftFMs = fms.filter(
          (_, index: number) => index < Math.ceil(fms.length / 2)
        );
        const rightFMs = fms.filter(
          (_, index: number) => index >= Math.ceil(fms.length / 2)
        );

        leftFMs.forEach((fm: DeviceResult) => {
          edges.push({
            id: `fm-${fm.device_id}-tank-${tanks[0].device_id}`,
            source: fm.device_id.toString(),
            target: tanks[0].device_id.toString(),
            animated: true,
            style: { stroke: "#3b82f6", strokeWidth: 2 },
          });
        });

        rightFMs.forEach((fm: DeviceResult) => {
          edges.push({
            id: `tank-${tanks[0].device_id}-fm-${fm.device_id}`,
            source: tanks[0].device_id.toString(),
            target: fm.device_id.toString(),
            animated: true,
            style: { stroke: "#10b981", strokeWidth: 2 },
          });
        });

        for (let i = 0; i < tanks.length - 1; i++) {
          edges.push({
            id: `tank-${tanks[i].device_id}-tank-${tanks[i + 1].device_id}`,
            source: tanks[i].device_id.toString(),
            target: tanks[i + 1].device_id.toString(),
            animated: true,
            style: { stroke: "#8b5cf6", strokeWidth: 2 },
          });
        }
      } else {
        for (let i = 0; i < fms.length - 1; i++) {
          edges.push({
            id: `fm-${fms[i].device_id}-fm-${fms[i + 1].device_id}`,
            source: fms[i].device_id.toString(),
            target: fms[i + 1].device_id.toString(),
            animated: true,
            style: { stroke: "#f59e0b", strokeWidth: 2 },
          });
        }
      }
    });

    return { nodes, edges };
  }, []);

  const fetchDiagram = useCallback(async () => {
    try {
      const res = await dispatch(getProjectById(projectId as string)).unwrap();
      if (res.success) {
        setProjectData(res.data);
        if (res.data.nodes && res.data.edges && res.data.nodes.length > 0) {
          setNodes(res.data.nodes as any);
          setEdges(res.data.edges as any);
          setIsLoadingDiagram(false);
        } else {
          console.log("No existing diagram data found in project");
        }
      }
    } catch (err) {
      console.error("Error fetching project data:", err);
      setIsLoadingDiagram(false);
    }
  }, [dispatch, projectId, setNodes, setEdges]);

  const fetchDeviceData = useCallback(async () => {
    try {
      const res = await dispatch(
        getDeviceByProjectId(parseInt(projectId as string))
      ).unwrap();
      if (res.success) {
        setDeviceData(res.data);
      }
    } catch (err) {
      console.error("Error fetching device data:", err);
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (projectId) {
      diagramGeneratedRef.current = false;
      setIsLoadingDiagram(true);
      fetchDiagram();
      fetchDeviceData();
    }
  }, [fetchDiagram, fetchDeviceData, projectId]);

  useEffect(() => {
    if (
      projectData &&
      deviceData.length > 0 &&
      isLoadingDiagram &&
      !diagramGeneratedRef.current
    ) {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }

      generationTimeoutRef.current = setTimeout(() => {
        const { nodes: deviceNodes, edges: deviceEdges } =
          convertDevicesToDiagram(deviceData);
        setNodes(deviceNodes);
        setEdges(deviceEdges);
        setIsLoadingDiagram(false);
        diagramGeneratedRef.current = true;
      }, 100);
    }

    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, [
    projectData,
    deviceData,
    isLoadingDiagram,
    convertDevicesToDiagram,
    setNodes,
    setEdges,
  ]);

  const saveDiagramToAPI = useCallback(async () => {
    if (!projectId) return;

    setIsSaving(true);
    try {
      await dispatch(
        updateDiagramData({
          project_id: parseInt(projectId),
          nodes: nodes as any,
          edges: edges as any,
        })
      )
        .unwrap()
        .then(() => {
          setHasChanges(false);
          Success("Diagram saved to server successfully!");
        })
        .catch((error) => {
          console.error("Failed to save diagram to server:", error);
        })
        .finally(() => {
          setIsSaving(false);
        });
    } catch (error) {
      console.error("Failed to save diagram to server:", error);
    }
  }, [dispatch, projectId, nodes, edges]);

  const handleNodeDragStop: NodeDragHandler = () => {
    setHasChanges(true);
  };

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      setHasChanges(true);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      setHasChanges(true);
    },
    [onEdgesChange]
  );

  const handleSaveDiagram = async () => {
    await saveDiagramToAPI();
  };

  const handleResetDiagram = () => {
    if (
      confirm(
        "Are you sure you want to reset the diagram to its initial state? This will clear all current positions and data."
      )
    ) {
      Success("Diagram reset successfully!");
      setNodes([]);
      setEdges([]);
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

          <div className="h-full w-full p-4 relative">
            {isLoadingDiagram ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-text-muted">Loading diagram...</p>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DiagramPage;
