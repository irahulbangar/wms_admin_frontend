import {
  Search,
  PlusCircle,
  User,
  SquarePen,
  // Trash2,
  X,
  Loader2,
  ChevronRight,
  Home,
  Building2,
  ChevronDown,
  User2,
} from "lucide-react";
import NoDataFound from "../NoDataFound";
import { fromatDateWithTime, handleStatus } from "../../utils/utils";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type {
  ClientUsersResponse,
  ClientUsersResult,
} from "../../../model/client-users.interface";
import {
  getAllClients,
  getClientsByOrganizationId,
  setClients,
} from "../../../store/clientSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import AddUpdateUser from "./AddUpdateUser";
import { Error } from "../../utils/toast";
import {
  getOrganizations,
  setOrganizations,
} from "../../../store/organizationSlice";
import UserPlants from "./UserPlants";
import Pagination from "../Pagination";

const OrganizationUsers = () => {
  const navigate = useNavigate();
  const [filteredUsers, setFilteredUsers] = useState<ClientUsersResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useAppDispatch();
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientId, setClientId] = useState(0);
  const [modalType, setModalType] = useState<"add" | "update">("add");
  const [organizationId, setOrganizationId] = useState<number>(0);
  const { organizations } = useAppSelector((state) => state.organization);
  const { clients } = useAppSelector((state) => state.client);
  const [isLoading, setIsLoading] = useState(false);
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] =
    useState(false);
  const [organizationClients, setOrganizationClients] = useState<
    ClientUsersResult[]
  >([]);
  const [showUserPlants, setShowUserPlants] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalItems = useMemo(() => {
    return filteredUsers.length;
  }, [filteredUsers]);

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

  const handlePaginatedUsers = useMemo(() => {
    return filteredUsers.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredUsers, currentPage, rowsPerPage]);

  const organizationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        organizationDropdownRef.current &&
        !organizationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOrganizationDropdownOpen(false);
        setOrganizationSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchOrganizationClients = useCallback(async () => {
    if (isLoading || organizationId === 0) return;
    setIsLoading(true);
    try {
      await dispatch(getClientsByOrganizationId(organizationId))
        .unwrap()
        .then((res) => {
          if (res?.data) {
            setOrganizationClients(res.data);
            setFilteredUsers(res.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching organization clients:", err);
          Error(err as string);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (err) {
      console.error("Error fetching organization clients:", err);
      Error(err as string);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, organizationId]);

  useEffect(() => {
    if (organizationId !== 0) {
      fetchOrganizationClients();
    } else {
      setFilteredUsers(clients);
    }
  }, [organizationId, clients, fetchOrganizationClients]);

  useEffect(() => {
    if (organizationId !== 0 && organizationClients.length > 0) {
      setFilteredUsers(organizationClients);
    }
  }, [organizationClients, organizationId]);

  const breadcrumbs = [
    { label: "Home", icon: <Home className="w-4 h-4" />, path: "/home" },
    {
      label: "Organization",
      icon: <Building2 className="w-4 h-4" />,
      path: "/organization",
    },
    {
      label: "Users",
      icon: <User className="w-4 h-4" />,
      path: "/organization/users",
    },
  ];

  const handleBreadcrumbClick = (path: string) => {
    navigate(path);
  };

  const getOrganizationData = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getOrganizations())
      .unwrap()
      .then((res) => {
        dispatch(setOrganizations(res.data));
      })
      .catch((err) => {
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const getClients = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    dispatch(getAllClients())
      .unwrap()
      .then((res: ClientUsersResponse) => {
        if (res.success) {
          dispatch(setClients(res.data));
          setFilteredUsers(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    const dataSource = organizationId === 0 ? clients : organizationClients;

    if (searchTerm.trim() === "") {
      setFilteredUsers(dataSource);
    } else {
      const filtered = dataSource.filter(
        (user) =>
          user.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.organization_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, clients, organizationClients, organizationId]);

  useEffect(() => {
    if (organizations.length === 0 && clients.length === 0) {
      getClients();
      getOrganizationData();
    }
  }, [getClients, getOrganizationData, organizations.length, clients.length]);

  const handleEditUser = (clientId: number, organizationId: number) => {
    setModalType("update");
    setClientId(clientId);
    setOrganizationId(organizationId);
    setShowAddModal(true);
  };

  const handleAddUser = () => {
    setModalType("add");
    setClientId(0);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setClientId(0);
    if (organizationId === 0) {
      getClients();
    } else {
      fetchOrganizationClients();
    }
  };

  const handleUpdateSuccess = (updatedUser: any) => {
    if (organizationId !== 0) {
      setOrganizationClients(prevClients => {
        const updated = prevClients.map(client => 
          client.client_id === updatedUser.client_id ? updatedUser : client
        );
        return updated;
      });
      
      setFilteredUsers(prevFiltered => {
        const updated = prevFiltered.map(client => {
          if (client.client_id === updatedUser.client_id) {
            return updatedUser;
          }
          return client;
        });
        return updated;
      });
    } else {
      setFilteredUsers(prevFiltered => {
        const updated = prevFiltered.map(client => 
          client.client_id === updatedUser.client_id ? updatedUser : client
        );
        return updated;
      });
    }
  };

  const handleViewPlants = (clientId: string, organizationId: string) => {
    setShowUserPlants(true);
    setClientId(parseInt(clientId));
    setOrganizationId(parseInt(organizationId));
  };

  const handleCloseUserPlants = () => {
    setShowUserPlants(false);
    setClientId(0);
    setOrganizationId(0);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit">
        <nav
          className="flex items-center space-x-2 text-sm font-roboto"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center space-x-2">
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-text-muted"
                  aria-hidden="true"
                />
              )}
              <div
                className={`flex items-center space-x-2 transition-colors cursor-pointer px-2 py-1 rounded ${
                  index === breadcrumbs.length - 1
                    ? "text-text-primary font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-overlay/20"
                }`}
                onClick={() => handleBreadcrumbClick(breadcrumb.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleBreadcrumbClick(breadcrumb.path);
                  }
                }}
                aria-label={`Navigate to ${breadcrumb.label}`}
              >
                {breadcrumb.icon}
                <span>{breadcrumb.label}</span>
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-start md:items-center md:justify-between justify-center w-full md:gap-4 gap-2 md:flex-row flex-col">
        <div className="flex items-start flex-col md:items-center md:flex-row gap-4 w-full md:w-auto">
          <div
            className="flex-shrink-0 md:w-54 w-full relative organization-dropdown"
            ref={organizationDropdownRef}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Select organization..."
                value={
                  organizationId === 0
                    ? "All Organization"
                    : organizations.find(
                        (org) => org.organization_id === organizationId
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
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary border-b-0 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
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
                    setOrganizationId(0);
                    setOrganizationSearchTerm("");
                    setIsOrganizationDropdownOpen(false);
                    getClients();
                  }}
                >
                  All Organization
                </div>

                {organizations
                  .filter((org) =>
                    org.organization_name
                      .toLowerCase()
                      .includes(organizationSearchTerm.toLowerCase())
                  )
                  .map((organization, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                      onClick={() => {
                        setOrganizationId(organization.organization_id);
                        setOrganizationSearchTerm(
                          organization.organization_name
                        );
                        setIsOrganizationDropdownOpen(false);
                        fetchOrganizationClients();
                      }}
                    >
                      {organization.organization_name}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search users..."
              className="md:w-80 w-50 pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm.trim() && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 whitespace-nowrap px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto"
          >
            <PlusCircle className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative bg-primary rounded-lg shadow-sm overflow-hidden h-full">
          <div className="overflow-auto h-[calc(100vh-280px)]">
            <table className={`w-full text-sm text-left rtl:text-right text-text-primary ${handlePaginatedUsers?.length > 0 ? "h-auto" : "h-full"}`}>
              <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Sr No
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Name
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Email
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Status
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Updated At
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {handlePaginatedUsers.length > 0 ? (
                  handlePaginatedUsers.map((user, index) => (
                    <tr
                      key={user.client_id}
                      className="bg-primary border-b border-border-primary hover:bg-secondary cursor-pointer"
                      onDoubleClick={() =>
                        handleViewPlants(
                          user.client_id.toString(),
                          user.organization_id.toString()
                        )
                      }
                    >
                      <td className="px-6 py-4 text-center font-roboto text-text-secondary text-base capitalize">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 font-roboto whitespace-nowrap text-text-primary text-base capitalize">
                        {user.client_name}
                      </td>
                      <td className="px-6 py-4 font-roboto whitespace-nowrap text-text-primary text-base">
                        {user.client_email}
                      </td>
                      <td className="px-6 py-4 font-roboto whitespace-nowrap text-text-primary text-base capitalize">
                        {user.client_phone}
                      </td>
                      <td className="px-6 py-4 font-roboto whitespace-nowrap text-text-primary text-base capitalize">
                        {
                          organizations.find(
                            (org) =>
                              org.organization_id.toString() ===
                              user.organization_id.toString()
                          )?.organization_name
                        }
                      </td>
                      <td className="px-6 py-4 font-roboto text-text-primary text-base capitalize">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${handleStatus(
                            user?.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-roboto whitespace-nowrap text-text-primary text-base">
                        {fromatDateWithTime(user.created_at)}
                      </td>
                      <td className="px-6 py-4 font-roboto whitespace-nowrap text-text-primary text-base">
                        {fromatDateWithTime(user.updated_at)}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                        <div className="flex items-center gap-3 justify-center">
                          <span title="Edit user" aria-label="Edit user">
                            <SquarePen
                              onClick={() =>
                                handleEditUser(
                                  user.client_id,
                                  user.organization_id
                                )
                              }
                              className="w-5 h-5 text-status-info cursor-pointer"
                            />
                          </span>
                          <span
                            title="View user plants"
                            aria-label="View user plants"
                          >
                            <User2
                              className="w-5 h-5 text-text-primary cursor-pointer"
                              onClick={() =>
                                handleViewPlants(
                                  user.client_id.toString(),
                                  user.organization_id.toString()
                                )
                              }
                            />
                          </span>
                          {/* <Trash2 className="w-5 h-5 text-status-danger cursor-pointer" /> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center font-roboto text-text-secondary text-sm"
                    >
                      <NoDataFound
                        icon={
                          <User className="w-16 h-16 text-text-muted mx-auto mb-4" />
                        }
                        title={
                          searchTerm.trim()
                            ? "No search results found"
                            : "No users found"
                        }
                        description={
                          searchTerm.trim()
                            ? "Try adjusting your search terms"
                            : "Add your first user to get started"
                        }
                        buttonText="Add User"
                        buttonOnClick={handleAddUser}
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
        <AddUpdateUser
          clientId={clientId}
          setShowAddModal={setShowAddModal}
          type={modalType}
          onClose={handleCloseAddModal}
          onUpdateSuccess={handleUpdateSuccess}
          organizationId={organizationId as number}
          organizationData={organizations}
        />
      )}

      {showUserPlants && (
        <UserPlants
          onClose={handleCloseUserPlants}
          userId={clientId}
          organizationId={organizationId.toString()}
        />
      )}
    </div>
  );
};

export default OrganizationUsers;
