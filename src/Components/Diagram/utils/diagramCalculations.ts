import type { DeviceResult } from "../../../../model/devices.interface";
import type { NodeData } from "../../../../model/single-plant.interface";

export interface ReportTypeCalculations {
  reportType: string;
  totalIn: number;
  totalOut: number;
  totalBalance: number;
}

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
  systems: Record<string, SystemGroup>;
}

export interface SystemGroup {
  system_id: number;
  system_name: string;
  devices: DeviceResult[];
}

export interface DepartmentCalculations {
  department_id: number;
  department_name: string;
  totalIn: number;
  totalOut: number;
  totalBalance: number;
  totalStock: number;
  totalCapacity: number;
  reportTypeCalculations: ReportTypeCalculations[];
}

export const convertDevicesToDiagram = (
  devices: DeviceResult[],
  plantData?: { plant_name: string; plant_id: number }
): { nodes: DiagramNode[]; edges: DiagramEdge[] } => {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  const visibleDevices = devices.filter(device => device.visibility !== "hidden");

  const plantGroups = visibleDevices.reduce((acc, device) => {
    const plantId = device.plant_id?.toString() || "unknown";
    if (!acc[plantId]) {
      acc[plantId] = {
        plant_id: device.plant_id,
        plant_name: plantData?.plant_name || `Plant ${device.plant_id}`,
        departments: {},
      };
    }

    const deptId = device.department_id?.toString() || "unknown";
    if (!acc[plantId].departments[deptId]) {
      acc[plantId].departments[deptId] = {
        department_id: device.department_id,
        department_name: device.department_name || `Department ${device.department_id}`,
        systems: {},
      };
    }

    const systemId = device.system_id?.toString() || "unknown";
    if (!acc[plantId].departments[deptId].systems[systemId]) {
      acc[plantId].departments[deptId].systems[systemId] = {
        system_id: device.system_id,
        system_name: device.system_name || `System ${device.system_id}`,
        devices: [],
      };
    }
    acc[plantId].departments[deptId].systems[systemId].devices.push(device);
    return acc;
  }, {} as Record<string, { plant_id: number; plant_name: string; departments: Record<string, DepartmentGroup> }>);

  Object.values(plantGroups).forEach((plant, plantIndex) => {
    const plantId = `plant-${plant.plant_name}`;

    const departmentCount = Object.values(plant.departments).length;

    const departmentSpacing = 40;
    const plantPadding = 70;
    const minDepartmentWidth = 1400;
    const minDepartmentHeight = 1000;

    const departmentRequirements = Object.values(plant.departments).map((department) => {
      const totalSystemsInDept = Object.values(department.systems).length;
      
      const systemSpacing = 30;
      const systemPadding = 40;
      const systemWidth = 1200;
      const systemHeight = 800;
      const systemHeaderHeight = 20;
      const systemFooterHeight = 40;
      
      if (totalSystemsInDept === 0) {
        return {
          width: minDepartmentWidth,
          height: minDepartmentHeight,
          systemCount: totalSystemsInDept,
          systemsPerRow: 0,
          totalSystemRows: 0
        };
      } else if (totalSystemsInDept === 1) {
        return {
          width: Math.max(minDepartmentWidth, 2 * systemPadding),
          height: Math.max(minDepartmentHeight, systemHeaderHeight + systemFooterHeight + systemHeight),
          systemCount: totalSystemsInDept,
          systemsPerRow: 1,
          totalSystemRows: 1
        };
      } else {
        const systemsPerRowWithMinWidth = Math.max(1, Math.floor((minDepartmentWidth - 2 * systemPadding) / (systemWidth + systemSpacing)));
        
        if (totalSystemsInDept <= systemsPerRowWithMinWidth) {
          const systemsPerRow = totalSystemsInDept;
          const totalSystemRows = 1;
          const requiredWidth = Math.max(minDepartmentWidth, 2 * systemPadding + systemsPerRow * systemWidth + (systemsPerRow - 1) * systemSpacing);
          const requiredHeight = Math.max(minDepartmentHeight, systemHeaderHeight + systemFooterHeight + systemHeight);
          
          return {
            width: requiredWidth,
            height: requiredHeight,
            systemCount: totalSystemsInDept,
            systemsPerRow,
            totalSystemRows
          };
        } else {
          const systemsPerRow = systemsPerRowWithMinWidth;
          const totalSystemRows = Math.ceil(totalSystemsInDept / systemsPerRow);
          
          const requiredWidth = Math.max(minDepartmentWidth, 2 * systemPadding + systemsPerRow * systemWidth + (systemsPerRow - 1) * systemSpacing);
          
          const requiredHeight = Math.max(minDepartmentHeight, systemHeaderHeight + systemFooterHeight + totalSystemRows * systemHeight + (totalSystemRows - 1) * systemSpacing);
          
          return {
            width: requiredWidth,
            height: requiredHeight,
            systemCount: totalSystemsInDept,
            systemsPerRow,
            totalSystemRows
          };
        }
      }
    });

    const totalDeptWidth = departmentRequirements.reduce((sum, dept) => sum + dept.width, 0) + (departmentCount - 1) * departmentSpacing;
    const maxDeptHeight = Math.max(...departmentRequirements.map(d => d.height));
    
    const sourceSinkPadding = 400;
    
    const requiredPlantWidth = plantPadding * 2 + totalDeptWidth + sourceSinkPadding;
    const requiredPlantHeight = plantPadding * 2 + 80 + maxDeptHeight;

    const plantWidth = Math.max(2000, requiredPlantWidth);
    const plantHeight = Math.max(1200, requiredPlantHeight);
    
    const plantSpacing = 100;
    const totalDiagramWidth = Object.values(plantGroups).length * (plantWidth + plantSpacing) - plantSpacing;
    const centerOffset = Math.max(0, (totalDiagramWidth - plantWidth) / 2);
    const plantX = plantIndex * (plantWidth + plantSpacing) - centerOffset;
    const plantY = 50;

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

    const sourceNodeId = `source-${plant.plant_id}`;
    const sourceX = plantX - 200;
    const sourceY = plantY + plantHeight / 2 - 40;
    
    nodes.push({
      id: sourceNodeId,
      data: {
        type: "source",
        label: `${plant.plant_name} Source`,
        flowRate: 0,
        totalizerReading: 0,
        unit: "Ltr",
        isActive: true,
      },
      position: { x: sourceX, y: sourceY },
      type: "source",
      draggable: true,
      selectable: true,
      deletable: false,
    });

    const sinkNodeId = `sink-${plant.plant_id}`;
    const sinkX = plantX + plantWidth + 50;
    const sinkY = plantY + plantHeight / 2 - 40;
    
    nodes.push({
      id: sinkNodeId,
      data: {
        type: "sink",
        label: `${plant.plant_name} Sink`,
        flowRate: 0,
        totalizerReading: 0,
        unit: "Ltr",
        isActive: true,
      },
      position: { x: sinkX, y: sinkY },
      type: "sink",
      draggable: true,
      selectable: true,
      deletable: false,
    });

    let cumulativeX = plantX + plantPadding + 200;
    
    Object.values(plant.departments).forEach((department, deptIndex) => {
      const deptId = `dept-${department.department_id}`;

      const deptRequirement = departmentRequirements[deptIndex];
      const deptWidth = deptRequirement.width;
      const deptHeight = deptRequirement.height;

      const deptX = cumulativeX;
      const deptY = plantY + 80;
      
      const maxDeptX = plantX + plantWidth - deptWidth - plantPadding;
      const maxDeptY = plantY + plantHeight - deptHeight - plantPadding;
      const finalDeptX = Math.min(deptX, maxDeptX);
      const finalDeptY = Math.min(deptY, maxDeptY);
      
      cumulativeX = finalDeptX + deptWidth + departmentSpacing;

      nodes.push({
        id: deptId,
        data: {
          label: department.department_name,
          type: "department",
          unit: "Ltr",
        },
        position: { x: finalDeptX, y: finalDeptY },
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

      const systemSpacing = 30;
      const systemPadding = 40;
      const systemHeaderHeight = 20;
      const systemFooterHeight = 40;
      
      const systemWidth = 1200;
      const systemHeight = 800;
      
      
      Object.values(department.systems).forEach((system, systemIndex) => {
        const systemId = `system-${system.system_id}`;
        
        const deptRequirement = departmentRequirements[deptIndex];
        const systemsPerRow = deptRequirement.systemsPerRow;
        const systemCol = systemIndex % systemsPerRow;
        const systemRow = Math.floor(systemIndex / systemsPerRow);
        
        const totalSystemsInDept = Object.values(department.systems).length;
        const systemsInCurrentRow = Math.min(systemsPerRow, totalSystemsInDept - systemRow * systemsPerRow);
        const rowWidth = systemsInCurrentRow * systemWidth + (systemsInCurrentRow - 1) * systemSpacing;
        const rowStartX = finalDeptX + systemPadding + (deptWidth - 2 * systemPadding - rowWidth) / 2;
        
        const systemX = rowStartX + systemCol * (systemWidth + systemSpacing);
        const systemY = finalDeptY + systemHeaderHeight + systemRow * (systemHeight + systemSpacing);
        
        const maxSystemX = finalDeptX + deptWidth - systemWidth - systemPadding;
        const maxSystemY = finalDeptY + deptHeight - systemHeight - systemFooterHeight;
        const finalSystemX = Math.min(systemX, maxSystemX);
        const finalSystemY = Math.min(systemY, maxSystemY);

        nodes.push({
          id: systemId,
          data: {
            label: system.system_name,
            type: "system",
            unit: "Ltr",
          },
          position: { x: finalSystemX, y: finalSystemY },
          parentId: deptId,
          style: {
            width: systemWidth,
            height: systemHeight,
            borderRadius: 8,
            border: "2px solid #10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            zIndex: 3,
            pointerEvents: "auto",
          },
          type: "group",
          width: systemWidth,
          height: systemHeight,
          draggable: true,
          selectable: true,
          deletable: false,
          dragHandle: ".group-drag-handle",
        });

        system.devices.sort((a: DeviceResult, b: DeviceResult) => {
          const aIsTank = a.device_family_type === "tank" || a.device_family?.toLowerCase().includes("tank");
          const bIsTank = b.device_family_type === "tank" || b.device_family?.toLowerCase().includes("tank");
          if (aIsTank && !bIsTank) return -1;
          if (!aIsTank && bIsTank) return 1;
          return a.device_id - b.device_id;
        });
    
        const tanks = system.devices.filter(
          (device: DeviceResult) =>
            device.device_family_type === "tank" ||
            device.device_family?.toLowerCase().includes("tank")
        );

        tanks.forEach((device: DeviceResult, tankIndex: number) => {
          const deviceId = `${systemId}-tank${tankIndex + 1}`;
          const tankNode = createTankNode(
            device,
            deviceId,
            systemId,
            systemWidth,
            systemHeight,
            tankIndex,
            tanks.length
          );
          nodes.push(tankNode);
        });

        const fms = system.devices.filter(
          (device: DeviceResult) =>
            device.device_family_type === "fm" ||
            device.device_family?.toLowerCase().includes("flow")
        );

        fms.forEach((device: DeviceResult, fmIndex: number) => {
          const deviceId = `${systemId}-fm${fmIndex + 1}`;
          const fmNode = createFMNode(
            device,
            deviceId,
            systemId,
            systemWidth,
            systemHeight,
            fmIndex,
            fms.length,
            tanks.length
          );
          nodes.push(fmNode);
        });

        const brwhms = system.devices.filter(
          (device: DeviceResult) =>
            device.device_family_type === "brwhms" ||
            device.device_family?.toLowerCase().includes("brwhms")
        );

        brwhms.forEach((device: DeviceResult, brwhmsIndex: number) => {
          const deviceId = `${systemId}-brwhms${brwhmsIndex + 1}`;
          const brwhmsNode = createBRWHMSNode(
            device,
            deviceId,
            systemId,
            systemWidth,
            systemHeight,
            brwhmsIndex,
            brwhms.length,
            tanks.length + fms.length
          );
          nodes.push(brwhmsNode);
        });

        const phmcs = system.devices.filter(
          (device: DeviceResult) =>
            device.device_family_type === "phmc" ||
            device.device_family?.toLowerCase().includes("phmc")
        );

        phmcs.forEach((device: DeviceResult, phmcIndex: number) => {
          const deviceId = `${systemId}-phmc${phmcIndex + 1}`;
          const phmcNode = createPHMCNode(
            device,
            deviceId,
            systemId,
            systemWidth,
            systemHeight,
            phmcIndex,
            phmcs.length,
            tanks.length + fms.length + brwhms.length
          );
          nodes.push(phmcNode);
        });

        const args = system.devices.filter(
          (device: DeviceResult) =>
            device.device_family_type === "arg" ||
            device.device_family?.toLowerCase().includes("arg")
        );

        args.forEach((device: DeviceResult, argIndex: number) => {
          const deviceId = `${systemId}-arg${argIndex + 1}`;
          const argNode = createARGNode(
            device,
            deviceId,
            systemId,
            systemWidth,
            systemHeight,
            argIndex,
            args.length,
            tanks.length + fms.length + brwhms.length + phmcs.length
          );
          nodes.push(argNode);
        });
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
  const tankWidth = 50;
  const tankHeight = 20;
  const tankSpacing = 20;
  const sideMargin = 50;

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
  const headerHeight = 10;
  const footerHeight = 10;
  const availableHeight = groupHeight - headerHeight - footerHeight;

  const tankSectionHeight = Math.min(
    availableHeight * 0.6,
    totalRows * (tankHeight + 30) + 30
  );
  const tankStartY = headerHeight + 30;

  if (totalRows === 1) {
    deviceY = tankStartY + (tankSectionHeight - tankHeight) / 2;
  } else {
    const rowSpacing = Math.max(
      50,
      Math.min(
        80,
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
    // departmentConnection: device?.department_connection,
    // plantConnection: device?.plant_connection,
    // organizationConnection: device?.organization_connection,
    // departmentName: device?.department_name,
    // systemName: device?.system_name,
    // systemConnection: device?.system_connection,
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
  const fmWidth = 20;
  const fmHeight = 100;
  const sideMargin = 50;
  const fmSpacing = 30;

  const availableWidth = groupWidth - 2 * sideMargin;
  const maxTanksPerRow = Math.max();
  const totalTankRows = Math.ceil(totalTanks / maxTanksPerRow);

  const headerHeight = 10;
  const footerHeight = 40;
  const tankAreaHeight =
    totalTanks > 0
      ? headerHeight +
      30 +
      totalTankRows * 120 +
      Math.max(0, totalTankRows - 1) * 50 +
      100
      : headerHeight + 30;

  const maxFMsPerRow = Math.max(
    1,
    Math.floor(availableWidth / (fmWidth + fmSpacing))
  );
  const totalFMRows = Math.ceil(totalFMs / maxFMsPerRow);

  const fmStartY = tankAreaHeight + 80;
  const availableHeight = groupHeight - fmStartY - footerHeight;

  const fmSectionHeight = Math.min(
    availableHeight * 0.5,
    totalFMRows * (fmHeight + 50) + 80
  );

  const fmVerticalSpacing =
    totalFMRows > 1
      ? Math.max(
        50,
        Math.min(
          80,
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
  const deviceY = fmStartY + 40 + row * (fmHeight + fmVerticalSpacing);

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
    // departmentConnection: device?.department_connection,
    // plantConnection: device?.plant_connection,
    // organizationConnection: device?.organization_connection,
    // departmentName: device?.department_name,
    // systemName: device?.system_name,
    // systemConnection: device?.system_connection,
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
  const brwhmsWidth = 10;
  const brwhmsHeight = 100;
  const sideMargin = 50;
  const brwhmsSpacing = 30;

  const availableWidth = groupWidth - 2 * sideMargin;
  const maxDevicesPerRow = Math.max(
    1,
    Math.floor(availableWidth / (brwhmsWidth + brwhmsSpacing))
  );
  const totalRows = Math.ceil(totalBRWHMS / maxDevicesPerRow);

  const footerHeight = 10;
  const previousDevicesHeight = previousDevicesCount > 0 ? 300 : 0;

  const brwhmsStartY = previousDevicesHeight + 50;
  const availableHeight = groupHeight - brwhmsStartY - footerHeight;

  const brwhmsSectionHeight = Math.min(
    availableHeight * 0.5,
    totalRows * (brwhmsHeight + 50) + 80
  );

  const brwhmsVerticalSpacing =
    totalRows > 1
      ? Math.max(
        50,
        Math.min(
          80,
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
  const deviceY = brwhmsStartY + 40 + row * (brwhmsHeight + brwhmsVerticalSpacing);

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
    // departmentConnection: device?.department_connection,
    // plantConnection: device?.plant_connection,
    // organizationConnection: device?.organization_connection,
    // departmentName: device?.department_name,
    // systemName: device?.system_name,
    // systemConnection: device?.system_connection,
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
  const phmcWidth = 50;
  const phmcHeight = 100;
  const sideMargin = 50;
  const phmcSpacing = 30;

  const availableWidth = groupWidth - 2 * sideMargin;
  const maxDevicesPerRow = Math.max(
    1,
    Math.floor(availableWidth / (phmcWidth + phmcSpacing))
  );
  const totalRows = Math.ceil(totalPHMCs / maxDevicesPerRow);

  const footerHeight = 40;
  const previousDevicesHeight = previousDevicesCount > 0 ? 400 : 0;

  const phmcStartY = previousDevicesHeight + 80;
  const availableHeight = groupHeight - phmcStartY - footerHeight;

  const phmcSectionHeight = Math.min(
    availableHeight * 0.6,
    totalRows * (phmcHeight + 50) + 80
  );

  const phmcVerticalSpacing =
    totalRows > 1
      ? Math.max(
        50,
        Math.min(
          80,
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
    // departmentConnection: device?.department_connection,
    // plantConnection: device?.plant_connection,
    // organizationConnection: device?.organization_connection,
    // departmentName: device?.department_name,
    // systemName: device?.system_name,
    // systemConnection: device?.system_connection,
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
  const argWidth = 160;
  const argHeight = 100;
  const sideMargin = 30;
  const argSpacing = 20;

  const availableWidth = groupWidth - 2 * sideMargin;
  const maxDevicesPerRow = Math.max(
    1,
    Math.floor(availableWidth / (argWidth + argSpacing))
  );
  const totalRows = Math.ceil(totalARGs / maxDevicesPerRow);

  const footerHeight = 20;
  const previousDevicesHeight = previousDevicesCount > 0 ? 500 : 0;

  const argStartY = previousDevicesHeight + 60;
  const availableHeight = groupHeight - argStartY - footerHeight;

  const argSectionHeight = Math.min(
    availableHeight * 0.6,
    totalRows * (argHeight + 40) + 60
  );

  const argVerticalSpacing =
    totalRows > 1
      ? Math.max(
        40,
        Math.min(
          70,
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
  const deviceY = argStartY + 30 + row * (argHeight + argVerticalSpacing);

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
      if (node.data.type === "department") {
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
      return {
        ...node,
        draggable: true,
        selectable: true,
        deletable: false,
        dragHandle: ".group-drag-handle",
      };
    }
    return node;
  });
};


const getDeviceFlowValue = (device: DeviceResult): number => {
  const { device_family_type, device_type, last_record } = device;

  if (device_family_type === "fm") {
    return Number(last_record?.max) || 0;
  }

  if (device_family_type === "brwhms") {
    return Number(last_record?.max) || 0;
  }

  if (device_family_type === "phmc" && device_type === "New phmc") {
    return Number(last_record?.flowrate) || 0;
  }

  return 0;
};

const shouldIncludeDevice = (device: DeviceResult): boolean => {
  const { device_family_type, device_type } = device;

  if (device_family_type === "fm") return true;

  if (device_family_type === "brwhms") return true;

  if (device_family_type === "phmc" && device_type === "New phmc") return true;

  return false;
};

const calculateReportTypeWiseFlow = (
  devices: DeviceResult[],
  groupId: number,
  groupType: 'plant' | 'department' | 'system'
): ReportTypeCalculations[] => {
  const reportTypeMap = new Map<string, { totalIn: number; totalOut: number }>();

  devices.forEach((device) => {
    if (!shouldIncludeDevice(device)) return;

    const flowValue = getDeviceFlowValue(device);
    const reportType = device.report_type_name || 'Unknown';

    if (!reportTypeMap.has(reportType)) {
      reportTypeMap.set(reportType, { totalIn: 0, totalOut: 0 });
    }

    const reportTypeData = reportTypeMap.get(reportType)!;

    if (groupType === 'plant' && device.in_plant_id === groupId) {
      reportTypeData.totalIn += flowValue;
    } else if (groupType === 'department' && device.in_department_id === groupId) {
      reportTypeData.totalIn += flowValue;
    } else if (groupType === 'system' && device.in_system_id === groupId) {
      reportTypeData.totalIn += flowValue;
    }

    if (groupType === 'plant' && device.out_plant_id === groupId) {
      reportTypeData.totalOut += flowValue;
    } else if (groupType === 'department' && device.out_department_id === groupId) {
      reportTypeData.totalOut += flowValue;
    } else if (groupType === 'system' && device.out_system_id === groupId) {
      reportTypeData.totalOut += flowValue;
    }
  });

  return Array.from(reportTypeMap.entries()).map(([reportType, data]) => ({
    reportType,
    totalIn: data.totalIn,
    totalOut: data.totalOut,
    totalBalance: data.totalOut - data.totalIn,
  }));
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
        systems: {},
      };
    }

    const systemId = device.system_id?.toString() || "unknown";
    if (!acc[deptId].systems[systemId]) {
      acc[deptId].systems[systemId] = {
        system_id: device.system_id,
        system_name: device.system_name || `System ${device.system_id}`,
        devices: [],
      };
    }
    acc[deptId].systems[systemId].devices.push(device);
    return acc;
  }, {} as Record<number, DepartmentGroup>);

  return Object.values(departmentGroups).map((group) => {
    let totalIn = 0;
    let totalOut = 0;
    let totalStock = 0;
    let totalCapacity = 0;

    Object.values(group.systems).forEach((system) => {
      system.devices.forEach((device) => {
        if (!shouldIncludeDevice(device)) return;

        const flowValue = getDeviceFlowValue(device);
        const { in_department_id, out_department_id } = device;

        if (in_department_id === group.department_id) {
          totalIn += flowValue;
        }

        if (out_department_id === group.department_id) {
          totalOut += flowValue;
        }
      });

      const tankDevices = system.devices.filter(
        (device) => device.device_family_type === "tank" || device.device_family?.toLowerCase().includes("tank")
      );

      tankDevices.forEach((device) => {
        const currentLevel = Number(device.last_record?.last_level) || 0;
        const capacity = Number(device.params?.storageCapacity) || 0;

        totalStock += currentLevel;
        totalCapacity += capacity;
      });
    });

    const totalBalance = totalOut - totalIn;
    const reportTypeCalculations = calculateReportTypeWiseFlow(visibleDevices, group.department_id, 'department');

    return {
      department_id: group.department_id,
      department_name: group.department_name,
      totalIn,
      totalOut,
      totalBalance,
      totalStock,
      totalCapacity,
      reportTypeCalculations,
    };
  });
};

export const calculateDepartmentFlowBalance = (
  devices: DeviceResult[],
  departmentId: number
): DepartmentCalculations | null => {
  const visibleDevices = devices.filter(device => device.visibility !== "hidden");
  
  const departmentDevices = visibleDevices.filter(device => 
    device.department_id === departmentId || 
    device.in_department_id === departmentId || 
    device.out_department_id === departmentId
  );

  if (departmentDevices.length === 0) return null;

  const tankDevices = departmentDevices.filter(
    (device) => device.device_family_type === "tank" || device.device_family?.toLowerCase().includes("tank")
  );

  let totalIn = 0;
  let totalOut = 0;
  let totalStock = 0;
  let totalCapacity = 0;

  visibleDevices.forEach((device) => {
    if (!shouldIncludeDevice(device)) return;

    const flowValue = getDeviceFlowValue(device);
    const { in_department_id, out_department_id } = device;

    if (in_department_id === departmentId) {
      totalIn += flowValue;
    }

    if (out_department_id === departmentId) {
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
  const reportTypeCalculations = calculateReportTypeWiseFlow(visibleDevices, departmentId, 'department');

  return {
    department_id: departmentId,
    department_name: departmentDevices[0]?.in_department_name || departmentDevices[0]?.out_department_name || departmentDevices[0]?.department_name || `Department ${departmentId}`,
    totalIn,
    totalOut,
    totalBalance,
    totalStock,
    totalCapacity,
    reportTypeCalculations,
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
  reportTypeCalculations: ReportTypeCalculations[];
}

export const calculatePlantFlowBalance = (
  devices: DeviceResult[],
  plantId: number
): PlantCalculations | null => {
  const visibleDevices = devices.filter(device => device.visibility !== "hidden");
  
  const plantDevices = visibleDevices.filter(device => 
    device.plant_id === plantId || 
    device.in_plant_id === plantId || 
    device.out_plant_id === plantId
  );

  if (plantDevices.length === 0) return null;

  const tankDevices = plantDevices.filter(
    (device) => device.device_family_type === "tank" || device.device_family?.toLowerCase().includes("tank")
  );

  let totalIn = 0;
  let totalOut = 0;
  let totalStock = 0;
  let totalCapacity = 0;

  visibleDevices.forEach((device) => {
    if (!shouldIncludeDevice(device)) return;

    const flowValue = getDeviceFlowValue(device);
    const { in_plant_id, out_plant_id } = device;

    if (in_plant_id === plantId) {
      totalIn += flowValue;
    }

    if (out_plant_id === plantId) {
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
  const reportTypeCalculations = calculateReportTypeWiseFlow(visibleDevices, plantId, 'plant');

  return {
    plant_id: plantId,
    plant_name: plantDevices[0]?.in_plant_name || plantDevices[0]?.out_plant_name || plantDevices[0]?.plant_name || `Plant ${plantId}`,
    totalIn,
    totalOut,
    totalBalance,
    totalStock,
    totalCapacity,
    reportTypeCalculations,
  };
};

export interface SystemCalculations {
  system_id: number;
  system_name: string;
  totalIn: number;
  totalOut: number;
  totalBalance: number;
  totalStock: number;
  totalCapacity: number;
  reportTypeCalculations: ReportTypeCalculations[];
}

export const calculateSystemFlowBalance = (
  devices: DeviceResult[],
  systemId: number
): SystemCalculations | null => {
  const visibleDevices = devices.filter(device => device.visibility !== "hidden");
  
  const systemDevices = visibleDevices.filter(device => 
    device.system_id === systemId || 
    device.in_system_id === systemId || 
    device.out_system_id === systemId
  );

  if (systemDevices.length === 0) return null;

  const tankDevices = systemDevices.filter(
    (device) => device.device_family_type === "tank" || device.device_family?.toLowerCase().includes("tank")
  );

  let totalIn = 0;
  let totalOut = 0;
  let totalStock = 0;
  let totalCapacity = 0;

  visibleDevices.forEach((device) => {
    if (!shouldIncludeDevice(device)) return;

    const flowValue = getDeviceFlowValue(device);
    const { in_system_id, out_system_id } = device;

    if (in_system_id === systemId) {
      totalIn += flowValue;
    }

    if (out_system_id === systemId) {
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
  const reportTypeCalculations = calculateReportTypeWiseFlow(visibleDevices, systemId, 'system');

  return {
    system_id: systemId,
    system_name: systemDevices[0]?.in_system_name || systemDevices[0]?.out_system_name || systemDevices[0]?.system_name || `System ${systemId}`,
    totalIn,
    totalOut,
    totalBalance,
    totalStock,
    totalCapacity,
    reportTypeCalculations,
  };
};
