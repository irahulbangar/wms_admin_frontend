import { useState, useEffect, useCallback, useRef } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import type { DeviceResult } from "../../../../model/devices.interface";
import {
  deleteDevice,
  getDeviceByOrganizationIdPlantIdDepartmentIdAndSystemId,
  setDevices,
} from "../../../../store/deviceSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { setOrganizations } from "../../../../store/organizationSlice";
import { setPlants } from "../../../../store/plantSlice";
import type { DeviceFamilyResult } from "../../../../model/device-family.interface";
import AddUpdateDevice from "./AddUpdateDevice";
import { Error, Success, Warning } from "../../../utils/toast";
import type { DeviceTypeResult } from "../../../../model/device-type.interface";
import { setDepartments } from "../../../../store/departmentSlice";
import { getDeviceFamiliy } from "../../../../store/deviceFamilySlice";
import { getDeviceTypes } from "../../../../store/deviceTypeSlice";
import DeletePopup from "../DeletePopup";
import { setSystems } from "../../../../store/systemSlice";
import {
  useGetAllDepartmentsQuery,
  useGetAllDevicesQuery,
  useGetAllOrganizationsQuery,
  useGetAllPlantsQuery,
  useGetAllSystemsQuery,
} from "../../../../store/rtkQuery";
import BreadcrumbNav from "./components/BreadcrumbNav";
import SearchBar from "./components/SearchBar";
import FilterSection from "./components/FilterSection";
import DeviceList from "./components/DeviceList";

