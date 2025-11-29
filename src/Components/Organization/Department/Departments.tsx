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
import { setOrganizations } from "../../../../store/organizationSlice";
import { getAllPlants, setPlants } from "../../../../store/plantSlice";
import type { DepartmentResult } from "../../../../model/department.interface";
import { Error, Warning } from "../../../utils/toast";
import {
  getAllDepartments,
  getDepartmentByOrganizationIdAndPlantId,
  setDepartments,
} from "../../../../store/departmentSlice";
import AddUpdateDepartment from "./AddUpdateDepartment";
import { fromatDateWithTime } from "../../../utils/utils";
import NoDataFound from "../../NoDataFound";
import Pagination from "../../Pagination";
import { useGetAllOrganizationsQuery } from "../../../../store/rtkQuery";

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
  const organizationDropdownRef = useRef<HTMLDivElement>(null);
  const plantDropdownRef = useRef<HTMLDivElement>(null);
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
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data: organizationsData,
    isLoading: isFetchingOrganizations,
    refetch: refetchOrganizations,
  } = useGetAllOrganizationsQuery();

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

  const getOrganization = () => {
    if (isFetchingOrganizations) return;
    refetchOrganizations();
  };

  useEffect(() => {
    if (organizationsData?.success && organizationsData?.data) {
      dispatch(setOrganizations(organizationsData.data));
    }
  }, [organizationsData, dispatch]);

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
    if (
      organizations.length === 0 ||
      organizationsData?.success === false ||
      organizationsData?.data?.length === 0
    ) {
      getOrganization();
    }
    
    if (plants.length === 0) {
      fetchPlants();
    }
  }, [getOrganization, organizationsData]);

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
      refreshDepartments();
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

  const refreshDepartments = useCallback(() => {
    if (isLoading) return;

    if (organization_id && plant_id) {
      setIsLoading(true);
    }

    dispatch(getAllDepartments())
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
  }, [dispatch]);

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
      refreshDepartments();
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
      refreshDepartments();
    }
  }, [
    organization_id,
    plant_id,
    selectedOrganization,
    selectedPlant,
    dispatch,
    refreshDepartments,
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
        getOrganization();
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
        refreshDepartments();
      }
    },
    [
      dispatch,
      selectedOrganization,
      selectedPlant,
      organization_id,
      plant_id,
      refreshDepartments,
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

        {(plant_id || selectedPlant !== "all") && (
          <>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary font-normal bg-secondary/30 px-2 py-1 rounded capitalize">
              {plants.find(
                (plant) =>
                  plant.plant_id.toString() === (plant_id || selectedPlant)
              )?.plant_name || "Plant"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-start md:items-center justify-center md:justify-end lg:justify-between w-full gap-3 md:flex-row flex-col flex-wrap">
        <div className="flex items-center gap-3 pl-1 md:flex-row flex-col w-full md:w-auto">
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
        </div>
        <div className="flex items-center flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="flex-shrink-0 relative md:w-60 lg:w-80 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-60 lg:w-80 w-full pl-10 pr-4 py-1.5 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilteredDepartments(departments);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={handleAddDepartment}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add Department
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
                    <tr
                      onDoubleClick={() =>
                        handleViewDevices(
                          department.department_id,
                          department.organization_id,
                          department.plant_id
                        )
                      }
                      key={index}
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
                        {fromatDateWithTime(department.created_at)}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                        {fromatDateWithTime(department.updated_at)}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span title="View devices" aria-label="View devices">
                            <Eye
                              onClick={() =>
                                handleViewDevices(
                                  department.department_id,
                                  department.organization_id,
                                  department.plant_id
                                )
                              }
                              className="w-5 h-5 text-fuchsia-500 cursor-pointer"
                            />
                          </span>

                          <span
                            title="Edit department"
                            aria-label="Edit department"
                          >
                            <Edit
                              onClick={() =>
                                handleEditDepartment(
                                  department.department_id,
                                  department.plant_id
                                )
                              }
                              className="w-5 h-5 text-status-info cursor-pointer"
                            />
                          </span>

                          {admin?.role === "super_admin" && (
                            <span
                              title="Delete department"
                              aria-label="Delete department"
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
