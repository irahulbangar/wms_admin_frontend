import { Home, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BreadcrumbNavProps {
  organizationId?: string;
  plantId?: string;
  departmentId?: string;
  selectedSystem?: string;
  systemName?: string;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  organizationId,
  plantId,
  departmentId,
  selectedSystem,
  systemName,
}) => {
  const navigate = useNavigate();

  const handleBackToHome = () => navigate("/");
  const handleBackToOrganizations = () => navigate("/organization");
  const handleBackToPlants = () => {
    if (organizationId) {
      navigate(`/organization/plants/${organizationId}`);
    } else {
      navigate("/organization/plants");
    }
  };
  const handleBackToDepartments = () => {
    if (organizationId && plantId) {
      navigate(`/organization/departments/${organizationId}/${plantId}`);
    } else {
      navigate("/organization/departments");
    }
  };
  const handleBackToSystems = () => {
    if (organizationId && plantId && departmentId) {
      navigate(
        `/organization/systems/${organizationId}/${plantId}/${departmentId}`
      );
    } else {
      navigate("/organization/systems");
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit">
      <button
        onClick={handleBackToHome}
        className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>

      <ChevronRight className="w-4 h-4 text-text-muted" />

      <button
        onClick={handleBackToOrganizations}
        className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
      >
        <span>Organization</span>
      </button>

      <ChevronRight className="w-4 h-4 text-text-muted" />
      <button
        onClick={handleBackToPlants}
        className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
      >
        <span>Plants</span>
      </button>

      <ChevronRight className="w-4 h-4 text-text-muted" />
      <button
        onClick={handleBackToDepartments}
        className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
      >
        <span>Departments</span>
      </button>

      <ChevronRight className="w-4 h-4 text-text-muted" />
      <button
        onClick={handleBackToSystems}
        className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
      >
        <span>Systems</span>
      </button>

      {selectedSystem && selectedSystem !== "all" && systemName && (
        <>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <span className="text-text-primary font-normal bg-secondary/30 px-2 py-1 rounded capitalize">
            {systemName}
          </span>
        </>
      )}
    </div>
  );
};

export default BreadcrumbNav;
