import { Search, PlusCircle, Monitor } from "lucide-react";
import NoDataFound from "../NoDataFound";

const Devices = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center w-full">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">Devices</h1>
          <p className="text-text-secondary">
            Manage your organization's devices
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search devices..."
              className="w-full pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer">
          <PlusCircle className="w-4 h-4" />
          Add Device
        </button>
      </div>

      <NoDataFound
        icon={<Monitor className="w-16 h-16 text-text-muted mx-auto mb-4" />}
        title="No devices found"
        description="Add your first device to get started"
        buttonText="Add Device"
        buttonOnClick={() => {}}
      />
    </div>
  );
};

export default Devices;
