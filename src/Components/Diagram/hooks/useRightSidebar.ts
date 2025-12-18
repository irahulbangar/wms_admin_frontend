import { useState, useCallback, useMemo } from "react";
import type { DeviceResult } from "../../../../model/devices.interface";
import {
  calculatePlantFlowBalance,
  calculateDepartmentFlowBalance,
  calculateSystemFlowBalance,
} from "../utils/diagramCalculations";

interface SelectedGroup {
  id: string;
  name: string;
  type: "plant" | "department" | "system";
}

export const useRightSidebar = (deviceData: DeviceResult[]) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(
    null
  );

  const calculations = useMemo(() => {
    if (!selectedGroup || !deviceData.length) return null;

    // selectedGroup.id now contains the numeric ID as string
    const groupId = parseInt(selectedGroup.id, 10);
    if (isNaN(groupId)) return null;

    switch (selectedGroup.type) {
      case "plant": {
        return calculatePlantFlowBalance(deviceData, groupId);
      }

      case "department": {
        return calculateDepartmentFlowBalance(deviceData, groupId);
      }

      case "system": {
        return calculateSystemFlowBalance(deviceData, groupId);
      }

      default:
        return null;
    }
  }, [selectedGroup, deviceData]);

  const extractNumericId = useCallback(
    (
      nodeId: string,
      groupType: "plant" | "department" | "system"
    ): string | null => {
      if (!deviceData || deviceData.length === 0) return null;

      switch (groupType) {
        case "plant": {
          let plantName = nodeId;
          if (plantName.startsWith("plant-")) {
            plantName = plantName.replace("plant-", "").trim();
          } else {
            plantName = plantName.trim();
          }

          const searchName = plantName.toLowerCase();

          let plantDevice = deviceData.find((device) => {
            const devicePlantName = device.plant_name
              ?.toString()
              .trim()
              .toLowerCase();
            const deviceInPlantName = device.in_plant_name
              ?.toString()
              .trim()
              .toLowerCase();
            const deviceOutPlantName = device.out_plant_name
              ?.toString()
              .trim()
              .toLowerCase();

            return (
              (devicePlantName === searchName && device.plant_id) ||
              (deviceInPlantName === searchName && device.in_plant_id) ||
              (deviceOutPlantName === searchName && device.out_plant_id)
            );
          });

          if (plantDevice) {
            if (
              plantDevice.plant_name?.toString().trim().toLowerCase() ===
                searchName &&
              plantDevice.plant_id
            ) {
              return String(plantDevice.plant_id);
            }
            if (
              plantDevice.in_plant_name?.toString().trim().toLowerCase() ===
                searchName &&
              plantDevice.in_plant_id
            ) {
              return String(plantDevice.in_plant_id);
            }
            if (
              plantDevice.out_plant_name?.toString().trim().toLowerCase() ===
                searchName &&
              plantDevice.out_plant_id
            ) {
              return String(plantDevice.out_plant_id);
            }
          }

          plantDevice = deviceData.find((device) => {
            const devicePlantName = device.plant_name
              ?.toString()
              .trim()
              .toLowerCase();
            const deviceInPlantName = device.in_plant_name
              ?.toString()
              .trim()
              .toLowerCase();
            const deviceOutPlantName = device.out_plant_name
              ?.toString()
              .trim()
              .toLowerCase();

            return (
              devicePlantName?.includes(searchName) ||
              deviceInPlantName?.includes(searchName) ||
              deviceOutPlantName?.includes(searchName)
            );
          });

          if (plantDevice) {
            if (
              plantDevice.plant_name
                ?.toString()
                .trim()
                .toLowerCase()
                .includes(searchName) &&
              plantDevice.plant_id
            ) {
              return String(plantDevice.plant_id);
            }
            if (
              plantDevice.in_plant_name
                ?.toString()
                .trim()
                .toLowerCase()
                .includes(searchName) &&
              plantDevice.in_plant_id
            ) {
              return String(plantDevice.in_plant_id);
            }
            if (
              plantDevice.out_plant_name
                ?.toString()
                .trim()
                .toLowerCase()
                .includes(searchName) &&
              plantDevice.out_plant_id
            ) {
              return String(plantDevice.out_plant_id);
            }
          }

          const allPlantIds = new Set<number>();
          deviceData.forEach((device) => {
            if (device.plant_id) allPlantIds.add(device.plant_id);
            if (device.in_plant_id) allPlantIds.add(device.in_plant_id);
            if (device.out_plant_id) allPlantIds.add(device.out_plant_id);
          });

          if (allPlantIds.size === 1) {
            return String(Array.from(allPlantIds)[0]);
          }
          return null;
        }
        case "department": {
          let deptIdStr = nodeId;
          if (deptIdStr.startsWith("dept-")) {
            deptIdStr = deptIdStr.replace("dept-", "");
          }
          const deptId = parseInt(deptIdStr, 10);
          return isNaN(deptId) ? null : String(deptId);
        }
        case "system": {
          let sysIdStr = nodeId;
          if (sysIdStr.startsWith("system-")) {
            sysIdStr = sysIdStr.replace("system-", "");
          }
          const sysId = parseInt(sysIdStr, 10);
          return isNaN(sysId) ? null : String(sysId);
        }
        default:
          return null;
      }
    },
    [deviceData]
  );

  const openSidebar = useCallback(
    (
      groupId: string,
      groupName: string,
      groupType: "plant" | "department" | "system",
      directId?: string | number
    ) => {
      if (directId !== undefined) {
        setSelectedGroup({
          id: String(directId),
          name: groupName,
          type: groupType,
        });
        setIsOpen(true);
        return;
      }

      const numericId = extractNumericId(groupId, groupType);
      if (!numericId) {
        return;
      }

      setSelectedGroup({
        id: numericId,
        name: groupName,
        type: groupType,
      });
      setIsOpen(true);
    },
    [extractNumericId]
  );

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    setSelectedGroup(null);
  }, []);

  const handleGroupClick = useCallback(
    (nodeId: string, nodeData: any) => {
      if (nodeData.type === "plant") {
        openSidebar(nodeId, nodeData.label || "", "plant", nodeData.plant_id);
      } else if (nodeData.type === "department") {
        openSidebar(nodeId, nodeData.label, "department");
      } else if (nodeData.type === "system") {
        openSidebar(nodeId, nodeData.label, "system");
      }
    },
    [openSidebar]
  );

  return {
    isOpen,
    selectedGroup,
    calculations,
    deviceData,
    openSidebar,
    closeSidebar,
    handleGroupClick,
  };
};
