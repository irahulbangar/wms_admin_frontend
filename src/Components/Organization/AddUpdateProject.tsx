import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Success, Error } from "../../utils/toast";

interface ProjectFormData {
  project_name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "active" | "inactive" | "completed" | "on-hold";
  priority: "low" | "medium" | "high" | "urgent";
  budget: string;
  project_manager: string;
  team_size: string;
  location: string;
  notes: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    project_name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "active",
    priority: "medium",
    budget: "",
    project_manager: "",
    team_size: "",
    location: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  // Load project data for update mode
  useEffect(() => {
    if (type === "update" && projectId) {
      // TODO: Load project data from API
      // For now, using mock data
      setFormData({
        project_name: "Sample Project",
        description: "This is a sample project description",
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        status: "active",
        priority: "medium",
        budget: "50000",
        project_manager: "John Doe",
        team_size: "10",
        location: "New York",
        notes: "Sample project notes",
      });
    }
  }, [type, projectId]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.project_name.trim()) {
      newErrors.project_name = "Project name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (
      formData.start_date &&
      formData.end_date &&
      formData.start_date >= formData.end_date
    ) {
      newErrors.end_date = "End date must be after start date";
    }

    if (!formData.project_manager.trim()) {
      newErrors.project_manager = "Project manager is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = "Budget must be a valid number";
    }

    if (formData.team_size && isNaN(Number(formData.team_size))) {
      newErrors.team_size = "Team size must be a valid number";
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

    // Clear error when user starts typing
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
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      if (type === "add") {
        // Add new project
        Success("Project added successfully");
        setShowModal(false);
        // TODO: Refresh projects list
      } else {
        // Update existing project
        Success("Project updated successfully");
        if (onUpdateSuccess) {
          onUpdateSuccess({
            success: true,
            data: formData as unknown as Record<string, unknown>,
          });
        }
        setShowModal(false);
      }
    } catch {
      Error(
        type === "add" ? "Failed to add project" : "Failed to update project"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <h2 className="text-2xl font-bold text-text-primary">
            {type === "add" ? "Add New Project" : "Update Project"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.project_name
                    ? "border-red-500"
                    : "border-border-secondary"
                }`}
                placeholder="Enter project name"
              />
              {errors.project_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.project_name}
                </p>
              )}
            </div>

            {/* Project Manager */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Project Manager *
              </label>
              <input
                type="text"
                name="project_manager"
                value={formData.project_manager}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.project_manager
                    ? "border-red-500"
                    : "border-border-secondary"
                }`}
                placeholder="Enter project manager name"
              />
              {errors.project_manager && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.project_manager}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.start_date
                    ? "border-red-500"
                    : "border-border-secondary"
                }`}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.end_date ? "border-red-500" : "border-border-secondary"
                }`}
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Budget
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.budget ? "border-red-500" : "border-border-secondary"
                }`}
                placeholder="Enter budget amount"
              />
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
              )}
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Team Size
              </label>
              <input
                type="text"
                name="team_size"
                value={formData.team_size}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.team_size
                    ? "border-red-500"
                    : "border-border-secondary"
                }`}
                placeholder="Enter team size"
              />
              {errors.team_size && (
                <p className="text-red-500 text-sm mt-1">{errors.team_size}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? "border-red-500" : "border-border-secondary"
                }`}
                placeholder="Enter project location"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description
                  ? "border-red-500"
                  : "border-border-secondary"
              }`}
              placeholder="Enter project description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter additional notes"
            />
          </div>

          {/* Organization ID Display (if available) */}
          {organizationId && (
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-sm text-text-secondary">
                <span className="font-medium">Organization ID:</span>{" "}
                {organizationId}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border-primary">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 border border-border-secondary text-text-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {type === "add" ? "Add Project" : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateProject;
