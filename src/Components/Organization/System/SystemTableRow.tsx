import { Edit, Eye, Trash2 } from "lucide-react";
import { formatDateForCSV } from "../../../utils/utils";
import type { SystemResult } from "../../../../model/system.interface";

interface SystemTableRowProps {
  system: SystemResult;
  index: number;
  currentPage: number;
  rowsPerPage: number;
  adminRole?: string;
  onViewDevices: (
    departmentId: number,
    organizationId: number,
    plantId: number,
    systemId: number
  ) => void;
  onEditSystem: (systemId: number, plantId: number) => void;
}

const SystemTableRow: React.FC<SystemTableRowProps> = ({
  system,
  index,
  currentPage,
  rowsPerPage,
  adminRole,
  onViewDevices,
  onEditSystem,
}) => {
  return (
    <tr
      onDoubleClick={() =>
        onViewDevices(
          system.department_id,
          system.organization_id,
          system.plant_id,
          system.system_id
        )
      }
      className="border-b border-border-primary bg-primary hover:bg-secondary cursor-pointer"
    >
      <td className="px-6 py-4 text-text-primary text-start font-roboto text-base whitespace-nowrap">
        {(currentPage - 1) * rowsPerPage + index + 1}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {system.system_name}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {system.organization_name}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {system.plant_name}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {system.department_name}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {formatDateForCSV(system.created_at)}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {formatDateForCSV(system.updated_at)}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap sticky right-0 bg-primary z-0">
        <div className="flex items-center justify-center gap-2">
          <span title="View devices" aria-label="View devices">
            <Eye
              onClick={() =>
                onViewDevices(
                  system.department_id,
                  system.organization_id,
                  system.plant_id,
                  system.system_id
                )
              }
              className="w-5 h-5 text-fuchsia-500 cursor-pointer"
            />
          </span>

          <span title="Edit system" aria-label="Edit system">
            <Edit
              onClick={() => onEditSystem(system.system_id, system.plant_id)}
              className="w-5 h-5 text-status-info cursor-pointer"
            />
          </span>

          {adminRole === "super_admin" && (
            <span title="Delete system" aria-label="Delete system">
              <Trash2 className="w-5 h-5 text-status-danger cursor-pointer" />
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default SystemTableRow;
