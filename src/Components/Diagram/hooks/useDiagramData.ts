import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch } from "../../../../store/store";
import { getPlantById, updateDiagramData } from "../../../../store/plantSlice";
import { getDeviceByPlantId } from "../../../../store/deviceSlice";
import type { SinglePlantResult } from "../../../../model/single-plant.interface";
import type { DeviceResult } from "../../../../model/devices.interface";
import {
  convertDevicesToDiagram,
  cleanNodesForAPI,
  type DiagramNode,
  type DiagramEdge,
} from "../utils/diagramCalculations";
import { Success } from "../../../utils/toast";

export const useDiagramData = (plantId: string | undefined) => {
  const dispatch = useAppDispatch();

  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [edges, setEdges] = useState<DiagramEdge[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDiagram, setIsLoadingDiagram] = useState(false);
  const [plantData, setPlantData] = useState<SinglePlantResult | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceResult[]>([]);
  const [departmentDimensions, setDepartmentDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});

  const diagramGeneratedRef = useRef(false);
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const convertDevicesToDiagramCallback = useCallback(
    (devices: DeviceResult[]) => {
      const plantInfo = plantData
        ? {
            plant_name: plantData.plant_name,
            plant_id: plantData.plant_id,
          }
        : undefined;
      return convertDevicesToDiagram(devices, plantInfo);
    },
    [plantData]
  );

  const fetchDiagram = useCallback(async () => {
    if (!plantId) return;

    try {
      await dispatch(getPlantById(plantId))
        .unwrap()
        .then((res: any) => {
          if (res.success) {
            setPlantData(res.data);
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

              diagramGeneratedRef.current = true;
              setIsLoadingDiagram(false);
            } else {
              diagramGeneratedRef.current = false;
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
  }, [dispatch, plantId]);

  const fetchDeviceData = useCallback(async () => {
    if (!plantId) return;

    try {
      await dispatch(getDeviceByPlantId(parseInt(plantId)))
        .unwrap()
        .then((res: any) => {
          if (res.success) {
            setDeviceData(res.data);
          }
        })
        .catch((err: any) => {
          console.error("Error fetching device data:", err);
        })
        .finally(() => {
          setIsLoadingDiagram(false);
        });
    } catch (err) {
      console.error("Error fetching device data:", err);
      setIsLoadingDiagram(false);
    }
  }, [dispatch, plantId]);

  const mergeNewDevicesWithSavedData = useCallback(() => {
    if (deviceData?.length === 0 || nodes?.length === 0) return;

    const savedDeviceIds = new Set(
      nodes
        ?.filter((node) => node.type !== "group")
        ?.map((node) => {
          const deviceName = node.data?.label;
          return deviceName;
        })
        ?.filter(Boolean) || []
    );

    const newDevices =
      deviceData?.filter(
        (device) =>
          !savedDeviceIds.has(device.device_name) &&
          device.visibility !== "hidden"
      ) || [];

    if (newDevices.length === 0) return;

    const { nodes: newDeviceNodes } =
      convertDevicesToDiagramCallback(newDevices);

    const deviceNodesOnly = newDeviceNodes.filter(
      (node) => node.type !== "group"
    );

    if (deviceNodesOnly.length > 0) {
      setNodes((currentNodes) => [...(currentNodes || []), ...deviceNodesOnly]);
      setHasChanges(true);
    }
  }, [deviceData, nodes, convertDevicesToDiagramCallback]);

  const getSystemConnection = (matchingDevice: any): string => {
    if (
      matchingDevice.in_system_id === null &&
      matchingDevice.out_system_id === null
    ) {
      return "None";
    }
    if (matchingDevice.in_system_id && matchingDevice.out_system_id) {
      return "Both";
    }
    if (matchingDevice.in_system_id && !matchingDevice.out_system_id) {
      return "In";
    }
    if (!matchingDevice.in_system_id && matchingDevice.out_system_id) {
      return "Out";
    }
    return "None";
  };

  const getPlantConnection = (matchingDevice: any): string => {
    if (
      matchingDevice.in_plant_id === null &&
      matchingDevice.out_plant_id === null
    ) {
      return "None";
    }
    if (matchingDevice.in_plant_id && matchingDevice.out_plant_id) {
      return "Both";
    }
    if (matchingDevice.in_plant_id && !matchingDevice.out_plant_id) {
      return "In";
    }
    if (!matchingDevice.in_plant_id && matchingDevice.out_plant_id) {
      return "Out";
    }
    return "None";
  };

  const getDepartmentConnection = (matchingDevice: any): string => {
    if (
      matchingDevice.in_department_id === null &&
      matchingDevice.out_department_id === null
    ) {
      return "None";
    }
    if (matchingDevice.in_department_id && matchingDevice.out_department_id) {
      return "Both";
    }
    if (matchingDevice.in_department_id && !matchingDevice.out_department_id) {
      return "In";
    }
    if (!matchingDevice.in_department_id && matchingDevice.out_department_id) {
      return "Out";
    }
    return "None";
  };

  const updateNodesWithDynamicData = useCallback(() => {
    if (deviceData?.length === 0 || nodes?.length === 0) return;

    setNodes((currentNodes) => {
      return currentNodes?.map((node) => {
        if (node?.type === "tank") {
          const matchingDevice = deviceData?.find(
            (device) =>
              device?.device_name === node?.data?.label &&
              (device?.device_family_type === "tank" ||
                device?.device_family?.toLowerCase().includes("tank"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                currentLevel:
                  Number(matchingDevice?.last_record?.last_level) || 0,
                capacity: Number(matchingDevice?.params?.storageCapacity) || 0,
                height: Number(matchingDevice?.params?.height) || 0,
                departmentConnection: getDepartmentConnection(matchingDevice),
                plantConnection: getPlantConnection(matchingDevice),
                systemConnection: getSystemConnection(matchingDevice),
                organizationConnection: matchingDevice?.organization_connection,
                systemName: matchingDevice?.system_name,
                crossSectionArea:
                  Number(matchingDevice?.params?.crossSectionArea) || 0,
                lastRecordTime: matchingDevice?.last_record?.time || "",
              },
            };
          }
        } else if (node?.type === "fm") {
          const matchingDevice = deviceData?.find(
            (device) =>
              device?.device_name === node?.data?.label &&
              (device?.device_family_type === "fm" ||
                device?.device_family?.toLowerCase().includes("flow"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                flowRate: Number(matchingDevice?.last_record?.avg) || 0,
                totalizerReading: Number(matchingDevice?.last_record?.max) || 0,
                isActive: matchingDevice?.device_status === "active",
                departmentConnection: getDepartmentConnection(matchingDevice),
                plantConnection: getPlantConnection(matchingDevice),
                organizationConnection: matchingDevice?.organization_connection,
                systemName: matchingDevice?.system_name,
                systemConnection: getSystemConnection(matchingDevice),
                lastRecordTime: matchingDevice?.last_record?.time || "",
              },
            };
          }
        } else if (node?.type === "brwhms") {
          const matchingDevice = deviceData?.find(
            (device) =>
              device?.device_name === node?.data?.label &&
              (device?.device_family_type === "brwhms" ||
                device?.device_family?.toLowerCase().includes("brwhms"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                flowRate: Number(matchingDevice?.last_record?.flow) || 0,
                avg: Number(matchingDevice?.last_record?.avg) || 0,
                max: Number(matchingDevice?.last_record?.max) || 0,
                min: Number(matchingDevice?.last_record?.min) || 0,
                isActive: matchingDevice?.device_status === "active",
                departmentConnection: getDepartmentConnection(matchingDevice),
                plantConnection: getPlantConnection(matchingDevice),
                organizationConnection: matchingDevice?.organization_connection,
                systemName: matchingDevice?.system_name,
                systemConnection: getSystemConnection(matchingDevice),
                lastRecordTime: matchingDevice?.last_record?.time || "",
              },
            };
          }
        } else if (node?.type === "phmc") {
          const matchingDevice = deviceData?.find(
            (device) =>
              device?.device_name === node?.data?.label &&
              (device?.device_family_type === "phmc" ||
                device?.device_family?.toLowerCase().includes("phmc"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                pumpStatus: matchingDevice?.last_record?.pumpstatus || "0",
                voltageR: Number(matchingDevice?.last_record?.voltage_r) || 0,
                currentR: Number(matchingDevice?.last_record?.Current_r) || 0,
                voltageY: Number(matchingDevice?.last_record?.voltage_y) || 0,
                currentY: Number(matchingDevice?.last_record?.Current_y) || 0,
                voltageB: Number(matchingDevice?.last_record?.voltage_b) || 0,
                currentB: Number(matchingDevice?.last_record?.Current_b) || 0,
                frequency: Number(matchingDevice?.last_record?.Frequency) || 0,
                isActive: matchingDevice?.device_status === "active",
                departmentConnection: getDepartmentConnection(matchingDevice),
                plantConnection: getPlantConnection(matchingDevice),
                organizationConnection: matchingDevice?.organization_connection,
                systemName: matchingDevice?.system_name,
                systemConnection: getSystemConnection(matchingDevice),
                lastRecordTime: matchingDevice?.last_record?.time || "",
              },
            };
          }
        } else if (node?.type === "arg") {
          const matchingDevice = deviceData?.find(
            (device) =>
              device?.device_name === node?.data?.label &&
              (device?.device_family_type === "arg" ||
                device?.device_family?.toLowerCase().includes("arg"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                maxMm: Number(matchingDevice?.last_record?.max_mm) || 0,
                minMm: Number(matchingDevice?.last_record?.min_mm) || 0,
                lastMm: Number(matchingDevice?.last_record?.last_mm) || 0,
                firstMm: Number(matchingDevice?.last_record?.first_mm) || 0,
                isActive: matchingDevice?.device_status === "active",
                departmentConnection: getDepartmentConnection(matchingDevice),
                plantConnection: getPlantConnection(matchingDevice),
                organizationConnection: matchingDevice?.organization_connection,
                systemName: matchingDevice?.system_name,
                systemConnection: getSystemConnection(matchingDevice),
              },
            };
          }
        } else if (node?.type === "virtual") {
          const matchingDevice = deviceData?.find(
            (device) =>
              device?.device_name === node?.data?.label &&
              (device?.device_family_type === "virtual" ||
                device?.device_family?.toLowerCase().includes("virtual"))
          );

          if (matchingDevice) {
            return {
              ...node,
              data: {
                ...node.data,
                departmentConnection: getDepartmentConnection(matchingDevice),
                plantConnection: getPlantConnection(matchingDevice),
                organizationConnection: matchingDevice?.organization_connection,
                systemName: matchingDevice?.system_name,
                systemConnection: getSystemConnection(matchingDevice),
                lastRecordTime: matchingDevice?.last_record?.time || "",
              },
            };
          }
        } else if (node.type === "group" && node.data.type === "department") {
          const departmentId = node.id.replace("dept-", "");
          const departmentDevices = deviceData.filter(
            (device) =>
              device?.in_department_id?.toString() === departmentId ||
              device?.out_department_id?.toString() === departmentId
          );

          if (departmentDevices?.length > 0) {
            const latestDepartmentName =
              departmentDevices[0]?.in_department_name ||
              departmentDevices[0]?.out_department_name;
            if (
              latestDepartmentName &&
              latestDepartmentName !== node?.data?.label
            ) {
              return {
                ...node,
                data: {
                  ...node.data,
                  label: latestDepartmentName,
                },
              };
            }
          }
        } else if (node.type === "group" && node.data.type === "plant") {
          const plantId = node.id.replace("plant-", "");
          const plantDevices = deviceData.filter(
            (device) =>
              device?.in_plant_id?.toString() === plantId ||
              device?.out_plant_id?.toString() === plantId
          );

          if (plantDevices?.length > 0) {
            const latestPlantName =
              plantDevices[0].in_plant_name || plantDevices[0].out_plant_name;
            if (latestPlantName && latestPlantName !== node.data.label) {
              return {
                ...node,
                data: {
                  ...node.data,
                  label: latestPlantName,
                },
              };
            }
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
    if (!plantId) return;

    setIsSaving(true);
    try {
      const cleanNodes = cleanNodesForAPI(nodes, departmentDimensions);

      const diagramData = {
        plant_id: parseInt(plantId),
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
  }, [dispatch, plantId, nodes, edges, departmentDimensions]);

  const resetDiagram = useCallback(() => {
    setDepartmentDimensions({});
    setNodes([]);
    setEdges([]);
    setHasChanges(false);
    diagramGeneratedRef.current = false;
    setIsLoadingDiagram(true);
    fetchDiagram();
    fetchDeviceData();
    Success("Diagram and department dimensions reset successfully!");
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
    if (plantId) {
      fetchDeviceData();
      diagramGeneratedRef.current = false;
      setIsLoadingDiagram(true);
      fetchDiagram();
    }
  }, [fetchDiagram, fetchDeviceData, plantId]);

  useEffect(() => {
    if (plantData && deviceData.length === 0 && !isLoadingDiagram) {
      setIsLoadingDiagram(false);
    }

    if (
      plantData &&
      deviceData.length > 0 &&
      !isLoadingDiagram &&
      !diagramGeneratedRef.current
    ) {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }

      generationTimeoutRef.current = setTimeout(() => {
        try {
          const { nodes: deviceNodes, edges: deviceEdges } =
            convertDevicesToDiagramCallback(deviceData);
          setNodes(deviceNodes);
          setEdges(deviceEdges);
          setIsLoadingDiagram(false);
          diagramGeneratedRef.current = true;
        } catch (error) {
          console.error("Error generating diagram:", error);
          setIsLoadingDiagram(false);
        }
      }, 100);
    }

    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, [
    plantData,
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

      if (diagramGeneratedRef.current && nodes.length > 0) {
        mergeNewDevicesWithSavedData();
      }
    }

    return () => {
      delete (window as any).deviceData;
    };
  }, [deviceData, mergeNewDevicesWithSavedData, nodes.length]);

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
    plantData,
    deviceData,
    departmentDimensions,
    setDepartmentDimensions,
    saveDiagramToAPI,
    resetDiagram,
  };
};
