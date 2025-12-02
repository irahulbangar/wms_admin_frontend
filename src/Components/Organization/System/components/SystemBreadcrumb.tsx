import { Home, ChevronRight } from "lucide-react";
import type { DepartmentResult } from "../../../../../model/department.interface";

interface SystemBreadcrumbProps {
  selectedDepartment: string;
  departments: DepartmentResult[];
  onBackToHome: () => void;
  onBackToOrganizations: () => void;
  onBackToPlants: () => void;
  onBackToDepartments: () => void;
}

const SystemBreadcrumb: React.FC<SystemBreadcrumbProps> = ({
  selectedDepartment,
  departments,
  onBackToHome,
  onBackToOrganizations,
  onBackToPlants,
  onBackToDepartments,
}) => {
  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit">
      <button
        onClick={onBackToHome}
        className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>

      <ChevronRight className="w-4 h-4 text-text-muted" />

      <button
        onClick={onBackToOrganizations}
        className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
      >
        <span>Organization</span>
      </button>

      <ChevronRight className="w-4 h-4 text-text-muted" />
      <button
        onClick={onBackToPlants}
        className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
      >
        <span>Plants</span>
      </button>

      <ChevronRight className="w-4 h-4 text-text-muted" />
      <button
        onClick={onBackToDepartments}
        className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
      >
        <span>Departments</span>
      </button>

      {selectedDepartment !== "all" && (
        <>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <span className="text-text-primary font-normal bg-secondary/30 px-2 py-1 rounded capitalize">
            {departments.find(
              (department) =>
                department.department_id.toString() === selectedDepartment
            )?.department_name || "Department"}
          </span>
        </>
      )}
    </div>
  );
};

export default SystemBreadcrumb;
