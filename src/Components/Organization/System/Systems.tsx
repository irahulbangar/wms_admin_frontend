import { Dock, Loader2, PlusCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { setOrganizations } from "../../../../store/organizationSlice";
import { setPlants } from "../../../../store/plantSlice";
import { Error, Warning } from "../../../utils/toast";
import NoDataFound from "../../NoDataFound";
import Pagination from "../../Pagination";
import AddUpdateSystem from "./AddUpdateSystem";
import {
  getSystemByOrganizationIdPlantIdAndDepartmentId,
  setSystems,
} from "../../../../store/systemSlice";
import type { SystemResult } from "../../../../model/system.interface";
import {
  useGetAllOrganizationsQuery,
  useGetAllPlantsQuery,
  useGetAllSystemsQuery,
} from "../../../../store/rtkQuery";
import SystemTableRow from "./components/SystemTableRow";
import FilterDropdown from "../../Common/FilterDropdown";
import SearchInput from "../../Common/SearchInput";
import OrganizationBreadcrumb from "../../Common/OrganizationBreadcrumb";

const Systems = () => {
  const { organization_id, plant_id, department_id } = useParams<{
    organization_id: string;
    plant_id: string;
    department_id: string;
  }>();
  const navigate = useNavigate();
  const [selectedOrganization, setSelectedOrganization] = useState<string>(
    organization_id || "all"
  );
  const [selectedPlant, setSelectedPlant] = useState<string>(plant_id || "all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    department_id || "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [plantSearchTerm, setPlantSearchTerm] = useState("");
  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] =
    useState(false);
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const { organizations } = useAppSelector((state) => state.organization);
  const { plants } = useAppSelector((state) => state.plant);
  const { admin } = useAppSelector((state) => state.admin);
  const { systems } = useAppSelector((state) => state.system);
  const { departments } = useAppSelector((state) => state.department);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [filteredSystems, setFilteredSystems] = useState<SystemResult[]>([]);
  const [isAddSystemOpen, setIsAddSystemOpen] = useState(false);
  const [plantId, setPlantId] = useState<number | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [isEditSystemOpen, setIsEditSystemOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [systemId, setSystemId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const {
    data: organizationsData,
    isLoading: isFetchingOrganizations,
    refetch: refetchOrganizations,
  } = useGetAllOrganizationsQuery();

  const {
    data: plantsData,
    isLoading: isFetchingPlants,
    refetch: refetchPlants,
  } = useGetAllPlantsQuery();

  const {
    data: systemsData,
    isLoading: isFetchingSystems,
    refetch: refetchSystems,
  } = useGetAllSystemsQuery();

  const totalItems = useMemo(() => {
    return filteredSystems.length;
  }, [filteredSystems]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / rowsPerPage);
  }, [totalItems, rowsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const fetchOrganizations = useCallback(() => {
    if (isFetchingOrganizations) return;
    refetchOrganizations();
  }, [isFetchingOrganizations, refetchOrganizations]);

  useEffect(() => {
    if (organizationsData?.success && organizationsData?.data) {
      dispatch(setOrganizations(organizationsData.data));
    }
  }, [organizationsData, dispatch]);

  const fetchPlants = useCallback(() => {
    if (isFetchingPlants) return;
    refetchPlants();
  }, [isFetchingPlants, refetchPlants]);

  useEffect(() => {
    if (plantsData?.success && plantsData?.data) {
      dispatch(setPlants(plantsData.data));
    }
  }, [plantsData, dispatch]);

  useEffect(() => {
    if (
      organizations.length === 0 ||
      plantsData?.success === false ||
      plantsData?.data?.length === 0
    ) {
      fetchPlants();
    }

    if (
      organizations.length === 0 ||
      organizationsData?.success === false ||
      organizationsData?.data?.length === 0
    ) {
      fetchOrganizations();
    }
  }, [fetchOrganizations, fetchPlants]);

  useEffect(() => {
    if (organization_id) {
      setSelectedOrganization(organization_id);
    } else {
      setSelectedOrganization("all");
    }

    if (plant_id) {
      setSelectedPlant(plant_id);
    } else {
      setSelectedPlant("all");
    }

    if (department_id) {
      setSelectedDepartment(department_id);
    } else {
      setSelectedDepartment("all");
    }

    if (!organization_id && !plant_id && !department_id) {
      setOrganizationSearchTerm("");
      setPlantSearchTerm("");
      setDepartmentSearchTerm("");
    }
  }, [organization_id, plant_id, department_id]);

  useEffect(() => {
    let filtered = systems;

    if (searchTerm) {
      filtered = filtered.filter((system: SystemResult) =>
        system.system_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const currentOrganization = organization_id || selectedOrganization;
    const currentPlant = plant_id || selectedPlant;
    const currentDepartment = department_id || selectedDepartment;

    if (currentOrganization !== "all") {
      const orgPlantIds = plants
        .filter((p) => p.organization_id === parseInt(currentOrganization))
        .map((p) => p.plant_id);
      filtered = filtered.filter((system: SystemResult) =>
        orgPlantIds.includes(system.plant_id)
      );
    }

    if (currentPlant !== "all") {
      filtered = filtered.filter(
        (system: SystemResult) => system.plant_id === parseInt(currentPlant)
      );
    }

    if (currentDepartment !== "all") {
      filtered = filtered.filter(
        (system: SystemResult) =>
          system.department_id === parseInt(currentDepartment)
      );
    }

    setFilteredSystems(filtered);
  }, [
    systems,
    selectedOrganization,
    selectedPlant,
    selectedDepartment,
    plants,
    searchTerm,
    organization_id,
    plant_id,
    department_id,
  ]);

  const filteredOrganizations = organizations.filter((org) =>
    org.organization_name
      .toLowerCase()
      .includes(organizationSearchTerm.toLowerCase())
  );

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = plant.plant_name
      .toLowerCase()
      .includes(plantSearchTerm.toLowerCase());

    if (selectedOrganization === "all") {
      return matchesSearch;
    }

    const matchesOrganization =
      plant.organization_id === parseInt(selectedOrganization);
    return matchesSearch && matchesOrganization;
  });

  const filteredDepartments = departments.filter((department) => {
    const matchesDepartment = department.department_name
      .toLowerCase()
      .includes(departmentSearchTerm.toLowerCase());

    if (selectedPlant === "all") {
      return matchesDepartment;
    }

    const matchesPlant = department.plant_id === parseInt(selectedPlant);
    return matchesDepartment && matchesPlant;
  });

  useEffect(() => {
    if (selectedOrganization !== "all") {
      const selectedPlants = plants.find(
        (plant) => plant.plant_id.toString() === selectedPlant
      );

      if (
        selectedPlants &&
        selectedPlants.organization_id !== parseInt(selectedOrganization)
      ) {
        setSelectedPlant("all");
        setPlantSearchTerm("");
      }
    }
  }, [selectedOrganization, selectedPlant, plants]);

  const handleAddSystem = () => {
    const currentOrganization = organization_id || selectedOrganization;
    const currentPlant = plant_id || selectedPlant;
    const currentDepartment = department_id || selectedDepartment;

    if (currentOrganization === "all" || currentPlant === "all") {
      Warning(
        "Please select both organization, plant and department before adding a system"
      );
      return;
    }

    setIsAddSystemOpen(true);
    setPlantId(parseInt(currentPlant));
    setOrganizationId(parseInt(currentOrganization));
    setDepartmentId(parseInt(currentDepartment));
  };

  const handleEditSystem = (systemId: number, plantId: number) => {
    const derivedOrganizationId: number =
      plants.find((p) => p.plant_id === plantId)?.organization_id ||
      (selectedOrganization !== "all" ? parseInt(selectedOrganization) : 0);

    setSystemId(systemId);
    setIsEditSystemOpen(true);
    setPlantId(plantId);
    setOrganizationId(derivedOrganizationId);

    if (!derivedOrganizationId) {
      Warning(
        "Organization not found for this system. Please select an organization first."
      );
    }
  };

  const fetchSystems = useCallback(() => {
    if (isFetchingSystems) return;
    refetchSystems();
  }, [isFetchingSystems, refetchSystems]);

  useEffect(() => {
    if (systemsData?.success && systemsData?.data) {
      dispatch(setSystems(systemsData.data));
    }
  }, [systemsData, dispatch]);

  useEffect(() => {
    if (organization_id && plant_id && department_id) {
      setIsLoading(true);
      dispatch(
        getSystemByOrganizationIdPlantIdAndDepartmentId({
          plantId: parseInt(plant_id),
          departmentId: parseInt(department_id),
          organizationId: parseInt(organization_id),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success || res.status === 200) {
            dispatch(setSystems(res?.data));
            setFilteredSystems(res?.data);
          } else {
            Error(res.message || "Failed to get systems");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get systems");
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    if (
      selectedOrganization === "all" &&
      selectedPlant === "all" &&
      selectedDepartment === "all"
    ) {
      fetchSystems();
    } else if (
      selectedOrganization !== "all" &&
      selectedPlant !== "all" &&
      selectedDepartment !== "all"
    ) {
      setIsLoading(true);
      dispatch(
        getSystemByOrganizationIdPlantIdAndDepartmentId({
          plantId: parseInt(selectedPlant),
          departmentId: parseInt(selectedDepartment),
          organizationId: parseInt(selectedOrganization),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success || res.status === 200) {
            dispatch(setSystems(res?.data));
            setFilteredSystems(res?.data);
          } else {
            Error(res.message || "Failed to get systems");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get systems");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      fetchSystems();
    }
  }, [
    organization_id,
    plant_id,
    department_id,
    selectedOrganization,
    selectedPlant,
    selectedDepartment,
    dispatch,
    fetchSystems,
  ]);

  const handleSystemUpdate = useCallback(
    (result?: {
      data?: {
        refreshPlants?: boolean;
        refreshOrganizations?: boolean;
      };
    }) => {
      if (isLoading) return;

      if (result?.data?.refreshPlants) {
        fetchPlants();
        return;
      }

      if (result?.data?.refreshOrganizations) {
        fetchOrganizations();
        return;
      }

      setIsLoading(true);

      if (organization_id && plant_id && department_id) {
        dispatch(
          getSystemByOrganizationIdPlantIdAndDepartmentId({
            plantId: parseInt(plant_id),
            departmentId: parseInt(department_id),
            organizationId: parseInt(organization_id),
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              dispatch(setSystems(res?.data));
              setFilteredSystems(res?.data);
            } else {
              Error(res.message || "Failed to refresh systems");
            }
          })
          .catch((err) => {
            console.log(err);
            Error(err.message || "Failed to refresh systems");
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else if (selectedOrganization !== "all" && selectedPlant !== "all") {
        dispatch(
          getSystemByOrganizationIdPlantIdAndDepartmentId({
            plantId: parseInt(selectedPlant),
            departmentId: parseInt(selectedDepartment),
            organizationId: parseInt(selectedOrganization),
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              dispatch(setSystems(res?.data));
              setFilteredSystems(res?.data);
            } else {
              Error(res.message || "Failed to refresh departments");
            }
          })
          .catch((err) => {
            console.log(err);
            Error(err.message || "Failed to refresh departments");
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        fetchSystems();
      }
    },
    [
      dispatch,
      selectedOrganization,
      selectedPlant,
      organization_id,
      plant_id,
      fetchSystems,
      fetchPlants,
      fetchOrganizations,
    ]
  );

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleBackToOrganizations = () => {
    navigate("/organization");
  };

  const handleBackToPlants = () => {
    const currentOrganization = organization_id || selectedOrganization;
    if (currentOrganization && currentOrganization !== "all") {
      navigate(`/organization/plants/${currentOrganization}`);
    } else {
      navigate("/organization/plants");
    }
  };

  const handleBackToDepartments = () => {
    const currentOrganization = organization_id || selectedOrganization;
    const currentPlant = plant_id || selectedPlant;

    if (
      currentOrganization &&
      currentOrganization !== "all" &&
      currentPlant &&
      currentPlant !== "all"
    ) {
      navigate(
        `/organization/departments/${currentOrganization}/${currentPlant}`
      );
    } else {
      navigate("/organization/departments");
    }
  };

  const handleViewDevices = (
    departmentId: number,
    organizationId: number,
    plantId: number,
    systemId: number
  ) => {
    navigate(
      `/organization/devices/${organizationId}/${plantId}/${departmentId}/${systemId}`
    );
  };

  const handlePaginatedSystems = useMemo(() => {
    return filteredSystems.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredSystems, currentPage, rowsPerPage]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-3 flex-col md:flex-row flex-wrap">
        <OrganizationBreadcrumb
          onHomeClick={handleBackToHome}
          items={[
            { label: "Organization", onClick: handleBackToOrganizations },
            { label: "Plants", onClick: handleBackToPlants },
            { label: "Departments", onClick: handleBackToDepartments },
            {
              label: "Department",
              onClick: () => {},
              isActive: selectedDepartment !== "all",
              displayValue:
                departments.find(
                  (dept) => dept.department_id.toString() === selectedDepartment
                )?.department_name || "Department",
            },
          ]}
        />
        <div className="flex items-center flex-col md:flex-row gap-3 w-full md:w-auto">
          <SearchInput
            value={searchTerm}
            placeholder="Search systems..."
            onChange={setSearchTerm}
            onClear={() => {
              setSearchTerm("");
              setFilteredSystems(systems);
            }}
          />

          <button
            onClick={handleAddSystem}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add System
          </button>
        </div>
      </div>

      <div className="flex items-start md:items-center justify-center md:justify-end lg:justify-between w-full gap-3 md:flex-row flex-col flex-wrap">
        <div className="flex items-center gap-3 pl-1 md:flex-row flex-col w-full md:w-auto">
          <FilterDropdown
            placeholder="Select organization..."
            allLabel="All Organization"
            value={organization_id || selectedOrganization}
            options={filteredOrganizations.map((org) => ({
              id: org.organization_id,
              name: org.organization_name,
            }))}
            searchTerm={organizationSearchTerm}
            onSearchChange={setOrganizationSearchTerm}
            onSelect={(id) => {
              setSelectedOrganization(id);
              setSelectedPlant("all");
              setPlantSearchTerm("");
            }}
            onSelectAll={() => {
              setSelectedOrganization("all");
              setSelectedPlant("all");
              setPlantSearchTerm("");
            }}
            isOpen={isOrganizationDropdownOpen}
            onToggle={() =>
              setIsOrganizationDropdownOpen(!isOrganizationDropdownOpen)
            }
            className="flex-shrink-0 md:w-54 w-full relative organization-dropdown"
          />
          <FilterDropdown
            placeholder="Select plant..."
            allLabel="All Plant"
            value={plant_id || selectedPlant}
            options={filteredPlants.map((plant) => ({
              id: plant.plant_id,
              name: plant.plant_name,
            }))}
            searchTerm={plantSearchTerm}
            onSearchChange={setPlantSearchTerm}
            onSelect={(id) => {
              setSelectedPlant(id);
            }}
            onSelectAll={() => {
              setSelectedPlant("all");
            }}
            isOpen={isPlantDropdownOpen}
            onToggle={() => setIsPlantDropdownOpen(!isPlantDropdownOpen)}
            className="flex-shrink-0 md:w-54 w-full relative plant-dropdown"
            dropdownClassName="border-b-0"
          />
          <FilterDropdown
            placeholder="Select department..."
            allLabel="All Department"
            value={department_id || selectedDepartment}
            options={filteredDepartments.map((dept) => ({
              id: dept.department_id,
              name: dept.department_name,
            }))}
            searchTerm={departmentSearchTerm}
            onSearchChange={setDepartmentSearchTerm}
            onSelect={(id) => {
              setSelectedDepartment(id);
            }}
            onSelectAll={() => {
              setSelectedDepartment("all");
            }}
            isOpen={isDepartmentDropdownOpen}
            onToggle={() =>
              setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)
            }
            className="flex-shrink-0 md:w-54 w-full relative department-dropdown"
            dropdownClassName="border-b-0"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-14 h-14 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative bg-primary rounded-lg shadow-sm overflow-hidden h-full">
          <div className="overflow-y-auto overflow-x-auto h-[calc(100vh-295px)] table-scrollbar">
            <table
              className={`w-full text-sm text-left rtl:text-right text-text-primary ${
                handlePaginatedSystems?.length > 0 ? "h-auto" : "h-full"
              } min-w-[800px]`}
            >
              <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                    Sr No
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                    System Name
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
                    Created At
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                    Updated At
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="min-h-[800px]">
                {handlePaginatedSystems.length > 0 ? (
                  handlePaginatedSystems.map((system, index) => (
                    <SystemTableRow
                      key={system.system_id || index}
                      system={system}
                      index={index}
                      currentPage={currentPage}
                      rowsPerPage={rowsPerPage}
                      adminRole={admin?.role}
                      onViewDevices={handleViewDevices}
                      onEditSystem={handleEditSystem}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-text-primary text-center font-roboto text-sm h-full"
                    >
                      <NoDataFound
                        icon={
                          <Dock className="w-16 h-16 text-text-muted mx-auto mb-4" />
                        }
                        title={
                          searchTerm || selectedOrganization !== "all"
                            ? "No systems match your search/filter"
                            : selectedOrganization === "all"
                            ? "No systems found"
                            : `No systems found for ${
                                organizations.find(
                                  (org) =>
                                    org.organization_id === selectedOrganization
                                )?.organization_name ||
                                `Organization ${selectedOrganization}`
                              }`
                        }
                        description={
                          searchTerm || selectedOrganization !== "all"
                            ? "Try adjusting your search terms or filter criteria"
                            : selectedOrganization === "all"
                            ? "Add your first department to get started"
                            : `Add your first department for ${
                                organizations.find(
                                  (org) =>
                                    org.organization_id === selectedOrganization
                                )?.organization_name ||
                                `Organization ${selectedOrganization}`
                              } to get started`
                        }
                        buttonText={
                          searchTerm || selectedOrganization !== "all"
                            ? "Clear Search"
                            : "Add System"
                        }
                        buttonOnClick={() => {
                          if (searchTerm || selectedOrganization !== "all") {
                            setSearchTerm("");
                            setSelectedOrganization("all");
                          } else {
                            setIsAddSystemOpen(true);
                          }
                        }}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      )}

      {isAddSystemOpen && (
        <AddUpdateSystem
          setShowAddSystemPopup={setIsAddSystemOpen}
          type="add"
          systemId={systemId || 0}
          departmentId={departmentId || 0}
          plantId={plantId || 0}
          onUpdateSuccess={handleSystemUpdate}
          organizationId={organizationId || 0}
        />
      )}

      {isEditSystemOpen && (
        <AddUpdateSystem
          setShowAddSystemPopup={setIsEditSystemOpen}
          type="update"
          systemId={systemId || 0}
          departmentId={departmentId || 0}
          plantId={plantId || 0}
          onUpdateSuccess={handleSystemUpdate}
          organizationId={organizationId || 0}
        />
      )}
    </div>
  );
};

export default Systems;
