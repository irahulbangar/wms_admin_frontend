import type { DeviceResult } from "../../../../model/devices.interface";
import type { NodeData } from "../../../../model/single-plant.interface";

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

export interface DepartmentCalculations {
  department_id: number;
  department_name: string;
  totalIn: number;
  totalOut: number;
  totalBalance: number;
}

export const convertDevicesToDiagram = (
  devices: DeviceResult[],
  departmentDimensions: Record<string, { width: number; height: number }>,
  plantData?: { plant_name: string; plant_id: number }
): { nodes: DiagramNode[]; edges: DiagramEdge[] } => {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  const visibleDevices = devices.filter(device => device.visibility !== "hidden");

  const plantGroups = visibleDevices.reduce((acc, device) => {
    const plantId = device.plant_id.toString();
    if (!acc[plantId]) {
      acc[plantId] = {
        plant_id: device.plant_id,
        plant_name: plantData?.plant_name || device.plant_name || `Plant ${device.plant_id}`,
        departments: {},
      };
    } else {
      if (device.plant_name && device.plant_name !== acc[plantId].plant_name && !plantData?.plant_name) {
        acc[plantId].plant_name = device.plant_name;
      }
    }

    const deptId = device.department_id.toString();
    if (!acc[plantId].departments[deptId]) {
      acc[plantId].departments[deptId] = {
        department_id: device.department_id,
        department_name: device.department_name || `Department ${device.department_id}`,
        devices: [],
      };
    } else {
      if (device.department_name && device.department_name !== acc[plantId].departments[deptId].department_name) {
        acc[plantId].departments[deptId].department_name = device.department_name;
      }
    }
    acc[plantId].departments[deptId].devices.push(device);
    return acc;
  }, {} as Record<string, { plant_id: number; plant_name: string; departments: Record<string, DepartmentGroup> }>);

  Object.values(plantGroups).forEach((plant, plantIndex) => {
    const plantId = `plant-${plant.plant_id}`;

    // Calculate dynamic plant dimensions based on department count and content
    const departmentCount = Object.values(plant.departments).length;

    // Calculate optimal grid layout
    const maxDepartmentsPerRow = departmentCount <= 2 ? 2 : departmentCount <= 6 ? 3 : 4;
    const totalRows = Math.ceil(departmentCount / maxDepartmentsPerRow);

    // Calculate department dimensions first
    const departmentSpacing = 20;
    const plantPadding = 40;
    const minDepartmentWidth = 650; // Minimum department width
    const minDepartmentHeight = 550; // Minimum department height

    // Calculate plant width based on department count (minimum 1200px)
    const plantWidth = Math.max(1200, plantPadding * 2 + maxDepartmentsPerRow * minDepartmentWidth + (maxDepartmentsPerRow - 1) * departmentSpacing);

    // Calculate plant height based on department rows and content (minimum 650px)
    const plantHeight = Math.max(650, plantPadding * 2 + 60 + totalRows * minDepartmentHeight + (totalRows - 1) * departmentSpacing);

    // Calculate plant positioning based on dynamic width
    const plantSpacing = 100; // Base spacing between plants
    const plantX = plantIndex * (plantWidth + plantSpacing) + 0;
    const plantY = 20;

    nodes.push({
      id: plantId,
      data: {
        label: plant.plant_name,
        type: "plant",
        unit: "Ltr",
      },
      position: { x: plantX, y: plantY },
      style: {
        width: plantWidth,
        height: plantHeight,
        borderRadius: 15,
        border: "3px solid #3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        zIndex: 1,
        pointerEvents: "auto",
      },
      type: "group",
      width: plantWidth,
      height: plantHeight,
      draggable: true,
      selectable: true,
      deletable: false,
      dragHandle: ".group-drag-handle",
    });

    // Calculate available space for departments within dynamic plant boundaries
    const availableWidth = plantWidth - (2 * plantPadding);
    const availableHeight = plantHeight - (2 * plantPadding) - 40; // 40px for plant header

    // Calculate department dimensions based on available space
    const departmentWidth = Math.max(minDepartmentWidth, (availableWidth - (maxDepartmentsPerRow - 1) * departmentSpacing) / maxDepartmentsPerRow);
    const departmentHeight = Math.max(minDepartmentHeight, (availableHeight - (totalRows - 1) * departmentSpacing) / totalRows);

    Object.values(plant.departments).forEach((department, deptIndex) => {
      const deptId = `dept-${department.department_id}`;

      // Calculate position within plant boundaries
      const row = Math.floor(deptIndex / maxDepartmentsPerRow);
      const col = deptIndex % maxDepartmentsPerRow;
      const deptX = plantX + plantPadding + col * (departmentWidth + departmentSpacing);
      const deptY = plantY + 60 + row * (departmentHeight + departmentSpacing);

      department.devices.sort((a: DeviceResult, b: DeviceResult) => {
        const aIsTank = a.type === "tank" || a.device_family?.toLowerCase().includes("tank");
        const bIsTank = b.type === "tank" || b.device_family?.toLowerCase().includes("tank");
        if (aIsTank && !bIsTank) return -1;
        if (!aIsTank && bIsTank) return 1;
        return a.device_id - b.device_id;
      });

      // Calculate dynamic department dimensions based on device count
      const deviceCount = department.devices.length;
      const minDimensions = calculateMinimumDimensions(deviceCount);

      // Use minimum department dimensions (650x550) and grow based on device content
      const dynamicWidth = Math.max(650, Math.max(departmentWidth, minDimensions.width));
      const dynamicHeight = Math.max(550, Math.max(departmentHeight, minDimensions.height));

      const currentDimensions = departmentDimensions[deptId] || {
        width: dynamicWidth,
        height: dynamicHeight,
      };
      const deptWidth = currentDimensions.width;
      const deptHeight = currentDimensions.height;

      nodes.push({
        id: deptId,
        data: {
          label: department.department_name,
          type: "department",
          unit: "Ltr",
        },
        position: { x: deptX, y: deptY },
        parentId: plantId,
        style: {
          width: deptWidth,
          height: deptHeight,
          borderRadius: 10,
          border: "2px dashed #6b7280",
          backgroundColor: "rgba(107, 114, 128, 0.1)",
          zIndex: 2,
          pointerEvents: "auto",
        },
        type: "group",
        width: deptWidth,
        height: deptHeight,
        draggable: true,
        selectable: true,
        deletable: false,
        dragHandle: ".group-drag-handle",
      });

      const tanks = department.devices.filter(
        (device: DeviceResult) =>
          device.type === "tank" ||
          device.device_family?.toLowerCase().includes("tank")
      );

      tanks.forEach((device: DeviceResult, tankIndex: number) => {
        const deviceId = `${deptId}-tank${tankIndex + 1}`;
        const tankNode = createTankNode(
          device,
          deviceId,
          deptId,
          deptWidth,
          deptHeight,
          tankIndex,
          tanks.length
        );
        nodes.push(tankNode);
      });

      const fms = department.devices.filter(
        (device: DeviceResult) =>
          device.type === "fm" ||
          device.device_family?.toLowerCase().includes("flow")
      );

      fms.forEach((device: DeviceResult, fmIndex: number) => {
        const deviceId = `${deptId}-fm${fmIndex + 1}`;
        const fmNode = createFMNode(
          device,
          deviceId,
          deptId,
          deptWidth,
          deptHeight,
          fmIndex,
          fms.length,
          tanks.length
        );
        nodes.push(fmNode);
      });

      const brwhms = department.devices.filter(
        (device: DeviceResult) =>
          device.type === "brwhms" ||
          device.device_family?.toLowerCase().includes("brwhms")
      );

      brwhms.forEach((device: DeviceResult, brwhmsIndex: number) => {
        const deviceId = `${deptId}-brwhms${brwhmsIndex + 1}`;
        const brwhmsNode = createBRWHMSNode(
          device,
          deviceId,
          deptId,
          deptWidth,
          deptHeight,
          brwhmsIndex,
          brwhms.length,
          tanks.length + fms.length
        );
        nodes.push(brwhmsNode);
      });

      const phmcs = department.devices.filter(
        (device: DeviceResult) =>
          device.type === "phmc" ||
          device.device_family?.toLowerCase().includes("phmc")
      );

      phmcs.forEach((device: DeviceResult, phmcIndex: number) => {
        const deviceId = `${deptId}-phmc${phmcIndex + 1}`;
        const phmcNode = createPHMCNode(
          device,
          deviceId,
          deptId,
          deptWidth,
          deptHeight,
          phmcIndex,
          phmcs.length,
          tanks.length + fms.length + brwhms.length
        );
        nodes.push(phmcNode);
      });

      const args = department.devices.filter(
        (device: DeviceResult) =>
          device.type === "arg" ||
          device.device_family?.toLowerCase().includes("arg")
      );

      args.forEach((device: DeviceResult, argIndex: number) => {
        const deviceId = `${deptId}-arg${argIndex + 1}`;
        const argNode = createARGNode(
          device,
          deviceId,
          deptId,
          deptWidth,
          deptHeight,
          argIndex,
          args.length,
          tanks.length + fms.length + brwhms.length + phmcs.length
        );
        nodes.push(argNode);
      });
    });
  });

  return { nodes, edges };
};

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
    currentLevel: Number(device.last_record?.last_level) || 0,
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
    totalizerReading: Number(device.last_record?.max) || 0,
    flowRate: Number(device.last_record?.avg) || 0,
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

