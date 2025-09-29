import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Success, Error } from "../../utils/toast";
import { useAppDispatch } from "../../../store/store";
import {
  addPlant,
  updatePlantById,
  getPlantById,
} from "../../../store/plantSlice";
import type { PlantResult } from "../../../model/plant.interface";

interface PlantFormData {
  plant_name: string;
  latitude: string;
  longitude: string;
  address: string;
  status: string;
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
        if (res.success && res.data) {
          const plant = res.data as unknown as PlantResult;
          const newFormData = {
            plant_name: plant.plant_name || "",
            latitude: plant.latitude || "",
            longitude: plant.longitude || "",
            address: plant.address || "",
            status: plant.status || "active",
          };
          setFormData(newFormData);
        } else {
          Error(res.message);
        }
      })
      .catch((error) => {
        Error(`Failed to load plant data: ${error}`);
      });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PlantFormData> = {};

    if (!formData.plant_name.trim()) {
      newErrors.plant_name = "Plant name is required";
    }

    if (!formData.latitude.trim()) {
      newErrors.latitude = "Latitude is required";
    }

    if (!formData.longitude.trim()) {
      newErrors.longitude = "Longitude is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
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

    if (!validateForm()) {
      return;
    }

    if (type === "add" && !organizationId) {
      Error("Organization ID is required to add a plant");
      return;
    }

    if (type === "add") {
      const plantPayload = {
        ...formData,
        organization_id: organizationId,
      };

      await dispatch(addPlant(plantPayload))
        .unwrap()
        .then((res) => {
          if (res.success) {
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
            Error(res.message);
          }
        })
        .catch((error) => {
          Error(`Failed to add plant: ${error}`);
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
      };

      await dispatch(updatePlantById(plantPayload))
        .unwrap()
        .then((res) => {
          if (res.success) {
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
            Error(res.message);
          }
        })
        .catch((error) => {
          Error(`Failed to update plant: ${error}`);
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
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
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
          <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
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
          {errors.plant_name && (
            <p className="text-status-danger text-sm">{errors.plant_name}</p>
          )}

          <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
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
          {errors.latitude && (
            <p className="text-status-danger text-sm">{errors.latitude}</p>
          )}

          <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
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
          {errors.longitude && (
            <p className="text-status-danger text-sm">{errors.longitude}</p>
          )}

          <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
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
          {errors.address && (
            <p className="text-status-danger text-sm">{errors.address}</p>
          )}

          <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
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

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-border-primary text-text-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer font-roboto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer font-roboto"
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
