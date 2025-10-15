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
  unit: string;
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
    unit: "ltr",
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
          const plant = res.data as unknown as PlantResult;
          const newFormData = {
            plant_name: plant.plant_name || "",
            latitude: plant.latitude || "",
            longitude: plant.longitude || "",
            address: plant.address || "",
            status: plant.status || "active",
            unit: plant.unit || "ltr",
          };
          setFormData(newFormData);
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

          <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
            Unit
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info font-roboto"
          >
            <option value="Ltr">Ltr</option>
            <option value="M^3">M^3</option>
          </select>

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
