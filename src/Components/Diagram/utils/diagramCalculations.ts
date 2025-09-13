import type { DeviceResult } from "../../../../model/devices.interface";
import type { NodeData } from "../../../../model/single-project.interface";

// Type definitions
export interface DiagramNode {
  id: string;
  data: NodeData;
  position: { x: number; y: number };
  type: string;
  parentId?: string;
  sourcePosition?: string;
  targetPosition?: string;
  width?: number;
  height?: number;
  style?: any;
  draggable?: boolean;
  selectable?: boolean;
  deletable?: boolean;
  dragHandle?: string;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: any;
  type?: string;
}

export interface DepartmentGroup {
  department_id: number;
  department_name: string;
  devices: DeviceResult[];
}

// Device conversion functions
export const convertDevicesToDiagram = (
  devices: DeviceResult[],
  departmentDimensions: Record<string, { width: number; height: number }>
): { nodes: DiagramNode[]; edges: DiagramEdge[] } => {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

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

  // Sort devices within each department
  Object.values(departmentGroups).forEach((group) => {
    group.devices.sort((a: DeviceResult, b: DeviceResult) => {
      const aIsTank =
        a.type === "tank" || a.device_family?.toLowerCase().includes("tank");
      const bIsTank =
        b.type === "tank" || b.device_family?.toLowerCase().includes("tank");
      if (aIsTank && !bIsTank) return -1;
      if (!aIsTank && bIsTank) return 1;
      return a.device_id - b.device_id;
    });
  });

  // Create nodes for each department
  Object.values(departmentGroups).forEach((group, groupIndex) => {
    const groupId = group.department_id.toString();
    const groupX = groupIndex * 600 + 50;
    const groupY = 50;

    const minDimensions = calculateMinimumDimensions(group.devices.length);

    const currentDimensions = departmentDimensions[groupId] || {
      width: Math.max(575, minDimensions.width),
      height: Math.max(350, minDimensions.height),
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
        zIndex: 1,
        pointerEvents: "auto",
      },
      type: "group",
      width: groupWidth,
      height: groupHeight,
      draggable: true,
      selectable: true,
      deletable: false,
      dragHandle: ".group-drag-handle",
    });

    // Create tank nodes
    const tanks = group.devices.filter(
      (device: DeviceResult) =>
        device.type === "tank" ||
        device.device_family?.toLowerCase().includes("tank")
    );

    tanks.forEach((device: DeviceResult, tankIndex: number) => {
      const deviceId = `${groupId}-tank${tankIndex + 1}`;
      const tankNode = createTankNode(
        device,
        deviceId,
        groupId,
        groupWidth,
        groupHeight,
        tankIndex,
        tanks.length
      );
      nodes.push(tankNode);
    });

    // Create flow meter nodes
    const fms = group.devices.filter(
      (device: DeviceResult) =>
        device.type === "fm" ||
        device.device_family?.toLowerCase().includes("flow")
    );

    fms.forEach((device: DeviceResult, fmIndex: number) => {
      const deviceId = `${groupId}-fm${fmIndex + 1}`;
      const fmNode = createFMNode(
        device,
        deviceId,
        groupId,
        groupWidth,
        groupHeight,
        fmIndex,
        fms.length,
        tanks.length
      );
      nodes.push(fmNode);
    });
  });

  return { nodes, edges };
};

// Helper function to create tank node
const createTankNode = (
  device: DeviceResult,
  deviceId: string,
  groupId: string,
  groupWidth: number,
  groupHeight: number,
  tankIndex: number,
  totalTanks: number
): DiagramNode => {
  const tankWidth = 120;
  const tankHeight = 80;
  const tankSpacing = 10;
  const sideMargin = 30;

  const availableWidth = groupWidth - 2 * sideMargin;
  const maxTanksPerRow = Math.max(
    1,
    Math.floor(availableWidth / (tankWidth + tankSpacing))
  );
  const totalRows = Math.ceil(totalTanks / maxTanksPerRow);

  const row = Math.floor(tankIndex / maxTanksPerRow);
  const col = tankIndex % maxTanksPerRow;

  const totalTanksInRow = Math.min(
    maxTanksPerRow,
    totalTanks - row * maxTanksPerRow
  );
  const rowWidth =
    totalTanksInRow * tankWidth + (totalTanksInRow - 1) * tankSpacing;
  const startX = sideMargin + (availableWidth - rowWidth) / 2;

  const deviceX = startX + col * (tankWidth + tankSpacing);

  let deviceY;
  const headerHeight = 40;
  const footerHeight = 20;
  const availableHeight = groupHeight - headerHeight - footerHeight;

  const tankSectionHeight = Math.min(
    availableHeight * 0.6,
    totalRows * (tankHeight + 10) + 30
  );
  const tankStartY = headerHeight + 10;

  if (totalRows === 1) {
    deviceY = tankStartY + (tankSectionHeight - tankHeight) / 2;
  } else {
    const rowSpacing = Math.max(
      30,
      Math.min(
        50,
        (tankSectionHeight - totalRows * tankHeight) / (totalRows - 1)
      )
    );
    deviceY = tankStartY + row * (tankHeight + rowSpacing);
  }

  const maxX = groupWidth - tankWidth - sideMargin;
  const maxY = groupHeight - tankHeight - footerHeight;
  const finalX = Math.min(deviceX, maxX);
  const finalY = Math.min(deviceY, maxY);

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

  return {
    id: deviceId,
    data: tankNodeData,
    position: { x: finalX, y: finalY },
    parentId: groupId,
    sourcePosition: "right",
    targetPosition: "left",
    type: "tank",
    width: tankWidth,
    height: tankHeight,
  };
};