const Devices = () => {
  const navigate = useNavigate();
  const { organization_id, plant_id, department_id, system_id } = useParams<{
    organization_id: string;
    plant_id: string;
    department_id: string;
    system_id: string;
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
  const [selectedSystem, setSelectedSystem] = useState(system_id || "all");
  const { organizations } = useAppSelector((state) => state.organization);
  const { plants } = useAppSelector((state) => state.plant);
  const { departments } = useAppSelector((state) => state.department);
  const { devices } = useAppSelector((state) => state.device);
  const { systems } = useAppSelector((state) => state.system);
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
  const [organizationId, setOrganizationId] = useState<number>(0);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<DeviceResult | null>(
    null
  );
  const { admin } = useAppSelector((state) => state.admin);
  const hasInitializedRef = useRef(false);
  const isFetchingDataRef = useRef(false);

  const {
    data: organizationsData,
    isLoading: isFetchingOrganizations,
    refetch: refetchOrganizations,
  } = useGetAllOrganizationsQuery();

  const {
    data: plantsData,
    isLoading: isFetchingPlants,
    refetch: refetchPlants,
  } = useGetAllPlantsQuery();

  const {
    data: departmentsData,
    isLoading: isFetchingDepartments,
    refetch: refetchDepartments,
  } = useGetAllDepartmentsQuery();

  const {
    data: systemsData,
    isLoading: isFetchingSystems,
    refetch: refetchSystems,
  } = useGetAllSystemsQuery();

  const {
    data: devicesData,
    isLoading: isFetchingDevices,
    refetch: refetchDevices,
  } = useGetAllDevicesQuery();

  const fetchSystems = useCallback(() => {
    if (isFetchingSystems) return;
    refetchSystems();
  }, [isFetchingSystems, refetchSystems]);

  useEffect(() => {
    if (systemsData?.success && systemsData?.data) {
      dispatch(setSystems(systemsData.data));
    }
  }, [systemsData, dispatch]);

  const fetchDepartments = useCallback(() => {
    if (isFetchingDepartments) return;
    refetchDepartments();
  }, [isFetchingDepartments, refetchDepartments]);

  useEffect(() => {
    if (departmentsData?.success && departmentsData?.data) {
      dispatch(setDepartments(departmentsData.data));
    }
  }, [departmentsData, dispatch]);

  const fetchOrganizations = useCallback(() => {
    if (isFetchingOrganizations) return;
    refetchOrganizations();
  }, [isFetchingOrganizations, refetchOrganizations]);

  useEffect(() => {
    if (organizationsData?.success && organizationsData?.data) {
      dispatch(setOrganizations(organizationsData.data));
    }
  }, [organizationsData, dispatch]);

  const fetchPlants = useCallback(() => {
    if (isFetchingPlants) return;
    refetchPlants();
  }, [isFetchingPlants, refetchPlants]);

  useEffect(() => {
    if (plantsData?.success && plantsData?.data) {
      dispatch(setPlants(plantsData.data));
    }
  }, [plantsData, dispatch]);

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
    if (hasInitializedRef.current || isFetchingDataRef.current) return;

    isFetchingDataRef.current = true;
    hasInitializedRef.current = true;

    if (
      !isFetchingOrganizations &&
      organizations.length === 0 &&
      (!organizationsData ||
        organizationsData?.success === false ||
        (organizationsData?.data && organizationsData.data.length === 0))
    ) {
      fetchOrganizations();
    }

    if (
      !isFetchingPlants &&
      plants.length === 0 &&
      (!plantsData ||
        plantsData?.success === false ||
        (plantsData?.data && plantsData.data.length === 0))
    ) {
      fetchPlants();
    }

    if (
      !isFetchingDepartments &&
      departments.length === 0 &&
      (!departmentsData ||
        departmentsData?.success === false ||
        departmentsData?.data?.length === 0)
    ) {
      fetchDepartments();
    }
    if (deviceFamily.length === 0) {
      getDeviceFamily();
    }
    if (deviceType.length === 0) {
      getDeviceType();
    }
    if (systems.length === 0) {
      fetchSystems();
    }

    isFetchingDataRef.current = false;
  }, []);

  useEffect(() => {
    if (organization_id && plant_id && department_id && system_id) {
      setIsLoading(true);
      setSelectedOrganization(organization_id);
      setSelectedPlant(plant_id);
      setSelectedDepartment(department_id);
      setSelectedSystem(system_id);

      dispatch(
        getDeviceByOrganizationIdPlantIdDepartmentIdAndSystemId({
          plantId: parseInt(plant_id),
          organizationId: parseInt(organization_id),
          departmentId: parseInt(department_id),
          systemId: parseInt(system_id),
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
    } else if (organization_id && plant_id && department_id) {
      setSelectedOrganization(organization_id);
      setSelectedPlant(plant_id);
      setSelectedDepartment(department_id);
      setSelectedSystem("all");
    } else {
      setSelectedOrganization("all");
      setSelectedPlant("all");
      setSelectedDepartment("all");
      setSelectedSystem("all");
    }
  }, [organization_id, plant_id, department_id, system_id, dispatch]);

  const fetchDevices = useCallback(() => {
    if (isFetchingDevices) return;
    refetchDevices();
  }, [isFetchingDevices, refetchDevices]);

  useEffect(() => {
    if (devicesData?.success && devicesData?.data) {
      dispatch(setDevices(devicesData.data));
    }
  }, [devicesData, dispatch]);

  useEffect(() => {
    if (organization_id && plant_id && department_id && system_id) {
      return;
    }

    if (
      selectedOrganization === "all" &&
      selectedPlant === "all" &&
      selectedDepartment === "all" &&
      selectedSystem === "all"
    ) {
      fetchDevices();
    } else if (
      selectedOrganization !== "all" &&
      selectedPlant !== "all" &&
      selectedDepartment !== "all" &&
      selectedSystem !== "all"
    ) {
      setIsLoading(true);
      dispatch(
        getDeviceByOrganizationIdPlantIdDepartmentIdAndSystemId({
          plantId: parseInt(selectedPlant),
          organizationId: parseInt(selectedOrganization),
          departmentId: parseInt(selectedDepartment),
          systemId: parseInt(selectedSystem),
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
    selectedSystem,
    dispatch,
    organization_id,
    plant_id,
    department_id,
    system_id,
    fetchDevices,
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

    if (selectedSystem !== "all") {
      filtered = filtered.filter(
        (device: DeviceResult) => device.system_id === parseInt(selectedSystem)
      );
    }

    setFilteredDevices(filtered);
  }, [
    devices,
    searchTerm,
    selectedOrganization,
    selectedPlant,
    selectedDepartment,
    selectedSystem,
    plants,
    deviceFamily,
  ]);

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
        "Please select both organization, plant, department and system before adding a device"
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

    if (selectedSystem === "all") {
      Warning("Please select a system before adding a device");
      return;
    }

    setIsAddDeviceOpen(true);
    setPlantId(parseInt(selectedPlant));
    setOrganizationId(parseInt(selectedOrganization));
    setDepartmentId(parseInt(selectedDepartment));
    setSystemId(parseInt(selectedSystem));
  };

  const handleEditDevice = (
    deviceId: number,
    plantId: number,
    departmentId: number,
    systemId: number,
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
    setSystemId(systemId);
  };

  const handleReportDeviceClick = (deviceId: number, plantId: number) => {
    navigate(`/organization/devices/report/fm/${plantId}/${deviceId}`);
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
        fetchDepartments();
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
        fetchOrganizations();
        return;
      }

      if (result?.data?.refreshPlants) {
        fetchPlants();
        return;
      }

      if (result?.data?.refreshSystems) {
        fetchSystems();
        return;
      }

      setIsLoading(true);

      if (organization_id && plant_id && department_id && system_id) {
        dispatch(
          getDeviceByOrganizationIdPlantIdDepartmentIdAndSystemId({
            organizationId: parseInt(organization_id),
            plantId: parseInt(plant_id),
            departmentId: parseInt(department_id || "0"),
            systemId: parseInt(system_id),
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
        selectedDepartment !== "all" &&
        selectedSystem !== "all"
      ) {
        dispatch(
          getDeviceByOrganizationIdPlantIdDepartmentIdAndSystemId({
            plantId: parseInt(selectedPlant),
            organizationId: parseInt(selectedOrganization),
            departmentId: parseInt(selectedDepartment || "0"),
            systemId: parseInt(selectedSystem),
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
        fetchDevices();
      }
    },
    [
      dispatch,
      selectedOrganization,
      selectedPlant,
      organization_id,
      plant_id,
      fetchDevices,
      selectedDepartment,
      selectedSystem,
    ]
  );

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
          fetchDevices();
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

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganization(value);
    if (value === "all") {
      setSelectedPlant("all");
    }
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    setFilteredDevices(devices);
  };

  const systemName =
    selectedSystem !== "all"
      ? systems.find((system) => system.system_id.toString() === selectedSystem)
          ?.system_name || "System"
      : undefined;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto overflow-x-hidden">
      <div className="flex items-center justify-between gap-2 md:flex-row flex-col flex-wrap">
        <BreadcrumbNav
          organizationId={organization_id}
          plantId={plant_id}
          departmentId={department_id}
          selectedSystem={selectedSystem}
          systemName={systemName}
        />

        <div className="flex items-center flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={handleSearchClear}
            placeholder="Search devices by name, HWID, status, type, family name, or family ID..."
          />

          <button
            onClick={handleAddDevice}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add Device
          </button>
        </div>
      </div>

      <FilterSection
        organizations={organizations}
        plants={plants}
        departments={departments}
        systems={systems}
        selectedOrganization={selectedOrganization}
        selectedPlant={selectedPlant}
        selectedDepartment={selectedDepartment}
        selectedSystem={selectedSystem}
        onOrganizationChange={handleOrganizationChange}
        onPlantChange={setSelectedPlant}
        onDepartmentChange={setSelectedDepartment}
        onSystemChange={setSelectedSystem}
        onOrganizationClear={() => {
          setSelectedOrganization("all");
          setSelectedPlant("all");
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-14 h-14 text-text-primary animate-spin" />
        </div>
      ) : (
        <DeviceList
          groupedDevices={groupedDevices}
          systems={systems}
          organizations={organizations}
          plants={plants}
          departments={departments}
          deviceFamily={deviceFamily}
          collapsedSystems={collapsedSystems}
          searchTerm={searchTerm}
          selectedOrganization={selectedOrganization}
          onToggleSystem={toggleSystemCollapse}
          onEdit={handleEditDevice}
          onDelete={handleDeleteDevice}
          onAddDevice={handleAddDevice}
          onClearSearch={() => {
            setSearchTerm("");
            setSelectedOrganization("all");
          }}
          canDelete={admin?.role === "super_admin" || false}
          onReport={handleReportDeviceClick}
        />
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
          systemId={
            systemId ||
            (selectedSystem !== "all" ? parseInt(selectedSystem) : 0)
          }
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
          systemId={
            systemId ||
            (selectedSystem !== "all" ? parseInt(selectedSystem) : 0)
          }
          plantData={plants}
          departmentData={departments}
        />
      )}
    </div>
  );
};

export default Devices;
