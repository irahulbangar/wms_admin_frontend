import FilterDropdown from "./FilterDropdown";

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
          selectedValue={selectedOrganization}
          options={organizations}
          onSelect={onOrganizationChange}
          onClear={onOrganizationClear}
          getDisplayValue={(opt) => opt.organization_name}
          getOptionId={(opt) => opt.organization_id.toString()}
          searchPlaceholder="Search organizations..."
          className="organization-dropdown"
        />

        <FilterDropdown
          placeholder="Select plant..."
          allLabel="All Plant"
          selectedValue={selectedPlant}
          options={filteredPlants}
          onSelect={onPlantChange}
          getDisplayValue={(opt) => opt.plant_name}
          getOptionId={(opt) => opt.plant_id.toString()}
          searchPlaceholder="Search plants..."
          className="plant-dropdown"
        />

        <FilterDropdown
          placeholder="Select department..."
          allLabel="All Department"
          selectedValue={selectedDepartment}
          options={filteredDepartments}
          onSelect={onDepartmentChange}
          getDisplayValue={(opt) => opt.department_name}
          getOptionId={(opt) => opt.department_id.toString()}
          searchPlaceholder="Search departments..."
          className="plant-dropdown"
        />

        <FilterDropdown
          placeholder="Select system..."
          allLabel="All System"
          selectedValue={selectedSystem}
          options={filteredSystems}
          onSelect={onSystemChange}
          getDisplayValue={(opt) => opt.system_name}
          getOptionId={(opt) => opt.system_id.toString()}
          searchPlaceholder="Search systems..."
          className="plant-dropdown"
        />
      </div>
    </div>
  );
};

export default FilterSection;
