import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch } from "../../../../store/store";
import {
  getProjectById,
  updateDiagramData,
} from "../../../../store/projectSlice";
import { getDeviceByProjectId } from "../../../../store/deviceSlice";
import type { SingleProjectResult } from "../../../../model/single-project.interface";
import type { DeviceResult } from "../../../../model/devices.interface";
import {
  convertDevicesToDiagram,
  cleanNodesForAPI,
  type DiagramNode,
  type DiagramEdge,
} from "../utils/diagramCalculations";
import { Success } from "../../../utils/toast";

export const useDiagramData = (projectId: string | undefined) => {
  const dispatch = useAppDispatch();

  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [edges, setEdges] = useState<DiagramEdge[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDiagram, setIsLoadingDiagram] = useState(false);
  const [projectData, setProjectData] = useState<SingleProjectResult | null>(
    null
  );
  const [deviceData, setDeviceData] = useState<DeviceResult[]>([]);
  const [departmentDimensions, setDepartmentDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});

  const diagramGeneratedRef = useRef(false);
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const convertDevicesToDiagramCallback = useCallback(
    (devices: DeviceResult[]) => {
      return convertDevicesToDiagram(devices, departmentDimensions);
    },
    [departmentDimensions]
  );

  const fetchDiagram = useCallback(async () => {
    if (!projectId) return;

    try {
      await dispatch(getProjectById(projectId))
        .unwrap()
        .then((res: any) => {
          if (res.success) {
            setProjectData(res.data);

            if (res.data.nodes && res.data.edges && res.data.nodes.length > 0) {
              const nodesWithDraggable = (res.data.nodes as DiagramNode[]).map(
                (node) => {
                  if (node.type === "group") {
                    return {
                      ...node,
                      draggable: true,
                      selectable: true,
                      deletable: false,
                      dragHandle: ".group-drag-handle",
                    };
                  }
                  return node;
                }
              );

              setNodes(nodesWithDraggable);
              setEdges(res.data.edges as DiagramEdge[]);

              if ((res.data as any).department_dimensions) {
                setDepartmentDimensions(
                  (res.data as any).department_dimensions
                );
              }

              setIsLoadingDiagram(false);
            }
          }
        })
        .catch((err: any) => {
          console.error("Error fetching plant data:", err);
          setIsLoadingDiagram(false);
        });
    } catch (err) {
      console.error("Error fetching plant data:", err);
      setIsLoadingDiagram(false);
    }
  }, [dispatch, projectId]);

  const fetchDeviceData = useCallback(async () => {
    if (!projectId) return;

    try {
      await dispatch(getDeviceByProjectId(parseInt(projectId)))
        .unwrap()
        .then((res: any) => {
          if (res.success) {
            setDeviceData(res.data);
            if (!res.data || res.data.length === 0) {
              setIsLoadingDiagram(false);
            }
          }
        })
        .catch((err: any) => {
          console.error("Error fetching device data:", err);
          setIsLoadingDiagram(false);
        });
    } catch (err) {
      console.error("Error fetching device data:", err);
      setIsLoadingDiagram(false);
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
                  Number(matchingDevice.last_record?.last_level) || 0,
                capacity: Number(matchingDevice?.params?.storageCapacity) || 0,
                height: Number(matchingDevice?.params?.height) || 0,
                departmentConnection: matchingDevice.department_connection,
                projectConnection: matchingDevice.project_connection,
                organizationConnection: matchingDevice.organization_connection,
                departmentName: matchingDevice.department_name,
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
                flowRate: Number(matchingDevice.last_record?.avg) || 0,
                totalizerReading:
                  Number(matchingDevice.last_record?.max) || 0,
                isActive: matchingDevice.device_status === "active",
                departmentConnection: matchingDevice.department_connection,
                projectConnection: matchingDevice.project_connection,
                organizationConnection: matchingDevice.organization_connection,
                departmentName: matchingDevice.department_name,
              },
            };
          }
        } else if (node.type === "brwhms") {
          const matchingDevice = deviceData.find(
            (device) =>
              device.device_name === node.data.label &&
              (device.type === "brwhms" ||
                device.device_family?.toLowerCase().includes("brwhms"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                flowRate: Number(matchingDevice.last_record?.flow) || 0,
                avg: Number(matchingDevice.last_record?.avg) || 0,
                max: Number(matchingDevice.last_record?.max) || 0,
                min: Number(matchingDevice.last_record?.min) || 0,
                isActive: matchingDevice.device_status === "active",
                departmentConnection: matchingDevice.department_connection,
                projectConnection: matchingDevice.project_connection,
                organizationConnection: matchingDevice.organization_connection,
                departmentName: matchingDevice.department_name,
              },
            };
          }
        } else if (node.type === "phmc") {
          const matchingDevice = deviceData.find(
            (device) =>
              device.device_name === node.data.label &&
              (device.type === "phmc" ||
                device.device_family?.toLowerCase().includes("phmc"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                pumpStatus: matchingDevice.last_record?.pumpstatus || "0",
                voltage: Number(matchingDevice.last_record?.voltage_r) || 0,
                current: Number(matchingDevice.last_record?.Current_r) || 0,
                frequency: Number(matchingDevice.last_record?.Frequency) || 0,
                power: Number(matchingDevice.last_record?.Active_Power) || 0,
                isActive: matchingDevice.device_status === "active",
                departmentConnection: matchingDevice.department_connection,
                projectConnection: matchingDevice.project_connection,
                organizationConnection: matchingDevice.organization_connection,
                departmentName: matchingDevice.department_name,
              },
            };
          }
        } else if (node.type === "arg") {
          const matchingDevice = deviceData.find(
            (device) =>
              device.device_name === node.data.label &&
              (device.type === "arg" ||
                device.device_family?.toLowerCase().includes("arg"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                maxMm: Number(matchingDevice.last_record?.max_mm) || 0,
                minMm: Number(matchingDevice.last_record?.min_mm) || 0,
                lastMm: Number(matchingDevice.last_record?.last_mm) || 0,
                firstMm: Number(matchingDevice.last_record?.first_mm) || 0,
                isActive: matchingDevice.device_status === "active",
                departmentConnection: matchingDevice.department_connection,
                projectConnection: matchingDevice.project_connection,
                organizationConnection: matchingDevice.organization_connection,
                departmentName: matchingDevice.department_name,
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

  const saveDiagramToAPI = useCallback(async () => {
    if (!projectId) return;

    setIsSaving(true);
    try {
      const cleanNodes = cleanNodesForAPI(nodes, departmentDimensions);

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
        .catch((error: any) => {
          console.error("Failed to save diagram to server:", error);
        })
        .finally(() => {
          setIsSaving(false);
        });
    } catch (error) {
      console.error("Failed to save diagram to server:", error);
      setIsSaving(false);
    }
  }, [dispatch, projectId, nodes, edges, departmentDimensions]);

  const resetDiagram = useCallback(() => {
    setDepartmentDimensions({});
    fetchDiagram();
    fetchDeviceData();
    Success("Diagram and department dimensions reset successfully!");
    setNodes([]);
    setEdges([]);
    setHasChanges(false);
  }, [fetchDiagram, fetchDeviceData]);

  const syncDepartmentDimensionsWithNodes = useCallback(() => {
    setNodes((currentNodes) => {
      return currentNodes.map((node) => {
        if (node.type === "group" && departmentDimensions[node.id]) {
          const dimensions = departmentDimensions[node.id];
          return {
            ...node,
            width: dimensions.width,
            height: dimensions.height,
            draggable: true,
            selectable: true,
            deletable: false,
            dragHandle: ".group-drag-handle",
            style: {
              ...node.style,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              zIndex: 1,
            },
          };
        }
        return node;
      });
    });
  }, [departmentDimensions]);

  useEffect(() => {
    if (projectId) {
      fetchDeviceData();
      diagramGeneratedRef.current = false;
      setIsLoadingDiagram(true);
      fetchDiagram();
    }
  }, [fetchDiagram, fetchDeviceData, projectId]);

  useEffect(() => {
    if (projectData && deviceData.length === 0 && isLoadingDiagram) {
      setIsLoadingDiagram(false);
    }

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
          convertDevicesToDiagramCallback(deviceData);
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
    convertDevicesToDiagramCallback,
  ]);

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
              draggable: true,
              selectable: true,
              deletable: false,
              dragHandle: ".group-drag-handle",
              style: {
                ...node.style,
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
                zIndex: 1,
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

  return {
    nodes,
    setNodes,
    edges,
    setEdges,
    hasChanges,
    setHasChanges,
    isSaving,
    isLoadingDiagram,
    projectData,
    deviceData,
    departmentDimensions,
    setDepartmentDimensions,
    saveDiagramToAPI,
    resetDiagram,
  };
};
