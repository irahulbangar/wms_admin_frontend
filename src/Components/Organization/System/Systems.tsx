import {
  ChevronDown,
  ChevronRight,
  Dock,
  Edit,
  Eye,
  Home,
  Loader2,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  getOrganizations,
  setOrganizations,
} from "../../../../store/organizationSlice";
import { getAllPlants, setPlants } from "../../../../store/plantSlice";
import { Error, Warning } from "../../../utils/toast";
import { fromatDateWithTime } from "../../../utils/utils";
import NoDataFound from "../../NoDataFound";
import Pagination from "../../Pagination";
import AddUpdateSystem from "../AddUpdateSystem";
import {
  getAllSystems,
  getSystemByOrganizationIdPlantIdAndDepartmentId,
  setSystems,
} from "../../../../store/systemSlice";
import type { SystemResult } from "../../../../model/system.interface";

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
  const organizationDropdownRef = useRef<HTMLDivElement>(null);
  const plantDropdownRef = useRef<HTMLDivElement>(null);
  const departmentDropdownRef = useRef<HTMLDivElement>(null);
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
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const getOrganization = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getOrganizations())
      .unwrap()
      .then((res) => {
        if (res.success) {
          dispatch(setOrganizations(res.data));
        }
      })
      .catch((err) => {
        console.log(err);
        Error("Failed to get organizations");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const fetchPlants = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getAllPlants())
      .unwrap()
      .then((res) => {
        if (res.success) {
          dispatch(setPlants(res.data));
        }
      })
      .catch((err) => {
        console.log(err);
        Error("Failed to get plants");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    if (organizations.length === 0 || plants.length === 0) {
      getOrganization();
      fetchPlants();
    }
  }, [getOrganization, fetchPlants]);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        organizationDropdownRef.current &&
        !organizationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOrganizationDropdownOpen(false);
        setOrganizationSearchTerm("");
      }
      if (
        plantDropdownRef.current &&
        !plantDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPlantDropdownOpen(false);
        setPlantSearchTerm("");
      }
      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDepartmentDropdownOpen(false);
        setDepartmentSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".organization-dropdown")) {
        setIsOrganizationDropdownOpen(false);
      }
      if (!target.closest(".plant-dropdown")) {
        setIsPlantDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const refreshSystems = useCallback(() => {
    if (isLoading) return;

    if (organization_id && plant_id && department_id) {
      setIsLoading(true);
    }

    dispatch(getAllSystems())
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
  }, [dispatch]);

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
      refreshSystems();
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
      refreshSystems();
    }
  }, [
    organization_id,
    plant_id,
    department_id,
    selectedOrganization,
    selectedPlant,
    selectedDepartment,
    dispatch,
    refreshSystems,
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
        getOrganization();
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
        refreshSystems();
      }
    },
    [
      dispatch,
      selectedOrganization,
      selectedPlant,
      organization_id,
      plant_id,
      refreshSystems,
      fetchPlants,
      getOrganization,
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

      <div className="flex items-start md:items-center justify-center md:justify-end lg:justify-between lg:flex-nowrap w-full md:gap-4 gap-2 md:flex-row flex-col flex-nowrap md:flex-wrap">
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
                  (organization_id || selectedOrganization) === "all"
                    ? "All Organization"
                    : organizations.find(
                        (org) =>
                          org.organization_id.toString() ===
                          (organization_id || selectedOrganization)
                      )?.organization_name || "Select organization..."
                }
                readOnly
                className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
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
                      className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
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
                  (plant_id || selectedPlant) === "all"
                    ? "All Plant"
                    : plants.find(
                        (plant) =>
                          plant.plant_id.toString() ===
                          (plant_id || selectedPlant)
                      )?.plant_name || "Select plant..."
                }
                readOnly
                className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
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
                      className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
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
                  filteredPlants.map((plant) => (
                    <div
                      key={plant.plant_id}
                      className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                      onClick={() => {
                        setSelectedPlant(plant.plant_id.toString());
                        setIsPlantDropdownOpen(false);
                        setPlantSearchTerm(plant.plant_name);
                      }}
                    >
                      {plant.plant_name}
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
          <div
            className="flex-shrink-0 md:w-54 w-full relative department-dropdown"
            ref={departmentDropdownRef}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Select department..."
                value={
                  (department_id || selectedDepartment) === "all"
                    ? "All Department"
                    : departments.find(
                        (department) =>
                          department.department_id.toString() ===
                          (department_id || selectedDepartment)
                      )?.department_name || "Select department..."
                }
                readOnly
                className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
                onClick={() =>
                  setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)
                }
              />
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-200 ${
                  isDepartmentDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isDepartmentDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary border-b-0 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search departments..."
                      value={departmentSearchTerm || ""}
                      onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div
                  className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                  onClick={() => {
                    setSelectedDepartment("all");
                    setIsDepartmentDropdownOpen(false);
                    setDepartmentSearchTerm("");
                  }}
                >
                  All Department
                </div>

                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((department) => (
                    <div
                      key={department.department_id}
                      className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                      onClick={() => {
                        setSelectedDepartment(
                          department.department_id.toString()
                        );
                        setIsDepartmentDropdownOpen(false);
                        setDepartmentSearchTerm(department.department_name);
                      }}
                    >
                      {department.department_name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-text-secondary text-sm">
                    No departments found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex-shrink-0 relative md:w-60 lg:w-80 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search systems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-60 lg:w-80 w-full pl-10 pr-4 py-1.5 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilteredSystems(systems);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={handleAddSystem}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add System
          </button>
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
                    <tr
                      onDoubleClick={() =>
                        handleViewDevices(
                          system.department_id,
                          system.organization_id,
                          system.plant_id,
                          system.system_id
                        )
                      }
                      key={index}
                      className="border-b border-border-primary bg-primary hover:bg-secondary cursor-pointer"
                    >
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
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
                        {fromatDateWithTime(system.created_at)}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                        {fromatDateWithTime(system.updated_at)}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span title="View devices" aria-label="View devices">
                            <Eye
                              onClick={() =>
                                handleViewDevices(
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
                              onClick={() =>
                                handleEditSystem(
                                  system.system_id,
                                  system.plant_id
                                )
                              }
                              className="w-5 h-5 text-status-info cursor-pointer"
                            />
                          </span>

                          {admin?.role === "super_admin" && (
                            <span
                              title="Delete system"
                              aria-label="Delete system"
                            >
                              <Trash2 className="w-5 h-5 text-status-danger cursor-pointer" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
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