const createBRWHMSNode = (
  device: DeviceResult,
  deviceId: string,
  groupId: string,
  groupWidth: number,
  groupHeight: number,
  brwhmsIndex: number,
  totalBRWHMS: number,
  previousDevicesCount: number
): DiagramNode => {
  const brwhmsWidth = 140;
  const brwhmsHeight = 80;
  const sideMargin = 10;
  const brwhmsSpacing = 10;

  const availableWidth = groupWidth - 2 * sideMargin;
  const maxDevicesPerRow = Math.max(
    1,
    Math.floor(availableWidth / (brwhmsWidth + brwhmsSpacing))
  );
  const totalRows = Math.ceil(totalBRWHMS / maxDevicesPerRow);

  const footerHeight = 10;
  const previousDevicesHeight = previousDevicesCount > 0 ? 200 : 0;

  const brwhmsStartY = previousDevicesHeight + 40;
  const availableHeight = groupHeight - brwhmsStartY - footerHeight;

  const brwhmsSectionHeight = Math.min(
    availableHeight * 0.4,
    totalRows * (brwhmsHeight + 30) + 40
  );

  const brwhmsVerticalSpacing =
    totalRows > 1
      ? Math.max(
        30,
        Math.min(
          50,
          (brwhmsSectionHeight - totalRows * brwhmsHeight) / (totalRows - 1)
        )
      )
      : 0;

  const row = Math.floor(brwhmsIndex / maxDevicesPerRow);
  const col = brwhmsIndex % maxDevicesPerRow;

  const totalDevicesInRow = Math.min(maxDevicesPerRow, totalBRWHMS - row * maxDevicesPerRow);
  const rowWidth = totalDevicesInRow * brwhmsWidth + (totalDevicesInRow - 1) * brwhmsSpacing;
  const startX = sideMargin + (availableWidth - rowWidth) / 2;

  const deviceX = startX + col * (brwhmsWidth + brwhmsSpacing);
  const deviceY = brwhmsStartY + 20 + row * (brwhmsHeight + brwhmsVerticalSpacing);

  const maxX = groupWidth - brwhmsWidth - sideMargin;
  const maxY = groupHeight - brwhmsHeight - footerHeight;
  const finalX = Math.min(deviceX, maxX);
  const finalY = Math.min(deviceY, maxY);

  const brwhmsNodeData: NodeData = {
    label: device.device_name,
    type: "bidirectional",
    direction: "bidirectional",
    unit: "Ltr",
    isActive: device.device_status === "active",
    flowRate: Number(device.last_record?.flow) || 0,
    avg: Number(device.last_record?.avg) || 0,
    max: Number(device.last_record?.max) || 0,
    min: Number(device.last_record?.min) || 0,
  };

  return {
    id: deviceId,
    data: brwhmsNodeData,
    position: { x: finalX, y: finalY },
    parentId: groupId,
    sourcePosition: "right",
    targetPosition: "left",
    type: "brwhms",
    width: brwhmsWidth,
    height: brwhmsHeight,
  };
};

