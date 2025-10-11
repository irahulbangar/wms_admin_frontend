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
  getDeviceByOrganizationIdAndPlantIdAndDepartmentId,
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
import {
  getAllDepartments,
  setDepartments,
} from "../../../store/departmentSlice";
import { getDeviceFamiliy } from "../../../store/deviceFamilySlice";
import { getDeviceTypes } from "../../../store/deviceTypeSlice";
import DeletePopup from "./DeletePopup";
import { getAllSystems, setSystems } from "../../../store/systemSlice";
import AddUpdateSystem from "./AddUpdateSystem";

const Devices = () => {
  const navigate = useNavigate();
  const { organization_id, plant_id, department_id } = useParams<{
    organization_id: string;
    plant_id: string;
    department_id: string;
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
  const [selectedDepartment, setSelectedDepartment] = useState(
    department_id || "all"
  );
  const { organizations } = useAppSelector((state) => state.organization);
  const { plants } = useAppSelector((state) => state.plant);
  const { departments } = useAppSelector((state) => state.department);
  const { devices } = useAppSelector((state) => state.device);
  const [deviceFamily, setDeviceFamily] = useState<DeviceFamilyResult[]>([]);
  const [plantId, setPlantId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceTypeResult[]>([]);
  const dispatch = useAppDispatch();
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [systemId, setSystemId] = useState<number>(0);
  const [collapsedSystems, setCollapsedSystems] = useState<Set<string>>(
    new Set()
  );
  const [isEditSystemOpen, setIsEditSystemOpen] = useState(false);
  const [isOrganizationDropdownOpen, setIsOrganizationDropdownOpen] =
    useState(false);
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [plantSearchTerm, setPlantSearchTerm] = useState("");
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [organizationId, setOrganizationId] = useState<number>(0);
  const organizationDropdownRef = useRef<HTMLDivElement>(null);
  const plantDropdownRef = useRef<HTMLDivElement>(null);
  const departmentDropdownRef = useRef<HTMLDivElement>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<DeviceResult | null>(
    null
  );
  const { admin } = useAppSelector((state) => state.admin);
  const { systems } = useAppSelector((state) => state.system);

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
      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDepartmentDropdownOpen(false);
        setDepartmentSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getSystem = useCallback(async () => {
    setIsLoading(true);
    await dispatch(getAllSystems())
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          dispatch(setSystems(res.data));
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get systems");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const getDepartment = useCallback(async () => {
    setIsLoading(true);
    await dispatch(getAllDepartments())
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          dispatch(setDepartments(res.data));
        } else {
          Error(res.message || "Failed to get departments");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get departments");
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
        if (res.success || res.status === 200) {
          dispatch(setOrganizations(res.data));
        } else {
          Error(res.message || "Failed to get organizations");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get organizations");
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
        if (res.success || res.status === 200) {
          dispatch(setPlants(res.data));
        } else {
          Error(res.message || "Failed to get plants");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get plants");
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
        if (res.success || res.status === 200) {
          setDeviceFamily(res.data);
        } else {
          Error(res.message || "Failed to get device families");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get device families");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const getDeviceType = useCallback(async () => {
    await dispatch(getDeviceTypes())
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          setDeviceType(res.data);
        } else {
          Error(res.message || "Failed to get device types");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get device types");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    if (
      organizations.length === 0 ||
      plants.length === 0 ||
      departments.length === 0
    ) {
      getOrganization();
      fetchPlants();
      getDepartment();
    }
    getDeviceFamily();
    getDeviceType();
    getSystem();

    if (organization_id && plant_id && department_id) {
      setIsLoading(true);
      setSelectedOrganization(organization_id);
      setSelectedPlant(plant_id);
      setSelectedDepartment(department_id);

      dispatch(
        getDeviceByOrganizationIdAndPlantIdAndDepartmentId({
          plantId: parseInt(plant_id),
          organizationId: parseInt(organization_id),
          departmentId: parseInt(department_id || "0"),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success || res.status === 200) {
            dispatch(setDevices(res?.data));
            setFilteredDevices(res?.data);
          } else {
            Error(res.message || "Failed to get devices");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get devices");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setSelectedOrganization("all");
      setSelectedPlant("all");
      setSelectedDepartment("all");
    }
  }, [
    organization_id,
    plant_id,
    department_id,
    dispatch,
    getOrganization,
    fetchPlants,
    getDeviceFamily,
    getDeviceType,
    getDepartment,
    getSystem,
  ]);

  const refreshDevices = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    dispatch(getAllDevices())
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          dispatch(setDevices(res?.data));
          setFilteredDevices(res?.data);
        } else {
          Error(res.message || "Failed to get devices");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get devices");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, setFilteredDevices, setDevices]);

  useEffect(() => {
    if (organization_id && plant_id) {
      return;
    }

    if (
      selectedOrganization === "all" &&
      selectedPlant === "all" &&
      selectedDepartment === "all"
    ) {
      refreshDevices();
    } else if (
      selectedOrganization !== "all" &&
      selectedPlant !== "all" &&
      selectedDepartment !== "all"
    ) {
      setIsLoading(true);
      dispatch(
        getDeviceByOrganizationIdAndPlantIdAndDepartmentId({
          plantId: parseInt(selectedPlant),
          organizationId: parseInt(selectedOrganization),
          departmentId: parseInt(selectedDepartment || "0"),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success || res.status === 200) {
            dispatch(setDevices(res?.data));
            setFilteredDevices(res?.data);
          } else {
            Error(res.message || "Failed to get devices");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get devices");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [
    selectedOrganization,
    selectedPlant,
    selectedDepartment,
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

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (device: DeviceResult) =>
          device.department_id === parseInt(selectedDepartment)
      );
    }

    setFilteredDevices(filtered);
  }, [
    devices,
    searchTerm,
    selectedOrganization,
    selectedPlant,
    selectedDepartment,
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

  const filteredDepartments = departments.filter((department) => {
    const matchesSearch = department.department_name
      .toLowerCase()
      .includes(departmentSearchTerm.toLowerCase());

    if (selectedPlant === "all") {
      return matchesSearch;
    }

    const matchesOrganization = department.plant_id === parseInt(selectedPlant);
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
    if (
      selectedOrganization === "all" &&
      selectedPlant === "all" &&
      selectedDepartment === "all"
    ) {
      Warning(
        "Please select both organization, plant and department before adding a device"
      );
      return;
    }

    if (selectedOrganization === "all") {
      Warning("Please select both organization before adding a device");
      return;
    }

    if (selectedPlant === "all") {
      Warning("Please select a plant before adding a device");
      return;
    }

    if (selectedDepartment === "all") {
      Warning("Please select a department before adding a device");
      return;
    }

    setIsAddDeviceOpen(true);
    setPlantId(parseInt(selectedPlant));
    setOrganizationId(parseInt(selectedOrganization));
    setDepartmentId(parseInt(selectedDepartment));
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
        refreshSystems?: boolean;
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

      if (result?.data?.refreshSystems) {
        getSystem();
        return;
      }

      setIsLoading(true);

      if (organization_id && plant_id && department_id) {
        dispatch(
          getDeviceByOrganizationIdAndPlantIdAndDepartmentId({
            organizationId: parseInt(organization_id),
            plantId: parseInt(plant_id),
            departmentId: parseInt(department_id || "0"),
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              dispatch(setDevices(res?.data));
              setFilteredDevices(res?.data);
            } else {
              Error(res.message || "Failed to update device");
            }
          })
          .catch((err) => {
            console.log(err);
            Error(err.message || "Failed to update device");
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else if (
        selectedOrganization !== "all" &&
        selectedPlant !== "all" &&
        selectedDepartment !== "all"
      ) {
        dispatch(
          getDeviceByOrganizationIdAndPlantIdAndDepartmentId({
            plantId: parseInt(selectedPlant),
            organizationId: parseInt(selectedOrganization),
            departmentId: parseInt(selectedDepartment || "0"),
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success || res.status === 200) {
              dispatch(setDevices(res?.data));
              setFilteredDevices(res?.data);
            } else {
              Error(res.message || "Failed to update device");
            }
          })
          .catch((err) => {
            console.log(err);
            Error(err.message || "Failed to update device");
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
      selectedDepartment,
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

  const groupDevicesBySystem = (devices: DeviceResult[]) => {
    const grouped: { [key: string]: DeviceResult[] } = {};

    devices.forEach((device) => {
      const systemId = device.system_id?.toString() || "unknown";
      if (!grouped[systemId]) {
        grouped[systemId] = [];
      }
      grouped[systemId].push(device);
    });

    return grouped;
  };

  const groupedDevices = groupDevicesBySystem(filteredDevices);

  const toggleSystemCollapse = (systemId: string) => {
    setCollapsedSystems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(systemId)) {
        newSet.delete(systemId);
      } else {
        newSet.add(systemId);
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

  const handleBackToDepartments = () => {
    navigate("/organization/departments");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleEditSystem = (systemId: string) => {
    if (selectedPlant === "all") {
      Warning(
        "Please select a plant from the dropdown before updating the device"
      );
      return;
    }

    const systemDevices = groupedDevices[systemId] || [];
    const firstDevice = systemDevices[0];

    if (firstDevice && firstDevice.plant_id) {
      setIsEditSystemOpen(true);
      setSystemId(parseInt(systemId));
      setPlantId(parseInt(selectedPlant));
    } else {
      Warning(
        "No plant found for this system. Please ensure devices are assigned to this system."
      );
    }
  };

  const handleSystemUpdate = () => {
    getSystem();
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
        if (res.success || res.status === 200) {
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
        Error(err.message || "Failed to delete device");
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

        <ChevronRight className="w-4 h-4 text-text-muted" />
        <button
          onClick={handleBackToDepartments}
          className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
        >
          <span>Departments</span>
        </button>

        {selectedDepartment !== "all" && (
          <>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary font-medium bg-secondary/30 px-2 py-1 rounded capitalize">
              {departments.find(
                (department) =>
                  department.department_id.toString() === selectedDepartment
              )?.department_name || "Department"}
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
                className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
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
                      className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div
                  className="px-3 py-1.5 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
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
                className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
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
                      className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
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
          <div
            className="flex-shrink-0 md:w-54 w-full relative plant-dropdown"
            ref={departmentDropdownRef}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Select department..."
                value={
                  selectedDepartment === "all"
                    ? "All Department"
                    : departments.find(
                        (department) =>
                          department.department_id.toString() ===
                          selectedDepartment
                      )?.department_name || "Select department..."
                }
                readOnly
                className="px-3 py-1.5 border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary w-full md:w-54 pr-8 cursor-pointer"
                onClick={() =>
                  setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)
                }
              />
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted transition-transform duration-200 ${
                  isDepartmentDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isDepartmentDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-primary border-b-0 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-primary p-3 border-b border-border-primary">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search departments..."
                      value={departmentSearchTerm}
                      onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-1.5 text-sm text-text-primary bg-secondary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div
                  className="px-3 py-1.5 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                  onClick={() => {
                    setSelectedDepartment("all");
                    setIsDepartmentDropdownOpen(false);
                    setDepartmentSearchTerm("");
                  }}
                >
                  All Department
                </div>

                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((department) => (
                    <div
                      key={department.department_id}
                      className="px-3 py-1.5 text-text-primary hover:bg-secondary cursor-pointer border-b border-border-primary"
                      onClick={() => {
                        setSelectedDepartment(
                          department.department_id.toString()
                        );
                        setIsDepartmentDropdownOpen(false);
                        setDepartmentSearchTerm(department.department_name);
                      }}
                    >
                      {department.department_name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-text-secondary text-sm">
                    No departments found
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
              className="md:w-60 lg:w-92 w-full pl-10 pr-4 py-1.5 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
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
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto whitespace-nowrap"
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
            Object.entries(groupedDevices).map(([systemId, systemDevices]) => {
              const system = systems?.find(
                (system: any) => system.system_id.toString() === systemId
              );

              const systemName =
                system?.system_name?.trim() ||
                `${systemId === "0" ? "Extra System" : `System ${systemId}`}`;

              return (
                <div
                  className={`${
                    collapsedSystems?.has(systemId) ? "mb-4" : "mb-0"
                  }`}
                  key={systemId}
                >
                  <div className="bg-primary px-4 py-3 border-b border-border-primary flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSystemCollapse(systemId)}
                        className="p-1 hover:bg-secondary/50 bg-secondary/50 cursor-pointer rounded transition-colors"
                      >
                        {collapsedSystems?.has(systemId) ? (
                          <ChevronDown className="w-5 h-5 text-text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-text-primary" />
                        )}
                      </button>
                      <div>
                        <h3 className="text-lg font-medium text-text-primary font-roboto">
                          {systemName}
                        </h3>
                        <p className="text-sm text-text-secondary font-roboto">
                          {systemDevices?.length} device
                          {systemDevices?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-status-success rounded-full"></div>
                          <span className="text-xs text-text-secondary font-roboto">
                            {systemDevices?.filter(
                              (d) => d.device_status?.toLowerCase() === "active"
                            ).length || 0}{" "}
                            Active
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-status-danger rounded-full"></div>
                          <span className="text-xs text-text-secondary font-roboto">
                            {systemDevices?.filter(
                              (d) =>
                                d.device_status?.toLowerCase() === "inactive"
                            ).length || 0}{" "}
                            Inactive
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {systemId !== "0" && (
                          <Edit
                            onClick={() => handleEditSystem(systemId)}
                            className="w-5 h-5 text-status-info cursor-pointer"
                          />
                        )}
                        {systemDevices?.length < 1 && (
                          <Trash2 className="w-5 h-5 text-status-danger cursor-pointer" />
                        )}
                      </div>
                    </div>
                  </div>

                  {!collapsedSystems?.has(systemId) && (
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
                              Organization Name
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Plant Name
                            </th>
                            <th className="p-4 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium font-roboto">
                              Department Name
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
                          {systemDevices?.map((device, index) => (
                            <tr
                              onDoubleClick={() =>
                                handleEditDevice(
                                  device?.device_id,
                                  device?.plant_id,
                                  device?.department_id,
                                  device?.organization_id
                                )
                              }
                              key={index}
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
                                  organizations?.find(
                                    (org) =>
                                      org?.organization_id?.toString() ===
                                      device?.organization_id?.toString()
                                  )?.organization_name
                                }
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
                              <td className="px-6 py-4 text-text-primary font-roboto text-base whitespace-nowrap capitalize">
                                {
                                  departments?.find(
                                    (department) =>
                                      department?.department_id?.toString() ===
                                      device?.department_id?.toString()
                                  )?.department_name
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
          systemData={systems}
          departmentId={departmentId}
          organizationId={organizationId}
          systemId={0}
          plantData={plants}
          departmentData={departments}
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
          systemData={systems}
          departmentId={departmentId}
          organizationId={organizationId}
          systemId={0}
          plantData={plants}
          departmentData={departments}
        />
      )}

      {isEditSystemOpen && plantId && (
        <AddUpdateSystem
          setShowAddSystemPopup={setIsEditSystemOpen}
          type="update"
          systemId={systemId}
          plantId={plantId}
          onUpdateSuccess={handleSystemUpdate}
        />
      )}
    </div>
  );
};

export default Devices;
