import { useEffect, useRef, useState } from "react";
import {
  Search,
  PlusCircle,
  Columns3Cog,
  ChevronsLeft,
  Eye,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import NoDataFound from "../NoDataFound";
import AddUpdateProject from "./AddUpdateProject";
import { useAppDispatch } from "../../../store/store";
import {
  getAllProjects,
  getProjectsByOrganizationId,
} from "../../../store/projectSlice";
import type { ProjectResult } from "../../../model/project.interface";
import { Error } from "../../utils/toast";
import { fromatDateWithTime } from "../../utils/utils";
import { getOrganizations } from "../../../store/organizationSlice";
import type { OrganizationResult } from "../../../model/organizations.interface";

const Projects = () => {
  const { organization_id } = useParams<{ organization_id: string }>();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddModalType, setShowAddModalType] = useState<"add" | "update">(
    "add"
  );
  const [projectId, setProjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [projects, setProjects] = useState<ProjectResult[]>([]);
  const hasCalledAPI = useRef(false);
  const [organizations, setOrganizations] = useState<OrganizationResult[]>([]);

  const handleBackToOrganizations = () => {
    navigate("/organization");
  };

  const getProjects = async () => {
    if (isLoading || hasCalledAPI.current) return;
    hasCalledAPI.current = true;
    setIsLoading(true);
    try {
      const res = await dispatch(getAllProjects()).unwrap();
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.toString() : String(err);
      Error(errorMessage || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectByOrganizationId = async () => {
    if (isLoading || hasCalledAPI.current) return;
    hasCalledAPI.current = true;
    setIsLoading(true);
    try {
      const res = await dispatch(
        getProjectsByOrganizationId(organization_id!)
      ).unwrap();
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.toString() : String(err);
      Error(errorMessage || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getAllOrganizations = async () => {
    if (isLoading || hasCalledAPI.current) return;
    hasCalledAPI.current = true;
    setIsLoading(true);

    await dispatch(getOrganizations())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setOrganizations(res.data);
        }
      })
      .catch((err: unknown) => {
        const errorMessage =
          err instanceof Error ? err.toString() : String(err);
        Error(errorMessage || "An error occurred");
      });
  };

  // Reset projects and loading state when organization_id changes
  useEffect(() => {
    setProjects([]);
    setIsLoading(false);
    getAllOrganizations();

    if (organization_id) {
      getProjectByOrganizationId();
    } else {
      getProjects();
    }
  }, [organization_id]);

  const handleAddProject = () => {
    setShowAddModalType("add");
    setProjectId("");
    setShowAddModal(true);
  };

  const handleEditProject = (id: string) => {
    setShowAddModalType("update");
    setProjectId(id);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowAddModalType("add");
    setProjectId("");
  };

  const handleProjectUpdate = (updatedData: {
    success: boolean;
    data?: Record<string, unknown>;
  }) => {
    if (updatedData.success) {
      handleModalClose();
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-4">
      <div className="flex items-center w-full">
        {organization_id && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToOrganizations}
              className="flex items-center gap-2 pr-3 text-text-primary hover:text-text-secondary transition-colors duration-200 cursor-pointer"
            >
              <ChevronsLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            {organization_id
              ? `Projects - Organization ${organization_id}`
              : "Projects"}
          </h1>
        </div>
        <div className="flex-shrink-0">
          <select
            value={organization_id}
            className="px-3 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-primary text-text-primary w-54"
          >
            <option value="all">All Organization</option>
            {organizations.map((organization, index) => (
              <option key={index} value={organization.organization_id}>
                {organization.org_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleAddProject}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-primary rounded-lg">
          <Loader2 className="w-14 h-14 text-text-primary animate-spin" />
        </div>
      ) : (
        <div className="relative overflow-auto shadow-sm rounded-lg pb-0 bg-primary flex-1">
          <table className="w-full text-sm text-left rtl:text-right text-text-primary">
            <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary">
              <tr>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  No
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Project Name
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Latitude
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Longitude
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Address
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Status
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Created At
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Updated At
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <tr
                    key={index}
                    className="border-b border-border-primary bg-primary hover:bg-secondary"
                  >
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {project.project_name}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {project.latitude}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {project.longitude}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {project.address}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {project.status}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {fromatDateWithTime(project.created_at)}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {fromatDateWithTime(project.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            handleEditProject(project.project_id.toString())
                          }
                          className="text-status-info hover:text-status-info-hover transition-colors duration-200 cursor-pointer"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="text-status-danger hover:text-status-danger-hover transition-colors duration-200 cursor-pointer">
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button className="text-teal-500 hover:text-teal-600 transition-colors duration-200 cursor-pointer">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-text-primary text-center font-roboto text-sm"
                  >
                    <NoDataFound
                      icon={
                        <Columns3Cog className="w-16 h-16 text-text-muted mx-auto mb-4" />
                      }
                      title={
                        organization_id
                          ? `No projects found for organization ${organization_id}`
                          : "No projects found"
                      }
                      description={
                        organization_id
                          ? `Add your first project for organization ${organization_id} to get started`
                          : "Add your first project to get started"
                      }
                      buttonText="Add Project"
                      buttonOnClick={handleAddProject}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Update Project Modal */}
      {showAddModal && (
        <AddUpdateProject
          setShowModal={handleModalClose}
          type={showAddModalType}
          projectId={projectId}
          organizationId={organization_id}
          onUpdateSuccess={handleProjectUpdate}
        />
      )}
    </div>
  );
};

export default Projects;
