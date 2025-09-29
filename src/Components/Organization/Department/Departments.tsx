import {
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  Home,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../../../store/store";

const Departments = () => {
  const { plant_id, organization_id } = useParams<{
    plant_id: string;
    organization_id: string;
  }>();
  const navigate = useNavigate();
  const [selectedOrganization, setSelectedOrganization] = useState<string>(
    organization_id || "all"
  );
  const [selectedPlant, setSelectedPlant] = useState<string>(plant_id || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [plantSearchTerm, setPlantSearchTerm] = useState("");
  const organizationDropdownRef = useRef<HTMLDivElement>(null);
  const plantDropdownRef = useRef<HTMLDivElement>(null);
  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] =
    useState(false);
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const { organizations } = useAppSelector((state) => state.organization);
  const { plants } = useAppSelector((state) => state.plant);
  const { admin } = useAppSelector((state) => state.admin);

  const filteredOrganizations = organizations.filter((org) =>
    org.organization_name
      .toLowerCase()
      .includes(organizationSearchTerm.toLowerCase())
  );

  const filteredPlants = plants.filter((proj) => {
    const matchesSearch = proj.plant_name
      .toLowerCase()
      .includes(plantSearchTerm.toLowerCase());

    if (selectedOrganization === "all") {
      return matchesSearch;
    }

    const matchesOrganization =
      proj.organization_id === parseInt(selectedOrganization);
    return matchesSearch && matchesOrganization;
  });

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleBackToOrganizations = () => {
    navigate("/organization");
  };

  const handleBackToPlants = () => {
    navigate("/organization/plants");
  };

  return (
    <div className="flex flex-col gap-4 h-full">
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

        {selectedPlant !== "all" && (
          <>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary font-medium bg-secondary/30 px-2 py-1 rounded capitalize">
              {plants.find((proj) => proj.plant_id.toString() === selectedPlant)
                ?.plant_name || "Plant"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-start md:items-center justify-center md:justify-end lg:justify-between w-full md:gap-4 gap-2 md:flex-row flex-col flex-nowrap md:flex-wrap">
        <div className="flex items-center gap-4 pl-1 md:flex-row flex-col w-full md:w-auto">
          <div
            className="flex-shrink-0 md:w-54 w-full relative organization-dropdown"
            ref={organizationDropdownRef}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Select organization..."
                value={
                  selectedOrganization === "all"
                    ? "All Organization"
                    : organizations.find(
                        (org) =>
                          org.organization_id.toString() ===
                          selectedOrganization
                      )?.organization_name || "Select organization..."
                }
                readOnly
                className="px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
                onClick={() =>
                  setIsOrganizationDropdownOpen(!isOrganizationDropdownOpen)
                }
              />
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-200 ${
                  isOrganizationDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isOrganizationDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search organizations..."
                      value={organizationSearchTerm}
                      onChange={(e) =>
                        setOrganizationSearchTerm(e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div
                  className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                  onClick={() => {
                    setSelectedOrganization("all");
                    setSelectedPlant("all");
                    setIsOrganizationDropdownOpen(false);
                    setOrganizationSearchTerm("");
                    setPlantSearchTerm("");
                  }}
                >
                  All Organization
                </div>

                {filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map((org) => (
                    <div
                      key={org.organization_id}
                      className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                      onClick={() => {
                        setSelectedOrganization(org.organization_id.toString());
                        setSelectedPlant("all");
                        setIsOrganizationDropdownOpen(false);
                        setOrganizationSearchTerm(org.organization_name);
                        setPlantSearchTerm("");
                      }}
                    >
                      {org.organization_name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-text-secondary text-sm">
                    No organizations found
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            className="flex-shrink-0 md:w-54 w-full relative plant-dropdown"
            ref={plantDropdownRef}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Select plant..."
                value={
                  selectedPlant === "all"
                    ? "All Plant"
                    : plants.find(
                        (proj) => proj.plant_id.toString() === selectedPlant
                      )?.plant_name || "Select plant..."
                }
                readOnly
                className="px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
                onClick={() => setIsPlantDropdownOpen(!isPlantDropdownOpen)}
              />
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-200 ${
                  isPlantDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isPlantDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary border-b-0 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search plants..."
                      value={plantSearchTerm}
                      onChange={(e) => setPlantSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div
                  className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                  onClick={() => {
                    setSelectedPlant("all");
                    setIsPlantDropdownOpen(false);
                    setPlantSearchTerm("");
                  }}
                >
                  All Plant
                </div>

                {filteredPlants.length > 0 ? (
                  filteredPlants.map((proj) => (
                    <div
                      key={proj.plant_id}
                      className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                      onClick={() => {
                        setSelectedPlant(proj.plant_id.toString());
                        setIsPlantDropdownOpen(false);
                        setPlantSearchTerm(proj.plant_name);
                      }}
                    >
                      {proj.plant_name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-text-secondary text-sm">
                    No plants found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex-shrink-0 relative md:w-60 lg:w-92 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-60 lg:w-92 w-full pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  //   setFilteredDevices(devices);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            // onClick={handleAddDevice}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add Department
          </button>
        </div>
      </div>

      <div className="relative bg-primary rounded-lg shadow-sm overflow-hidden h-full">
        <div className="overflow-auto h-[calc(100vh-280px)]">
          <table className="w-full text-sm text-left rtl:text-right text-text-primary">
            <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
              <tr>
                <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                  Sr No
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                  Department Name
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                  Created At
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                  Updated At
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-primary bg-primary hover:bg-secondary cursor-pointer">
                <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                  1
                </td>
                <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                  Testing
                </td>
                <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                  2025-08-09
                </td>
                <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                  2025-06-09
                </td>
                <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <span title="View devices" aria-label="View devices">
                      <Eye className="w-5 h-5 text-fuchsia-500 cursor-pointer" />
                    </span>

                    <span title="Edit plant" aria-label="Edit plant">
                      <Edit className="w-5 h-5 text-status-info cursor-pointer" />
                    </span>

                    {admin?.role === "super_admin" && (
                      <span title="Delete plant" aria-label="Delete plant">
                        <Trash2 className="w-5 h-5 text-status-danger cursor-pointer" />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Departments;
