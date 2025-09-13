import React, { useState, useEffect } from "react";
import { useReactFlow } from "reactflow";
import { Edit } from "lucide-react";
import type { NodeData } from "../../../model/single-project.interface";
import type { DeviceResult } from "../../../model/devices.interface";

interface GroupNodeProps {
  data: NodeData;
  id: string;
  deviceData?: DeviceResult[];
}

const GroupNode: React.FC<GroupNodeProps> = ({ data, id, deviceData }) => {
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

          e.stopPropagation();
        }}
      />

      <div
        className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-secondary border border-border-primary rounded-md px-3 py-1 shadow-sm group-header flex items-center gap-2"
        style={{
          pointerEvents: "auto",
          zIndex: 2,
        }}
      >
        <span className="text-sm font-semibold text-text-primary font-roboto">
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

export default GroupNode;
