import FilterDropdown from "../../../Common/FilterDropdown";
import { useState } from "react";

interface FilterSectionProps {
  organizations: Array<{
    organization_id: number;
    organization_name: string;
    [key: string]: any;
  }>;
  plants: Array<{
    plant_id: number;
    plant_name: string;
    organization_id: number;
    [key: string]: any;
  }>;
  departments: Array<{
    department_id: number;
    department_name: string;
    plant_id: number;
    [key: string]: any;
  }>;
  systems: Array<{
    system_id: number;
    system_name: string;
    department_id: number;
    [key: string]: any;
  }>;
  selectedOrganization: string;
  selectedPlant: string;
  selectedDepartment: string;
  selectedSystem: string;
  onOrganizationChange: (value: string) => void;
  onPlantChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onSystemChange: (value: string) => void;
  onOrganizationClear?: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  organizations,
  plants,
  departments,
  systems,
  selectedOrganization,
  selectedPlant,
  selectedDepartment,
  selectedSystem,
  onOrganizationChange,
  onPlantChange,
  onDepartmentChange,
  onSystemChange,
  onOrganizationClear,
}) => {
  const [orgSearchTerm, setOrgSearchTerm] = useState("");
  const [plantSearchTerm, setPlantSearchTerm] = useState("");
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [systemSearchTerm, setSystemSearchTerm] = useState("");
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isPlantOpen, setIsPlantOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);

  const filteredPlants = plants.filter((plant) => {
    if (selectedOrganization === "all") return true;
    return plant.organization_id === parseInt(selectedOrganization);
  });

  const filteredDepartments = departments.filter((department) => {
    if (selectedPlant === "all") return true;
    return department.plant_id === parseInt(selectedPlant);
  });

  const filteredSystems = systems.filter((system) => {
    if (selectedDepartment === "all") return true;
    return system.department_id === parseInt(selectedDepartment);
  });

  return (
    <div className="flex items-start md:items-center justify-start w-full md:gap-3 gap-2 md:flex-row flex-col flex-nowrap md:flex-wrap">
      <div className="flex items-center gap-3 pl-1 md:flex-row flex-col w-full md:w-auto">
        <FilterDropdown
          placeholder="Select organization..."
          allLabel="All Organization"
          value={selectedOrganization}
          options={organizations.map((org) => ({
            id: org.organization_id,
            name: org.organization_name,
          }))}
          onSelect={(id) => {
            onOrganizationChange(id);
            if (onOrganizationClear) {
              onOrganizationClear();
            }
          }}
          onSelectAll={() => {
            onOrganizationChange("all");
            if (onOrganizationClear) {
              onOrganizationClear();
            }
          }}
          searchTerm={orgSearchTerm}
          onSearchChange={setOrgSearchTerm}
          isOpen={isOrgOpen}
          onToggle={() => setIsOrgOpen(!isOrgOpen)}
          className="flex-shrink-0 md:w-54 w-full relative organization-dropdown"
        />

        <FilterDropdown
          placeholder="Select plant..."
          allLabel="All Plant"
          value={selectedPlant}
          options={filteredPlants.map((plant) => ({
            id: plant.plant_id,
            name: plant.plant_name,
          }))}
          onSelect={onPlantChange}
          onSelectAll={() => onPlantChange("all")}
          searchTerm={plantSearchTerm}
          onSearchChange={setPlantSearchTerm}
          isOpen={isPlantOpen}
          onToggle={() => setIsPlantOpen(!isPlantOpen)}
          className="flex-shrink-0 md:w-54 w-full relative plant-dropdown"
          dropdownClassName="border-b-0"
        />

        <FilterDropdown
          placeholder="Select department..."
          allLabel="All Department"
          value={selectedDepartment}
          options={filteredDepartments.map((dept) => ({
            id: dept.department_id,
            name: dept.department_name,
          }))}
          onSelect={onDepartmentChange}
          onSelectAll={() => onDepartmentChange("all")}
          searchTerm={deptSearchTerm}
          onSearchChange={setDeptSearchTerm}
          isOpen={isDeptOpen}
          onToggle={() => setIsDeptOpen(!isDeptOpen)}
          className="flex-shrink-0 md:w-54 w-full relative plant-dropdown"
          dropdownClassName="border-b-0"
        />

        <FilterDropdown
          placeholder="Select system..."
          allLabel="All System"
          value={selectedSystem}
          options={filteredSystems.map((system) => ({
            id: system.system_id,
            name: system.system_name,
          }))}
          onSelect={onSystemChange}
          onSelectAll={() => onSystemChange("all")}
          searchTerm={systemSearchTerm}
          onSearchChange={setSystemSearchTerm}
          isOpen={isSystemOpen}
          onToggle={() => setIsSystemOpen(!isSystemOpen)}
          className="flex-shrink-0 md:w-54 w-full relative plant-dropdown"
          dropdownClassName="border-b-0"
        />
      </div>
    </div>
  );
};

export default FilterSection;
