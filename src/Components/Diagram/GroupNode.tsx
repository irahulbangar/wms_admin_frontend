import React, { useState, useEffect } from "react";
import { useReactFlow } from "reactflow";
import { Edit } from "lucide-react";
import type { NodeData } from "../../../model/single-plant.interface";
import type { DeviceResult } from "../../../model/devices.interface";
import type { DiagramEdge } from "./utils/diagramCalculations";
import {
  calculateDepartmentFlowBalance,
  calculatePlantFlowBalance,
  calculateSystemFlowBalance,
} from "./utils/diagramCalculations";

interface GroupNodeProps {
  data: NodeData;
  id: string;
  deviceData?: DeviceResult[];
  edges?: DiagramEdge[];
}

const determineFMFlowDirection = (
  fmId: string,
  departmentTanks: any[],
  edges: DiagramEdge[]
): boolean => {
  const fmEdges = edges.filter(
    (edge) => edge.source === fmId || edge.target === fmId
  );

  const tankConnections = fmEdges.filter((edge) => {
    const otherNodeId = edge.source === fmId ? edge.target : edge.source;
    return departmentTanks.some((tank) => tank.id === otherNodeId);
  });

  if (tankConnections.length === 0) {
    return true;
  }

  let inputConnections = 0;
  let outputConnections = 0;

  tankConnections.forEach((edge) => {
    if (edge.source === fmId) {
      inputConnections++;
    } else {
      outputConnections++;
    }
  });

  return inputConnections >= outputConnections;
};

