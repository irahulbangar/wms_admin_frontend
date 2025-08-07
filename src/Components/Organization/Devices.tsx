import { Search, Filter, Monitor, PlusCircle } from "lucide-react";

const Devices = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center w-full">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-theme-primary">Devices</h1>
          <p className="text-theme-muted">Manage your organization's devices</p>
        </div>
        <div className="flex items-center gap-4 p-4 bg-theme-primary rounded-lg flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Search devices..."
              className="w-full pl-10 pr-4 py-2 text-theme-secondary bg-theme-primary border border-theme-secondary dark:border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-theme-secondary bg-theme-primary border border-theme-secondary dark:border-slate-300 rounded-lg hover:bg-theme-secondary transition-all duration-200">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
          <PlusCircle className="w-4 h-4" />
          Add Device
        </button>
      </div>

      <div className="text-center py-12">
        <Monitor className="w-16 h-16 text-theme-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-theme-primary mb-2">No devices found</h3>
        <p className="text-theme-muted mb-4">Add your first device to get started</p>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
          Add Device
        </button>
      </div>
    </div>
  );
};

export default Devices;
