import { useNavigate } from "react-router-dom";

const DiagramPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/organization/plants");
  };

  return (
    <div className="min-h-screen bg-primary text-text-primary">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-secondary border border-border-primary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer font-roboto"
          >
            Back
          </button>
          <h1 className="text-2xl font-semibold font-roboto">Diagram Editor</h1>
        </div>

        <div className="rounded-lg border border-border-primary bg-primary p-6">
          <p className="text-text-secondary">
            This is a standalone diagram page outside the dashboard layout.
            Implement your diagram UI here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiagramPage;
