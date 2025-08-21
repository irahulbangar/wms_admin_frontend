import { Search, PlusCircle, User } from "lucide-react";
import NoDataFound from "../NoDataFound";

const Users = () => {
  return (
    <div className="flex flex-col gap-6 w-full h-full pb-5">
      <div className="flex items-center w-full">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary font-roboto">
            Organization Users
          </h1>
          <p className="text-text-secondary font-roboto">
            Manage your organization's users
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 text-text-primary bg-primary font-roboto border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto">
          <PlusCircle className="w-4 h-4" />
          Add User
        </button>
      </div>

      <NoDataFound
        icon={<User className="w-16 h-16 text-text-muted mx-auto mb-4" />}
        title="No users found"
        description="Add your first user to get started"
        buttonText="Add User"
        buttonOnClick={() => {}}
      />
    </div>
  );
};

export default Users;
