import { useState, useEffect } from "react";
import { Search, PlusCircle, Edit, Trash2, X } from "lucide-react";
import { useParams } from "react-router-dom";
import type { DeviceResult } from "../../../model/devices.interface";
import { getDevices } from "../../../store/deviceSlice";
import { useAppDispatch } from "../../../store/store";
import { getOrganizations } from "../../../store/organizationSlice";
import type { OrganizationResult } from "../../../model/organizations.interface";
import type { ProjectResult } from "../../../model/project.interface";
import { getAllProjects } from "../../../store/projectSlice";
import { fromatDateWithTime } from "../../utils/utils";
import AddUpdateDevice from "./AddUpdateDevice";

const Devices = () => {
  const { organization_id, project_id } = useParams<{
    organization_id: string;
    project_id: string;
  }>();

  const [devices, setDevices] = useState<DeviceResult[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<DeviceResult[]>([]);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isEditDeviceOpen, setIsEditDeviceOpen] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState(
    organization_id || "all"
  );
  const [selectedProject, setSelectedProject] = useState(project_id || "all");
  const [organization, setOrganization] = useState<OrganizationResult[]>([]);
  const [project, setProject] = useState<ProjectResult[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);

  const dispatch = useAppDispatch();

  const getOrganization = async () => {
    await dispatch(getOrganizations())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setOrganization(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getProject = async () => {
    await dispatch(getAllProjects())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setProject(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getOrganization();
    getProject();
    dispatch(getDevices())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setDevices(res.data);
          setFilteredDevices(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Filter devices based on search term, organization, and project
  useEffect(() => {
    let filtered = devices;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (device) =>
          device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (device.imeino &&
            device.imeino.toLowerCase().includes(searchTerm.toLowerCase())) ||
          device.device_status
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          device.devicetypeid.toString().includes(searchTerm) ||
          device.devicefid.toString().includes(searchTerm)
      );
    }

    // Filter by project (if not "all")
    if (selectedProject !== "all") {
      filtered = filtered.filter(
        (device) => device.project_id === parseInt(selectedProject)
      );
    }

    setFilteredDevices(filtered);
  }, [devices, searchTerm, selectedProject]);

  const handleAddDevice = () => {
    setIsAddDeviceOpen(true);
    setProjectId(parseInt(project_id || "0"));
  };

  const handleEditDevice = (deviceId: number, projectId: number) => {
    setEditingDeviceId(deviceId);
    setIsEditDeviceOpen(true);
    setProjectId(projectId);
  };

  const handleDeviceUpdate = () => {
    // Refresh devices after update
    dispatch(getDevices())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setDevices(res.data);
          setFilteredDevices(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

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
              {organization.map((org) => (
                <option key={org.organization_id} value={org.organization_id}>
                  {org.org_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-primary text-text-primary w-54"
            >
              <option value="all">All Project</option>
              {project.map((proj) => (
                <option key={proj.project_id} value={proj.project_id}>
                  {proj.project_name}
                </option>
              ))}
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
          onClick={handleAddDevice}
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
                  key={index}
                  className="border-b border-border-primary bg-primary hover:bg-secondary"
                >
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {device.device_name}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {device.devicetypeid}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {device.devicefid}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        device.device_status === "Online"
                          ? "bg-green-100 text-green-800"
                          : device.device_status === "Offline"
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
                    {device.imeino || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {fromatDateWithTime(device.created_at)}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    {fromatDateWithTime(device.updated_at)}
                  </td>
                  <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          handleEditDevice(device.device_id, device.project_id)
                        }
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
      {isAddDeviceOpen && (
        <AddUpdateDevice
          setShowAddModal={setIsAddDeviceOpen}
          type="add"
          deviceId={0}
          project_id={projectId}
          onUpdateSuccess={handleDeviceUpdate}
        />
      )}

      {isEditDeviceOpen && editingDeviceId && (
        <AddUpdateDevice
          setShowAddModal={setIsEditDeviceOpen}
          type="update"
          deviceId={editingDeviceId}
          project_id={projectId}
          onUpdateSuccess={handleDeviceUpdate}
        />
      )}
    </div>
  );
};

export default Devices;
