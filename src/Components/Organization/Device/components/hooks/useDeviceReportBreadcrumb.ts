import { useNavigate } from "react-router-dom";
import type { DeviceResult } from "../../../../../../model/devices.interface";

/**
 * Custom hook for device report breadcrumb navigation
 */
export const useDeviceReportBreadcrumb = (device: DeviceResult | null) => {
  const navigate = useNavigate();

  const handleBackToHome = () => navigate("/");
  const handleBackToOrganizations = () => navigate("/organization");
  const handleBackToPlants = () => {
    if (device?.organization_id) {
      navigate(`/organization/plants/${device.organization_id}`);
    } else {
      navigate("/organization/plants");
    }
  };
  const handleBackToDepartments = () => {
    if (device?.organization_id && device?.plant_id) {
      navigate(
        `/organization/departments/${device.organization_id}/${device.plant_id}`
      );
    } else {
      navigate("/organization/departments");
    }
  };
  const handleBackToSystems = () => {
    if (device?.organization_id && device?.plant_id && device?.department_id) {
      navigate(
        `/organization/systems/${device.organization_id}/${device.plant_id}/${device.department_id}`
      );
    } else {
      navigate("/organization/systems");
    }
  };
  const handleBackToDevices = () => {
    if (
      device?.organization_id &&
      device?.plant_id &&
      device?.department_id &&
      device?.system_id
    ) {
      navigate(
        `/organization/devices/${device.organization_id}/${device.plant_id}/${device.department_id}/${device.system_id}`
      );
    } else {
      navigate("/organization/devices");
    }
  };

  return {
    handleBackToHome,
    handleBackToOrganizations,
    handleBackToPlants,
    handleBackToDepartments,
    handleBackToSystems,
    handleBackToDevices,
  };
};
