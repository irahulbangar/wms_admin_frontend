import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Success, Error } from "../../utils/toast";
import { useAppDispatch } from "../../../store/store";
import {
  addProject,
  updateProjectById,
  getProjectById,
} from "../../../store/projectSlice";

interface ProjectFormData {
  project_name: string;
  latitude: string;
  longitude: string;
  address: string;
  status: string;
}

interface AddUpdateProjectProps {
  setShowModal: (show: boolean) => void;
  type: "add" | "update";
  projectId?: string;
  organizationId?: string;
  onUpdateSuccess?: (data: {
    success: boolean;
    data?: Record<string, unknown>;
  }) => void;
}

const AddUpdateProject = ({
  setShowModal,
  type,
  projectId,
  organizationId,
  onUpdateSuccess,
}: AddUpdateProjectProps) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    project_name: "",
    latitude: "",
    longitude: "",
    address: "",
    status: "",
  });

  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  useEffect(() => {
    if (type === "update" && projectId) {
      loadProjectData();
    }
  }, [type, projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const result = await dispatch(getProjectById(projectId)).unwrap();
      if (result.success && result.data && result.data.length > 0) {
        const project = result.data[0];
        setFormData({
          project_name: project.project_name || "",
          latitude: project.latitude || "",
          longitude: project.longitude || "",
          address: project.address || "",
          status: project.status || "active",
        });
      }
    } catch (error) {
      Error(`Failed to load project data: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.project_name.trim()) {
      newErrors.project_name = "Project name is required";
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

    if (!formData.status.trim()) {
      newErrors.status = "Status is required";
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

    if (errors[name as keyof ProjectFormData]) {
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

    setIsLoading(true);

    try {
      if (type === "add") {
        const projectPayload = {
          ...formData,
          organization_id: organizationId,
        };

        const result = await dispatch(addProject(projectPayload)).unwrap();
        if (result.success) {
          Success("Project added successfully");
          setShowModal(false);
          if (onUpdateSuccess) {
            onUpdateSuccess({
              success: true,
              data: result.data,
            });
          }
        }
      } else {
        if (!projectId) return;

        const projectPayload = {
          ...formData,
          id: projectId,
          organization_id: organizationId,
        };

        const result = await dispatch(
          updateProjectById(projectPayload)
        ).unwrap();
        if (result.success) {
          Success("Project updated successfully");
          if (onUpdateSuccess) {
            onUpdateSuccess({
              success: true,
              data: result.data,
            });
          }
          setShowModal(false);
        }
      }
    } catch (error) {
      Error(
        type === "add"
          ? `Failed to add project: ${error}`
          : `Failed to update project: ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setShowModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-primary pb-4 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {type === "add" ? "Add New Project" : "Update Project"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <label className="block text-base font-medium text-text-primary mb-2 font-roboto">
            Project Name
          </label>
          <input
            type="text"
            name="project_name"
            value={formData.project_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto ${
              errors.project_name
                ? "border-status-danger"
                : "border-border-primary"
            }`}
            placeholder="Enter project name"
          />
          {errors.project_name && (
            <p className="text-status-danger text-sm">{errors.project_name}</p>
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
            className={`w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto ${
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
            className={`w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto ${
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
            className={`w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto ${
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
            className="w-full px-3 py-2 text-text-primary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 border border-border-primary text-text-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer font-roboto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer font-roboto"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {type === "add" ? "Add Project" : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateProject;
