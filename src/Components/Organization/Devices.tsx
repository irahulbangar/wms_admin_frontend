import { useState, useEffect, useCallback, useRef, Fragment } from "react";
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
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import type { DeviceResult } from "../../../model/devices.interface";
import {
  getAllDevices,
  getDeviceByOrganizationIdAndProjectId,
  setDevices,
} from "../../../store/deviceSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  getOrganizations,
  setOrganizations,
} from "../../../store/organizationSlice";
import { getAllProjects, setProjects } from "../../../store/projectSlice";
import type { DeviceFamilyResult } from "../../../model/device-family.interface";
import { fromatDateWithTime } from "../../utils/utils";
import AddUpdateDevice from "./AddUpdateDevice";
import { Error, Warning } from "../../utils/toast";
import NoDataFound from "../NoDataFound";
import type { DeviceTypeResult } from "../../../model/device-type.interface";
import type { DepartmentResult } from "../../../model/department.interface";
import { getDepartments } from "../../../store/departmentSlice";
import AddUpdateDepartment from "./AddUpdateDepartment";
import { getDeviceFamiliy } from "../../../store/deviceFamilySlice";
import { getDeviceTypes } from "../../../store/deviceTypeSlice";

const Devices = () => {
  const navigate = useNavigate();
  const { project_id, organization_id } = useParams<{
    project_id: string;
    organization_id: string;
  }>();

  const [filteredDevices, setFilteredDevices] = useState<DeviceResult[]>([]);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isEditDeviceOpen, setIsEditDeviceOpen] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState(
    organization_id || "all"
  );
  const [selectedProject, setSelectedProject] = useState(project_id || "all");
  const { organizations } = useAppSelector((state) => state.organization);
  const { projects } = useAppSelector((state) => state.project);
  const { devices } = useAppSelector((state) => state.device);
  const [deviceFamily, setDeviceFamily] = useState<DeviceFamilyResult[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceTypeResult[]>([]);
  const dispatch = useAppDispatch();
  const [departmentData, setDepartmentData] = useState<DepartmentResult[]>([]);
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [collapsedDepartments, setCollapsedDepartments] = useState<Set<string>>(
    new Set()
  );
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] =
    useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");

  const organizationDropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        organizationDropdownRef.current &&
        !organizationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOrganizationDropdownOpen(false);
        setOrganizationSearchTerm("");
      }
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
        setProjectSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDepartment = useCallback(async () => {
    setIsLoading(true);
    await dispatch(getDepartments())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setDepartmentData(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        Error("Failed to get departments");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const getOrganization = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getOrganizations())
      .unwrap()
      .then((res) => {
        if (res.success) {
          dispatch(setOrganizations(res.data));
        }
      })
      .catch((err) => {
        console.log(err);
        Error("Failed to get organizations");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const fetchProjects = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getAllProjects())
      .unwrap()
      .then((res) => {
        if (res.success) {
          dispatch(setProjects(res.data));
        }
      })
      .catch((err) => {
        console.log(err);
        Error("Failed to get projects");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const getDeviceFamily = useCallback(async () => {
    setIsLoading(true);
    await dispatch(getDeviceFamiliy())
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
  }, [dispatch]);

  const getDeviceType = useCallback(async () => {
    await dispatch(getDeviceTypes())
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
  }, [dispatch]);

  useEffect(() => {
    if (organizations.length === 0 || projects.length === 0) {
      getOrganization();
      fetchProjects();
    }
    getDeviceFamily();
    getDeviceType();
    getDepartment();

    if (organization_id && project_id) {
      setIsLoading(true);
      setSelectedOrganization(organization_id);
      setSelectedProject(project_id);

      dispatch(
        getDeviceByOrganizationIdAndProjectId({
          projectId: parseInt(project_id),
          organizationId: parseInt(organization_id),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setDevices(res?.data));
            setFilteredDevices(res?.data);
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
      setSelectedOrganization("all");
      setSelectedProject("all");

      if (devices.length === 0) {
        setIsLoading(true);
        dispatch(getAllDevices())
          .unwrap()
          .then((res) => {
            if (res.success) {
              dispatch(setDevices(res?.data));
              setFilteredDevices(res?.data);
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
    }
  }, [
    organization_id,
    project_id,
    dispatch,
    getOrganization,
    fetchProjects,
    getDeviceFamily,
    getDeviceType,
    getDepartment,
  ]);

  useEffect(() => {
    if (organization_id && project_id) {
      return;
    }

    if (selectedOrganization === "all" && selectedProject === "all") {
      if (devices.length === 0) {
        dispatch(getAllDevices())
          .unwrap()
          .then((res) => {
            if (res.success) {
              dispatch(setDevices(res?.data));
              setFilteredDevices(res?.data);
            }
          })
          .catch((err) => {
            console.log(err);
            Error("Failed to get devices");
          });
      }
    } else if (selectedOrganization !== "all" && selectedProject !== "all") {
      setIsLoading(true);
      dispatch(
        getDeviceByOrganizationIdAndProjectId({
          projectId: parseInt(selectedProject),
          organizationId: parseInt(selectedOrganization),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setDevices(res?.data));
            setFilteredDevices(res?.data);
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
  }, [
    selectedOrganization,
    selectedProject,
    dispatch,
    devices.length,
    organization_id,
    project_id,
  ]);

  useEffect(() => {
    let filtered = devices;

    if (searchTerm) {
      filtered = filtered.filter(
        (device: DeviceResult) =>
          device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (device.hwid &&
            device.hwid.toLowerCase().includes(searchTerm.toLowerCase())) ||
          device.device_status
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          device.device_type_id.toString().includes(searchTerm) ||
          device.device_family_id.toString().includes(searchTerm) ||
          deviceFamily
            .find((df) => df.device_family_id === device.device_family_id)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedOrganization !== "all") {
      const orgProjectIds = projects
        .filter((p) => p.organization_id === parseInt(selectedOrganization))
        .map((p) => p.project_id);

      filtered = filtered.filter((device: DeviceResult) =>
        orgProjectIds.includes(device.project_id)
      );
    }

    if (selectedProject !== "all") {
      filtered = filtered.filter(
        (device: DeviceResult) =>
          device.project_id === parseInt(selectedProject)
      );
    }

    setFilteredDevices(filtered);
  }, [
    devices,
    searchTerm,
    selectedOrganization,
    selectedProject,
    projects,
    deviceFamily,
  ]);

  const filteredOrganizations = organizations.filter((org) =>
    org.organization_name
      .toLowerCase()
      .includes(organizationSearchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter((proj) =>
    proj.project_name.toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".organization-dropdown")) {
        setIsOrganizationDropdownOpen(false);
      }
      if (!target.closest(".project-dropdown")) {
        setIsProjectDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleEditDevice = (
    deviceId: number,
    projectId: number,
    departmentId: number
  ) => {
    setEditingDeviceId(deviceId);
    setIsEditDeviceOpen(true);
    setProjectId(projectId);
    setDepartmentId(departmentId);
  };

  const handleDeviceUpdate = (result?: {
    data?: {
      refreshDepartments?: boolean;
      refreshDeviceFamilies?: boolean;
      refreshDeviceTypes?: boolean;
    };
  }) => {
    if (isLoading) return;

    if (result?.data?.refreshDepartments) {
      getDepartment();
      return;
    }

    if (result?.data?.refreshDeviceFamilies) {
      getDeviceFamily();
      return;
    }

    if (result?.data?.refreshDeviceTypes) {
      getDeviceType();
      return;
    }

    setIsLoading(true);

    if (organization_id && project_id) {
      dispatch(
        getDeviceByOrganizationIdAndProjectId({
          projectId: parseInt(project_id),
          organizationId: parseInt(organization_id),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setDevices(res?.data));
            setFilteredDevices(res?.data);
          }
        })
        .catch((err) => {
          console.log(err);
          Error("Failed to update device");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (selectedOrganization !== "all" && selectedProject !== "all") {
      dispatch(
        getDeviceByOrganizationIdAndProjectId({
          projectId: parseInt(selectedProject),
          organizationId: parseInt(selectedOrganization),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setDevices(res?.data));
            setFilteredDevices(res?.data);
          }
        })
        .catch((err) => {
          console.log(err);
          Error("Failed to update device");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      dispatch(getAllDevices())
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setDevices(res?.data));
            setFilteredDevices(res?.data);
          }
        })
        .catch((err) => {
          console.log(err);
          Error("Failed to update device");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const deviceStatus = (status: string) => {
    if (status === "active" || status === "Active") {
      return "bg-green-100 text-status-success";
    } else if (status === "inactive" || status === "Inactive") {
      return "bg-red-100 text-status-danger";
    } else {
      return "bg-blue-100 text-status-info";
    }
  };

  const groupDevicesByDepartment = (devices: DeviceResult[]) => {
    const grouped: { [key: string]: DeviceResult[] } = {};

    devices.forEach((device) => {
      const deptId = device.department_id?.toString() || "unknown";
      if (!grouped[deptId]) {
        grouped[deptId] = [];
      }
      grouped[deptId].push(device);
    });

    return grouped;
  };

  const groupedDevices = groupDevicesByDepartment(filteredDevices);

  const toggleDepartmentCollapse = (deptId: string) => {
    setCollapsedDepartments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });
  };

  const handleBackToProjects = () => {
    navigate("/organization/plants");
  };

  const handleBackToOrganizations = () => {
    navigate("/organization");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleEditDepartment = (deptId: string) => {
    if (selectedProject === "all") {
      Warning(
        "Please select a project from the dropdown before updating the department"
      );
      return;
    }

    const deptDevices = groupedDevices[deptId] || [];
    const firstDevice = deptDevices[0];

    if (firstDevice && firstDevice.project_id) {
      setIsEditDepartmentOpen(true);
      setDepartmentId(parseInt(deptId));
      setProjectId(parseInt(selectedProject));
    } else {
      Warning(
        "No project found for this department. Please ensure devices are assigned to this department."
      );
    }
  };

  const handleDepartmentUpdate = () => {
    getDepartment();
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit">
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
            <span>Plants</span>
          </button>
        </>

        {selectedProject !== "all" && (
          <>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary font-medium bg-secondary/30 px-2 py-1 rounded capitalize">
              {projects.find(
                (proj) => proj.project_id.toString() === selectedProject
              )?.project_name || "Project"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-start md:items-center lg:justify-between justify-center md:justify-end w-full md:gap-4 gap-2 md:flex-row flex-col flex-nowrap md:flex-wrap lg:flex-nowrap">
        <div className="flex items-center gap-4 pl-1 md:flex-row flex-col w-full md:w-auto">
          <div
            className="flex-shrink-0 md:w-54 w-full relative organization-dropdown"
            ref={organizationDropdownRef}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Select organization..."
                value={
                  selectedOrganization === "all"
                    ? "All Organization"
                    : organizations.find(
                        (org) =>
                          org.organization_id.toString() ===
                          selectedOrganization
                      )?.organization_name || "Select organization..."
                }
                readOnly
                className="px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
                onClick={() =>
                  setIsOrganizationDropdownOpen(!isOrganizationDropdownOpen)
                }
              />
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-200 ${
                  isOrganizationDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isOrganizationDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-secondary rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-primary p-3 border-b border-border-secondary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search organizations..."
                      value={organizationSearchTerm}
                      onChange={(e) =>
                        setOrganizationSearchTerm(e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2 text-sm text-text-primary bg-secondary border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div
                  className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-secondary"
                  onClick={() => {
                    setSelectedOrganization("all");
                    setIsOrganizationDropdownOpen(false);
                    setOrganizationSearchTerm("");
                  }}
                >
                  All Organization
                </div>

                {filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map((org) => (
                    <div
                      key={org.organization_id}
                      className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-secondary"
                      onClick={() => {
                        setSelectedOrganization(org.organization_id.toString());
                        setIsOrganizationDropdownOpen(false);
                        setOrganizationSearchTerm(org.organization_name);
                      }}
                    >
                      {org.organization_name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-text-secondary text-sm">
                    No organizations found
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            className="flex-shrink-0 md:w-54 w-full relative project-dropdown"
            ref={projectDropdownRef}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Select plant..."
                value={
                  selectedProject === "all"
                    ? "All Plant"
                    : projects.find(
                        (proj) => proj.project_id.toString() === selectedProject
                      )?.project_name || "Select plant..."
                }
                readOnly
                className="px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              />
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-200 ${
                  isProjectDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary border-b-0 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search plants..."
                      value={projectSearchTerm}
                      onChange={(e) => setProjectSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div
                  className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                  onClick={() => {
                    setSelectedProject("all");
                    setIsProjectDropdownOpen(false);
                    setProjectSearchTerm("");
                  }}
                >
                  All Plant
                </div>

                {filteredProjects.length > 0 ? (
                  filteredProjects.map((proj) => (
                    <div
                      key={proj.project_id}
                      className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                      onClick={() => {
                        setSelectedProject(proj.project_id.toString());
                        setIsProjectDropdownOpen(false);
                        setProjectSearchTerm(proj.project_name);
                      }}
                    >
                      {proj.project_name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-text-secondary text-sm">
                    No plants found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex-shrink-0 relative md:w-60 lg:w-92 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search devices by name, HWID, status, type, family name, or family ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-60 lg:w-92 w-full pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            onClick={handleAddDevice}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add Device
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-14 h-14 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative overflow-x-auto pb-0 flex-1">
          {Object.keys(groupedDevices).length > 0 ? (
            Object.entries(groupedDevices).map(([deptId, deptDevices]) => {
              const department = departmentData.find(
                (dept) => dept.department_id.toString() === deptId
              );
              const departmentName =
                department?.department_name.trim() || `Department ${deptId}`;

              return (
                <div className="mb-2" key={deptId}>
                  <div className="bg-primary px-4 py-3 border-b border-border-primary flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDepartmentCollapse(deptId)}
                        className="p-1 hover:bg-secondary/50 bg-secondary/50 cursor-pointer rounded transition-colors"
                      >
                        {collapsedDepartments?.has(deptId) ? (
                          <ChevronDown className="w-5 h-5 text-text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-text-primary" />
                        )}
                      </button>
                      <div>
                        <h3 className="text-lg font-medium text-text-primary font-roboto">
                          {departmentName}
                        </h3>
                        <p className="text-sm text-text-secondary font-roboto">
                          {deptDevices?.length} device
                          {deptDevices?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Edit
                        onClick={() => handleEditDepartment(deptId)}
                        className="w-5 h-5 text-status-info cursor-pointer"
                      />
                      {deptDevices?.length < 1 && (
                        <Trash2 className="w-5 h-5 text-status-danger cursor-pointer" />
                      )}
                    </div>
                  </div>

                  {!collapsedDepartments?.has(deptId) && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-base text-left rtl:text-right text-text-primary min-w-[1200px]">
                        <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
                          <tr>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Sr No
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Device Name
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Project Name
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Device Family
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Device Type
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Device Status
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              HWID Number
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Created At
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Updated At
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {deptDevices?.map((device, index) => (
                            <tr
                              key={`${deptId}-${device?.device_id} ${index}`}
                              className="border-b border-border-primary bg-primary hover:bg-primary/50"
                            >
                              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                                {device?.device_name}
                              </td>
                              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                                {
                                  projects?.find(
                                    (p) =>
                                      p?.project_id?.toString() ===
                                      device?.project_id?.toString()
                                  )?.project_name
                                }
                              </td>
                              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                                {
                                  deviceFamily?.find(
                                    (df) =>
                                      df?.device_family_id ===
                                      device?.device_family_id
                                  )?.name
                                }
                              </td>
                              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                                {device?.device_type}
                              </td>
                              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                                <span
                                  className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${deviceStatus(
                                    device?.device_status
                                  )}`}
                                >
                                  {device?.device_status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap">
                                {device?.hwid || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                                {fromatDateWithTime(device?.created_at)}
                              </td>
                              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                                {fromatDateWithTime(device?.updated_at)}
                              </td>
                              <td className="px-6 py-4 text-text-primary text-center font-roboto text-base whitespace-nowrap capitalize">
                                <div className="flex items-center justify-center gap-2">
                                  <Edit
                                    onClick={() =>
                                      handleEditDevice(
                                        device?.device_id,
                                        device?.project_id,
                                        device?.department_id
                                      )
                                    }
                                    className="w-5 h-5 text-status-info cursor-pointer"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-text-primary text-center font-roboto text-sm w-full h-full">
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
                        organizations.find(
                          (org) => org.organization_id === selectedOrganization
                        )?.organization_name ||
                        `Organization ${selectedOrganization}`
                      }`
                }
                description={
                  searchTerm || selectedOrganization !== "all"
                    ? "Try adjusting your search terms or filter criteria"
                    : selectedOrganization === "all"
                    ? "Add your first device to get started"
                    : `Add your first project for ${
                        organizations.find(
                          (org) => org.organization_id === selectedOrganization
                        )?.organization_name ||
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
            </div>
          )}
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
          departmentData={departmentData}
          departmentId={departmentId}
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
          departmentData={departmentData}
          departmentId={departmentId}
        />
      )}

      {isEditDepartmentOpen && projectId && (
        <AddUpdateDepartment
          setShowAddDepartmentPopup={setIsEditDepartmentOpen}
          type="update"
          departmentId={departmentId}
          projectId={projectId}
          onUpdateSuccess={handleDepartmentUpdate}
        />
      )}
    </div>
  );
};

export default Devices;
