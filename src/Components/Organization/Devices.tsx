import { Monitor, Plus, Search, Filter } from "lucide-react";

const Devices = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Devices</h1>
          <p className="text-theme-muted">Manage your organization's devices</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 p-4 bg-theme-secondary rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            placeholder="Search devices..."
            className="w-full pl-10 pr-4 py-2 bg-theme-primary border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-theme-primary border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-theme-secondary transition-all duration-200">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Sample Device Cards */}
        {[1, 2, 3, 4, 5, 6].map((device) => (
          <div
            key={device}
            className="bg-theme-secondary p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary">Device {device}</h3>
                  <p className="text-sm text-theme-muted">ID: DEV-{device.toString().padStart(3, '0')}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                device % 2 === 0 ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-theme-muted">Status:</span>
                <span className={`font-medium ${
                  device % 2 === 0 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {device % 2 === 0 ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-theme-muted">Type:</span>
                <span className="text-theme-primary">Sensor</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-theme-muted">Location:</span>
                <span className="text-theme-primary">Building A</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-theme-muted">Last Updated</span>
                <span className="text-xs text-theme-primary">2 hours ago</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (uncomment if needed) */}
      {/* 
      <div className="text-center py-12">
        <Monitor className="w-16 h-16 text-theme-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-theme-primary mb-2">No devices found</h3>
        <p className="text-theme-muted mb-4">Add your first device to get started</p>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
          Add Device
        </button>
      </div>
      */}
    </div>
  );
};

export default Devices; 