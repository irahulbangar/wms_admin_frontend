import { Edit, Eye, Trash2 } from "lucide-react";
import type { DepartmentResult } from "../../../../model/department.interface";
import { formatDateForCSV } from "../../../utils/utils";

interface DepartmentTableRowProps {
  department: DepartmentResult;
  index: number;
  currentPage: number;
  rowsPerPage: number;
  adminRole?: string;
  onViewSystems: (
    departmentId: number,
    organizationId: number,
    plantId: number
  ) => void;
  onEditDepartment: (departmentId: number, plantId: number) => void;
}

const DepartmentTableRow: React.FC<DepartmentTableRowProps> = ({
  department,
  index,
  currentPage,
  rowsPerPage,
  adminRole,
  onViewSystems,
  onEditDepartment,
}) => {
  return (
    <tr
      onDoubleClick={() =>
        onViewSystems(
          department.department_id,
          department.organization_id,
          department.plant_id
        )
      }
      className="border-b border-border-primary bg-primary hover:bg-secondary cursor-pointer"
    >
      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
        {(currentPage - 1) * rowsPerPage + index + 1}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {department.department_name}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {department.organization_name}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {department.plant_name}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {formatDateForCSV(department.created_at)}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        {formatDateForCSV(department.updated_at)}
      </td>
      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          <span title="View systems" aria-label="View systems">
            <Eye
              onClick={() =>
                onViewSystems(
                  department.department_id,
                  department.organization_id,
                  department.plant_id
                )
              }
              className="w-5 h-5 text-fuchsia-500 cursor-pointer"
            />
          </span>

          <span title="Edit department" aria-label="Edit department">
            <Edit
              onClick={() =>
                onEditDepartment(department.department_id, department.plant_id)
              }
              className="w-5 h-5 text-status-info cursor-pointer"
            />
          </span>

          {adminRole === "super_admin" && (
            <span title="Delete department" aria-label="Delete department">
              <Trash2 className="w-5 h-5 text-status-danger cursor-pointer" />
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default DepartmentTableRow;

