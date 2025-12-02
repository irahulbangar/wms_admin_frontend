import { Home, ChevronRight } from "lucide-react";
import type { PlantResult } from "../../../../../model/plant.interface";

interface DepartmentBreadcrumbProps {
  selectedPlant: string;
  plantId?: string;
  plants: PlantResult[];
  onBackToHome: () => void;
  onBackToOrganizations: () => void;
  onBackToPlants: () => void;
}

const DepartmentBreadcrumb: React.FC<DepartmentBreadcrumbProps> = ({
  selectedPlant,
  plantId,
  plants,
  onBackToHome,
  onBackToOrganizations,
  onBackToPlants,
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

      {(plantId || selectedPlant !== "all") && (
        <>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <span className="text-text-primary font-normal bg-secondary/30 px-2 py-1 rounded capitalize">
            {plants.find(
              (plant) =>
                plant.plant_id.toString() === (plantId || selectedPlant)
            )?.plant_name || "Plant"}
          </span>
        </>
      )}
    </div>
  );
};

export default DepartmentBreadcrumb;
