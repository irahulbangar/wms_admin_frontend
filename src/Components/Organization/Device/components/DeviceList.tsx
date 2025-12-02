import { Monitor } from "lucide-react";
import type { DeviceResult } from "../../../../../model/devices.interface";
import type { DeviceFamilyResult } from "../../../../../model/device-family.interface";
import NoDataFound from "../../../NoDataFound";
import SystemGroupHeader from "./SystemGroupHeader";
import DeviceTable from "./DeviceTable";

interface DeviceListProps {
  groupedDevices: { [key: string]: DeviceResult[] };
  systems: Array<{ system_id: number; system_name: string }>;
  organizations: Array<{ organization_id: number; organization_name: string }>;
  plants: Array<{ plant_id: number; plant_name: string }>;
  departments: Array<{ department_id: number; department_name: string }>;
  deviceFamily: DeviceFamilyResult[];
  collapsedSystems: Set<string>;
  searchTerm: string;
  selectedOrganization: string;
  onToggleSystem: (systemId: string) => void;
  onEdit: (
    deviceId: number,
    plantId: number,
    departmentId: number,
    systemId: number,
    organizationId?: number
  ) => void;
  onDelete: (deviceId: number) => void;
  onAddDevice: () => void;
  onClearSearch: () => void;
  canDelete: boolean;
  onReport: (deviceId: number, plantId: number) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({
  groupedDevices,
  systems,
  organizations,
  plants,
  departments,
  deviceFamily,
  collapsedSystems,
  searchTerm,
  selectedOrganization,
  onToggleSystem,
  onEdit,
  onDelete,
  onAddDevice,
  onClearSearch,
  canDelete,
  onReport,
}) => {
  if (Object.keys(groupedDevices).length === 0) {
    return (
      <div className="text-text-primary text-center font-roboto text-sm w-full h-full">
        <NoDataFound
          icon={<Monitor className="w-16 h-16 text-text-muted mx-auto mb-4" />}
          title={
            searchTerm || selectedOrganization !== "all"
              ? "No devices match your search/filter"
              : selectedOrganization === "all"
              ? "No devices found"
              : `No devices found for ${
                  organizations.find(
                    (org) =>
                      org.organization_id.toString() === selectedOrganization
                  )?.organization_name || `Organization ${selectedOrganization}`
                }`
          }
          description={
            searchTerm || selectedOrganization !== "all"
              ? "Try adjusting your search terms or filter criteria"
              : selectedOrganization === "all"
              ? "Add your first device to get started"
              : `Add your first plant for ${
                  organizations.find(
                    (org) =>
                      org.organization_id.toString() === selectedOrganization
                  )?.organization_name || `Organization ${selectedOrganization}`
                } to get started`
          }
          buttonText={
            searchTerm || selectedOrganization !== "all"
              ? "Clear Search"
              : "Add Device"
          }
          buttonOnClick={() => {
            if (searchTerm || selectedOrganization !== "all") {
              onClearSearch();
            } else {
              onAddDevice();
            }
          }}
        />
      </div>
    );
  }

  return (
    <>
      {Object.entries(groupedDevices).map(([systemId, systemDevices]) => {
        const system = systems.find((s) => s.system_id.toString() === systemId);
        const systemName =
          system?.system_name?.trim() ||
          system?.system_name ||
          `${systemId === "0" ? "Extra System" : `System ${systemId}`}`;

        return (
          <div key={systemId} className="mb-0">
            <SystemGroupHeader
              systemId={systemId}
              systemName={systemName}
              devices={systemDevices}
              isCollapsed={collapsedSystems.has(systemId)}
              onToggle={() => onToggleSystem(systemId)}
            />

            {!collapsedSystems.has(systemId) && (
              <DeviceTable
                devices={systemDevices}
                organizations={organizations}
                plants={plants}
                departments={departments}
                deviceFamily={deviceFamily}
                onEdit={onEdit}
                onDelete={onDelete}
                canDelete={canDelete}
                onReport={onReport}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default DeviceList;
