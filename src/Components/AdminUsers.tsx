import {
  Search,
  PlusCircle,
  User,
  SquarePen,
  Trash2,
  Loader2,
} from "lucide-react";
import NoDataFound from "./NoDataFound";
import AddUpdateAdmin from "./AddUpdateAdmin";
import DeleteAdminPopup from "./DeleteAdminPopup";
import { useAppDispatch, useAppSelector } from "../../store/store";
import type {
  AdminUsers,
  AdminUsersResponse,
} from "../../model/admin-users.interface";
import { useEffect, useState } from "react";
import { getAllUsers, deleteAdminUser } from "../../store/adminSlice";
import { Error, Success } from "../utils/toast";
import Loader from "./Loader";
import { fromatDateWithTime, handleStatus } from "../utils/utils";
import Pagination from "./Pagination";

const Users = () => {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState<AdminUsers[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [type, setType] = useState<string>("add");
  const { admin } = useAppSelector((state) => state.admin);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] =
    useState<AdminUsers | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  useEffect(() => {
    setLoading(true);
    dispatch(getAllUsers())
      .unwrap()
      .then((res: AdminUsersResponse) => {
        if (res.success) {
          setUsers(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleEditUser = (id: string) => {
    setSelectedAdminId(id);
    setType("update");
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    const userToDelete = users.find((user) => user.admin_id === id);
    if (userToDelete) {
      setSelectedUserForDelete(userToDelete);
      setShowDeletePopup(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;

    setIsDeleting(true);
    try {
      const result = await dispatch(
        deleteAdminUser(selectedUserForDelete.admin_id)
      ).unwrap();
      if (result.success) {
        Success("Admin user deleted successfully");
        setLoading(true);
        await dispatch(getAllUsers())
          .unwrap()
          .then((res: AdminUsersResponse) => {
            if (res.success) {
              setUsers(res.data);
            }
          });
      }
    } catch (err: any) {
      console.log(err);
      Error(err.message || "Failed to delete admin user");
    } finally {
      setIsDeleting(false);
      setShowDeletePopup(false);
      setSelectedUserForDelete(null);
      setLoading(false);
    }
  };

  const handleCloseDeletePopup = () => {
    setShowDeletePopup(false);
    setSelectedUserForDelete(null);
  };

  const handleAddUser = () => {
    setSelectedAdminId(null);
    setType("add");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setType("add");
    setIsModalOpen(false);
    setSelectedAdminId(null);
  };

  const handleModalSuccess = () => {
    setLoading(true);
    dispatch(getAllUsers())
      .unwrap()
      .then((res: AdminUsersResponse) => {
        if (res.success) {
          setUsers(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col gap-4 h-full relative">
      <div className="flex items-center md:justify-end justify-center gap-4 w-full md:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            className="md:w-96 w-50 pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto"
        >
          <PlusCircle className="w-4 h-4" />
          Add User
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-14 h-14 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative bg-primary rounded-lg shadow-sm overflow-hidden h-full">
          <div className="overflow-auto h-[calc(100vh-245px)]">
            <table className="w-full text-sm text-left rtl:text-right text-text-primary">
              <thead className="text-xs text-text-primary uppercase border-b border-border-primary sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Sr No
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Name
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Email
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Phone
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Role
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Status
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Created At
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Updated At
                  </th>
                  <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers?.length > 0 ? (
                  paginatedUsers?.map((user, index) => (
                    <tr
                      key={user?.admin_id}
                      className="border-b border-border-primary hover:bg-secondary transition-colors"
                    >
                      <td className="px-6 py-4 text-center font-roboto text-text-primary text-base whitespace-nowrap">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 text-center font-roboto text-text-primary text-base whitespace-nowrap capitalize">
                        {user?.name}
                      </td>
                      <td className="px-6 py-4 text-center font-roboto text-text-primary text-base whitespace-nowrap">
                        {user?.email}
                      </td>
                      <td className="px-6 py-4 text-center font-roboto text-text-primary text-base whitespace-nowrap">
                        {user?.contact_number}
                      </td>
                      <td className="px-6 py-4 text-center font-roboto text-text-primary text-base whitespace-nowrap capitalize">
                        {user?.role === "admin" ? "Admin" : "Super Admin"}
                      </td>
                      <td className="px-6 py-4 text-center font-roboto text-text-primary text-base whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${handleStatus(
                            user?.status
                          )}`}
                        >
                          {user?.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-roboto text-text-primary text-base whitespace-nowrap">
                        {fromatDateWithTime(user?.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center font-roboto text-text-primary text-base whitespace-nowrap">
                        {fromatDateWithTime(user?.updated_at)}
                      </td>
                      <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                        <div className="flex items-center gap-3 justify-center">
                          <SquarePen
                            onClick={() => handleEditUser(user?.admin_id)}
                            className="w-5 h-5 text-status-info cursor-pointer"
                          />
                          {admin?.role === "super_admin" && (
                            <Trash2
                              onClick={() => handleDeleteUser(user?.admin_id)}
                              className="w-5 h-5 text-status-danger cursor-pointer"
                            />
                          )}
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
                        title="No users found"
                        description="Add your first user to get started"
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
            selectedRows={totalItems}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      )}

      <AddUpdateAdmin
        isOpen={isModalOpen}
        onClose={handleModalClose}
        adminId={selectedAdminId}
        onSuccess={handleModalSuccess}
        type={type}
      />

      <DeleteAdminPopup
        isOpen={showDeletePopup}
        onClose={handleCloseDeletePopup}
        onConfirm={handleConfirmDelete}
        adminUser={selectedUserForDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Users;
