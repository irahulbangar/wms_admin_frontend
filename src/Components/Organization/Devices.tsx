import { useState, useEffect } from "react";
import { Search, PlusCircle, Edit, Trash2, X } from "lucide-react";
import { useParams } from "react-router-dom";
import AddUpdateDevice from "./AddUpdateDevice";

const Devices = () => {
  const { organization_id, project_id } = useParams<{
    organization_id: string;
    project_id: string;
  }>();

  const [devices, setDevices] = useState<any[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<any[]>([]);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isEditDeviceOpen, setIsEditDeviceOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState(
    organization_id || "all"
  );
  const [selectedProject, setSelectedProject] = useState(project_id || "all");
  useEffect(() => {
    const mockDevices: any[] = [
      {
        id: 1,
        project_id: parseInt(project_id || "1"),
        deviceFId: 1,
        imeiNo: "123456789012",
        deviceTypeId: 1,
        device_name: "GPS Tracker 001",
        device_status: "Active",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      },
      {
        id: 2,
        project_id: parseInt(project_id || "1"),
        deviceFId: 2,
        imeiNo: "987654321098",
        deviceTypeId: 2,
        device_name: "Temperature Sensor 001",
        device_status: "Active",
        created_at: "2024-01-14T09:00:00Z",
        updated_at: "2024-01-14T09:00:00Z",
      },
      {
        id: 3,
        project_id: parseInt(project_id || "1"),
        deviceFId: 3,
        imeiNo: "555666777888",
        deviceTypeId: 3,
        device_name: "Security Camera 001",
        device_status: "Maintenance",
        created_at: "2024-01-13T08:00:00Z",
        updated_at: "2024-01-13T08:00:00Z",
      },
      {
        id: 4,
        project_id: parseInt(project_id || "1"),
        deviceFId: 1,
        imeiNo: "111222333444",
        deviceTypeId: 4,
        device_name: "RFID Scanner 001",
        device_status: "Inactive",
        created_at: "2024-01-12T07:00:00Z",
        updated_at: "2024-01-12T07:00:00Z",
      },
      {
        id: 5,
        project_id: parseInt(project_id || "1"),
        deviceFId: 2,
        imeiNo: "999888777666",
        deviceTypeId: 1,
        device_name: "GPS Tracker 002",
        device_status: "Offline",
        created_at: "2024-01-11T06:00:00Z",
        updated_at: "2024-01-11T06:00:00Z",
      },
    ];
    setDevices(mockDevices);
    setFilteredDevices(mockDevices);
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-5">
      <div className="flex items-center w-full">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary font-roboto">
            Devices
          </h1>
          {searchTerm && (
            <p className="text-sm text-text-secondary mt-1">
              {filteredDevices.length} of {devices.length} devices found
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <select
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              className="px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-primary text-text-primary w-54"
            >
              <option value="all">All Organization</option>
              <option value="1">Organization 1</option>
              <option value="2">Organization 2</option>
              <option value="3">Organization 3</option>
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-primary text-text-primary w-54"
            >
              <option value="all">All Project</option>
              <option value="1">Project 1</option>
              <option value="2">Project 2</option>
              <option value="3">Project 3</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search devices by name, IMEI, status, type, or family..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-text-primary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-success font-roboto"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilteredDevices(devices);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsAddDeviceOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Device
        </button>
      </div>

      <div className="relative overflow-auto shadow-sm rounded-lg pb-0 bg-primary flex-1">
        <table className="w-full text-base text-left rtl:text-right text-text-primary">
          <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary">
            <tr>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Sr No
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Device Name
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Device Type
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Device Family
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Device Status
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                IMEI Number
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Created At
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Updated At
              </th>
              <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-8 text-center text-text-muted font-roboto"
                >
                  {searchTerm ? (
                    <div className="flex flex-col items-center gap-2">
                      <p>No devices found matching "{searchTerm}"</p>
                      <p className="text-sm text-text-secondary">
                        Try searching by device name, IMEI, status, type, or
                        family
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilteredDevices(devices);
                        }}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    "No devices found"
                  )}
                </td>
              </tr>
            ) : (
              filteredDevices.map((device, index) => (
                <tr
                  key={device.id}
                  className="border-b border-border-primary bg-primary hover:bg-secondary"
                >
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {device.device_name}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {device.deviceTypeId}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {device.deviceFId}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        device.device_status === "Active"
                          ? "bg-green-100 text-green-800"
                          : device.device_status === "Inactive"
                          ? "bg-red-100 text-red-800"
                          : device.device_status === "Maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {device.device_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {device.imeiNo || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {device.created_at}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {device.updated_at}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setIsEditDeviceOpen(true)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit Device"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {}}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Device"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Device Popup */}
      <AddUpdateDevice
        isOpen={isAddDeviceOpen}
        onClose={() => setIsAddDeviceOpen(false)}
        onSubmit={() => {}}
        project_id={parseInt(project_id || "1")}
      />

      {/* Edit Device Popup */}
      <AddUpdateDevice
        isOpen={isEditDeviceOpen}
        onClose={() => {
          setIsEditDeviceOpen(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice || undefined}
        isEdit={true}
        onSubmit={() => {}}
        project_id={parseInt(project_id || "1")}
      />
    </div>
  );
};

export default Devices;