// Helper function to create FM node
const createFMNode = (
  device: DeviceResult,
  deviceId: string,
  groupId: string,
  groupWidth: number,
  groupHeight: number,
  fmIndex: number,
  totalFMs: number,
  totalTanks: number
): DiagramNode => {
  const fmWidth = 140;
  const fmHeight = 60;
  const sideMargin = 10;
  const fmSpacing = 10;

  const availableWidth = groupWidth - 2 * sideMargin;
  const maxTanksPerRow = Math.max(1, Math.floor(availableWidth / (50 + 30)));
  const totalTankRows = Math.ceil(totalTanks / maxTanksPerRow);

  const headerHeight = 20;
  const footerHeight = 10;
  const tankAreaHeight =
    totalTanks > 0
      ? headerHeight +
        20 +
        totalTankRows * 60 +
        Math.max(0, totalTankRows - 1) * 30 +
        40
      : headerHeight + 20;

  const maxFMsPerRow = Math.max(
    1,
    Math.floor(availableWidth / (fmWidth + fmSpacing))
  );
  const totalFMRows = Math.ceil(totalFMs / maxFMsPerRow);

  const fmStartY = tankAreaHeight + 40;
  const availableHeight = groupHeight - fmStartY - footerHeight;

  const fmSectionHeight = Math.min(
    availableHeight * 0.4,
    totalFMRows * (fmHeight + 30) + 40
  );

  const fmVerticalSpacing =
    totalFMRows > 1
      ? Math.max(
          30,
          Math.min(
            50,
            (fmSectionHeight - totalFMRows * fmHeight) / (totalFMRows - 1)
          )
        )
      : 0;

  const row = Math.floor(fmIndex / maxFMsPerRow);
  const col = fmIndex % maxFMsPerRow;

  const totalFMsInRow = Math.min(maxFMsPerRow, totalFMs - row * maxFMsPerRow);
  const rowWidth = totalFMsInRow * fmWidth + (totalFMsInRow - 1) * fmSpacing;
  const startX = sideMargin + (availableWidth - rowWidth) / 2;

  const deviceX = startX + col * (fmWidth + fmSpacing);
  const deviceY = fmStartY + 20 + row * (fmHeight + fmVerticalSpacing);

  const maxX = groupWidth - fmWidth - sideMargin;
  const maxY = groupHeight - fmHeight - footerHeight;
  const finalX = Math.min(deviceX, maxX);
  const finalY = Math.min(deviceY, maxY);

  const fmNodeData: NodeData = {
    label: device.device_name,
    type: "bidirectional",
    direction: "bidirectional",
    unit: "Ltr",
    isActive: device.device_status === "active",
    totalizerReading: Number(device.last_record?.min_max) || 0,
    flowRate: Number(device.last_record?.min_avg) || 0,
  };

  return {
    id: deviceId,
    data: fmNodeData,
    position: { x: finalX, y: finalY },
    parentId: groupId,
    sourcePosition: "right",
    targetPosition: "left",
    type: "fm",
    width: fmWidth,
    height: fmHeight,
  };
};

// Clean nodes for API submission
export const cleanNodesForAPI = (
  nodes: DiagramNode[],
  departmentDimensions: Record<string, { width: number; height: number }>
): DiagramNode[] => {
  return nodes.map((node) => {
    if (node.type === "tank") {
      const { currentLevel: _currentLevel, ...cleanData } = node.data;
      return {
        ...node,
        data: cleanData,
      };
    } else if (node.type === "fm") {
      const {
        flowRate: _flowRate,
        totalizerReading: _totalizerReading,
        isActive: _isActive,
        ...cleanData
      } = node.data;
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
          draggable: true,
          selectable: true,
          deletable: false,
          dragHandle: ".group-drag-handle",
          style: {
            ...node.style,
            width: `${currentDimensions.width}px`,
            height: `${currentDimensions.height}px`,
            zIndex: 1,
          },
        };
      }
    }
    return node;
  });
};

const calculateMinimumDimensions = (
  deviceCount: number
): { width: number; height: number } => {
  const headerHeight = 20;
  const footerHeight = 10;
  const sideMargin = 30;
  const deviceSpacing = 30;

  const minWidth = Math.max(500, sideMargin * 2 + deviceCount * 50);

  const tankHeight = 80;
  const fmHeight = 70;
  const maxDevicesPerRow = Math.max(
    1,
    Math.floor((minWidth - sideMargin * 2) / 150)
  );
  const totalRows = Math.ceil(deviceCount / maxDevicesPerRow);
  const minHeight =
    headerHeight +
    footerHeight +
    totalRows * Math.max(tankHeight, fmHeight) +
    (totalRows - 1) * deviceSpacing +
    100;

  return {
    width: minWidth,
    height: Math.max(500, minHeight),
  };
};
