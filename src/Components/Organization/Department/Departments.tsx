import { Dock, Loader2, PlusCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { setOrganizations } from "../../../../store/organizationSlice";
import { setPlants } from "../../../../store/plantSlice";
import type { DepartmentResult } from "../../../../model/department.interface";
import { Error, Warning } from "../../../utils/toast";
import {
  getDepartmentByOrganizationIdAndPlantId,
  setDepartments,
} from "../../../../store/departmentSlice";
import AddUpdateDepartment from "./AddUpdateDepartment";
import NoDataFound from "../../NoDataFound";
import Pagination from "../../Pagination";
import {
  useGetAllDepartmentsQuery,
  useGetAllOrganizationsQuery,
  useGetAllPlantsQuery,
} from "../../../../store/rtkQuery";
import DepartmentTableRow from "./components/DepartmentTableRow";
import FilterDropdown from "../../Common/FilterDropdown";
import SearchInput from "../../Common/SearchInput";
import OrganizationBreadcrumb from "../../Common/OrganizationBreadcrumb";

const Departments = () => {
  const { organization_id, plant_id } = useParams<{
    organization_id: string;
    plant_id: string;
  }>();
  const navigate = useNavigate();
  const [selectedOrganization, setSelectedOrganization] = useState<string>(
    organization_id || "all"
  );
  const [selectedPlant, setSelectedPlant] = useState<string>(plant_id || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [plantSearchTerm, setPlantSearchTerm] = useState("");
  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] =
    useState(false);
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const { organizations } = useAppSelector((state) => state.organization);
  const { plants } = useAppSelector((state) => state.plant);
  const { admin } = useAppSelector((state) => state.admin);
  const { departments } = useAppSelector((state) => state.department);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [filteredDepartments, setFilteredDepartments] = useState<
    DepartmentResult[]
  >([]);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [plantId, setPlantId] = useState<number | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
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
    data: departmentsData,
    isLoading: isFetchingDepartments,
    refetch: refetchDepartments,
  } = useGetAllDepartmentsQuery();

  const totalItems = useMemo(() => {
    return filteredDepartments.length;
  }, [filteredDepartments]);

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
      organizationsData?.success === false ||
      organizationsData?.data?.length === 0
    ) {
      fetchOrganizations();
    }

    if (
      plants.length === 0 ||
      plantsData?.success === false ||
      plantsData?.data?.length === 0
    ) {
      fetchPlants();
    }
  }, [fetchOrganizations, organizationsData, plantsData]);

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

    if (!organization_id && !plant_id) {
      setOrganizationSearchTerm("");
      setPlantSearchTerm("");
      fetchDepartments();
    }
  }, [organization_id, plant_id]);

  useEffect(() => {
    let filtered = departments;

    if (searchTerm) {
      filtered = filtered.filter((department: DepartmentResult) =>
        department.department_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    const currentOrganization = organization_id || selectedOrganization;
    const currentPlant = plant_id || selectedPlant;

    if (currentOrganization !== "all") {
      const orgPlantIds = plants
        .filter((p) => p.organization_id === parseInt(currentOrganization))
        .map((p) => p.plant_id);
      filtered = filtered.filter((department: DepartmentResult) =>
        orgPlantIds.includes(department.plant_id)
      );
    }

    if (currentPlant !== "all") {
      filtered = filtered.filter(
        (department: DepartmentResult) =>
          department.plant_id === parseInt(currentPlant)
      );
    }

    setFilteredDepartments(filtered);
  }, [
    departments,
    selectedOrganization,
    selectedPlant,
    plants,
    searchTerm,
    organization_id,
    plant_id,
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

  const handleAddDepartment = () => {
    const currentOrganization = organization_id || selectedOrganization;
    const currentPlant = plant_id || selectedPlant;

    if (currentOrganization === "all" || currentPlant === "all") {
      Warning(
        "Please select both organization and plant before adding a department"
      );
      return;
    }

    setIsAddDepartmentOpen(true);
    setPlantId(parseInt(currentPlant));
    setOrganizationId(parseInt(currentOrganization));
  };

  const handleEditDepartment = (departmentId: number, plantId: number) => {
    const derivedOrganizationId: number =
      plants.find((p) => p.plant_id === plantId)?.organization_id ||
      (selectedOrganization !== "all" ? parseInt(selectedOrganization) : 0);

    setDepartmentId(departmentId);
    setIsEditDepartmentOpen(true);
    setPlantId(plantId);
    setOrganizationId(derivedOrganizationId);

    if (!derivedOrganizationId) {
      Warning(
        "Organization not found for this department. Please select an organization first."
      );
    }
  };

  const fetchDepartments = useCallback(() => {
    if (isFetchingDepartments) return;
    refetchDepartments();
  }, [isFetchingDepartments, refetchDepartments]);

  useEffect(() => {
    if (departmentsData?.success && departmentsData?.data) {
      dispatch(setDepartments(departmentsData.data));
    }
  }, [departmentsData, dispatch]);

  useEffect(() => {
    if (organization_id && plant_id) {
      setIsLoading(true);
      dispatch(
        getDepartmentByOrganizationIdAndPlantId({
          plant_id: parseInt(plant_id),
          organization_id: parseInt(organization_id),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success || res.status === 200) {
            dispatch(setDepartments(res?.data));
            setFilteredDepartments(res?.data);
          } else {
            Error(res.message || "Failed to get departments");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get departments");
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    if (selectedOrganization === "all" && selectedPlant === "all") {
      fetchDepartments();
    } else if (selectedOrganization !== "all" && selectedPlant !== "all") {
      setIsLoading(true);
      dispatch(
        getDepartmentByOrganizationIdAndPlantId({
          plant_id: parseInt(selectedPlant),
          organization_id: parseInt(selectedOrganization),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success || res.status === 200) {
            dispatch(setDepartments(res?.data));
            setFilteredDepartments(res?.data);
          } else {
            Error(res.message || "Failed to get departments");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get departments");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      fetchDepartments();
    }
  }, [
    organization_id,
    plant_id,
    selectedOrganization,
    selectedPlant,
    dispatch,
    fetchDepartments,
  ]);

  const handleDepartmentUpdate = useCallback(
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

      if (organization_id && plant_id) {
        dispatch(
          getDepartmentByOrganizationIdAndPlantId({
            plant_id: parseInt(plant_id),
            organization_id: parseInt(organization_id),
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              dispatch(setDepartments(res?.data));
              setFilteredDepartments(res?.data);
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
      } else if (selectedOrganization !== "all" && selectedPlant !== "all") {
        dispatch(
          getDepartmentByOrganizationIdAndPlantId({
            plant_id: parseInt(selectedPlant),
            organization_id: parseInt(selectedOrganization),
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              dispatch(setDepartments(res?.data));
              setFilteredDepartments(res?.data);
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
        fetchDepartments();
      }
    },
    [
      dispatch,
      selectedOrganization,
      selectedPlant,
      organization_id,
      plant_id,
      fetchDepartments,
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

  const handleViewDevices = (
    departmentId: number,
    organizationId: number,
    plantId: number
  ) => {
    navigate(
      `/organization/systems/${organizationId}/${plantId}/${departmentId}`
    );
  };

  const handlePaginatedDepartments = useMemo(() => {
    return filteredDepartments.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredDepartments, currentPage, rowsPerPage]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-3 flex-col md:flex-row flex-wrap">
        <OrganizationBreadcrumb
          onHomeClick={handleBackToHome}
          items={[
            { label: "Organization", onClick: handleBackToOrganizations },
            { label: "Plants", onClick: handleBackToPlants },
            {
              label: "Plant",
              onClick: () => {},
              isActive: plant_id !== undefined || selectedPlant !== "all",
              displayValue:
                plants.find(
                  (plant) =>
                    plant.plant_id.toString() === (plant_id || selectedPlant)
                )?.plant_name || "Plant",
            },
          ]}
        />

        <div className="flex items-center flex-col md:flex-row gap-3 w-full md:w-auto">
          <SearchInput
            value={searchTerm}
            placeholder="Search departments..."
            onChange={setSearchTerm}
            onClear={() => {
              setSearchTerm("");
              setFilteredDepartments(departments);
            }}
          />

          <button
            onClick={handleAddDepartment}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add Department
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
                handlePaginatedDepartments?.length > 0 ? "h-auto" : "h-full"
              } min-w-[800px]`}
            >
              <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                    Sr No
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                    Department Name
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                    Organization Name
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-normal">
                    Plant Name
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
                {handlePaginatedDepartments.length > 0 ? (
                  handlePaginatedDepartments.map((department, index) => (
                    <DepartmentTableRow
                      key={department.department_id || index}
                      department={department}
                      index={index}
                      currentPage={currentPage}
                      rowsPerPage={rowsPerPage}
                      adminRole={admin?.role}
                      onViewSystems={handleViewDevices}
                      onEditDepartment={handleEditDepartment}
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
                            ? "No departments match your search/filter"
                            : selectedOrganization === "all"
                            ? "No departments found"
                            : `No departments found for ${
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
                            : "Add Department"
                        }
                        buttonOnClick={() => {
                          if (searchTerm || selectedOrganization !== "all") {
                            setSearchTerm("");
                            setSelectedOrganization("all");
                          } else {
                            setIsAddDepartmentOpen(true);
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

      {isAddDepartmentOpen && (
        <AddUpdateDepartment
          setShowAddDepartmentPopup={setIsAddDepartmentOpen}
          type="add"
          departmentId={departmentId || 0}
          plantId={plantId || 0}
          onUpdateSuccess={handleDepartmentUpdate}
          organizationId={organizationId || 0}
        />
      )}

      {isEditDepartmentOpen && (
        <AddUpdateDepartment
          setShowAddDepartmentPopup={setIsEditDepartmentOpen}
          type="update"
          departmentId={departmentId || 0}
          plantId={plantId || 0}
          onUpdateSuccess={handleDepartmentUpdate}
          organizationId={organizationId || 0}
        />
      )}
    </div>
  );
};

export default Departments;
