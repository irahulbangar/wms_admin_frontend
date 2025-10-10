import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  PlusCircle,
  Columns3Cog,
  Eye,
  Trash2,
  Edit,
  Loader2,
  X,
  Home,
  ChevronRight,
  ChevronDown,
  ChartNetwork,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import NoDataFound from "../NoDataFound";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { Error, Success, Warning } from "../../utils/toast";
import { fromatDateWithTime, handleStatus } from "../../utils/utils";
import {
  getOrganizations,
  setOrganizations,
} from "../../../store/organizationSlice";
import AddUpdatePlant from "./AddUpdatePlant";
import Pagination from "../Pagination";
import type { PlantResult } from "../../../model/plant.interface";
import {
  deletePlantById,
  getAllPlants,
  getPlantsByOrganizationId,
  setPlants,
} from "../../../store/plantSlice";

const Plants = () => {
  const { organization_id } = useParams<{ organization_id: string }>();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddModalType, setShowAddModalType] = useState<"add" | "update">(
    "add"
  );
  const [plantId, setPlantId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [filteredPlants, setFilteredPlants] = useState<PlantResult[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>(
    organization_id || "all"
  );
  const dispatch = useAppDispatch();
  const { organizations } = useAppSelector((state) => state.organization);
  const { plants } = useAppSelector((state) => state.plant);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [plantTitle, setPlantTitle] = useState<string | null>(null);
  const [deletePlant, setDeletePlant] = useState<PlantResult | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { admin } = useAppSelector((state) => state.admin);
  const totalItems = useMemo(() => {
    return filteredPlants.length;
  }, [filteredPlants]);

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

  const handlePaginatedPlants = useMemo(() => {
    return filteredPlants.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredPlants, currentPage, rowsPerPage]);

  const handleConfirmDelete = async () => {
    if (deletePlant) {
      setIsLoading(true);
      await dispatch(deletePlantById(deletePlant.plant_id.toString()))
        .unwrap()
        .then((res) => {
          if (res.success) {
            Success("Plant deleted successfully");
            if (selectedOrganizationId === "all") {
              fetchPlants();
            } else {
              getPlantByOrganizationId(selectedOrganizationId);
            }
          }
        })
        .catch((err) => {
          Error(err.message || "Failed to delete plant");
        })
        .finally(() => {
          setIsLoading(false);
        });
      setShowDeletePopup(false);
      setDeletePlant(null);
    }
  };

  const handleCloseDeletePopup = () => {
    setShowDeletePopup(false);
    setDeletePlant(null);
  };

  const handleBackToOrganizations = () => {
    navigate("/organization");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const fetchPlants = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getAllPlants())
      .unwrap()
      .then((res) => {
        if (res.success) {
          dispatch(setPlants(res.data));
        } else {
          Error(res.message || "Failed to fetch plants");
        }
      })
      .catch((err) => {
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const getPlantByOrganizationId = useCallback(
    async (orgId?: string) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const targetOrgId = orgId || organization_id;
        if (!targetOrgId) return;

        await dispatch(getPlantsByOrganizationId(targetOrgId))
          .unwrap()
          .then((res) => {
            if (res.success) {
              dispatch(setPlants(res.data));
            }
          })
          .catch((err) => {
            Error(err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.toString() : String(err);
        Error(errorMessage || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, organization_id]
  );

  const getAllOrganizations = useCallback(async () => {
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
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    setPlants([]);
    setIsLoading(false);
    if (organizations.length === 0) {
      getAllOrganizations();
    }

    if (organization_id) {
      setSelectedOrganizationId(organization_id);
      getPlantByOrganizationId(organization_id);
    } else {
      setSelectedOrganizationId("all");
      if (plants.length === 0) {
        fetchPlants();
      }
    }
  }, [
    organization_id,
    getPlantByOrganizationId,
    fetchPlants,
    getAllOrganizations,
  ]);

  useEffect(() => {
    let filtered = plants;

    if (filterBy !== "all") {
      filtered = filtered.filter((plant) => plant.status === filterBy);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (plant) =>
          plant.plant_name.toLowerCase().includes(searchLower) ||
          plant.address.toLowerCase().includes(searchLower) ||
          plant.status.toLowerCase().includes(searchLower)
      );
    }

    setFilteredPlants(filtered);
  }, [plants, filterBy, searchTerm]);

  useEffect(() => {
    if (selectedOrganizationId === "all") {
      fetchPlants();
    } else if (selectedOrganizationId !== "all") {
      getPlantByOrganizationId(selectedOrganizationId);
    }
  }, [selectedOrganizationId, fetchPlants, getPlantByOrganizationId]);

  const filteredOrganizations = organizations.filter((organization) =>
    organization.organization_name
      .toLowerCase()
      .includes(organizationSearchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".organization-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddPlant = () => {
    if (selectedOrganizationId === "all") {
      Warning("Please select an organization first before adding a plant");
      return;
    }
    setShowAddModalType("add");
    setPlantId("");
    setShowAddModal(true);
  };

  const handleEditPlant = (id: string) => {
    setShowAddModalType("update");
    setPlantId(id);
    setShowAddModal(true);
  };

  const handleDeletePlant = async (id: string) => {
    setShowDeletePopup(true);
    setDeletePlant(
      plants.find((plant) => plant.plant_id.toString() === id) || null
    );
    setPlantTitle(
      plants.find((plant) => plant.plant_id.toString() === id)?.plant_name ||
        null
    );
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowAddModalType("add");
    setPlantId("");
  };

  const handlePlantUpdate = (updatedData: {
    success: boolean;
    data?: Record<string, unknown>;
  }) => {
    if (updatedData.success) {
      handleModalClose();
      if (selectedOrganizationId === "all") {
        fetchPlants();
      } else {
        getPlantByOrganizationId(selectedOrganizationId);
      }
    }
  };

  const handleViewDevices = (plantId: number, organizationId: number) => {
    navigate(`/organization/departments/${organizationId}/${plantId}`);
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

        {selectedOrganizationId !== "all" && (
          <>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary font-medium bg-secondary/30 px-2 py-1 rounded capitalize">
              {organizations.find(
                (org) =>
                  org.organization_id.toString() === selectedOrganizationId
              )?.organization_name || selectedOrganizationId}
            </span>
          </>
        )}
      </div>

      <div className="flex items-start md:items-center md:justify-between justify-center w-full md:gap-4 gap-2 md:flex-row flex-col">
        <div className="flex-shrink-0 md:w-54 w-full relative organization-dropdown">
          <div className="relative">
            <input
              type="text"
              placeholder="Select organization..."
              value={
                selectedOrganizationId === "all"
                  ? "All Organization"
                  : organizations.find(
                      (org) =>
                        org.organization_id.toString() ===
                        selectedOrganizationId
                    )?.organization_name || "Select organization..."
              }
              readOnly
              className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
            <ChevronDown
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary border-b-0 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
              <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    value={organizationSearchTerm}
                    onChange={(e) => setOrganizationSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              <div
                className="px-3 py-1.5 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                onClick={() => {
                  setSelectedOrganizationId("all");
                  setIsDropdownOpen(false);
                  setOrganizationSearchTerm("");
                  fetchPlants();
                }}
              >
                All Organization
              </div>

              {filteredOrganizations.length > 0 ? (
                filteredOrganizations.map((organization, index) => (
                  <div
                    key={index}
                    className="px-3 py-1.5 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                    onClick={() => {
                      setSelectedOrganizationId(
                        organization.organization_id.toString()
                      );
                      setIsDropdownOpen(false);
                      setOrganizationSearchTerm(organization.organization_name);
                      getPlantByOrganizationId(
                        organization.organization_id.toString()
                      );
                    }}
                  >
                    {organization.organization_name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-1.5 text-text-muted text-sm">
                  No organizations found
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-shrink-0 relative md:w-92 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-92 w-full pl-10 pr-4 py-1.5 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
            />
          </div>
          <button
            onClick={handleAddPlant}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add Plant
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-14 h-14 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative bg-primary rounded-lg shadow-sm overflow-hidden h-full">
          <div className="overflow-auto h-[calc(100vh-280px)]">
            <table className={`w-full text-sm text-left rtl:text-right text-text-primary ${handlePaginatedPlants?.length > 0 ? "h-auto" : "h-full"}`}>
              <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Sr No
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Plant Name
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Organization
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Latitude
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Longitude
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Address
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Status
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
                {handlePaginatedPlants.length > 0 ? (
                  handlePaginatedPlants.map((plant, index) => (
                    <tr
                      key={index}
                      className="border-b border-border-primary bg-primary hover:bg-secondary cursor-pointer"
                      onDoubleClick={() =>
                        handleViewDevices(
                          plant?.plant_id,
                          plant?.organization_id
                        )
                      }
                    >
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                        {plant?.plant_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                        {
                          organizations.find(
                            (org) =>
                              org.organization_id.toString() ===
                              plant.organization_id.toString()
                          )?.organization_name
                        }
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                        {plant?.latitude || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                        {plant?.longitude || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                        {plant?.address || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${handleStatus(
                            plant?.status
                          )}`}
                        >
                          {plant?.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                        {fromatDateWithTime(plant?.created_at) || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                        {fromatDateWithTime(plant?.updated_at) || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span title="View devices" aria-label="View devices">
                            <Eye
                              onClick={() =>
                                handleViewDevices(
                                  plant?.plant_id,
                                  plant?.organization_id
                                )
                              }
                              className="w-5 h-5 text-fuchsia-500 cursor-pointer"
                            />
                          </span>

                          <span title="Edit plant" aria-label="Edit plant">
                            <Edit
                              onClick={() =>
                                handleEditPlant(plant?.plant_id.toString())
                              }
                              className="w-5 h-5 text-status-info cursor-pointer"
                            />
                          </span>

                          <span
                            title="Edit diagram"
                            aria-label="Edit diagram"
                            className="inline-flex cursor-pointer"
                            onClick={() =>
                              navigate(`/diagram/${plant?.plant_id}`)
                            }
                          >
                            <ChartNetwork className="w-5 h-5 text-text-primary" />
                          </span>

                          {admin?.role === "super_admin" && (
                            <span
                              title="Delete plant"
                              aria-label="Delete plant"
                            >
                              <Trash2
                                onClick={() =>
                                  handleDeletePlant(plant?.plant_id.toString())
                                }
                                className="w-5 h-5 text-status-danger cursor-pointer"
                              />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-text-primary text-center font-roboto text-sm h-full"
                    >
                      <NoDataFound
                        icon={
                          <Columns3Cog className="w-16 h-16 text-text-muted mx-auto mb-4" />
                        }
                        title={
                          searchTerm || filterBy !== "all"
                            ? "No plants match your search/filter"
                            : selectedOrganizationId === "all"
                            ? "No plants found"
                            : `No plants found for ${
                                organizations.find(
                                  (org) =>
                                    org.organization_id.toString() ===
                                    selectedOrganizationId
                                )?.organization_name ||
                                `Organization ${selectedOrganizationId}`
                              }`
                        }
                        description={
                          searchTerm || filterBy !== "all"
                            ? "Try adjusting your search terms or filter criteria"
                            : selectedOrganizationId === "all"
                            ? "Add your first plant to get started"
                            : `Add your first plant for ${
                                organizations.find(
                                  (org) =>
                                    org.organization_id.toString() ===
                                    selectedOrganizationId
                                )?.organization_name ||
                                `Organization ${selectedOrganizationId}`
                              } to get started`
                        }
                        buttonText={
                          searchTerm || filterBy !== "all"
                            ? "Clear Search"
                            : "Add Plant"
                        }
                        buttonOnClick={() => {
                          if (searchTerm || filterBy !== "all") {
                            setSearchTerm("");
                            setFilterBy("all");
                          } else {
                            handleAddPlant();
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

      {showAddModal && (
        <AddUpdatePlant
          setShowModal={handleModalClose}
          type={showAddModalType}
          plantId={plantId}
          organizationId={
            selectedOrganizationId === "all"
              ? undefined
              : selectedOrganizationId
          }
          onUpdateSuccess={handlePlantUpdate}
          refreshPlants={
            selectedOrganizationId === "all"
              ? fetchPlants
              : () => getPlantByOrganizationId(selectedOrganizationId)
          }
        />
      )}

      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 bg-opacity-50 transition-opacity"
            onClick={handleCloseDeletePopup}
          />
          <div className="relative bg-primary rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
              <h3 className="text-xl font-semibold text-text-primary font-roboto">
                Delete Plant
              </h3>
              <button
                onClick={handleCloseDeletePopup}
                className="text-text-primary hover:text-text-primary/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-text-secondary mb-4 font-roboto">
                Are you sure you want to delete this plant{" "}
                <span className="font-bold">{plantTitle || "N/A"}</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border-primary">
              <button
                onClick={handleCloseDeletePopup}
                className="px-4 py-2 text-text-primary bg-secondary border border-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer font-roboto"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-status-danger hover:bg-status-danger/80 text-white rounded-lg transition-colors flex items-center gap-2 font-roboto"
              >
                <Trash2 className="w-4 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plants;
