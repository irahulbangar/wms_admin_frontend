import { useEffect, useRef, useState } from "react";
import { Search, PlusCircle, Columns3Cog, ChevronsLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import NoDataFound from "../NoDataFound";
import AddUpdateProject from "./AddUpdateProject";
import { useAppDispatch } from "../../../store/store";
import { getAllProjects } from "../../../store/projectSlice";
import type { ProjectResult } from "../../../model/project.interface";
import { Error } from "../../utils/toast";

const Projects = () => {
  const { organization_id } = useParams();
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

  const handleBackToOrganizations = () => {
    navigate("/organization");
  };

  const getProjects = () => {
    if (isLoading) return;
    setIsLoading(true);
    dispatch(getAllProjects())
      .unwrap()
      .then((res) => {
        if (res.success) {
          setProjects(res.data);
        }
      })
      .catch((err) => {
        Error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;
    getProjects();
  }, []);

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
    <div className="flex flex-col gap-6 h-full">
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

      <div className="h-[calc(100vh-295px)]">
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
      </div>

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
