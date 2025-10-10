import { useState, useCallback, useMemo } from 'react';
import type { DeviceResult } from '../../../../model/devices.interface';
import { 
  calculatePlantFlowBalance,
  calculateDepartmentFlowBalance,
  calculateSystemFlowBalance
} from '../utils/diagramCalculations';

interface SelectedGroup {
  id: string;
  name: string;
  type: 'plant' | 'department' | 'system';
}

export const useRightSidebar = (
  deviceData: DeviceResult[]
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null);

  const calculations = useMemo(() => {
    if (!selectedGroup || !deviceData.length) return null;

    const groupId = selectedGroup.id;
    
    switch (selectedGroup.type) {
      case 'plant': {
        const plantName = groupId.replace('plant-', '');
        const plantDevice = deviceData.find(device => 
          device.plant_name === plantName || 
          device.in_plant_name === plantName || 
          device.out_plant_name === plantName
        );
        const plantId = plantDevice?.plant_id || plantDevice?.in_plant_id || plantDevice?.out_plant_id;
        if (!plantId) return null;
        return calculatePlantFlowBalance(deviceData, plantId);
      }
      
      case 'department': {
        const departmentId = parseInt(groupId.replace('dept-', ''));
        return calculateDepartmentFlowBalance(deviceData, departmentId);
      }
      
      case 'system': {
        const systemId = parseInt(groupId.replace('system-', ''));
        return calculateSystemFlowBalance(deviceData, systemId);
      }
      
      default:
        return null;
    }
  }, [selectedGroup, deviceData]);

  const openSidebar = useCallback((groupId: string, groupName: string, groupType: 'plant' | 'department' | 'system') => {
    setSelectedGroup({
      id: groupId,
      name: groupName,
      type: groupType
    });
    setIsOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    setSelectedGroup(null);
  }, []);

  const handleGroupClick = useCallback((nodeId: string, nodeData: any) => {
    if (nodeData.type === 'plant') {
      openSidebar(nodeId, nodeData.label, 'plant');
    } else if (nodeData.type === 'department') {
      openSidebar(nodeId, nodeData.label, 'department');
    } else if (nodeData.type === 'system') {
      openSidebar(nodeId, nodeData.label, 'system');
    }
  }, [openSidebar]);

  return {
    isOpen,
    selectedGroup,
    calculations,
    deviceData,
    openSidebar,
    closeSidebar,
    handleGroupClick
  };
};
