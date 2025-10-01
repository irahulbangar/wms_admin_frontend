import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  PlusCircle,
  Edit,
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
  deleteDevice,
  getAllDevices,
  getDeviceByOrganizationIdAndPlantId,
  setDevices,
} from "../../../store/deviceSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  getOrganizations,
  setOrganizations,
} from "../../../store/organizationSlice";
import { getAllPlants, setPlants } from "../../../store/plantSlice";
import type { DeviceFamilyResult } from "../../../model/device-family.interface";
import { fromatDateWithTime } from "../../utils/utils";
import AddUpdateDevice from "./AddUpdateDevice";
import { Error, Success, Warning } from "../../utils/toast";
import NoDataFound from "../NoDataFound";
import type { DeviceTypeResult } from "../../../model/device-type.interface";
import type { DepartmentResult } from "../../../model/department.interface";
import { getAllDepartments } from "../../../store/departmentSlice";
import AddUpdateDepartment from "./Department/AddUpdateDepartment";
import { getDeviceFamiliy } from "../../../store/deviceFamilySlice";
import { getDeviceTypes } from "../../../store/deviceTypeSlice";
import DeletePopup from "./DeletePopup";

const Devices = () => {
  const navigate = useNavigate();
  const { plant_id, organization_id } = useParams<{
    plant_id: string;
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
  const [selectedPlant, setSelectedPlant] = useState(plant_id || "all");
  const { organizations } = useAppSelector((state) => state.organization);
  const { plants } = useAppSelector((state) => state.plant);
  const { devices } = useAppSelector((state) => state.device);
  const [deviceFamily, setDeviceFamily] = useState<DeviceFamilyResult[]>([]);
  const [plantId, setPlantId] = useState<number | null>(null);
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
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [plantSearchTerm, setPlantSearchTerm] = useState("");
  const [organizationId, setOrganizationId] = useState<number>(0);
  const organizationDropdownRef = useRef<HTMLDivElement>(null);
  const plantDropdownRef = useRef<HTMLDivElement>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<DeviceResult | null>(
    null
  );
  const { admin } = useAppSelector((state) => state.admin);

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
        plantDropdownRef.current &&
        !plantDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPlantDropdownOpen(false);
        setPlantSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDepartment = useCallback(async () => {
    setIsLoading(true);
    await dispatch(getAllDepartments())
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

  const fetchPlants = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await dispatch(getAllPlants())
      .unwrap()
      .then((res) => {
        if (res.success) {
          dispatch(setPlants(res.data));
        }
      })
      .catch((err) => {
        console.log(err);
        Error("Failed to get plants");
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
    if (organizations.length === 0 || plants.length === 0) {
      getOrganization();
      fetchPlants();
    }
    getDeviceFamily();
    getDeviceType();
    getDepartment();

    if (organization_id && plant_id) {
      setIsLoading(true);
      setSelectedOrganization(organization_id);
      setSelectedPlant(plant_id);

      dispatch(
        getDeviceByOrganizationIdAndPlantId({
          plantId: parseInt(plant_id),
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
      setSelectedPlant("all");
    }
  }, [
    organization_id,
    plant_id,
    dispatch,
    getOrganization,
    fetchPlants,
    getDeviceFamily,
    getDeviceType,
    getDepartment,
  ]);

  const refreshDevices = useCallback(async () => {
    if (isLoading) return;
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
  }, [dispatch, setFilteredDevices, setDevices]);

  useEffect(() => {
    if (organization_id && plant_id) {
      return;
    }

    if (selectedOrganization === "all" && selectedPlant === "all") {
      refreshDevices();
    } else if (selectedOrganization !== "all" && selectedPlant !== "all") {
      setIsLoading(true);
      dispatch(
        getDeviceByOrganizationIdAndPlantId({
          plantId: parseInt(selectedPlant),
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
    selectedPlant,
    dispatch,
    organization_id,
    plant_id,
    refreshDevices,
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
      const orgPlantIds = plants
        .filter((p) => p.organization_id === parseInt(selectedOrganization))
        .map((p) => p.plant_id);

      filtered = filtered.filter((device: DeviceResult) =>
        orgPlantIds.includes(device.plant_id)
      );
    }

    if (selectedPlant !== "all") {
      filtered = filtered.filter(
        (device: DeviceResult) => device.plant_id === parseInt(selectedPlant)
      );
    }

    setFilteredDevices(filtered);
  }, [
    devices,
    searchTerm,
    selectedOrganization,
    selectedPlant,
    plants,
    deviceFamily,
  ]);

  const filteredOrganizations = organizations.filter((org) =>
    org.organization_name
      .toLowerCase()
      .includes(organizationSearchTerm.toLowerCase())
  );

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = plant.plant_name
      .toLowerCase()
      .includes(plantSearchTerm.toLowerCase());

    if (selectedOrganization === "all") {
      return matchesSearch;
    }

    const matchesOrganization =
      plant.organization_id === parseInt(selectedOrganization);
    return matchesSearch && matchesOrganization;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".organization-dropdown")) {
        setIsOrganizationDropdownOpen(false);
      }
      if (!target.closest(".plant-dropdown")) {
        setIsPlantDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedOrganization !== "all") {
      const selectedPlants = plants.find(
        (plant) => plant.plant_id.toString() === selectedPlant
      );

      if (
        selectedPlants &&
        selectedPlants.organization_id !== parseInt(selectedOrganization)
      ) {
        setSelectedPlant("all");
        setPlantSearchTerm("");
      }
    }
  }, [selectedOrganization, selectedPlant, plants]);

  const handleAddDevice = () => {
    if (selectedOrganization === "all" || selectedPlant === "all") {
      Warning(
        "Please select both organization and plant before adding a device"
      );
      return;
    }

    setIsAddDeviceOpen(true);
    setPlantId(parseInt(selectedPlant));
    setOrganizationId(parseInt(selectedOrganization));
  };

  const handleEditDevice = (
    deviceId: number,
    plantId: number,
    departmentId: number,
    organizationId?: number
  ) => {
    const derivedOrganizationId: number =
      organizationId ||
      plants.find((p) => p.plant_id === plantId)?.organization_id ||
      (selectedOrganization !== "all" ? parseInt(selectedOrganization) : 0);

    setEditingDeviceId(deviceId);
    setIsEditDeviceOpen(true);
    setPlantId(plantId);
    setDepartmentId(departmentId);
    if (!derivedOrganizationId) {
      Warning(
        "Organization not found for this device. Please select an organization first."
      );
    }
    setOrganizationId(derivedOrganizationId);
  };

  const handleDeviceUpdate = useCallback(
    (result?: {
      data?: {
        refreshDepartments?: boolean;
        refreshDeviceFamilies?: boolean;
        refreshDeviceTypes?: boolean;
        refreshOrganizations?: boolean;
        refreshPlants?: boolean;
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

      if (result?.data?.refreshOrganizations) {
        getOrganization();
        return;
      }

      if (result?.data?.refreshPlants) {
        fetchPlants();
        return;
      }

      setIsLoading(true);

      if (organization_id && plant_id) {
        dispatch(
          getDeviceByOrganizationIdAndPlantId({
            plantId: parseInt(plant_id),
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
      } else if (selectedOrganization !== "all" && selectedPlant !== "all") {
        dispatch(
          getDeviceByOrganizationIdAndPlantId({
            plantId: parseInt(selectedPlant),
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
        refreshDevices();
      }
    },
    [
      dispatch,
      selectedOrganization,
      selectedPlant,
      organization_id,
      plant_id,
      refreshDevices,
    ]
  );

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

  const handleBackToPlants = () => {
    navigate("/organization/plants");
  };

  const handleBackToOrganizations = () => {
    navigate("/organization");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleEditDepartment = (deptId: string) => {
    if (selectedPlant === "all") {
      Warning(
        "Please select a plant from the dropdown before updating the department"
      );
      return;
    }

    const deptDevices = groupedDevices[deptId] || [];
    const firstDevice = deptDevices[0];

    if (firstDevice && firstDevice.plant_id) {
      setIsEditDepartmentOpen(true);
      setDepartmentId(parseInt(deptId));
      setPlantId(parseInt(selectedPlant));
    } else {
      Warning(
        "No plant found for this department. Please ensure devices are assigned to this department."
      );
    }
  };

  const handleDepartmentUpdate = () => {
    getDepartment();
  };

  const handleDeleteDevice = (deviceId: number) => {
    setShowDeletePopup(true);
    setDeviceName(
      devices.find((device) => device.device_id === deviceId)?.device_name ||
        null
    );
    setDeviceToDelete(
      devices.find((device) => device.device_id === deviceId) || null
    );
  };

  const handleCloseDeletePopup = () => {
    setShowDeletePopup(false);
    setDeviceName(null);
    setDeviceToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!deviceToDelete || isLoading) return;
    setIsLoading(true);

    await dispatch(deleteDevice(deviceToDelete.device_id.toString()))
      .unwrap()
      .then((res) => {
        if (res.success) {
          Success(res.message);
          refreshDevices();
          setShowDeletePopup(false);
          setDeviceName(null);
          setDeviceToDelete(null);
        } else {
          Error(res.message || "Failed to delete device");
        }
      })
      .catch((err) => {
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
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

        <ChevronRight className="w-4 h-4 text-text-muted" />
        <button
          onClick={handleBackToPlants}
          className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
        >
          <span>Plants</span>
        </button>

        {selectedPlant !== "all" && (
          <>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary font-medium bg-secondary/30 px-2 py-1 rounded capitalize">
              {plants.find((plant) => plant.plant_id.toString() === selectedPlant)
                ?.plant_name || "Plant"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-start md:items-center justify-center md:justify-end lg:justify-between w-full md:gap-4 gap-2 md:flex-row flex-col flex-nowrap md:flex-wrap">
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
                className="px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
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
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search organizations..."
                      value={organizationSearchTerm}
                      onChange={(e) =>
                        setOrganizationSearchTerm(e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div
                  className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                  onClick={() => {
                    setSelectedOrganization("all");
                    setSelectedPlant("all");
                    setIsOrganizationDropdownOpen(false);
                    setOrganizationSearchTerm("");
                    setPlantSearchTerm("");
                  }}
                >
                  All Organization
                </div>

                {filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map((org) => (
                    <div
                      key={org.organization_id}
                      className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                      onClick={() => {
                        setSelectedOrganization(org.organization_id.toString());
                        setSelectedPlant("all");
                        setIsOrganizationDropdownOpen(false);
                        setOrganizationSearchTerm(org.organization_name);
                        setPlantSearchTerm("");
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
            className="flex-shrink-0 md:w-54 w-full relative plant-dropdown"
            ref={plantDropdownRef}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Select plant..."
                value={
                  selectedPlant === "all"
                    ? "All Plant"
                    : plants.find(
                        (plant) => plant.plant_id.toString() === selectedPlant
                      )?.plant_name || "Select plant..."
                }
                readOnly
                className="px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
                onClick={() => setIsPlantDropdownOpen(!isPlantDropdownOpen)}
              />
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-200 ${
                  isPlantDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isPlantDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary border-b-0 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search plants..."
                      value={plantSearchTerm}
                      onChange={(e) => setPlantSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div
                  className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                  onClick={() => {
                    setSelectedPlant("all");
                    setIsPlantDropdownOpen(false);
                    setPlantSearchTerm("");
                  }}
                >
                  All Plant
                </div>

                {filteredPlants.length > 0 ? (
                  filteredPlants.map((plant) => (
                    <div
                      key={plant.plant_id}
                      className="px-3 py-2 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                      onClick={() => {
                        setSelectedPlant(plant.plant_id.toString());
                        setIsPlantDropdownOpen(false);
                        setPlantSearchTerm(plant.plant_name);
                      }}
                    >
                      {plant.plant_name}
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
              className="md:w-60 lg:w-92 w-full pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
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
                department?.department_name.trim() ||
                `${
                  deptId === "0" ? "Extra Department" : `Department ${deptId}`
                }`;

              return (
                <div
                  className={`${
                    collapsedDepartments?.has(deptId) ? "mb-4" : "mb-0"
                  }`}
                  key={deptId}
                >
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
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-status-success rounded-full"></div>
                          <span className="text-xs text-text-secondary font-roboto">
                            {deptDevices?.filter(
                              (d) => d.device_status?.toLowerCase() === "active"
                            ).length || 0}{" "}
                            Active
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-status-danger rounded-full"></div>
                          <span className="text-xs text-text-secondary font-roboto">
                            {deptDevices?.filter(
                              (d) =>
                                d.device_status?.toLowerCase() === "inactive"
                            ).length || 0}{" "}
                            Inactive
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {deptId !== "0" && (
                          <Edit
                            onClick={() => handleEditDepartment(deptId)}
                            className="w-5 h-5 text-status-info cursor-pointer"
                          />
                        )}
                        {deptDevices?.length < 1 && (
                          <Trash2 className="w-5 h-5 text-status-danger cursor-pointer" />
                        )}
                      </div>
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
                            <th className="p-4 text-text-primary whitespace-nowrap -center text-base font-roboto font-medium font-roboto">
                              Device Name
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Plant Name
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
                              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                                {device?.device_name}
                              </td>
                              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                                {
                                  plants?.find(
                                    (plant) =>
                                      plant?.plant_id?.toString() ===
                                      device?.plant_id?.toString()
                                  )?.plant_name
                                }
                              </td>
                              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize truncate">
                                {
                                  deviceFamily?.find(
                                    (df) =>
                                      df?.device_family_id ===
                                      device?.device_family_id
                                  )?.name
                                }
                              </td>
                              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap uppercase">
                                {device?.device_type}
                              </td>
                              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                                <span
                                  className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${deviceStatus(
                                    device?.device_status
                                  )}`}
                                >
                                  {device?.device_status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap">
                                {device?.hwid || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                                {fromatDateWithTime(device?.created_at)}
                              </td>
                              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                                {fromatDateWithTime(device?.updated_at)}
                              </td>
                              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                                <div className="flex items-center justify-center gap-2">
                                  <span
                                    title="Edit device"
                                    aria-label="Edit device"
                                  >
                                    <Edit
                                      onClick={() =>
                                        handleEditDevice(
                                          device?.device_id,
                                          device?.plant_id,
                                          device?.department_id,
                                          device?.organization_id
                                        )
                                      }
                                      className="w-5 h-5 text-status-info cursor-pointer"
                                    />
                                  </span>

                                  {admin?.role === "super_admin" && (
                                    <span
                                      title="Delete device"
                                      aria-label="Delete device"
                                    >
                                      <Trash2
                                        onClick={() =>
                                          handleDeleteDevice(device?.device_id)
                                        }
                                        className="w-5 h-5 text-status-danger cursor-pointer"
                                      />
                                    </span>
                                  )}
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
                    : `Add your first plant for ${
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

      {showDeletePopup && deviceToDelete && (
        <DeletePopup
          isOpen={showDeletePopup}
          onClose={handleCloseDeletePopup}
          onConfirm={handleConfirmDelete}
          title={deviceName}
          organization={deviceToDelete}
        />
      )}

      {isAddDeviceOpen && (
        <AddUpdateDevice
          setShowAddModal={setIsAddDeviceOpen}
          type="add"
          deviceId={0}
          plant_id={plantId}
          onUpdateSuccess={handleDeviceUpdate}
          familyData={deviceFamily}
          typeData={deviceType}
          departmentData={departmentData}
          departmentId={departmentId}
          organizationId={organizationId}
        />
      )}

      {isEditDeviceOpen && editingDeviceId && (
        <AddUpdateDevice
          setShowAddModal={setIsEditDeviceOpen}
          type="update"
          deviceId={editingDeviceId}
          plant_id={plantId}
          onUpdateSuccess={handleDeviceUpdate}
          familyData={deviceFamily}
          typeData={deviceType}
          departmentData={departmentData}
          departmentId={departmentId}
          organizationId={organizationId}
        />
      )}

      {isEditDepartmentOpen && plantId && (
        <AddUpdateDepartment
          setShowAddDepartmentPopup={setIsEditDepartmentOpen}
          type="update"
          departmentId={departmentId}
          plantId={plantId}
          onUpdateSuccess={handleDepartmentUpdate}
        />
      )}
    </div>
  );
};

export default Devices;
