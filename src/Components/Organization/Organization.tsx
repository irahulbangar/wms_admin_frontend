import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  PlusCircle,
  Building2,
  SquarePen,
  X,
  Loader2,
  Eye,
  Trash2,
} from "lucide-react";
import NoDataFound from "../NoDataFound";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  deleteOrganization,
  getOrganizations,
  setOrganizations,
} from "../../../store/organizationSlice";
import type { OrganizationResult } from "../../../model/organizations.interface";
import AddUpdateOrganization from "./AddUpdateOrganization";
import DeletePopup from "./DeletePopup";
import { Success, Error } from "../../utils/toast";
import { fromatDateWithTime, handleStatus } from "../../utils/utils";
import Pagination from "../Pagination";

const Organization = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddModalType, setShowAddModalType] = useState<"add" | "update">(
    "add"
  );
  const [organizationId, setOrganizationId] = useState<string>("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] =
    useState<OrganizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { organizations } = useAppSelector((state) => state.organization);
  const dispatch = useAppDispatch();
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    OrganizationResult[]
  >([]);
  const { admin } = useAppSelector((state) => state.admin);
  const [organizationTitle, setOrganizationTitle] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalItems = filteredOrganizations.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOrganizations = filteredOrganizations.slice(
    startIndex,
    endIndex
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const refreshOrganizations = () => {
    if (isLoading) return;
    setIsLoading(true);
    dispatch(getOrganizations())
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
  };

  const filterOrganizations = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredOrganizations(organizations);
      return;
    }

    const filtered = organizations.filter((organization) => {
      const searchLower = searchTerm.toLowerCase();

      return (
        organization.organization_name?.toLowerCase().includes(searchLower) ||
        organization.contact_person?.toLowerCase().includes(searchLower) ||
        organization.contact_number?.toLowerCase().includes(searchLower) ||
        organization.email?.toLowerCase().includes(searchLower) ||
        organization.note?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredOrganizations(filtered);
  };

  useEffect(() => {
    setFilteredOrganizations(organizations);
  }, [organizations]);

  useEffect(() => {
    if (organizations.length === 0) {
      refreshOrganizations();
    }
  }, []);

  const handleEditOrganization = (id: string) => {
    setShowAddModal(true);
    setShowAddModalType("update");
    setOrganizationId(id);
  };

  const handleConfirmDelete = async () => {
    if (!organizationToDelete || isLoading) return;
    setIsLoading(true);

    await dispatch(
      deleteOrganization(organizationToDelete.organization_id.toString())
    )
      .unwrap()
      .then((res) => {
        if (res.success) {
          Success(res.message);
          refreshOrganizations();
          setShowDeletePopup(false);
          setOrganizationToDelete(null);
        } else {
          Error(res.message || "Failed to delete organization");
        }
      })
      .catch((err) => {
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDeletePopupClose = () => {
    setShowDeletePopup(false);
    setOrganizationToDelete(null);
  };

  const handleModalClose = () => {
    const isAdd = showAddModalType === "add";
    setShowAddModal(false);
    setShowAddModalType("add");
    setOrganizationId("");
    if (isAdd && !isLoading) {
      refreshOrganizations();
    }
  };

  const handleOrganizationUpdate = (updatedData: {
    success: boolean;
    data?: Record<string, unknown>;
  }) => {
    if (updatedData && updatedData.success && updatedData.data) {
      const data = updatedData.data;
      organizations.map((org) =>
        org.organization_id === parseInt(organizationId)
          ? {
              ...org,
              organization_name:
                (data.organization_name as string) || org.organization_name,
              address: (data.address as string) || org.address,
              contact_person:
                (data.contact_person as string) || org.contact_person,
              contact_number:
                (data.contact_number as string) || org.contact_number,
              email: (data.email as string) || org.email,
              note: (data.note as string) || org.note,
              status: (data.status as string) || org.status,
              updated_at: new Date().toISOString(),
            }
          : org
      );
    }
    setShowAddModal(false);
    setShowAddModalType("add");
    setOrganizationId("");
  };

  const handleViewPlants = (organizationId: string) => {
    navigate(`/organization/plants/${organizationId}`);
  };

  const handleDeleteOrganization = (organizationId: string) => {
    setShowDeletePopup(true);
    setOrganizationToDelete(
      organizations.find(
        (org) => org.organization_id.toString() === organizationId
      ) || null
    );
    setOrganizationTitle(
      organizations.find(
        (org) => org.organization_id.toString() === organizationId
      )?.organization_name || ""
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-start md:items-center md:justify-end justify-center w-full md:gap-4 gap-2 md:flex-row flex-col sticky top-0">
        <div className="flex items-center flex-col md:flex-row gap-4 w-full md:w-auto mt-1">
          <div className="relative md:w-92 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                filterOrganizations(value);
              }}
              className="md:w-92 w-full pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilteredOrganizations(organizations);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setShowAddModalType("add");
              setOrganizationId("");
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add Organization
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative bg-primary rounded-lg shadow-sm overflow-hidden h-full">
          <div className="overflow-auto h-[calc(100vh-245px)]">
            <table className="w-full text-sm text-left rtl:text-right text-text-primary">
              <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Sr No
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Organization Name
                  </th>
                  <th className="px-6 py-3 text-text-primary text-center text-base font-roboto font-medium font-roboto whitespace-nowrap">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-text-primary text-center text-base font-roboto font-medium font-roboto whitespace-nowrap">
                    Contact Number
                  </th>
                  <th className="px-6 py-3 text-text-primary text-center text-base font-roboto font-medium font-roboto">
                    Email
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Address
                  </th>
                  <th className="px-6 py-3 text-text-primary text-center text-base font-roboto font-medium font-roboto">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-text-primary text-center text-base font-roboto font-medium font-roboto">
                    Status
                  </th>
                  <th className="px-6 py-3 text-text-primary text-center text-base font-roboto font-medium font-roboto">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-text-primary text-center text-base font-roboto font-medium font-roboto">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrganizations?.length > 0 ? (
                  paginatedOrganizations?.map((organization, index) => (
                    <tr
                      key={organization?.organization_id}
                      className="bg-primary border-b border-border-primary hover:bg-secondary"
                    >
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                        {organization?.organization_name || "-"}
                      </td>
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                        {organization?.contact_person || "-"}
                      </td>
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                        {organization?.contact_number || "-"}
                      </td>
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                        {organization?.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                        {organization?.address || "-"}
                      </td>
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                        {organization?.note || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${handleStatus(
                            organization?.status
                          )}`}
                        >
                          {organization?.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                        {fromatDateWithTime(organization?.created_at) || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                        <div className="flex items-center gap-3 justify-center">
                          <Eye
                            onClick={() =>
                              handleViewPlants(
                                organization?.organization_id.toString()
                              )
                            }
                            className="w-5 h-5 text-fuchsia-500 cursor-pointer"
                          />

                          <SquarePen
                            onClick={() =>
                              handleEditOrganization(
                                organization?.organization_id.toString()
                              )
                            }
                            className="w-5 h-5 text-status-info cursor-pointer"
                          />

                          {admin?.role === "super_admin" && (
                            <Trash2
                              className="w-5 h-5 text-status-danger cursor-pointer"
                              onClick={() =>
                                handleDeleteOrganization(
                                  organization?.organization_id.toString()
                                )
                              }
                            />
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
                          <Building2 className="w-16 h-16 text-text-muted mx-auto mb-4" />
                        }
                        title={
                          searchTerm
                            ? "No organizations found"
                            : "No organizations found"
                        }
                        description={
                          searchTerm
                            ? `No organizations match "${searchTerm}". Try a different search term.`
                            : "Add your first organization to get started"
                        }
                        buttonText={
                          searchTerm ? "Clear Search" : "Add Organization"
                        }
                        buttonOnClick={() => {
                          if (searchTerm) {
                            setSearchTerm("");
                            setFilteredOrganizations(organizations);
                          } else {
                            setShowAddModal(true);
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
            selectedRows={totalItems}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      )}

      {showDeletePopup && organizationToDelete && (
        <DeletePopup
          isOpen={showDeletePopup}
          onClose={handleDeletePopupClose}
          onConfirm={handleConfirmDelete}
          organization={organizationToDelete}
          title={organizationTitle}
        />
      )}

      {showAddModal && (
        <AddUpdateOrganization
          setShowAddModal={handleModalClose}
          type={showAddModalType}
          organizationId={organizationId}
          onUpdateSuccess={
            showAddModalType === "update" ? handleOrganizationUpdate : undefined
          }
          refreshOrganizations={refreshOrganizations}
        />
      )}
    </div>
  );
};

export default Organization;
