import { useState, useEffect } from "react";
import {
  Search,
  PlusCircle,
  Edit,
  // Trash2,
  X,
  Loader2,
  Monitor,
  Home,
  ChevronRight,
  Download,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import type { DeviceResult } from "../../../model/devices.interface";
import {
  getDevices,
  getDeviceByOrganizationIdAndProjectId,
  getDevicesByDeviceType,
} from "../../../store/deviceSlice";
import { useAppDispatch } from "../../../store/store";
import { getOrganizations } from "../../../store/organizationSlice";
import type { OrganizationResult } from "../../../model/organizations.interface";
import type { ProjectResult } from "../../../model/project.interface";
import { getAllProjects } from "../../../store/projectSlice";
import type { DeviceFamilyResult } from "../../../model/device-family.interface";
import { getDeviceByFamilyWise } from "../../../store/deviceSlice";
import { fromatDateWithTime } from "../../utils/utils";
import AddUpdateDevice from "./AddUpdateDevice";
import { Error, Warning } from "../../utils/toast";
import NoDataFound from "../NoDataFound";
import type { DeviceTypeResult } from "../../../model/device-type.interface";
import AddUpdateDepartment from "./AddUpdateDepartment";

const Devices = () => {
  const navigate = useNavigate();
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
  const [deviceFamily, setDeviceFamily] = useState<DeviceFamilyResult[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceTypeResult[]>([]);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const dispatch = useAppDispatch();

  const getOrganization = async () => {
    setIsLoading(true);
    await dispatch(getOrganizations())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setOrganization(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Error("Failed to get organizations");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getProject = async () => {
    setIsLoading(true);
    await dispatch(getAllProjects())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setProject(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Error("Failed to get projects");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getDeviceFamily = async () => {
    setIsLoading(true);
    await dispatch(getDeviceByFamilyWise())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setDeviceFamily(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Error("Failed to get device families");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getDeviceType = async () => {
    await dispatch(getDevicesByDeviceType())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setDeviceType(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Error("Failed to get device types");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getOrganization();
    getProject();
    getDeviceFamily();
    getDeviceType();

    if (organization_id && project_id) {
      setIsLoading(true);
      dispatch(
        getDeviceByOrganizationIdAndProjectId({
          projectId: parseInt(project_id),
          organizationId: parseInt(organization_id),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            setDevices(res.data);
            setFilteredDevices(res.data);
            setSelectedOrganization(organization_id);
            setSelectedProject(project_id);
          }
        })
        .catch((err) => {
          console.log(err);
          Error("Failed to get devices");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(true);
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
          Error("Failed to get devices");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [organization_id, project_id, dispatch]);

  useEffect(() => {
    let filtered = devices;

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
          device.devicefid.toString().includes(searchTerm) ||
          deviceFamily
            .find((df) => df.devicefamilyid === device.devicefid)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedOrganization !== "all") {
      const orgProjectIds = project
        .filter((p) => p.organization_id === parseInt(selectedOrganization))
        .map((p) => p.project_id);

      filtered = filtered.filter((device) =>
        orgProjectIds.includes(device.project_id)
      );
    }

    if (selectedProject !== "all") {
      filtered = filtered.filter(
        (device) => device.project_id === parseInt(selectedProject)
      );
    }

    setFilteredDevices(filtered);
  }, [devices, searchTerm, selectedOrganization, selectedProject, project]);

  const handleAddDevice = () => {
    if (selectedOrganization === "all" || selectedProject === "all") {
      Warning(
        "Please select both organization and project before adding a device"
      );
      return;
    }

    setIsAddDeviceOpen(true);
    setProjectId(parseInt(selectedProject));
  };

  const handleEditDevice = (deviceId: number, projectId: number) => {
    setEditingDeviceId(deviceId);
    setIsEditDeviceOpen(true);
    setProjectId(projectId);
  };

  const handleDeviceUpdate = () => {
    setIsLoading(true);
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
        Error("Failed to update device");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deviceStatus = (status: string) => {
    if (status === "Online" || status === "online") {
      return "bg-green-100 text-status-success";
    } else if (status === "Offline" || status === "offline") {
      return "bg-red-100 text-status-danger";
    } else if (status === "Maintenance" || status === "maintenance") {
      return "bg-yellow-100 text-status-warning";
    } else {
      return "bg-blue-100 text-status-info";
    }
  };

  const handleBackToProjects = () => {
    navigate("/organization/projects");
  };

  const handleBackToOrganizations = () => {
    navigate("/organization");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleAddDepartment = () => {
    setIsAddDepartmentOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pb-5">
      <div className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1 rounded-lg w-fit">
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <ChevronRight className="w-4 h-4 text-text-muted" />

        <button
          onClick={handleBackToOrganizations}
          className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
        >
          <span>Organization</span>
        </button>

        <>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <button
            onClick={handleBackToProjects}
            className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
          >
            <span>Projects</span>
          </button>
        </>

        {selectedProject !== "all" && (
          <>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary font-medium bg-secondary/30 px-2 py-1 rounded">
              {project.find(
                (proj) => proj.project_id === parseInt(selectedProject)
              )?.project_name || "Project"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center w-full gap-4 justify-end flex-wrap">
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
        <div className="flex-shrink-0 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search devices by name, IMEI, status, type, family name, or family ID..."
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
        <button
          onClick={handleAddDepartment}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Department
        </button>
        <button
          onClick={handleAddDevice}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-14 h-14 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative overflow-auto shadow-sm rounded-lg pb-0 bg-primary flex-1">
          <table className="w-full text-base text-left rtl:text-right text-text-primary">
            <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
              <tr>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Sr No
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Device Name
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Project Name
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Device Family Name
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Device Type ID
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
                  Download
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length > 0 ? (
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
                      {project.find((p) => p.project_id === device?.project_id)
                        ?.project_name ||
                        device?.project_id ||
                        "N/A"}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {deviceFamily.find(
                        (df) => df.devicefamilyid === device?.devicefid
                      )?.name ||
                        device?.devicefid ||
                        "N/A"}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {device?.devicetypeid}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${deviceStatus(
                          device?.device_status
                        )}`}
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
                        <Download className="w-5 h-5 text-status-success cursor-pointer" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Edit
                          onClick={() =>
                            handleEditDevice(
                              device.device_id,
                              device.project_id
                            )
                          }
                          className="w-5 h-5 text-status-info cursor-pointer"
                        />

                        {/* <Trash2
                          onClick={() => {}}
                          className="w-5 h-5 text-status-danger cursor-pointer"
                        /> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-text-primary text-center font-roboto text-sm"
                  >
                    <NoDataFound
                      icon={
                        <Monitor className="w-16 h-16 text-text-muted mx-auto mb-4" />
                      }
                      title={
                        searchTerm || selectedOrganization !== "all"
                          ? "No devices match your search/filter"
                          : selectedOrganization === "all"
                          ? "No devices found"
                          : `No devices found for ${
                              organization.find(
                                (org) =>
                                  org.organization_id === selectedOrganization
                              )?.org_name ||
                              `Organization ${selectedOrganization}`
                            }`
                      }
                      description={
                        searchTerm || selectedOrganization !== "all"
                          ? "Try adjusting your search terms or filter criteria"
                          : selectedOrganization === "all"
                          ? "Add your first device to get started"
                          : `Add your first project for ${
                              organization.find(
                                (org) =>
                                  org.organization_id === selectedOrganization
                              )?.org_name ||
                              `Organization ${selectedOrganization}`
                            } to get started`
                      }
                      buttonText={
                        searchTerm || selectedOrganization !== "all"
                          ? "Clear Search"
                          : "Add Device"
                      }
                      buttonOnClick={() => {
                        if (searchTerm || selectedOrganization !== "all") {
                          setSearchTerm("");
                          setSelectedOrganization("all");
                        } else {
                          handleAddDevice();
                        }
                      }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isAddDeviceOpen && (
        <AddUpdateDevice
          setShowAddModal={setIsAddDeviceOpen}
          type="add"
          deviceId={0}
          project_id={projectId}
          onUpdateSuccess={handleDeviceUpdate}
          familyData={deviceFamily}
          typeData={deviceType}
        />
      )}

      {isEditDeviceOpen && editingDeviceId && (
        <AddUpdateDevice
          setShowAddModal={setIsEditDeviceOpen}
          type="update"
          deviceId={editingDeviceId}
          project_id={projectId}
          onUpdateSuccess={handleDeviceUpdate}
          familyData={deviceFamily}
          typeData={deviceType}
        />
      )}

      {isAddDepartmentOpen && (
        <AddUpdateDepartment
          setShowAddModal={setIsAddDepartmentOpen}
          type="add"
          onUpdateSuccess={() => {
            setIsAddDepartmentOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Devices;
