import { Search, PlusCircle, User, SquarePen, Trash2 } from "lucide-react";
import NoDataFound from "./NoDataFound";
import { useAppDispatch } from "../../store/store";
import type {
  AdminUsers,
  AdminUsersResponse,
} from "../../model/admin-users.interface";
import { useEffect, useRef, useState } from "react";
import { getAllUsers } from "../../store/adminSlice";
import { Error } from "../utils/toast";
import Loader from "./Loader";
import { fromatDateWithTime } from "../utils/utils";

const Users = () => {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState<AdminUsers[]>([]);
  const [loading, setLoading] = useState(false);
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;
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
    console.log(id);
  };

  const handleDeleteUser = (id: string) => {
    console.log(id);
  };

  return (
    <div className="flex flex-col gap-4 h-full pb-5 relative">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex items-center w-full">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary font-roboto">
                Admin Users
              </h1>
              <p className="text-text-secondary font-roboto">
                Manage your admin users
              </p>
            </div>
            <div className="flex items-center gap-4 px-4 rounded-lg flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 text-text-primary bg-primary font-roboto border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto">
              <PlusCircle className="w-4 h-4" />
              Add User
            </button>
          </div>

          <div className="relative overflow-auto shadow-sm rounded-lg pb-0 bg-primary flex-1">
            <table className="w-full text-sm text-left rtl:text-right text-text-primary">
              <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary">
                <tr>
                  <th
                    scope="col"
                    className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm"
                  >
                    Sr No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-text-primary text-center font-roboto text-sm"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-text-primary text-center font-roboto text-sm"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-text-primary text-center font-roboto text-sm"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-text-primary text-center font-roboto text-sm"
                  >
                    Created At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-text-primary text-center font-roboto text-sm"
                  >
                    Updated At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-text-primary text-center font-roboto text-sm"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="bg-primary border-b border-border-primary hover:bg-secondary"
                    >
                      <td className="w-4 p-4 text-center font-roboto text-text-secondary text-sm">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-roboto text-center text-text-secondary text-sm">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 font-roboto text-center text-text-secondary text-sm">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 font-roboto text-center text-text-secondary text-sm">
                        {user.role}
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
                            onClick={() => handleEditUser(user.id)}
                            className="w-5 h-5 text-status-info cursor-pointer"
                          />
                          <Trash2
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-5 h-5 text-status-danger cursor-pointer"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center font-roboto text-text-secondary text-sm"
                    >
                      <NoDataFound
                        icon={
                          <User className="w-16 h-16 text-text-muted mx-auto mb-4" />
                        }
                        title="No users found"
                        description="Add your first user to get started"
                        buttonText="Add User"
                        buttonOnClick={() => {}}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Users;
