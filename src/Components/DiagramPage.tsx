import { ChevronsLeft, Trash2, Edit } from "lucide-react";
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
  addEdge,
  type Connection,
  type Edge,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { Success } from "../utils/toast";
import { useAppDispatch } from "../../store/store";
import { getProjectById, updateDiagramData } from "../../store/projectSlice";
import type {
  NodeData,
  SingleProjectResult,
} from "../../model/single-project.interface";
import type { DeviceResult } from "../../model/devices.interface";
import { getDeviceByProjectId } from "../../store/deviceSlice";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

const TankNode = ({ data }: { data: NodeData }) => {
  const currentLevel = Number(data.currentLevel) || 0;
  const capacity = Number(data.capacity) || 0;
  const height = Number(data.height) || 0;

  const percentage = capacity > 0 ? (currentLevel * 100) / height : 0;

  const fillHeight = Math.min(percentage, 100);
  const unit = data.unit || "Ltr";

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
            {percentage.toFixed(2)}%
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
        {currentLevel}/{capacity} {unit}
      </div>
    </>
  );
};

const FMNode = ({ data }: { data: NodeData }) => {
  const unit = data.unit || "Ltr";
  const isActive = data.isActive !== false;
  const totalizerReading = Number(data.totalizerReading) || 0;
  const flowRate = Number(data.flowRate) || 0;

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
        <div className="text-text-primary font-roboto">Flow:</div>
        <div className="font-semibold text-status-info font-roboto">
          {flowRate} {unit}
        </div>
      </div>

      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-text-primary whitespace-nowrap font-roboto">
        <div>
          Totalizer: {totalizerReading} {unit}
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

const GroupNode = ({
  data,
  id,
  deviceData,
}: {
  data: NodeData;
  id: string;
  deviceData?: DeviceResult[];
}) => {
  const unit = data.unit || "Ltr";
  const { getNodes } = useReactFlow();
  const allNodes = getNodes();

  const deviceDataKey = deviceData
    ? JSON.stringify(
        deviceData.map((d) => ({
          id: d.device_id,
          totalizerReading: d.last_record?.min_max,
          currentLevel: d.last_record?.min_last_level,
          capacity: d.params?.storageCapacity,
        }))
      )
    : "";

  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [deviceDataKey]);

  useEffect(() => {
    forceUpdate({});
  }, [allNodes.length]);

  useEffect(() => {
    const handleDeviceDataUpdate = () => {
      forceUpdate({});
    };

    document.addEventListener("deviceDataUpdated", handleDeviceDataUpdate);
    return () => {
      document.removeEventListener("deviceDataUpdated", handleDeviceDataUpdate);
    };
  }, []);

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if ((window as any).openDepartmentPopup) {
      (window as any).openDepartmentPopup(id);
    } else {
      const customEvent = new CustomEvent("groupEditClick", {
        detail: { nodeId: id, nodeData: data },
      });
      document.dispatchEvent(customEvent);
    }
  };

  const calculateTotalStock = () => {
    let totals = { current: 0, capacity: 0 };

    if (allNodes && allNodes.length > 0) {
      const departmentTanks = allNodes.filter(
        (node) => node.type === "tank" && node.parentId === id
      );

      totals = departmentTanks.reduce(
        (acc, tank) => {
          const tankData = tank.data as NodeData;
          return {
            current: acc.current + (Number(tankData.currentLevel) || 0),
            capacity: acc.capacity + (Number(tankData.capacity) || 0),
          };
        },
        { current: 0, capacity: 0 }
      );
    }

    if (
      totals.current === 0 &&
      totals.capacity === 0 &&
      deviceData &&
      deviceData.length > 0
    ) {
      const departmentId = parseInt(id);
      const departmentDevices = deviceData.filter(
        (device) => device.department_id === departmentId
      );

      const departmentTanks = departmentDevices.filter(
        (device) =>
          device.type === "tank" ||
          device.device_family?.toLowerCase().includes("tank")
      );

      totals = departmentTanks.reduce(
        (acc, device) => {
          return {
            current:
              acc.current + (Number(device.last_record?.min_last_level) || 0),
            capacity:
              acc.capacity + (Number(device?.params?.storageCapacity) || 0),
          };
        },
        { current: 0, capacity: 0 }
      );
    }

    return totals;
  };

  const calculateTotalInOut = () => {
    let totals = { totalIn: 0, totalOut: 0 };

    if (allNodes && allNodes.length > 0) {
      const departmentFMs = allNodes.filter(
        (node) => node.type === "fm" && node.parentId === id
      );

      totals = departmentFMs.reduce(
        (acc, fm) => {
          const fmData = fm.data as NodeData;
          const totalVolume = fmData?.totalizerReading || 0;

          const fmIndex = departmentFMs.indexOf(fm);
          const totalFMs = departmentFMs.length;

          if (totalFMs > 0) {
            if (fmIndex < Math.ceil(totalFMs / 2)) {
              acc.totalIn += totalVolume;
            } else {
              acc.totalOut += totalVolume;
            }
          }

          return acc;
        },
        { totalIn: 0, totalOut: 0 }
      );
    }

    if (
      totals.totalIn === 0 &&
      totals.totalOut === 0 &&
      deviceData &&
      deviceData.length > 0
    ) {
      const departmentId = parseInt(id);
      const departmentDevices = deviceData.filter(
        (device) => device.department_id === departmentId
      );

      const departmentFMs = departmentDevices.filter(
        (device) =>
          device.type === "fm" ||
          device.device_family?.toLowerCase().includes("flow")
      );

      totals = departmentFMs.reduce(
        (acc, device, index) => {
          const totalVolume = Number(device.last_record?.min_max) || 0;
          const totalFMs = departmentFMs.length;

          if (totalFMs > 0) {
            if (index < Math.ceil(totalFMs / 2)) {
              acc.totalIn += totalVolume;
            } else {
              acc.totalOut += totalVolume;
            }
          }

          return acc;
        },
        { totalIn: 0, totalOut: 0 }
      );
    }

    return totals;
  };

  const stockData = calculateTotalStock();
  const inOutData = calculateTotalInOut();
  const totalBalance = inOutData.totalOut - inOutData.totalIn;

  return (
    <div
      className="relative w-full h-full bg-transparent rounded-lg"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-secondary border border-border-primary rounded-md px-3 py-1 shadow-sm group-header flex items-center gap-2"
        style={{ pointerEvents: "auto" }}
      >
        <span className="text-sm font-semibold text-text-primary font-roboto">
          {data.label}
        </span>
        <button
          onClick={handleEditClick}
          className="text-status-info hover:text-status-info/80 transition-colors cursor-pointer"
          title="Edit department dimensions"
          style={{ pointerEvents: "auto" }}
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between w-full gap-6 text-xs font-roboto">
        <div className="text-center flex items-start flex-col">
          <div className="flex items-center gap-2">
            <div className="text-text-primary">Total Stock :</div>
            <div className="font-semibold text-text-primary">
              {stockData.current.toFixed(1)} {unit}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-text-primary">Total Capacity :</div>
            <div className="font-semibold text-text-primary">
              {stockData.capacity.toFixed(0)} {unit}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center justify-end gap-2">
              <div className="text-text-primary">Total In :</div>
              <div className="font-semibold text-text-primary">
                {inOutData.totalIn.toFixed(1)} {unit}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <div className="text-text-primary">Total Out :</div>
              <div className="font-semibold text-text-primary">
                {inOutData.totalOut.toFixed(1)} {unit}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <div className="text-text-primary">Total Balance :</div>
              <div className="font-semibold text-text-primary">
                {totalBalance.toFixed(1)} {unit}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupNodeWrapper = ({ data, id }: { data: NodeData; id: string }) => {
  const deviceData = (window as any).deviceData || [];
  return <GroupNode data={data} id={id} deviceData={deviceData} />;
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
  const [isLoadingDiagram, setIsLoadingDiagram] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  // Create global function for opening department popup
  useEffect(() => {
    (window as any).openDepartmentPopup = (nodeId: string) => {
      setSelectedDepartment(nodeId);
      setShowDepartmentPopup(true);
    };

    return () => {
      delete (window as any).openDepartmentPopup;
    };
  }, []);

  useEffect(() => {
    const handleGroupEditClick = (event: any) => {
      const { nodeId } = event.detail;
      setSelectedDepartment(nodeId);
      setShowDepartmentPopup(true);
    };

    document.addEventListener("groupEditClick", handleGroupEditClick);

    return () => {
      document.removeEventListener("groupEditClick", handleGroupEditClick);
    };
  }, []);

  useEffect(() => {
    const handleEdgeClick = (event: Event) => {
      const target = event.target as HTMLElement;

      if (
        (target.tagName === "path" &&
          target.classList.contains("react-flow__edge-path")) ||
        target.closest(".react-flow__edge")
      ) {
        const edgeElement = target.closest(".react-flow__edge");
        if (edgeElement) {
          const edgeId = edgeElement.getAttribute("data-id");
          if (edgeId) {
            setSelectedEdge(edgeId);
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
      }
    };

    document.addEventListener("click", handleEdgeClick, true);
    document.addEventListener("mousedown", handleEdgeClick, true);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.classList.contains("react-flow__edge")) {
                element.addEventListener("click", (e) => {
                  const edgeId = element.getAttribute("data-id");
                  if (edgeId) {
                    setSelectedEdge(edgeId);
                    e.preventDefault();
                    e.stopPropagation();
                  }
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      document.removeEventListener("click", handleEdgeClick, true);
      document.removeEventListener("mousedown", handleEdgeClick, true);
      observer.disconnect();
    };
  }, []);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [showDepartmentPopup, setShowDepartmentPopup] = useState(false);
  const [departmentDimensions, setDepartmentDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const projectId = useParams().project_id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [projectData, setProjectData] = useState<SingleProjectResult | null>(
    null
  );
  const [deviceData, setDeviceData] = useState<DeviceResult[]>([]);
  const diagramGeneratedRef = useRef(false);
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const convertDevicesToDiagram = useCallback(
    (devices: DeviceResult[]) => {
      const nodes: any[] = [];
      const edges: any[] = [];

      interface DepartmentGroup {
        department_id: number;
        department_name: string;
        devices: DeviceResult[];
      }

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
      }, {} as Record<string, DepartmentGroup>);

      Object.values(departmentGroups).forEach((group: DepartmentGroup) => {
        group.devices.sort((a: DeviceResult, b: DeviceResult) => {
          const aIsTank =
            a.type === "tank" ||
            a.device_family?.toLowerCase().includes("tank");
          const bIsTank =
            b.type === "tank" ||
            b.device_family?.toLowerCase().includes("tank");
          if (aIsTank && !bIsTank) return -1;
          if (!aIsTank && bIsTank) return 1;
          return a.device_id - b.device_id;
        });
      });

      Object.values(departmentGroups).forEach(
        (group: DepartmentGroup, groupIndex) => {
          const groupId = group.department_id.toString();
          const groupX = groupIndex * 675 + 50;
          const groupY = 50;

          const currentDimensions = departmentDimensions[groupId] || {
            width: 625,
            height: 350,
          };
          const groupWidth = currentDimensions.width;
          const groupHeight = currentDimensions.height;

          nodes.push({
            id: groupId,
            data: {
              label: group.department_name,
              type: "output",
              unit: "Ltr",
            },
            position: { x: groupX, y: groupY },
            style: {
              width: groupWidth,
              height: groupHeight,
              borderRadius: 10,
              border: "2px dashed #ccc",
            },
            type: "group",
            width: groupWidth,
            height: groupHeight,
          });

          const tanks = group.devices.filter(
            (device: DeviceResult) =>
              device.type === "tank" ||
              device.device_family?.toLowerCase().includes("tank")
          );
          const fms = group.devices.filter(
            (device: DeviceResult) =>
              device.type === "fm" ||
              device.device_family?.toLowerCase().includes("flow")
          );

          tanks.forEach((device: DeviceResult, tankIndex: number) => {
            const deviceId = `${groupId}-tank${tankIndex + 1}`;

            const tankWidth = 80;
            const tankHeight = 96;
            const tankSpacing = 20;
            const sideMargin = 50;

            const availableWidth = groupWidth - 2 * sideMargin;
            const maxTanksPerRow = Math.max(
              1,
              Math.floor(availableWidth / (tankWidth + tankSpacing))
            );
            const totalRows = Math.ceil(tanks.length / maxTanksPerRow);

            const row = Math.floor(tankIndex / maxTanksPerRow);
            const col = tankIndex % maxTanksPerRow;

            const totalTanksInRow = Math.min(
              maxTanksPerRow,
              tanks.length - row * maxTanksPerRow
            );
            const rowWidth =
              totalTanksInRow * tankWidth + (totalTanksInRow - 1) * tankSpacing;
            const startX = sideMargin + (availableWidth - rowWidth) / 2;

            const deviceX = startX + col * (tankWidth + tankSpacing);

            let deviceY;
            if (totalRows === 1) {
              deviceY = (groupHeight - tankHeight) / 2;
            } else {
              const availableHeight = groupHeight - 100;
              const rowSpacing = Math.max(
                20,
                (availableHeight - totalRows * tankHeight) / (totalRows + 1)
              );
              deviceY = 60 + rowSpacing + row * (tankHeight + rowSpacing);
            }

            const tankNodeData: NodeData = {
              label: device?.device_name,
              type: "bidirectional",
              direction: "bidirectional",
              unit: "Ltr",
              isActive: device.device_status === "active",
              capacity: Number(device?.params?.storageCapacity) || 0,
              currentLevel: Number(device.last_record?.min_last_level) || 0,
              height: Number(device?.params?.height) || 0,
            };

            nodes.push({
              id: deviceId,
              data: tankNodeData,
              position: { x: deviceX, y: deviceY },
              parentId: groupId,
              sourcePosition: "right",
              targetPosition: "left",
              type: "tank",
              width: tankWidth,
              height: tankHeight,
            });
          });

          fms.forEach((device: DeviceResult, fmIndex: number) => {
            const deviceId = `${groupId}-fm${fmIndex + 1}`;
            const totalFMs = fms.length;
            const fmWidth = 96;
            const fmHeight = 64;
            const sideMargin = 50;
            const fmSpacing = 20;

            const availableWidth = groupWidth - 2 * sideMargin;
            const maxTanksPerRow = Math.max(
              1,
              Math.floor(availableWidth / (80 + 20))
            );
            const totalTankRows = Math.ceil(tanks.length / maxTanksPerRow);
            const tankAreaHeight =
              totalTankRows > 0
                ? totalTankRows * 96 + (totalTankRows - 1) * 20 + 120
                : 0;

            const maxFMsPerRow = Math.max(
              1,
              Math.floor(availableWidth / (fmWidth + fmSpacing))
            );
            const totalFMRows = Math.ceil(totalFMs / maxFMsPerRow);

            const fmStartY = tankAreaHeight + 20;
            const availableHeight = groupHeight - fmStartY - 20;
            const fmVerticalSpacing =
              totalFMRows > 1
                ? Math.min(
                    80,
                    Math.max(
                      60,
                      (availableHeight - totalFMRows * fmHeight) /
                        (totalFMRows - 1)
                    )
                  )
                : 0;

            const row = Math.floor(fmIndex / maxFMsPerRow);
            const col = fmIndex % maxFMsPerRow;

            const totalFMsInRow = Math.min(
              maxFMsPerRow,
              totalFMs - row * maxFMsPerRow
            );
            const rowWidth =
              totalFMsInRow * fmWidth + (totalFMsInRow - 1) * fmSpacing;
            const startX = sideMargin + (availableWidth - rowWidth) / 2;

            const deviceX = startX + col * (fmWidth + fmSpacing);
            const deviceY = fmStartY + row * (fmHeight + fmVerticalSpacing);

            const fmNodeData: NodeData = {
              label: device.device_name,
              type: "bidirectional",
              direction: "bidirectional",
              unit: "Ltr",
              isActive: device.device_status === "active",
              totalizerReading: Number(device.last_record?.min_max) || 0,
              flowRate: Number(device.last_record?.min_avg) || 0,
            };

            nodes.push({
              id: deviceId,
              data: fmNodeData,
              position: { x: deviceX, y: deviceY },
              parentId: groupId,
              sourcePosition: "right",
              targetPosition: "left",
              type: "fm",
              width: fmWidth,
              height: fmHeight,
            });
          });
        }
      );

      return { nodes, edges };
    },
    [departmentDimensions]
  );

  const fetchDiagram = useCallback(async () => {
    try {
      const res = await dispatch(getProjectById(projectId as string)).unwrap();
      if (res.success) {
        setProjectData(res.data);

        if (res.data.nodes && res.data.edges && res.data.nodes.length > 0) {
          setNodes(res.data.nodes as any);
          setEdges(res.data.edges as any);

          if ((res.data as any).department_dimensions) {
            setDepartmentDimensions((res.data as any).department_dimensions);
          }

          setIsLoadingDiagram(false);
        } else {
          console.log(
            "No existing diagram data found in plant - will show nodes only"
          );
        }
      }
    } catch (err) {
      console.error("Error fetching plant data:", err);
      setIsLoadingDiagram(false);
    }
  }, [dispatch, projectId, setNodes, setEdges]);

  const syncDepartmentDimensionsWithNodes = useCallback(() => {
    setNodes((currentNodes) => {
      return currentNodes.map((node) => {
        if (node.type === "group" && departmentDimensions[node.id]) {
          const dimensions = departmentDimensions[node.id];
          return {
            ...node,
            width: dimensions.width,
            height: dimensions.height,
            style: {
              ...node.style,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
            },
          };
        }
        return node;
      });
    });
  }, [departmentDimensions]);

  const fetchDeviceData = useCallback(async () => {
    try {
      await dispatch(getDeviceByProjectId(parseInt(projectId as string)))
        .unwrap()
        .then((res) => {
          if (res.success) {
            setDeviceData(res.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching device data:", err);
        });
    } catch (err) {
      console.error("Error fetching device data:", err);
    }
  }, [dispatch, projectId]);

  const updateNodesWithDynamicData = useCallback(() => {
    if (deviceData.length === 0 || nodes.length === 0) return;

    setNodes((currentNodes) => {
      return currentNodes.map((node) => {
        if (node.type === "tank") {
          const matchingDevice = deviceData.find(
            (device) =>
              device.device_name === node.data.label &&
              (device.type === "tank" ||
                device.device_family?.toLowerCase().includes("tank"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                currentLevel:
                  Number(matchingDevice.last_record?.min_last_level) || 0,
                capacity: Number(matchingDevice?.params?.storageCapacity) || 0,
                height: Number(matchingDevice?.params?.height) || 0,
              },
            };
          }
        } else if (node.type === "fm") {
          const matchingDevice = deviceData.find(
            (device) =>
              device.device_name === node.data.label &&
              (device.type === "fm" ||
                device.device_family?.toLowerCase().includes("flow"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                flowRate: Number(matchingDevice.last_record?.min_avg) || 0,
                totalizerReading:
                  Number(matchingDevice.last_record?.min_max) || 0,
                isActive: matchingDevice.device_status === "active",
              },
            };
          }
        }

        return node;
      });
    });

    const event = new CustomEvent("deviceDataUpdated", {
      detail: { deviceData, timestamp: Date.now() },
    });
    document.dispatchEvent(event);
  }, [deviceData, nodes.length]);

  useEffect(() => {
    if (deviceData.length > 0 && nodes.length > 0) {
      updateNodesWithDynamicData();

      const interval = setInterval(() => {
        fetchDeviceData();
      }, 20000);

      return () => clearInterval(interval);
    }
  }, [
    deviceData.length,
    nodes.length,
    updateNodesWithDynamicData,
    fetchDeviceData,
  ]);

  useEffect(() => {
    (window as any).deviceData = deviceData;

    if (deviceData.length > 0) {
      const event = new CustomEvent("deviceDataUpdated", {
        detail: { deviceData, timestamp: Date.now() },
      });
      document.dispatchEvent(event);
    }

    return () => {
      delete (window as any).deviceData;
    };
  }, [deviceData]);

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

  useEffect(() => {
    if (
      Object.keys(departmentDimensions).length > 0 &&
      nodes.length > 0 &&
      !isLoadingDiagram
    ) {
      setNodes((currentNodes) => {
        return currentNodes.map((node) => {
          if (node.type === "group" && departmentDimensions[node.id]) {
            const dimensions = departmentDimensions[node.id];
            return {
              ...node,
              width: dimensions.width,
              height: dimensions.height,
              style: {
                ...node.style,
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
              },
            };
          }
          return node;
        });
      });
    }
  }, [departmentDimensions, nodes.length, isLoadingDiagram]);

  useEffect(() => {
    if (Object.keys(departmentDimensions).length > 0 && nodes.length > 0) {
      syncDepartmentDimensionsWithNodes();
    }
  }, [departmentDimensions, syncDepartmentDimensionsWithNodes, nodes.length]);

  const saveDiagramToAPI = useCallback(async () => {
    if (!projectId) return;

    setIsSaving(true);
    try {
      const cleanNodes = nodes.map((node) => {
        if (node.type === "tank") {
          const { currentLevel, ...cleanData } = node.data;
          return {
            ...node,
            data: cleanData,
          };
        } else if (node.type === "fm") {
          const { flowRate, totalizerReading, isActive, ...cleanData } =
            node.data;
          return {
            ...node,
            data: cleanData,
          };
        } else if (node.type === "group") {
          const currentDimensions = departmentDimensions[node.id];
          if (currentDimensions) {
            return {
              ...node,
              width: currentDimensions.width,
              height: currentDimensions.height,
              position: node.position,
              style: {
                ...node.style,
                width: `${currentDimensions.width}px`,
                height: `${currentDimensions.height}px`,
              },
            };
          }
        }
        return node;
      });

      const diagramData = {
        project_id: parseInt(projectId),
        nodes: cleanNodes as any,
        edges: edges as any,
        department_dimensions: departmentDimensions,
      };

      await dispatch(updateDiagramData(diagramData))
        .unwrap()
        .then(() => {
          setHasChanges(false);
          Success(
            "Diagram structure and department dimensions saved to server successfully!"
          );
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
  }, [dispatch, projectId, nodes, edges, departmentDimensions]);

  const handleNodeDragStop: NodeDragHandler = () => {
    setHasChanges(true);
  };

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChange(changes);
      setHasChanges(true);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      onEdgesChange(changes);
      setHasChanges(true);
    },
    [onEdgesChange]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
        animated: true,
        style: {
          stroke: "#6366f1",
          strokeWidth: 3,
        },
        type: "smoothstep",
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setHasChanges(true);
    },
    [setEdges]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedEdge(edge.id);
  }, []);

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setSelectedEdge(null);
    }
  }, []);

  const onSelectionChange = useCallback(({ edges }: { edges: Edge[] }) => {
    if (edges.length > 0) {
      setSelectedEdge(edges[0].id);
    } else {
      setSelectedEdge(null);
    }
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    if (
      target.tagName === "path" &&
      target.classList.contains("react-flow__edge-path")
    ) {
      const edgeElement = target.closest(".react-flow__edge");
      if (edgeElement) {
        const edgeId = edgeElement.getAttribute("data-id");
        if (edgeId) {
          setSelectedEdge(edgeId);
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
  }, []);

  const handleClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.closest(".react-flow__edge")) {
      const edgeElement = target.closest(".react-flow__edge");
      if (edgeElement) {
        const edgeId = edgeElement.getAttribute("data-id");
        if (edgeId) {
          setSelectedEdge(edgeId);
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    if (node.type !== "group") {
      event.stopPropagation();
    }
  }, []);

  const handleDepartmentDimensionsChange = useCallback(
    (width: number, height: number) => {
      if (selectedDepartment) {
        setDepartmentDimensions((prev) => ({
          ...prev,
          [selectedDepartment]: { width, height },
        }));

        setNodes((currentNodes) => {
          const updatedNodes = currentNodes.map((node) => {
            if (node.id === selectedDepartment && node.type === "group") {
              return {
                ...node,
                width: width,
                height: height,
                style: {
                  ...node.style,
                  width: `${width}px`,
                  height: `${height}px`,
                  minWidth: `${width}px`,
                  minHeight: `${height}px`,
                  maxWidth: `${width}px`,
                  maxHeight: `${height}px`,
                },
              };
            }
            return node;
          });

          return updatedNodes.map((node) => {
            if (node.parentId === selectedDepartment) {
              const parentNode = updatedNodes.find(
                (n) => n.id === selectedDepartment
              );
              if (parentNode) {
                const parentWidth = width;
                const parentHeight = height;

                if (node.type === "tank") {
                  const tankWidth = 80;
                  const tankHeight = 96;
                  const tankSpacing = 20;
                  const sideMargin = 50;

                  const availableWidth = parentWidth - 2 * sideMargin;
                  const maxTanksPerRow = Math.max(
                    1,
                    Math.floor(availableWidth / (tankWidth + tankSpacing))
                  );

                  const tankIndex = parseInt(node.id.split("-tank")[1]) - 1;
                  const totalRows = Math.ceil(
                    updatedNodes.filter(
                      (n) =>
                        n.parentId === selectedDepartment && n.type === "tank"
                    ).length / maxTanksPerRow
                  );

                  const row = Math.floor(tankIndex / maxTanksPerRow);
                  const col = tankIndex % maxTanksPerRow;

                  const totalTanksInRow = Math.min(
                    maxTanksPerRow,
                    updatedNodes.filter(
                      (n) =>
                        n.parentId === selectedDepartment && n.type === "tank"
                    ).length -
                      row * maxTanksPerRow
                  );
                  const rowWidth =
                    totalTanksInRow * tankWidth +
                    (totalTanksInRow - 1) * tankSpacing;
                  const startX = sideMargin + (availableWidth - rowWidth) / 2;

                  const deviceX = startX + col * (tankWidth + tankSpacing);

                  let deviceY;
                  if (totalRows === 1) {
                    deviceY = (parentHeight - tankHeight) / 2;
                  } else {
                    const availableHeight = parentHeight - 100;
                    const rowSpacing = Math.max(
                      20,
                      (availableHeight - totalRows * tankHeight) /
                        (totalRows + 1)
                    );
                    deviceY = 60 + rowSpacing + row * (tankHeight + rowSpacing);
                  }

                  return {
                    ...node,
                    position: { x: deviceX, y: deviceY },
                  };
                } else if (node.type === "fm") {
                  const fmWidth = 96;
                  const fmHeight = 64;
                  const sideMargin = 50;
                  const fmSpacing = 20;

                  const availableWidth = parentWidth - 2 * sideMargin;
                  const maxTanksPerRow = Math.max(
                    1,
                    Math.floor(availableWidth / (80 + 20))
                  );
                  const totalTankRows = Math.ceil(
                    updatedNodes.filter(
                      (n) =>
                        n.parentId === selectedDepartment && n.type === "tank"
                    ).length / maxTanksPerRow
                  );
                  const tankAreaHeight =
                    totalTankRows > 0
                      ? totalTankRows * 96 + (totalTankRows - 1) * 20 + 120
                      : 0;

                  const totalFMs = updatedNodes.filter(
                    (n) => n.parentId === selectedDepartment && n.type === "fm"
                  ).length;

                  const maxFMsPerRow = Math.max(
                    1,
                    Math.floor(availableWidth / (fmWidth + fmSpacing))
                  );
                  const totalFMRows = Math.ceil(totalFMs / maxFMsPerRow);

                  const fmStartY = tankAreaHeight + 20;
                  const availableHeight = parentHeight - fmStartY - 20;
                  const fmVerticalSpacing =
                    totalFMRows > 1
                      ? Math.min(
                          80,
                          Math.max(
                            60,
                            (availableHeight - totalFMRows * fmHeight) /
                              (totalFMRows - 1)
                          )
                        )
                      : 0;

                  const fmIndex = parseInt(node.id.split("-fm")[1]) - 1;
                  const row = Math.floor(fmIndex / maxFMsPerRow);
                  const col = fmIndex % maxFMsPerRow;

                  const totalFMsInRow = Math.min(
                    maxFMsPerRow,
                    totalFMs - row * maxFMsPerRow
                  );
                  const rowWidth =
                    totalFMsInRow * fmWidth + (totalFMsInRow - 1) * fmSpacing;
                  const startX = sideMargin + (availableWidth - rowWidth) / 2;

                  const deviceX = startX + col * (fmWidth + fmSpacing);
                  const deviceY =
                    fmStartY + row * (fmHeight + fmVerticalSpacing);

                  return {
                    ...node,
                    position: { x: deviceX, y: deviceY },
                  };
                }
              }
            }
            return node;
          });
        });

        setHasChanges(true);
      }
    },
    [selectedDepartment]
  );

  const handleCloseDepartmentPopup = useCallback(() => {
    setShowDepartmentPopup(false);
    setSelectedDepartment(null);
  }, []);

  const handleDeleteSelectedEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((currentEdges) => {
        const filteredEdges = currentEdges.filter(
          (edge) => edge.id !== selectedEdge
        );
        return filteredEdges;
      });
      setSelectedEdge(null);
      setHasChanges(true);
    }
  }, [selectedEdge, setEdges]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        if (selectedEdge) {
          handleDeleteSelectedEdge();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedEdge, handleDeleteSelectedEdge]);

  const handleSaveDiagram = async () => {
    await saveDiagramToAPI();
  };

  const handleResetDiagram = () => {
    if (
      confirm(
        "Are you sure you want to reset the diagram to its initial state? This will clear all current positions, data, and department dimensions."
      )
    ) {
      setDepartmentDimensions({});

      fetchDiagram();
      fetchDeviceData();
      Success("Diagram and department dimensions reset successfully!");
      setNodes([]);
      setEdges([]);
      setHasChanges(false);
    }
  };

  const handleClearAllEdges = () => {
    if (confirm("Are you sure you want to delete all connections?")) {
      setEdges([]);
      setHasChanges(true);
      Success("All connections cleared!");
    }
  };

  const handleBack = () => {
    navigate("/organization/plants");
  };

  const deleteKeyCode = useMemo(() => ["Backspace", "Delete"], []);
  const multiSelectionKeyCode = useMemo(() => ["Meta", "Ctrl"], []);

  const transformedNodes = useMemo(() => {
    return nodes.map((node) => {
      if (node.id === selectedDepartment && node.type === "group") {
        return {
          ...node,
          style: {
            ...node.style,
            border: "3px solid #3b82f6",
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
          },
        };
      }
      return node;
    });
  }, [nodes, selectedDepartment]);

  const transformedEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        strokeWidth:
          selectedEdge === edge.id ? 2 : edge.style?.strokeWidth || 3,
        stroke:
          selectedEdge === edge.id
            ? "#ff0000"
            : edge.style?.stroke || "#6366f1",
        zIndex: 10,
      },
      className: "react-flow__edge-clickable",
    }));
  }, [edges, selectedEdge]);

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
                  {selectedEdge && (
                    <button
                      onClick={handleDeleteSelectedEdge}
                      className="px-3 py-2 bg-status-danger hover:bg-status-danger/80 text-white rounded-md text-sm transition-colors font-roboto flex items-center gap-2"
                      title="Delete selected edge"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Selected Edge
                    </button>
                  )}

                  <button
                    onClick={handleClearAllEdges}
                    className="px-3 py-2 bg-status-warning hover:bg-status-warning/80 text-white rounded-md text-sm transition-colors font-roboto flex items-center gap-2"
                    title="Clear all connections"
                  >
                    <Trash2 className="w-4 h-4" /> Clear All Edges
                  </button>

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
                        ? "Saving structure to server..."
                        : hasChanges
                        ? "Save diagram structure (positions & connections only)"
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

              <div className="flex items-center gap-6">
                {selectedEdge && (
                  <div className="flex items-center gap-2 text-text-secondary text-xs">
                    <span className="w-2 h-2 bg-status-info rounded-full animate-pulse"></span>
                    Edge selected - Press Delete or use button to remove
                  </div>
                )}
                {hasChanges && (
                  <div className="flex items-center gap-2 text-text-secondary text-xs">
                    <span className="w-2 h-2 bg-status-warning rounded-full animate-pulse"></span>
                    Unsaved changes detected
                  </div>
                )}
                {!hasChanges && !selectedEdge && (
                  <div className="flex items-center gap-2 text-text-secondary text-xs">
                    <span className="w-2 h-2 bg-status-success rounded-full"></span>
                    All changes saved
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="h-full w-full p-4 relative"
            style={{ width: "100%", height: "calc(100vh - 120px)" }}
          >
            {isLoadingDiagram ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-text-secondary">Loading diagram...</p>
                </div>
              </div>
            ) : (
              <div
                onMouseDown={handleMouseDown}
                onClick={handleClick}
                style={{ width: "100%", height: "100%" }}
                className="h-full w-full"
              >
                <ReactFlow
                  className="h-full w-full"
                  style={{ width: "100%", height: "100%" }}
                  nodes={transformedNodes}
                  edges={transformedEdges}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={handleEdgesChange}
                  onNodeDragStop={handleNodeDragStop}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  onEdgeClick={onEdgeClick}
                  onPaneClick={onPaneClick}
                  onSelectionChange={onSelectionChange}
                  connectionMode={ConnectionMode.Loose}
                  nodeTypes={nodeTypes}
                  edgesUpdatable={true}
                  edgesFocusable={true}
                  selectNodesOnDrag={false}
                  fitView
                  attributionPosition="bottom-left"
                  deleteKeyCode={deleteKeyCode}
                  multiSelectionKeyCode={multiSelectionKeyCode}
                >
                  <Background variant={BackgroundVariant.Dots} />
                  <Controls />
                </ReactFlow>
              </div>
            )}
          </div>
        </main>
      </div>

      {showDepartmentPopup && selectedDepartment && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary border border-border-primary rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Edit Department Dimensions
              </h3>
              <button
                onClick={handleCloseDepartmentPopup}
                className="text-text-secondary hover:text-text-primary text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary font-roboto">
                  Department Name :
                  {nodes.find((n) => n.id === selectedDepartment)?.data.label}
                </label>
                <div className="text-xs text-text-secondary mb-2 font-roboto">
                  Current size :
                  {departmentDimensions[selectedDepartment]?.width || 625}px ×{" "}
                  {departmentDimensions[selectedDepartment]?.height || 350}px
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-xs text-blue-800 font-roboto">
                  <strong>💡 Tip:</strong> The department group (highlighted in
                  blue) will resize immediately as you change the values below.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2 font-roboto">
                    Width (px)
                  </label>
                  <input
                    type="text"
                    min="300"
                    max="1200"
                    value={
                      departmentDimensions[selectedDepartment]?.width || 625
                    }
                    onChange={(e) => {
                      const width = parseInt(e.target.value) || 625;
                      const height =
                        departmentDimensions[selectedDepartment]?.height || 350;
                      handleDepartmentDimensionsChange(width, height);
                    }}
                    placeholder="Enter width"
                    className="w-full px-3 py-2 border border-border-primary rounded-md bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2 font-roboto">
                    Height (px)
                  </label>
                  <input
                    type="text"
                    min="200"
                    max="800"
                    value={
                      departmentDimensions[selectedDepartment]?.height || 350
                    }
                    onChange={(e) => {
                      const width =
                        departmentDimensions[selectedDepartment]?.width || 625;
                      const height = parseInt(e.target.value) || 350;
                      handleDepartmentDimensionsChange(width, height);
                    }}
                    placeholder="Enter height"
                    className="w-full px-3 py-2 border border-border-primary rounded-md bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="text-xs text-text-secondary font-roboto">
                <p>• Minimum width: 300px, Maximum width: 1200px</p>
                <p>• Minimum height: 200px, Maximum height: 800px</p>
                <p>• Changes will reposition devices automatically</p>
                <p className="text-status-info font-roboto font-medium">
                  • Group will resize immediately as you type
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={handleCloseDepartmentPopup}
                  className="px-4 py-2 bg-primary border border-border-primary rounded-md text-text-primary hover:bg-primary/80 font-roboto cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedDepartment) {
                      handleDepartmentDimensionsChange(625, 350);
                    }
                  }}
                  className="px-4 py-2 bg-status-warning hover:bg-status-warning/80 text-white rounded-md transition-colors font-roboto cursor-pointer"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagramPage;
