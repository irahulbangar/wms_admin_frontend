import { Edit, FileText, Trash2 } from "lucide-react";
import type { DeviceResult } from "../../../../../model/devices.interface";
import type { DeviceFamilyResult } from "../../../../../model/device-family.interface";
import { fromatDateWithTime } from "../../../../utils/utils";

interface DeviceTableProps {
  devices: DeviceResult[];
  organizations: Array<{ organization_id: number; organization_name: string }>;
  plants: Array<{ plant_id: number; plant_name: string }>;
  departments: Array<{ department_id: number; department_name: string }>;
  deviceFamily: DeviceFamilyResult[];
  onEdit: (
    deviceId: number,
    plantId: number,
    departmentId: number,
    systemId: number,
    organizationId?: number
  ) => void;
  onReport: (
    deviceId: number,
    plantId: number,
    deviceFamilyType: string
  ) => void;
  onDelete: (deviceId: number) => void;
  canDelete: boolean;
}

const deviceStatus = (status: string) => {
  if (status === "active" || status === "Active") {
    return "bg-green-100 text-status-success";
  } else if (status === "inactive" || status === "Inactive") {
    return "bg-red-100 text-status-danger";
  } else {
    return "bg-blue-100 text-status-info";
  }
};

const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  organizations,
  plants,
  departments,
  deviceFamily,
  onEdit,
  onReport,
  onDelete,
  canDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base text-left rtl:text-right text-text-primary min-w-[1200px]">
        <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
          <tr>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Sr No
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Device Name
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Organization Name
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Plant Name
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Department Name
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Device Family
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Device Type
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Device Status
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              HWID Number
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Created At
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Updated At
            </th>
            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device, index) => (
            <tr
              onDoubleClick={() =>
                onEdit(
                  device.device_id,
                  device.plant_id,
                  device.department_id,
                  device.system_id || 0,
                  device.organization_id
                )
              }
              key={device.device_id}
              className="border-b border-border-primary bg-primary hover:bg-primary/50"
            >
              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                {index + 1}
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                {device.device_name}
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                {
                  organizations.find(
                    (org) =>
                      org.organization_id.toString() ===
                      device.organization_id?.toString()
                  )?.organization_name
                }
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                {
                  plants.find(
                    (plant) =>
                      plant.plant_id.toString() === device.plant_id?.toString()
                  )?.plant_name
                }
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                {
                  departments.find(
                    (department) =>
                      department.department_id.toString() ===
                      device.department_id?.toString()
                  )?.department_name
                }
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize truncate">
                {
                  deviceFamily.find(
                    (df) => df.device_family_id === device.device_family_id
                  )?.name
                }
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap uppercase">
                {device.device_type}
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                <span
                  className={`px-2 py-1 rounded-full text-sm font-normal capitalize ${deviceStatus(
                    device.device_status
                  )}`}
                >
                  {device.device_status}
                </span>
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                {device.hwid || "N/A"}
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                {fromatDateWithTime(device.created_at)}
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                {fromatDateWithTime(device.updated_at)}
              </td>
              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                <div className="flex items-center justify-center gap-2">
                  <span title="Edit" aria-label="Edit device">
                    <Edit
                      onClick={() =>
                        onEdit(
                          device.device_id,
                          device.plant_id,
                          device.department_id,
                          device.system_id || 0,
                          device.organization_id
                        )
                      }
                      className="w-5 h-5 text-status-info cursor-pointer"
                    />
                  </span>

                  <span title="Report" aria-label="Report device">
                    <FileText
                      onClick={() =>
                        onReport(
                          device.device_id,
                          device.plant_id,
                          device.device_family_type
                        )
                      }
                      className="w-5 h-5 text-text-secondary cursor-pointer"
                    />
                  </span>

                  {canDelete && (
                    <span title="Delete device" aria-label="Delete device">
                      <Trash2
                        onClick={() => onDelete(device.device_id)}
                        className="w-5 h-5 text-status-danger cursor-pointer"
                      />
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceTable;