const createPHMCNode = (
  device: DeviceResult,
  deviceId: string,
  groupId: string,
  groupWidth: number,
  groupHeight: number,
  phmcIndex: number,
  totalPHMCs: number,
  previousDevicesCount: number
): DiagramNode => {
  const phmcWidth = 140;
  const phmcHeight = 100;
  const sideMargin = 10;
  const phmcSpacing = 10;

  const availableWidth = groupWidth - 2 * sideMargin;
  const maxDevicesPerRow = Math.max(
    1,
    Math.floor(availableWidth / (phmcWidth + phmcSpacing))
  );
  const totalRows = Math.ceil(totalPHMCs / maxDevicesPerRow);

  const footerHeight = 10;
  const previousDevicesHeight = previousDevicesCount > 0 ? 300 : 0;

  const phmcStartY = previousDevicesHeight + 40;
  const availableHeight = groupHeight - phmcStartY - footerHeight;

  const phmcSectionHeight = Math.min(
    availableHeight * 0.4,
    totalRows * (phmcHeight + 30) + 40
  );

  const phmcVerticalSpacing =
    totalRows > 1
      ? Math.max(
        30,
        Math.min(
          50,
          (phmcSectionHeight - totalRows * phmcHeight) / (totalRows - 1)
        )
      )
      : 0;

  const row = Math.floor(phmcIndex / maxDevicesPerRow);
  const col = phmcIndex % maxDevicesPerRow;

  const totalDevicesInRow = Math.min(maxDevicesPerRow, totalPHMCs - row * maxDevicesPerRow);
  const rowWidth = totalDevicesInRow * phmcWidth + (totalDevicesInRow - 1) * phmcSpacing;
  const startX = sideMargin + (availableWidth - rowWidth) / 2;

  const deviceX = startX + col * (phmcWidth + phmcSpacing);
  const deviceY = phmcStartY + 20 + row * (phmcHeight + phmcVerticalSpacing);

  const maxX = groupWidth - phmcWidth - sideMargin;
  const maxY = groupHeight - phmcHeight - footerHeight;
  const finalX = Math.min(deviceX, maxX);
  const finalY = Math.min(deviceY, maxY);

  const phmcNodeData: NodeData = {
    label: device.device_name,
    type: "bidirectional",
    direction: "bidirectional",
    unit: "W",
    isActive: device.device_status === "active",
    pumpStatus: device.last_record?.pumpstatus || "0",
    voltageR: Number(device.last_record?.voltage_r) || 0,
    voltageY: Number(device.last_record?.voltage_y) || 0,
    voltageB: Number(device.last_record?.voltage_b) || 0,
    currentR: Number(device.last_record?.Current_r) || 0,
    currentY: Number(device.last_record?.Current_y) || 0,
    currentB: Number(device.last_record?.Current_b) || 0,
    current: Number(device.last_record?.Current_r) || 0,
    frequency: Number(device.last_record?.Frequency) || 0,
  };

  return {
    id: deviceId,
    data: phmcNodeData,
    position: { x: finalX, y: finalY },
    parentId: groupId,
    sourcePosition: "right",
    targetPosition: "left",
    type: "phmc",
    width: phmcWidth,
    height: phmcHeight,
  };
};

