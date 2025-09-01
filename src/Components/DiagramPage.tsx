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
      <div className="max-w-6xl mx-auto px-4 py-6 h-full w-full">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-secondary border border-border-primary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer font-roboto"
          >
            Back
          </button>
          <h1 className="text-2xl font-semibold font-roboto">Diagram Editor</h1>
        </div>

        <div className="rounded-lg border border-border-primary bg-primary p-6 h-full w-full">
          <p className="text-text-secondary">
            This is a standalone diagram page outside the dashboard layout.
            Implement your diagram UI here.
          </p>
          <ReactFlow className="h-full w-full">
            <Background variant={BackgroundVariant.Dots} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default DiagramPage;
