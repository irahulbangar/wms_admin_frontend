import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Success, Error } from "../../../utils/toast";
import { useAppDispatch } from "../../../../store/store";
import {
  addPlant,
  updatePlantById,
  getPlantById,
} from "../../../../store/plantSlice";
import type { SinglePlantResult } from "../../../../model/single-plant.interface";
// import { Editor } from "@monaco-editor/react";
// import ReportUnitDropdown from "../../Common/ReportUnitDropdown";

interface PlantFormData {
  plant_name: string;
  latitude: string;
  longitude: string;
  address: string;
  status: string;
  unit: string;
  show_plant: number;
  show_department: number;
  show_system: number;
  show_device: number;
  show_water_report: number;
  show_plant_layout: number;
  show_notification: number;
}

interface ReportData {
  report_name: string;
  report_unit: string;
  report_formula: string;
  neutrality_formula: string;
}

interface AddUpdatePlantProps {
  setShowModal: (show: boolean) => void;
  type: "add" | "update";
  plantId?: string;
  organizationId?: string;
  onUpdateSuccess?: (data: {
    success: boolean;
    data?: Record<string, unknown>;
  }) => void;
  refreshPlants?: () => void;
}

const AddUpdatePlant: React.FC<AddUpdatePlantProps> = ({
  setShowModal,
  type,
  plantId,
  organizationId,
  onUpdateSuccess,
  refreshPlants,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<PlantFormData>({
    plant_name: "",
    latitude: "",
    longitude: "",
    address: "",
    status: "active",
    unit: "Ltr",
    show_plant: 0,
    show_department: 0,
    show_system: 0,
    show_device: 0,
    show_water_report: 0,
    show_plant_layout: 0,
    show_notification: 0,
  });

  const [reportData, setReportData] = useState<ReportData>({
    report_name: "",
    report_unit: "",
    report_formula: "",
    neutrality_formula: "",
  });

  const [errors, setErrors] = useState<Partial<PlantFormData>>({});

  useEffect(() => {
    if (type === "update" && plantId) {
      loadPlantData();
    }
  }, [type, plantId]);

  const loadPlantData = async () => {
    if (!plantId) return;

    await dispatch(getPlantById(plantId))
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          const plant = res.data as SinglePlantResult;
          const newFormData = {
            plant_name: plant.plant_name || "",
            latitude: plant.latitude || "",
            longitude: plant.longitude || "",
            address: plant.address || "",
            status: plant.status || "active",
            unit: plant.unit || "Ltr",
            show_plant: plant.show_plant.toString() === "1" ? 1 : 0,
            show_department: plant.show_department.toString() === "1" ? 1 : 0,
            show_system: plant.show_system.toString() === "1" ? 1 : 0,
            show_device: plant.show_device.toString() === "1" ? 1 : 0,
            show_water_report: plant.show_water_report.toString() === "1" ? 1 : 0,
            show_plant_layout: plant.show_plant_layout.toString() === "1" ? 1 : 0,
            show_notification: plant.show_notification.toString() === "1" ? 1 : 0,
          };
          setFormData(newFormData);

          if (plant.plant_reporting) {
            setReportData({
              report_name: plant.plant_reporting.report_name || "",
              report_unit: plant.plant_reporting.report_unit || "",
              report_formula: plant.plant_reporting.report_formula || "",
              neutrality_formula:
                plant.plant_reporting.neutrality_formula || "",
            });
          }
        } else {
          Error(res.message || "Failed to load plant data");
        }
      })
      .catch((error) => {
        Error(error.message || "Failed to load plant data");
      });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, type } = e.target;
    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
          ? 1
          : 0
        : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof PlantFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === "add" && !organizationId) {
      Error("Organization ID is required to add a plant");
      return;
    }

    if (type === "add") {
      const plantPayload = {
        ...formData,
        organization_id: organizationId,
        plant_reporting: reportData,
      };

      await dispatch(addPlant(plantPayload))
        .unwrap()
        .then((res) => {
          if (res.success || res.status === 200) {
            Success(res.message);
            setShowModal(false);
            if (refreshPlants) {
              refreshPlants();
            }
            if (onUpdateSuccess) {
              onUpdateSuccess({
                success: true,
                data: res.data,
              });
            }
          } else {
            Error(res.message || "Failed to add plant");
          }
        })
        .catch((error) => {
          Error(error.message || "Failed to add plant");
        });
    } else {
      if (!plantId) {
        Error("Plant ID is required for update");
        return;
      }

      const plantPayload = {
        ...formData,
        id: plantId,
        organization_id: organizationId,
        plant_reporting: reportData,
      };

      await dispatch(updatePlantById(plantPayload))
        .unwrap()
        .then((res) => {
          if (res.success || res.status === 200) {
            Success(res.message);
            setShowModal(false);
            if (refreshPlants) {
              refreshPlants();
            }
            if (onUpdateSuccess) {
              onUpdateSuccess({
                success: true,
                data: res.data,
              });
            }
          } else {
            Error(res.message || "Failed to update plant");
          }
        })
        .catch((error) => {
          Error(error.message || "Failed to update plant");
        });
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-primary pb-4 border-b border-border-primary z-10">
          <h2 className="text-xl font-normal text-text-primary font-roboto">
            {type === "add" ? "Add New Plant" : "Update Plant"}
          </h2>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Plant Name
          </label>
          <input
            type="text"
            name="plant_name"
            value={formData.plant_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto ${
              errors.plant_name
                ? "border-status-danger"
                : "border-border-primary"
            }`}
            placeholder="Enter plant name"
          />

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Latitude
          </label>
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            placeholder="Enter latitude"
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto ${
              errors.latitude ? "border-status-danger" : "border-border-primary"
            }`}
          />

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Longitude
          </label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            placeholder="Enter longitude"
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto ${
              errors.longitude
                ? "border-status-danger"
                : "border-border-primary"
            }`}
          />

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto ${
              errors.address ? "border-status-danger" : "border-border-primary"
            }`}
            placeholder="Enter address"
          />

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <label className="block text-base font-normal text-text-primary mb-2 font-roboto">
            Unit
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
          >
            <option value="Ltr">Ltr</option>
            <option value="M^3">
              m<sup>3</sup>
            </option>
          </select>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-start gap-2">
              <label className="text-base font-normal text-text-primary font-roboto">
                Show Plant
              </label>
              <input
                type="checkbox"
                name="show_plant"
                checked={formData.show_plant === 1}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    show_plant: e.target.checked ? 1 : 0,
                  }));
                }}
                className="w-4 h-4"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <label className="text-base font-normal text-text-primary font-roboto">
                Show Department
              </label>
              <input
                type="checkbox"
                name="show_department"
                checked={formData.show_department === 1}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    show_department: e.target.checked ? 1 : 0,
                  }));
                }}
                className="w-4 h-4"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <label className="text-base font-normal text-text-primary font-roboto">
                Show System
              </label>
              <input
                type="checkbox"
                name="show_system"
                checked={formData.show_system === 1}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    show_system: e.target.checked ? 1 : 0,
                  }));
                }}
                className="w-4 h-4"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <label className="text-base font-normal text-text-primary font-roboto">
                Show Device
              </label>
              <input
                type="checkbox"
                name="show_device"
                checked={formData.show_device === 1}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    show_device: e.target.checked ? 1 : 0,
                  }));
                }}
                className="w-4 h-4"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <label className="text-base font-normal text-text-primary font-roboto">
                Show Water Report
              </label>
              <input
                type="checkbox"
                name="show_water_report"
                checked={formData.show_water_report === 1}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    show_water_report: e.target.checked ? 1 : 0,
                  }));
                }}
                className="w-4 h-4"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <label className="text-base font-normal text-text-primary font-roboto">
                Show Plant Layout
              </label>
              <input
                type="checkbox"
                name="show_plant_layout"
                checked={formData.show_plant_layout === 1}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    show_plant_layout: e.target.checked ? 1 : 0,
                  }));
                }}
                className="w-4 h-4"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <label className="text-base font-normal text-text-primary font-roboto">
                Show Notification
              </label>
              <input
                type="checkbox"
                name="show_notification"
                checked={formData.show_notification === 1}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    show_notification: e.target.checked ? 1 : 0,
                  }));
                }}
                className="w-4 h-4"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-1.5 border border-border-primary text-text-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer font-roboto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer font-roboto"
            >
              {type === "add" ? "Add Plant" : "Update Plant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdatePlant;
