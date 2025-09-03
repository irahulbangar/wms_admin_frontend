import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, SquarePen } from "lucide-react";
import { useAppDispatch } from "../../../store/store";
import {
  createUserPlant,
  getUserPlantByUserId,
  updateUserPlantByUserId,
} from "../../../store/userPlantSlice";
import { getProjectsByOrganizationId } from "../../../store/projectSlice";
import type { ProjectResult } from "../../../model/project.interface";
import NoDataFound from "../NoDataFound";
import { User } from "lucide-react";
import type { UserPlantResult } from "../../../model/user-plants.interface";
import { Error, Success } from "../../utils/toast";
import { handleStatus } from "../../utils/utils";

interface UserPlantsProps {
  onClose: () => void;
  userId?: number;
  organizationId: string;
}

interface UserPlantFormData {
  project_id: number;
  role: string;
  status: string;
}

const UserPlants: React.FC<UserPlantsProps> = ({
  onClose,
  userId,
  organizationId,
}) => {
  const dispatch = useAppDispatch();

  const [userPlants, setUserPlants] = useState<UserPlantResult[]>([]);
  const [projects, setProjects] = useState<ProjectResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserPlantFormData>({
    project_id: 0,
    role: "",
    status: "",
  });
  const [editingUserPlantId, setEditingUserPlantId] = useState<number | null>(
    null
  );

  const roleOptions = [
    { value: "org_user", label: "User" },
    { value: "org_admin", label: "Admin" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const fetchUserPlants = useCallback(async () => {
    if (userId) {
      try {
        console.log("Fetching user plants for userId:", userId);
        const result = await dispatch(getUserPlantByUserId(userId)).unwrap();
        console.log("User plants fetch result:", result);
        if (result.success && result.data) {
          setUserPlants(result.data);
          console.log("User plants set:", result.data);
        }
      } catch (error) {
        console.error("Error fetching user plants:", error);
        Error(error as string);
      }
    }
  }, [dispatch, userId]);

  const fetchProjects = useCallback(async () => {
    try {
      await dispatch(getProjectsByOrganizationId(organizationId))
        .unwrap()
        .then((res) => {
          if (res.success && res.data) {
            setProjects(res.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching projects:", error);
          Error(error as string);
        });
    } catch (error) {
      console.error("Error fetching projects:", error);
      Error(error as string);
    }
  }, [dispatch, organizationId]);

  useEffect(() => {
    fetchUserPlants();
    fetchProjects();
  }, [fetchUserPlants, fetchProjects]);

  const handleClose = () => {
    setEditingUserPlantId(null);
    setFormData({
      project_id: 0,
      role: "",
      status: "",
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.project_id) {
      Error("Please select a project");
      return;
    }
    if (!formData.role) {
      Error("Please select a role");
      return;
    }
    if (!formData.status) {
      Error("Please select a status");
      return;
    }

    const userPlantData = {
      project_id: formData.project_id,
      role: formData.role || "org_user",
      status: formData.status || "active",
    };

    setLoading(true);

    try {
      if (editingUserPlantId) {
        console.log("Updating user plant with data:", {
          user_id: userId,
          ...userPlantData,
        });
        await dispatch(
          updateUserPlantByUserId({
            user_id: userId as number,
            ...userPlantData,
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success) {
              Success(res.message);
              setFormData({
                project_id: 0,
                role: "",
                status: "",
              });
            }
          });
      } else {
        console.log("Creating user plant with data:", {
          user_id: userId,
          ...userPlantData,
        });
        await dispatch(createUserPlant({ ...userPlantData }))
          .unwrap()
          .then((res) => {
            if (res.success) {
              Success(res.message);
              setFormData({
                project_id: 0,
                role: "",
                status: "",
              });
            }
          })
          .catch((error) => {
            Error(error as string);
          });
      }

      await fetchUserPlants();
    } catch (error) {
      console.error("Operation error:", error);
      Error(error as string);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUserPlant = (userPlantId: number) => {
    const userPlant = userPlants.find((plant) => plant.user_id === userPlantId);
    if (userPlant) {
      setEditingUserPlantId(userPlantId);
      setFormData({
        project_id: userPlant.project_id,
        role: userPlant.role,
        status: userPlant.status,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary sticky top-0 bg-primary z-10">
          <h2 className="text-xl font-semibold text-text-primary font-roboto">
            {editingUserPlantId ? "Edit User Plant" : "Add User Plants"}
          </h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-text-primary mb-2 font-roboto">
            Project
          </label>
          <select
            value={formData.project_id}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                project_id: parseInt(e.target.value),
              }))
            }
            className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-primary text-text-primary"
          >
            {projects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.project_name}
              </option>
            ))}
          </select>

          {/* Role Dropdown */}
          <label className="block text-sm font-medium text-text-primary mb-2 font-roboto">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, role: e.target.value }))
            }
            className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-primary text-text-primary"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-text-primary mb-2 font-roboto">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-primary text-text-primary"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-border-primary text-text-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer font-roboto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer font-roboto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingUserPlantId ? "Updating..." : "Adding..."}
                </>
              ) : editingUserPlantId ? (
                "Update User Plant"
              ) : (
                "Add User Plant"
              )}
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-primary">
              <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
            </div>
          ) : (
            <div className="relative overflow-auto shadow-sm rounded-lg bg-primary">
              <table className="w-full text-sm text-left rtl:text-right text-text-primary">
                <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                      Sr No
                    </th>
                    <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                      Client Name
                    </th>
                    <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                      Role
                    </th>
                    <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                      Status
                    </th>
                    <th className="px-6 py-3 text-text-primary whitespace-nowrap text-center text-base font-roboto font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userPlants.length > 0 ? (
                    userPlants.map((plant, index) => (
                      <tr
                        key={index}
                        className="bg-primary border-b border-border-primary hover:bg-secondary"
                      >
                        <td className="px-6 py-4 text-center font-roboto text-text-secondary text-base">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-roboto whitespace-nowrap text-center text-text-primary text-base">
                          {plant.project_name}
                        </td>
                        <td className="px-6 py-4 font-roboto whitespace-nowrap text-center text-text-primary text-base">
                          {plant.client_name}
                        </td>
                        <td className="px-6 py-4 font-roboto whitespace-nowrap text-center text-text-primary text-base capitalize">
                          {plant.role}
                        </td>
                        <td className="px-6 py-4 font-roboto text-center text-text-primary text-base">
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${handleStatus(
                              plant.status
                            )}`}
                          >
                            {plant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-roboto whitespace-nowrap text-center text-text-primary text-base">
                          <div className="flex items-center gap-2 justify-center">
                            <SquarePen
                              onClick={() =>
                                handleEditUserPlant(plant.user_plant_id)
                              }
                              className="w-4 h-4 text-status-info cursor-pointer"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center font-roboto text-text-secondary text-sm"
                      >
                        <NoDataFound
                          icon={
                            <User className="w-16 h-16 text-text-muted mx-auto mb-4" />
                          }
                          title={
                            formData.project_id !== 0 ||
                            formData.role ||
                            formData.status
                              ? "No matching plants found"
                              : "No plants found for this user"
                          }
                          description={
                            formData.project_id !== 0 ||
                            formData.role ||
                            formData.status
                              ? "Try adjusting your filters or search terms"
                              : "This user doesn't have any plants assigned yet"
                          }
                          buttonText=""
                          buttonOnClick={() => {}}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPlants;