const createARGNode = (
  device: DeviceResult,
  deviceId: string,
  groupId: string,
  groupWidth: number,
  groupHeight: number,
  argIndex: number,
  totalARGs: number,
  previousDevicesCount: number
): DiagramNode => {
  const argWidth = 120;
  const argHeight = 80;
  const sideMargin = 10;
  const argSpacing = 10;

  const availableWidth = groupWidth - 2 * sideMargin;
  const maxDevicesPerRow = Math.max(
    1,
    Math.floor(availableWidth / (argWidth + argSpacing))
  );
  const totalRows = Math.ceil(totalARGs / maxDevicesPerRow);

  const footerHeight = 10;
  const previousDevicesHeight = previousDevicesCount > 0 ? 400 : 0;

  const argStartY = previousDevicesHeight + 40;
  const availableHeight = groupHeight - argStartY - footerHeight;

  const argSectionHeight = Math.min(
    availableHeight * 0.4,
    totalRows * (argHeight + 30) + 40
  );

  const argVerticalSpacing =
    totalRows > 1
      ? Math.max(
        30,
        Math.min(
          50,
          (argSectionHeight - totalRows * argHeight) / (totalRows - 1)
        )
      )
      : 0;

  const row = Math.floor(argIndex / maxDevicesPerRow);
  const col = argIndex % maxDevicesPerRow;

  const totalDevicesInRow = Math.min(maxDevicesPerRow, totalARGs - row * maxDevicesPerRow);
  const rowWidth = totalDevicesInRow * argWidth + (totalDevicesInRow - 1) * argSpacing;
  const startX = sideMargin + (availableWidth - rowWidth) / 2;

  const deviceX = startX + col * (argWidth + argSpacing);
  const deviceY = argStartY + 20 + row * (argHeight + argVerticalSpacing);

  const maxX = groupWidth - argWidth - sideMargin;
  const maxY = groupHeight - argHeight - footerHeight;
  const finalX = Math.min(deviceX, maxX);
  const finalY = Math.min(deviceY, maxY);

  const argNodeData: NodeData = {
    label: device.device_name,
    type: "bidirectional",
    direction: "bidirectional",
    unit: "mm",
    isActive: device.device_status === "active",
    maxMm: Number(device.last_record?.max_mm) || 0,
    minMm: Number(device.last_record?.min_mm) || 0,
    lastMm: Number(device.last_record?.last_mm) || 0,
    firstMm: Number(device.last_record?.first_mm) || 0,
  };

  return {
    id: deviceId,
    data: argNodeData,
    position: { x: finalX, y: finalY },
    parentId: groupId,
    sourcePosition: "right",
    targetPosition: "left",
    type: "arg",
    width: argWidth,
    height: argHeight,
  };
};

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
    } else if (node.type === "brwhms") {
      const {
        flowRate: _flowRate,
        avg: _avg,
        max: _max,
        min: _min,
        isActive: _isActive,
        ...cleanData
      } = node.data;
      return {
        ...node,
        data: cleanData,
      };
    } else if (node.type === "phmc") {
      const {
        pumpStatus: _pumpStatus,
        voltageR: _voltageR,
        voltageY: _voltageY,
        voltageB: _voltageB,
        currentR: _currentR,
        currentY: _currentY,
        currentB: _currentB,
        current: _current,
        frequency: _frequency,
        isActive: _isActive,
        ...cleanData
      } = node.data;
      return {
        ...node,
        data: cleanData,
      };
    } else if (node.type === "arg") {
      const {
        maxMm: _maxMm,
        minMm: _minMm,
        lastMm: _lastMm,
        firstMm: _firstMm,
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
  const headerHeight = 50; // Department header height
  const footerHeight = 30; // Department footer height
  const sideMargin = 30; // Side margins
  const deviceSpacing = 20; // Spacing between devices
  const deviceWidth = 140; // Average device width
  const deviceHeight = 90; // Average device height

  // Calculate width based on device count and available space
  const maxDevicesPerRow = Math.max(1, Math.floor(600 / (deviceWidth + deviceSpacing)));
  const totalRows = Math.ceil(deviceCount / maxDevicesPerRow);

  // Calculate minimum width needed (starting from 650px minimum)
  const minWidth = Math.max(650, sideMargin * 2 + Math.min(deviceCount, maxDevicesPerRow) * (deviceWidth + deviceSpacing));

  // Calculate minimum height needed (starting from 550px minimum)
  const minHeight = Math.max(550, headerHeight + footerHeight + totalRows * deviceHeight + (totalRows - 1) * deviceSpacing + 30);

  return {
    width: Math.min(1200, minWidth), // Cap at 1200px for very large departments
    height: Math.min(1000, minHeight), // Cap at 1000px for very large departments
  };
};

const getDeviceFlowValue = (device: DeviceResult): number => {
  const { type, device_type, last_record } = device;

  if (type === "fm") {
    return Number(last_record?.max) || 0;
  }

  if (type === "brwhms") {
    return Number(last_record?.max) || 0;
  }

  if (type === "phmc" && device_type === "New phmc") {
    return Number(last_record?.flowrate) || 0;
  }

  return 0;
};

const shouldIncludeDevice = (device: DeviceResult): boolean => {
  const { type, device_type } = device;

  if (type === "fm") return true;

  if (type === "brwhms") return true;

  if (type === "phmc" && device_type === "New phmc") return true;

  return false;
};

export const calculateDepartmentFlowBalances = (
  devices: DeviceResult[]
): DepartmentCalculations[] => {
  const visibleDevices = devices.filter(device => device.visibility !== "hidden");

  const departmentGroups = visibleDevices.reduce((acc, device) => {
    const deptId = device.department_id;
    if (!acc[deptId]) {
      acc[deptId] = {
        department_id: deptId,
        department_name: device.department_name || `Department ${deptId}`,
        devices: [],
      };
    }
    acc[deptId].devices.push(device);
    return acc;
  }, {} as Record<number, DepartmentGroup>);

  return Object.values(departmentGroups).map((group) => {
    let totalIn = 0;
    let totalOut = 0;

    group.devices.forEach((device) => {
      if (!shouldIncludeDevice(device)) return;

      const flowValue = getDeviceFlowValue(device);
      const { department_connection } = device;

      if (department_connection === "in") {
        totalIn += flowValue;
      }

      if (department_connection === "out") {
        totalOut += flowValue;
      }

      if (department_connection === "both") {
        totalIn += flowValue;
        totalOut += flowValue;
      }
    });

    const totalBalance = totalOut - totalIn;

    return {
      department_id: group.department_id,
      department_name: group.department_name,
      totalIn,
      totalOut,
      totalBalance,
    };
  });
};

export const calculateDepartmentFlowBalance = (
  devices: DeviceResult[],
  departmentId: number
): DepartmentCalculations | null => {
  const visibleDevices = devices.filter(device => device.visibility !== "hidden");
  const departmentDevices = visibleDevices.filter(device => device.department_id === departmentId);

  if (departmentDevices.length === 0) return null;

  let totalIn = 0;
  let totalOut = 0;

  departmentDevices.forEach((device) => {
    if (!shouldIncludeDevice(device)) return;

    const flowValue = getDeviceFlowValue(device);
    const { department_connection } = device;

    if (department_connection === "in") {
      totalIn += flowValue;
    }

    if (department_connection === "out") {
      totalOut += flowValue;
    }

    if (department_connection === "both") {
      totalIn += flowValue;
      totalOut += flowValue;
    }
  });

  const totalBalance = totalOut - totalIn;

  return {
    department_id: departmentId,
    department_name: departmentDevices[0].department_name || `Department ${departmentId}`,
    totalIn,
    totalOut,
    totalBalance,
  };
};

export interface PlantCalculations {
  plant_id: number;
  plant_name: string;
  totalIn: number;
  totalOut: number;
  totalBalance: number;
  totalStock: number;
  totalCapacity: number;
}

export const calculatePlantFlowBalance = (
  devices: DeviceResult[],
  plantId: number
): PlantCalculations | null => {
  const visibleDevices = devices.filter(device => device.visibility !== "hidden");
  const plantDevices = visibleDevices.filter(device => device.plant_id === plantId);

  if (plantDevices.length === 0) return null;

  const relevantDevices = plantDevices.filter(shouldIncludeDevice);
  const tankDevices = plantDevices.filter(
    (device) => device.type === "tank" || device.device_family?.toLowerCase().includes("tank")
  );

  let totalIn = 0;
  let totalOut = 0;
  let totalStock = 0;
  let totalCapacity = 0;

  relevantDevices.forEach((device) => {
    const flowValue = getDeviceFlowValue(device);
    const { plant_connection } = device;

    if (plant_connection === "in") {
      totalIn += flowValue;
    }

    if (plant_connection === "out") {
      totalOut += flowValue;
    }

    if (plant_connection === "both") {
      totalIn += flowValue;
      totalOut += flowValue;
    }
  });

  tankDevices.forEach((device) => {
    const currentLevel = Number(device.last_record?.last_level) || 0;
    const capacity = Number(device.params?.storageCapacity) || 0;

    totalStock += currentLevel;
    totalCapacity += capacity;
  });

  const totalBalance = totalOut - totalIn;

  return {
    plant_id: plantId,
    plant_name: plantDevices[0].plant_name || `Plant ${plantId}`,
    totalIn,
    totalOut,
    totalBalance,
    totalStock,
    totalCapacity,
  };
};