import React from "react";
import { ChevronsLeft, Trash2, Download } from "lucide-react";

interface DiagramControlsProps {
  hasChanges: boolean;
  isSaving: boolean;
  selectedEdge: string | null;
  onBack: () => void;
  onSaveDiagram: () => void;
  onDeleteSelectedEdge: () => void;
  onClearAllEdges: () => void;
  onDownloadDiagram: () => void;
}

const DiagramControls: React.FC<DiagramControlsProps> = ({
  hasChanges,
  isSaving,
  selectedEdge,
  onBack,
  onSaveDiagram,
  onDeleteSelectedEdge,
  onClearAllEdges,
  onDownloadDiagram,
}) => {
  const handleClearAllEdgesWithConfirm = () => {
    if (confirm("Are you sure you want to delete all connections?")) {
      onClearAllEdges();
    }
  };

  return (
    <div className="flex items-center px-4 py-2 bg-secondary/20 border-b border-border-primary gap-4">
      <button
        onClick={onBack}
        className="px-4 py-2 bg-secondary border border-border-primary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer font-roboto flex items-center gap-2"
      >
        <ChevronsLeft />
        Back
      </button>

      <div className="w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold">Diagram Controls</h3>
          <div className="flex gap-2">
            {selectedEdge && (
              <button
                onClick={onDeleteSelectedEdge}
                className="px-3 py-2 bg-status-danger hover:bg-status-danger/80 text-white rounded-md text-sm transition-colors font-roboto flex items-center gap-2"
                title="Delete selected edge"
              >
                <Trash2 className="w-4 h-4" /> Delete Selected Edge
              </button>
            )}

            <button
              onClick={handleClearAllEdgesWithConfirm}
              className="px-3 py-2 bg-status-warning hover:bg-status-warning/80 text-white rounded-md text-sm transition-colors font-roboto flex items-center gap-2"
              title="Clear all connections"
            >
              <Trash2 className="w-4 h-4" /> Clear All Edges
            </button>

            <button
              onClick={onDownloadDiagram}
              className="px-3 py-2 bg-status-success hover:bg-status-success/80 text-white rounded-md text-sm transition-colors font-roboto flex items-center gap-2"
              title="Download diagram as PNG image"
            >
              <Download className="w-4 h-4" />
              Download Image
            </button>


            <button
              onClick={onSaveDiagram}
              disabled={!hasChanges || isSaving}
              className={`px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-colors font-roboto ${
                hasChanges && !isSaving
                  ? "bg-status-info hover:bg-status-info/80 text-white cursor-pointer"
                  : "bg-overlay/30 text-text-muted cursor-not-allowed"
              }`}
              title={
                isSaving
                  ? "Saving structure to server..."
                  : hasChanges
                  ? "Save diagram structure (positions & connections only)"
                  : "No changes to save"
              }
            >
              {isSaving ? "⏳ Saving..." : "💾 Save"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {selectedEdge && (
            <div className="flex items-center gap-2 text-text-secondary text-xs">
              <span className="w-2 h-2 bg-status-info rounded-full animate-pulse"></span>
              Edge selected - Press Delete or use button to remove
            </div>
          )}
          {hasChanges && (
            <div className="flex items-center gap-2 text-text-secondary text-xs">
              <span className="w-2 h-2 bg-status-warning rounded-full animate-pulse"></span>
              Unsaved changes detected
            </div>
          )}
          {!hasChanges && !selectedEdge && (
            <div className="flex items-center gap-2 text-text-secondary text-xs">
              <span className="w-2 h-2 bg-status-success rounded-full"></span>
              All changes saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagramControls;
