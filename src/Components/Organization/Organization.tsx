import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  PlusCircle,
  Building2,
  Trash2,
  SquarePen,
  Check,
  X,
  Loader2,
  Eye,
} from "lucide-react";
import NoDataFound from "../NoDataFound";
import { useAppDispatch } from "../../../store/store";
import {
  getOrganizations,
  deleteOrganization,
} from "../../../store/organizationSlice";
import type { OrganizationResult } from "../../../model/get-organizations.interface";
import AddUpdateOrganization from "./AddUpdateOrganization";
import DeletePopup from "./DeletePopup";
import { Success, Error } from "../../utils/toast";
import { fromatDateWithTime } from "../../utils/utils";

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
  const hasCalledAPI = useRef(false);

  const dispatch = useAppDispatch();
  const [organizations, setOrganizations] = useState<OrganizationResult[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    OrganizationResult[]
  >([]);

  const refreshOrganizations = () => {
    if (isLoading) return;

    setIsLoading(true);
    dispatch(getOrganizations())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setOrganizations(res.data);
        }
      })
      .catch((err) => {
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const initialLoadOrganizations = () => {
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;
    refreshOrganizations();
  };

  const filterOrganizations = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredOrganizations(organizations);
      return;
    }

    const filtered = organizations.filter((organization) => {
      const searchLower = searchTerm.toLowerCase();

      return (
        organization.org_name?.toLowerCase().includes(searchLower) ||
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
    initialLoadOrganizations();
  }, []);

  const handleEditOrganization = (id: string) => {
    setShowAddModal(true);
    setShowAddModalType("update");
    setOrganizationId(id);
  };

  const handleDeleteOrganization = (organization: OrganizationResult) => {
    setOrganizationToDelete(organization);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = async () => {
    if (!organizationToDelete || isLoading) return;
    setIsLoading(true);
    try {
      const result = await dispatch(
        deleteOrganization(organizationToDelete.organization_id)
      ).unwrap();
      if (result.success) {
        Success("Organization deleted successfully");
        refreshOrganizations();
        setShowDeletePopup(false);
        setOrganizationToDelete(null);
      } else {
        Error(result.message || "Failed to delete organization");
      }
    } catch (error) {
      console.log(error);
      Error("Failed to delete organization");
    } finally {
      setIsLoading(false);
    }
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
      setOrganizations((prevOrganizations) =>
        prevOrganizations.map((org) =>
          org.organization_id === organizationId
            ? {
                ...org,
                org_name: (data.org_name as string) || org.org_name,
                address: (data.address as string) || org.address,
                contact_person:
                  (data.contact_person as string) || org.contact_person,
                contact_number:
                  (data.contact_number as string) || org.contact_number,
                email: (data.email as string) || org.email,
                note: (data.note as string) || org.note,
                updated_at: new Date().toISOString(),
              }
            : org
        )
      );
    }
    setShowAddModal(false);
    setShowAddModalType("add");
    setOrganizationId("");
  };

  const handleViewPlants = (organizationId: string) => {
    navigate(`/organization/plants/${organizationId}`);
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-5">
      <div className="flex items-center w-full sticky top-0">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Organizations
          </h1>
          <p className="text-text-secondary">
            Manage your organization's information and settings
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg flex-1">
          <div className="flex-1 relative">
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
              className="w-full pl-10 pr-4 py-2 text-text-primary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Add Organization
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative overflow-auto shadow-sm rounded-lg pb-0 bg-primary flex-1">
          <table className="w-full text-sm text-left rtl:text-right text-text-primary">
            <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary">
              <tr>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Sr No
                </th>
                <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                  Organization Name
                </th>
                <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                  Address
                </th>
                <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                  Contact Person
                </th>
                <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                  Contact Number
                </th>
                <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                  Email
                </th>
                <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                  Notes
                </th>
                <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                  Status
                </th>
                <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                  Created At
                </th>
                <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizations?.length > 0 ? (
                filteredOrganizations?.map((organization, index) => (
                  <tr
                    key={organization?.organization_id}
                    className="bg-primary border-b border-border-primary hover:bg-secondary"
                  >
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {organization?.org_name}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {organization?.address}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {organization?.contact_person}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {organization?.contact_number}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {organization?.email}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {organization?.note}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      <div className="flex items-center gap-2 justify-center cursor-pointer">
                        {organization?.status === "active" ? (
                          <Check className="w-5 h-5 text-status-success" />
                        ) : (
                          <X className="w-5 h-5 text-status-danger" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {fromatDateWithTime(organization?.created_at)}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      <div className="flex items-center gap-3 justify-center">
                        <SquarePen
                          onClick={() =>
                            handleEditOrganization(
                              organization?.organization_id
                            )
                          }
                          className="w-5 h-5 text-status-info cursor-pointer"
                        />
                        <Trash2
                          onClick={() => handleDeleteOrganization(organization)}
                          className="w-5 h-5 text-status-danger cursor-pointer"
                        />

                        <Eye
                          onClick={() =>
                            handleViewPlants(organization?.organization_id)
                          }
                          className="w-5 h-5 text-status-info cursor-pointer"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-text-primary text-center font-roboto text-sm"
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
      )}

      {showDeletePopup && organizationToDelete && (
        <DeletePopup
          isOpen={showDeletePopup}
          onClose={handleDeletePopupClose}
          onConfirm={handleConfirmDelete}
          organization={organizationToDelete}
          isLoading={isLoading}
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
        />
      )}
    </div>
  );
};

export default Organization;
