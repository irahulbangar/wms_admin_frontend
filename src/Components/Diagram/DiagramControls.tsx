import React from "react";
import {Trash2, Download, Home, ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import Breadcrumb from "../Common/Breadcrumb";
import type { BreadcrumbItem } from "../Common/Breadcrumb";

interface DiagramControlsProps {
  hasChanges: boolean;
  isSaving: boolean;
  selectedEdge: string | null;
  selectedNodeForConnection: string | null;
  plantName?: string;
  onSaveDiagram: () => void;
  onDeleteSelectedEdge: () => void;
  onClearAllEdges: () => void;
  onDownloadDiagram: () => void;
  onNavigate?: (path: string) => void;
  onClearConnectionSelection?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onResetView?: () => void;
}

const DiagramControls: React.FC<DiagramControlsProps> = ({
  hasChanges,
  isSaving,
  selectedEdge,
  selectedNodeForConnection,
  plantName,
  onSaveDiagram,
  onDeleteSelectedEdge,
  onClearAllEdges,
  onDownloadDiagram,
  onNavigate,
  onClearConnectionSelection,
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetView,
}) => {
  const handleClearAllEdgesWithConfirm = () => {
    if (confirm("Are you sure you want to delete all connections?")) {
      onClearAllEdges();
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Home",
      path: "/home",
      icon: <Home className="w-4 h-4" />,
    },
    {
      label: "Organization",
      path: "/organization",
    },
    {
      label: "Plants",
      path: "/organization/plants",
    },
    {
      label: plantName || "Diagram",
      path: "#",
      isActive: true,
    },
  ];

  return (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center flex-wrap">
          <div className="flex items-center gap-4">
            <Breadcrumb items={breadcrumbItems} onNavigate={onNavigate} />
          </div>
          <div className="flex gap-2 pt-3 pr-3">
            <div className="diagram-zoom-controls">
              <button
                onClick={onZoomOut}
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-status-success hover:text-status-success/80" />
              </button>
              <button
                onClick={onFitView}
                title="Fit to Screen"
              >
                <Maximize2 className="w-4 h-4 text-status-info hover:text-status-info/80" />
              </button>
              <button
                onClick={onZoomIn}
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-status-success hover:text-status-success/80" />
              </button>
              <button
                onClick={onResetView}
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4 text-text-primary hover:text-text-primary/80" />
              </button>
              <button
                onClick={onDownloadDiagram}
                title="Download Diagram"
              >
                <Download className="w-4 h-4 text-status-info hover:text-status-info/80" />
              </button>
              <button
                onClick={handleClearAllEdgesWithConfirm}
                title="Clear All Edges"
              >
               <Trash2 className="w-4 h-4 text-status-danger" />
              </button>
            </div>

            {selectedEdge && (
              <button
                onClick={onDeleteSelectedEdge}
                className="px-3 py-1 bg-status-danger hover:bg-status-danger/80 h-9 text-white rounded-md text-sm transition-colors font-roboto flex items-center gap-2 whitespace-nowrap"
                title="Delete selected edge"
              >
                <Trash2 className="w-4 h-4" /> Delete Edge
              </button>
            )}

            <button
              onClick={onSaveDiagram}
              disabled={!hasChanges || isSaving}
              className={`px-3 py-1 h-9 rounded-md text-sm flex items-center gap-1 transition-colors font-roboto whitespace-nowrap ${
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

         <div className="flex items-center gap-6 px-3">
           {selectedNodeForConnection && (
             <div className="flex items-center gap-2 text-text-secondary text-xs">
               <span className="w-2 h-2 bg-status-success rounded-full animate-pulse"></span>
               <span className="font-roboto text-status-info text-sm">Node selected for connection - Ctrl+click another node to connect</span>
               {onClearConnectionSelection && (
                 <button
                   onClick={onClearConnectionSelection}
                   className="ml-2 text-sm font-roboto text-status-danger hover:text-status-danger/80 underline"
                 >
                   Cancel
                 </button>
               )}
             </div>
           )}
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
           {!hasChanges && !selectedEdge && !selectedNodeForConnection && (
             <div className="flex items-center gap-2 text-text-secondary text-xs">
               <span className="w-2 h-2 bg-status-success rounded-full"></span>
               All changes saved
             </div>
           )}
         </div>
    </div>
  );
};

export default DiagramControls;
