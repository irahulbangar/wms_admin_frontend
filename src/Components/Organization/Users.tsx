import { Search, Filter, PlusCircle, User } from "lucide-react";

const Users = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center w-full">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">Organization Users</h1>
          <p className="text-text-secondary">Manage your organization's users</p>
        </div>
        {/* Search and Filter */}
      <div className="flex items-center gap-4 p-4 bg-primary rounded-lg flex-1">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-secondary dark:border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
          <button className="flex items-center gap-2 px-4 py-2 text-text-secondary bg-primary border border-border-secondary dark:border-slate-300 rounded-lg hover:bg-theme-sendary transition-all duration-200">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
          <PlusCircle className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Empty State (uncomment if needed) */}
      <div className="text-center py-12">
        <User className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">No users found</h3>
        <p className="text-text-muted mb-4">Add your first user to get started</p>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
          Add User
        </button>
      </div>
     
    </div>
  );
};

export default Users;
