import { useEffect, useState } from "react";
import {
  Search,
  PlusCircle,
  Columns3Cog,
  Eye,
  Trash2,
  Edit,
  Loader2,
  X,
  Check,
  Home,
  ChevronRight,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import NoDataFound from "../NoDataFound";
import AddUpdateProject from "./AddUpdateProject";
import { useAppDispatch } from "../../../store/store";
import {
  getAllProjects,
  getProjectsByOrganizationId,
  deleteProjectById,
} from "../../../store/projectSlice";
import type { ProjectResult } from "../../../model/project.interface";
import { Error, Success, Warning } from "../../utils/toast";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [filteredProjects, setFilteredProjects] = useState<ProjectResult[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>(
    organization_id || "all"
  );
  const dispatch = useAppDispatch();
  const [projects, setProjects] = useState<ProjectResult[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationResult[]>([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteProject, setDeleteProject] = useState<ProjectResult | null>(
    null
  );

  // const handleDeleteClick = (project: ProjectResult) => {
  //   setDeleteProject(project);
  //   setShowDeletePopup(true);
  // };

  const handleConfirmDelete = async () => {
    if (deleteProject) {
      await handleDeleteProject(deleteProject.project_id.toString());
      setShowDeletePopup(false);
      setDeleteProject(null);
    }
  };

  const handleCloseDeletePopup = () => {
    setShowDeletePopup(false);
    setDeleteProject(null);
  };

  const handleBackToOrganizations = () => {
    navigate("/organization");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const getProjects = async () => {
    if (isLoading) return;
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

  const getProjectByOrganizationId = async (orgId?: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const targetOrgId = orgId || organization_id;
      if (!targetOrgId) return;

      const res = await dispatch(
        getProjectsByOrganizationId(targetOrgId)
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
    try {
      const res = await dispatch(getOrganizations()).unwrap();
      if (res.success) {
        setOrganizations(res.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.toString() : String(err);
      Error(errorMessage || "An error occurred");
    }
  };

  useEffect(() => {
    setProjects([]);
    setIsLoading(false);
    getAllOrganizations();

    if (organization_id) {
      setSelectedOrganizationId(organization_id);
      getProjectByOrganizationId(organization_id);
    } else {
      setSelectedOrganizationId("all");
      getProjects();
    }
  }, [organization_id]);

  useEffect(() => {
    let filtered = projects;

    if (filterBy !== "all") {
      filtered = filtered.filter((project) => project.status === filterBy);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.project_name.toLowerCase().includes(searchLower) ||
          project.address.toLowerCase().includes(searchLower) ||
          project.status.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProjects(filtered);
  }, [projects, filterBy, searchTerm]);

  const handleAddProject = () => {
    if (selectedOrganizationId === "all") {
      Warning("Please select an organization first before adding a project");
      return;
    }
    setShowAddModalType("add");
    setProjectId("");
    setShowAddModal(true);
  };

  const handleEditProject = (id: string) => {
    setShowAddModalType("update");
    setProjectId(id);
    setShowAddModal(true);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const result = await dispatch(deleteProjectById(id)).unwrap();
      if (result.success) {
        Success("Project deleted successfully");
        if (selectedOrganizationId === "all") {
          getProjects();
        } else {
          getProjectByOrganizationId(selectedOrganizationId);
        }
      }
    } catch (error) {
      Error(`Failed to delete project: ${error}`);
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowAddModalType("add");
    setProjectId("");
    getProjects();
  };

  const handleProjectUpdate = (updatedData: {
    success: boolean;
    data?: Record<string, unknown>;
  }) => {
    if (updatedData.success) {
      handleModalClose();
    }
  };

  const handleViewDevices = (projectId: number, organizationId: number) => {
    navigate(`/organization/devices/${projectId}/${organizationId}`);
  };

  return (
    <div className="flex flex-col gap-4 h-full pb-5">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1 rounded-lg w-fit">
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

        {selectedOrganizationId !== "all" && (
          <>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary font-medium bg-secondary/30 px-2 py-1 rounded">
              {organizations.find(
                (org) => org.organization_id === selectedOrganizationId
              )?.org_name || selectedOrganizationId}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center w-full gap-4 justify-end">
        <div className="flex-shrink-0">
          <select
            value={selectedOrganizationId}
            onChange={(e) => {
              const newOrgId = e.target.value;
              setSelectedOrganizationId(newOrgId);
              if (newOrgId === "all") {
                getProjects();
              } else {
                getProjectByOrganizationId(newOrgId);
              }
            }}
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
        <div className="flex-shrink-0 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-text-secondary bg-primary border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
              <tr>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  No
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Project Name
                </th>
                <th className="p-4 text-text-primary whitespace-nowrap text-center font-roboto text-sm">
                  Organization Id
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
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
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
                      {project.organization_id}
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
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm capitalize">
                      <div className="flex items-center gap-2 justify-center">
                        {project?.status === "active" ? (
                          <Check className="w-5 h-5 text-status-success" />
                        ) : (
                          <X className="w-5 h-5 text-status-danger" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {fromatDateWithTime(project.created_at)}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      {fromatDateWithTime(project.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-center font-roboto text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Edit
                          onClick={() =>
                            handleEditProject(project.project_id.toString())
                          }
                          className="w-5 h-5 text-status-info cursor-pointer"
                        />
                        {/* <Trash2
                          onClick={() =>
                            handleDeleteProject(project.project_id.toString())
                          }
                          className="w-5 h-5 text-status-danger cursor-pointer"
                        /> */}

                        <Eye
                          onClick={() =>
                            handleViewDevices(
                              project.project_id,
                              project.organization_id
                            )
                          }
                          className="w-5 h-5 text-teal-500 cursor-pointer"
                        />
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
                        searchTerm || filterBy !== "all"
                          ? "No projects match your search/filter"
                          : selectedOrganizationId === "all"
                          ? "No projects found"
                          : `No projects found for ${
                              organizations.find(
                                (org) =>
                                  org.organization_id === selectedOrganizationId
                              )?.org_name ||
                              `Organization ${selectedOrganizationId}`
                            }`
                      }
                      description={
                        searchTerm || filterBy !== "all"
                          ? "Try adjusting your search terms or filter criteria"
                          : selectedOrganizationId === "all"
                          ? "Add your first project to get started"
                          : `Add your first project for ${
                              organizations.find(
                                (org) =>
                                  org.organization_id === selectedOrganizationId
                              )?.org_name ||
                              `Organization ${selectedOrganizationId}`
                            } to get started`
                      }
                      buttonText={
                        searchTerm || filterBy !== "all"
                          ? "Clear Search"
                          : "Add Project"
                      }
                      buttonOnClick={() => {
                        if (searchTerm || filterBy !== "all") {
                          setSearchTerm("");
                          setFilterBy("all");
                        } else {
                          handleAddProject();
                        }
                      }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddUpdateProject
          setShowModal={handleModalClose}
          type={showAddModalType}
          projectId={projectId}
          organizationId={
            selectedOrganizationId === "all"
              ? undefined
              : selectedOrganizationId
          }
          onUpdateSuccess={handleProjectUpdate}
        />
      )}

      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 bg-opacity-50 transition-opacity"
            onClick={handleCloseDeletePopup}
          />
          <div className="relative bg-primary rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
              <h3 className="text-xl font-semibold text-text-primary font-roboto">
                Delete Project
              </h3>
              <button
                onClick={handleCloseDeletePopup}
                className="text-text-primary hover:text-text-primary/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-text-secondary mb-4 font-roboto">
                Are you sure you want to delete{" "}
                <span className="font-bold">{deleteProject?.project_name}</span>
                ?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border-primary">
              <button
                onClick={handleCloseDeletePopup}
                className="px-4 py-2 text-text-primary bg-secondary border border-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer font-roboto"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-status-danger hover:bg-status-danger/80 text-white rounded-lg transition-colors flex items-center gap-2 font-roboto"
              >
                <Trash2 className="w-4 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
