import { Search, PlusCircle, User, SquarePen, Trash2, X } from "lucide-react";
import NoDataFound from "../NoDataFound";
import { fromatDateWithTime, userStatus } from "../../utils/utils";
import { useEffect, useState } from "react";
import type {
  ClientUsersResponse,
  ClientUsersResult,
} from "../../../model/client-users.interface";
import { getAllClients, deleteClient } from "../../../store/clientSlice";
import { useAppDispatch } from "../../../store/store";
import AddUpdateUser from "./AddUpdateUser";
import { Error, Success } from "../../utils/toast";

const Users = () => {
  const [users, setUsers] = useState<ClientUsersResult[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ClientUsersResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useAppDispatch();
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientId, setClientId] = useState(0);
  const [modalType, setModalType] = useState<"add" | "update">("add");

  const getClients = () => {
    dispatch(getAllClients())
      .unwrap()
      .then((res: ClientUsersResponse) => {
        if (res.success) {
          setUsers(res.data);
          setFilteredUsers(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err);
      });
  };

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    getClients();
  }, []);

  const handleEditUser = (clientId: number) => {
    setModalType("update");
    setClientId(clientId);
    setShowAddModal(true);
  };

  const handleAddUser = () => {
    setModalType("add");
    setClientId(0);
    setShowAddModal(true);
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteClient(id))
        .unwrap()
        .then((res) => {
          if (res.success) {
            Success("User deleted successfully");
            getClients(); // Refresh the list
          }
        })
        .catch((err) => {
          Error(err);
        });
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setClientId(0);
    getClients(); // Refresh the list after modal closes
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full pb-5">
      <div className="flex items-center w-full">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary font-roboto">
            Organization Users
          </h1>
          <p className="text-text-secondary font-roboto">
            Manage your organization's users
          </p>
        </div>
        <div className="flex items-center gap-4 px-4 rounded-lg flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 text-text-primary bg-primary font-roboto border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto"
        >
          <PlusCircle className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search results count */}
      {searchTerm.trim() && (
        <div className="text-sm text-text-secondary font-roboto">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}

      <div className="relative overflow-auto shadow-sm rounded-lg pb-0 bg-primary flex-1">
        <table className="w-full text-sm text-left rtl:text-right text-text-primary">
          <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
            <tr>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Sr No
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Name
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Email
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Role
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Organization ID
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Status
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Created At
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Updated At
              </th>
              <th className="px-6 py-3 text-text-primary text-center font-roboto text-sm">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr
                  key={user.client_id}
                  className="bg-primary border-b border-border-primary hover:bg-secondary"
                >
                  <td className="w-4 p-4 text-center font-roboto text-text-secondary text-sm">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-roboto text-center text-text-secondary text-sm">
                    {user.client_name}
                  </td>
                  <td className="px-6 py-4 font-roboto text-center text-text-secondary text-sm">
                    {user.client_email}
                  </td>
                  <td className="px-6 py-4 font-roboto text-center text-text-secondary text-sm">
                    {user.role === "org_admin" ? "Admin" : "User"}
                  </td>
                  <td className="px-6 py-4 font-roboto text-center text-text-secondary text-sm">
                    {user?.organization_id}
                  </td>
                  <td className="px-6 py-4 font-roboto text-center text-text-secondary text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${userStatus(
                        user?.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-roboto text-center text-text-secondary text-sm">
                    {fromatDateWithTime(user.created_at)}
                  </td>
                  <td className="px-6 py-4 font-roboto text-center text-text-secondary text-sm">
                    {fromatDateWithTime(user.updated_at)}
                  </td>
                  <td className="px-6 py-4 font-roboto text-sm">
                    <div className="flex items-center gap-3 justify-center">
                      <SquarePen
                        onClick={() => handleEditUser(user.client_id)}
                        className="w-5 h-5 text-status-info cursor-pointer"
                      />
                      <Trash2
                        onClick={() => handleDeleteUser(user.client_id)}
                        className="w-5 h-5 text-status-danger cursor-pointer"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
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

      {showAddModal && (
        <AddUpdateUser
          clientId={clientId}
          setShowAddModal={setShowAddModal}
          type={modalType}
          onClose={handleCloseAddModal}
          organizationId={0} // You can set this to the actual organization ID if needed
        />
      )}
    </div>
  );
};

export default Users;