const GroupNode: React.FC<GroupNodeProps> = ({
  data,
  id,
  deviceData,
  edges = [],
}) => {
  const unit = data.unit || "Ltr";
  const { getNodes, getEdges } = useReactFlow();
  const allNodes = getNodes();
  const allEdges = getEdges ? getEdges() : edges;

  const deviceDataKey = deviceData
    ? JSON.stringify(
        deviceData.map((d) => ({
          id: d.device_id,
          totalizerReading: d.last_record?.max,
          currentLevel: d.last_record?.last_level,
          capacity: d.params?.storageCapacity,
          departmentId: d.in_department_id || d.out_department_id,
        }))
      )
    : "";

  const [, forceUpdate] = useState({});

  useEffect(() => {
    forceUpdate({});
  }, [deviceDataKey, id]);

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
  }, [id]);

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
    if (data.type === "plant" && deviceData && deviceData.length > 0) {
      const plantId = deviceData[0]?.plant_id;
      
      const connectedDevices = deviceData.filter(device => 
        device.in_plant_id || device.out_plant_id
      );
      
      const plantBalance = calculatePlantFlowBalance(connectedDevices, plantId);

      if (plantBalance) {
        return {
          current: plantBalance.totalStock,
          capacity: plantBalance.totalCapacity,
        };
      }
    }

    if (data.type === "department" && deviceData && deviceData.length > 0) {
      const departmentId = parseInt(id.replace("dept-", ""));
      const departmentDevices = deviceData.filter(
        (device) => device.in_department_id === departmentId || device.out_department_id === departmentId
      );

      const connectedDepartmentDevices = departmentDevices.filter(device => 
        device.in_department_id || device.out_department_id
      );

      const departmentTanks = connectedDepartmentDevices.filter(
        (device) =>
          device.device_family_type === "tank" ||
          device.device_family?.toLowerCase().includes("tank")
      );

      const totals = departmentTanks.reduce(
        (acc, device) => {
          const currentLevel = Number(device.last_record?.last_level) || 0;
          const capacity = Number(device?.params?.storageCapacity) || 0;
          
          return {
            current: acc.current + currentLevel,
            capacity: acc.capacity + capacity,
          };
        },
        { current: 0, capacity: 0 }
      );

      return totals;
    }

    if (data.type === "system" && deviceData && deviceData.length > 0) {
      const systemId = parseInt(id.replace("system-", ""));
      const systemDevices = deviceData.filter(
        (device) => device.in_system_id === systemId || device.out_system_id === systemId
      );

      const connectedSystemDevices = systemDevices.filter(device => 
        device.in_system_id || device.out_system_id
      );

      const systemTanks = connectedSystemDevices.filter(
        (device) =>
          device.device_family_type === "tank" ||
          device.device_family?.toLowerCase().includes("tank")
      );

      const totals = systemTanks.reduce(
        (acc, device) => {
          return {
            current:
              acc.current + (Number(device.last_record?.last_level) || 0),
            capacity:
              acc.capacity + (Number(device?.params?.storageCapacity) || 0),
          };
        },
        { current: 0, capacity: 0 }
      );

      return totals;
    }

    let totals = { current: 0, capacity: 0 };

    if (allNodes && allNodes.length > 0) {
      const childTanks = allNodes.filter(
        (node) => node.type === "tank" && node.parentId === id
      );

      totals = childTanks.reduce(
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

    return totals;
  };

  const calculateTotalInOut = () => {
    if (data.type === "department" && deviceData && deviceData.length > 0) {
      const departmentId = parseInt(id.replace("dept-", ""));
      
      const connectedDevices = deviceData.filter(device => 
        device.in_department_id || device.out_department_id
      );
      
      const flowBalance = calculateDepartmentFlowBalance(
        connectedDevices,
        departmentId
      );

      if (flowBalance) {
        return {
          totalIn: flowBalance.totalIn,
          totalOut: flowBalance.totalOut,
        };
      }
    }

    if (data.type === "plant" && deviceData && deviceData.length > 0) {
      const plantId = deviceData[0]?.plant_id;
      
      const connectedDevices = deviceData.filter(device => 
        device.in_plant_id || device.out_plant_id
      );
      
      const plantBalance = calculatePlantFlowBalance(connectedDevices, plantId);

      if (plantBalance) {
        return {
          totalIn: plantBalance.totalIn,
          totalOut: plantBalance.totalOut,
        };
      }
    }

    if (data.type === "system" && deviceData && deviceData.length > 0) {
      const systemId = parseInt(id.replace("system-", ""));
      
      const connectedDevices = deviceData.filter(device => 
        device.in_system_id || device.out_system_id
      );
      
      const systemBalance = calculateSystemFlowBalance(connectedDevices, systemId);

      if (systemBalance) {
        return {
          totalIn: systemBalance.totalIn,
          totalOut: systemBalance.totalOut,
        };
      }
    }

    let totals = { totalIn: 0, totalOut: 0 };

    if (allNodes && allNodes.length > 0) {
      const childFMs = allNodes.filter(
        (node) => node.type === "fm" && node.parentId === id
      );

      const childTanks = allNodes.filter(
        (node) => node.type === "tank" && node.parentId === id
      );

      totals = childFMs.reduce(
        (acc, fm) => {
          const fmData = fm.data as NodeData;
          const totalVolume = fmData?.totalizerReading || 0;

          const isInput = determineFMFlowDirection(
            fm.id,
            childTanks,
            allEdges
          );

          if (isInput) {
            acc.totalIn += totalVolume;
          } else {
            acc.totalOut += totalVolume;
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
      style={{
        pointerEvents: "auto",
        zIndex: 1,
        isolation: "isolate",
        cursor: "grab",
      }}
      data-node-id={id}
    >
      <div
        className="absolute inset-0 w-full h-full group-drag-handle"
        style={{
          pointerEvents: "auto",
          cursor: "grab",
          zIndex: 0,
          backgroundColor: "transparent",
        }}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          const isEdge =
            target.closest(".react-flow__edge") ||
            target.closest(".react-flow__edge-path") ||
            target.tagName === "path" ||
            target.classList.contains("react-flow__edge-clickable");

          if (isEdge) {
            return;
          }

          e.stopPropagation();
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isEdge =
            target.closest(".react-flow__edge") ||
            target.closest(".react-flow__edge-path") ||
            target.tagName === "path" ||
            target.classList.contains("react-flow__edge-clickable");

          if (isEdge) {
            return;
          }

          if (target.closest('button')) {
            e.stopPropagation();
          }
        }}
      />

      <div
        className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-secondary/70 border border-border-primary rounded-md px-3 py-1 shadow-sm group-header flex items-center gap-2"
        style={{
          pointerEvents: "auto",
          zIndex: 2,
        }}
      >
        <span className="text-sm font-medium text-text-primary font-roboto">
          {data.label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(e);
          }}
          className="text-status-info hover:text-status-info/80 transition-colors cursor-pointer"
          title="Edit department dimensions"
          style={{
            pointerEvents: "auto",
            zIndex: 15,
          }}
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex items-center justify-between w-full gap-6 text-xs font-roboto"
        style={{
          pointerEvents: "auto",
          zIndex: 2,
        }}
      >
        <div className="text-center flex items-start flex-col">
          <div className="flex items-center gap-2">
            <div className="text-text-primary">Total Stock :</div>
            <div className="font-medium text-text-primary">
              {stockData.current.toFixed(1)} {unit}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-text-primary">Total Capacity :</div>
            <div className="font-medium text-text-primary">
              {stockData.capacity.toFixed(0)} {unit}
            </div>
          </div>
        </div>
        
        {data.type === "department" && (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-primary">Total In :</div>
                <div className="font-medium text-text-primary">
                  {inOutData.totalIn.toFixed(1)} {unit}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-primary">Total Out :</div>
                <div className="font-medium text-text-primary">
                  {inOutData.totalOut.toFixed(1)} {unit}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-primary">Total Balance :</div>
                <div className="font-medium text-text-primary">
                  {totalBalance.toFixed(1)} {unit}
                </div>
              </div>
            </div>
          </div>
        )}

        {data.type === "plant" && (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-primary">Total In :</div>
                <div className="font-medium text-text-primary">
                  {inOutData.totalIn.toFixed(1)} {unit}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-primary">Total Out :</div>
                <div className="font-medium text-text-primary">
                  {inOutData.totalOut.toFixed(1)} {unit}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-primary">Total Balance :</div>
                <div className="font-medium text-text-primary">
                  {totalBalance.toFixed(1)} {unit}
                </div>
              </div>
            </div>
          </div>
        )}

        {data.type === "system" && (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-primary">Total In :</div>
                <div className="font-medium text-text-primary">
                  {inOutData.totalIn.toFixed(1)} {unit}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-primary">Total Out :</div>
                <div className="font-medium text-text-primary">
                  {inOutData.totalOut.toFixed(1)} {unit}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-text-primary">Total Balance :</div>
                <div className="font-medium text-text-primary">
                  {totalBalance.toFixed(1)} {unit}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupNode;
