import { ChevronsLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactFlow, { Background, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";

const DiagramPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/organization/plants");
  };

  return (
    <div className="bg-primary text-text-primary h-screen w-full">
      <div className="h-full w-full flex">
        <main className="flex-1 flex flex-col h-full w-full">
          <div className="pl-4 pt-4 w-fit">
            <button
              onClick={handleBack}
              className="w-full px-4 py-2 bg-secondary border border-border-primary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer font-roboto flex items-center gap-2"
            >
              <ChevronsLeft />
              Back
            </button>
          </div>
          <div className="h-full w-full p-4">
            <ReactFlow className="h-full w-full">
              <Background variant={BackgroundVariant.Dots} />
            </ReactFlow>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DiagramPage;
