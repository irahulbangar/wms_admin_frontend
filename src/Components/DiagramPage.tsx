import { useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactFlow, {
  Background,
  BackgroundVariant,
  type NodeDragHandler,
  Controls,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { Success } from "../utils/toast";
import { nodeTypes } from "./Diagram/nodeTypes";
import { useDiagramData } from "./Diagram/hooks/useDiagramData";
import { useDiagramControls } from "./Diagram/hooks/useDiagramControls";
import { useDepartmentPopup } from "./Diagram/hooks/useDepartmentPopup";
import { useRightSidebar } from "./Diagram/hooks/useRightSidebar";
import DepartmentPopup from "./Diagram/DepartmentPopup";
import RightSidebar from "./Diagram/RightSidebar";
import DiagramControls from "./Diagram/DiagramControls";
import { ChartArea } from "lucide-react";

const DiagramPage = () => {
  const plantId = useParams().plant_id;
  const navigate = useNavigate();

  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    hasChanges,
    setHasChanges,
    isSaving,
    isLoadingDiagram,
    departmentDimensions,
    setDepartmentDimensions,
    saveDiagramToAPI,
    deviceData,
    plantData,
  } = useDiagramData(plantId);

  const {
    selectedEdge,
    selectedNodeForConnection,
    onConnect,
    onEdgeClick,
    onPaneClick,
    onSelectionChange,
    handleDeleteSelectedEdge,
    handleClearAllEdges,
    handleMouseDown,
    handleClick,
    onNodeClick,
    handleCtrlClickConnection,
    clearConnectionSelection,
    multiSelectionKeyCode,
    downloadDiagramAsImage,
  } = useDiagramControls(setEdges, setHasChanges);

  const {
    selectedDepartment,
    showDepartmentPopup,
    handleDepartmentDimensionsChange,
    handleCloseDepartmentPopup,
  } = useDepartmentPopup(setNodes, setHasChanges, setDepartmentDimensions);

  const {
    isOpen: isRightSidebarOpen,
    selectedGroup,
    calculations,
    deviceData: sidebarDeviceData,
    closeSidebar: closeRightSidebar,
    handleGroupClick,
  } = useRightSidebar(deviceData);

  const handleNodeDragStop: NodeDragHandler = () => {
    setHasChanges(true);
  };

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      setNodes((nds) => {
        return nds
          .map((node) => {
            const change = changes.find((c) => c.id === node.id);
            if (change) {
              if (change.type === "position" && change.position) {
                return { ...node, position: change.position };
              }
              if (change.type === "dimensions" && change.dimensions) {
                return { ...node, ...change.dimensions };
              }
              if (change.type === "remove") {
                return null;
              }
            }
            return node;
          })
          .filter((node): node is NonNullable<typeof node> => node !== null);
      });
      setHasChanges(true);
    },
    [setNodes, setHasChanges]
  );

  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      setEdges((eds) => {
        const updatedEdges = eds
          .map((edge) => {
            const change = changes.find((c) => c.id === edge.id);
            if (change) {
              if (change.type === "remove") {
                return null;
              }
              if (change.type === "select") {
                return { ...edge, selected: change.selected };
              }
            }
            return edge;
          })
          .filter((edge): edge is NonNullable<typeof edge> => edge !== null);

        return updatedEdges;
      });
      setHasChanges(true);
    },
    [setEdges, setHasChanges]
  );

  const handleSaveDiagram = async () => {
    await saveDiagramToAPI();
  };

  const handleClearAllEdgesWithConfirm = () => {
    if (confirm("Are you sure you want to delete all connections?")) {
      handleClearAllEdges();
      Success("All connections cleared!");
    }
  };


  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleDownloadDiagram = async () => {
    try {
      await downloadDiagramAsImage();
      Success("Diagram downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedNodeForConnection) {
        clearConnectionSelection();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeForConnection, clearConnectionSelection]);

  const handleNodeClickWithSidebar = (event: React.MouseEvent, node: any) => {
    if (event.ctrlKey || event.metaKey) {
      handleCtrlClickConnection(event, node);
      return;
    }

    if (node.type === 'group' && (node.data.type === 'plant' || node.data.type === 'department' || node.data.type === 'system')) {
      handleGroupClick(node.id, node.data);
      return;
    }
    
    onNodeClick(event, node);
  };

  const transformedNodes = useMemo(() => {
    return nodes.map((node) => {
      let updatedNode = { ...node };

      if (node.id === selectedDepartment && node.type === "group") {
        updatedNode = {
          ...updatedNode,
          style: {
            ...updatedNode.style,
            border: "3px solid #3b82f6",
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
            zIndex: 5,
          },
        };
      }

      if (node.id === selectedNodeForConnection && node.type !== "group") {
        updatedNode = {
          ...updatedNode,
          style: {
            ...updatedNode.style,
            border: "3px solid #10b981",
            boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)",
            zIndex: 10,
          },
        };
      }

      return updatedNode;
    }) as any[];
  }, [nodes, selectedDepartment, selectedNodeForConnection]);

  const transformedEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        strokeWidth:
          selectedEdge === edge.id ? 2 : edge.style?.strokeWidth || 3,
        stroke:
          selectedEdge === edge.id
            ? "#ff0000"
            : edge.style?.stroke || "#6366f1",
        zIndex: selectedEdge === edge.id ? 50 : 25,
      },
      className: "react-flow__edge-clickable",
    }));
  }, [edges, selectedEdge]);


  const isDiagramEmpty = useMemo(() => {
    return nodes?.length === 0 && edges?.length === 0;
  }, [nodes, edges]);

  return (
    <div className="bg-primary text-text-primary h-screen w-full">
      <div className="h-full w-full flex">
        <main className="flex-1 flex flex-col h-full w-full">
          <DiagramControls
            hasChanges={hasChanges}
            isSaving={isSaving}
            selectedEdge={selectedEdge}
            selectedNodeForConnection={selectedNodeForConnection}
            plantName={plantData?.plant_name}
            onSaveDiagram={handleSaveDiagram}
            onDeleteSelectedEdge={handleDeleteSelectedEdge}
            onClearAllEdges={handleClearAllEdgesWithConfirm}
            onDownloadDiagram={handleDownloadDiagram}
            onNavigate={handleNavigate}
            onClearConnectionSelection={clearConnectionSelection}
          />

          <div
            className="h-full w-full p-4 relative"
            style={{ width: "100%", height: "calc(100vh - 70px)" }}
          >
            {isLoadingDiagram ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-text-secondary">Loading diagram...</p>
                </div>
              </div>
            ) : isDiagramEmpty ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center justify-center flex-col">
                  <ChartArea className="w-18 h-18 text-text-secondary gap-2" />
                  <p className="text-lg text-text-primary font-roboto">
                    Diagram data is not available
                  </p>
                  <p className="text-sm text-text-secondary font-roboto">
                    No departments or connections to display for this plant.
                  </p>
                </div>
              </div>
            ) : (
              <div
                onMouseDown={handleMouseDown}
                onClick={handleClick}
                style={{ width: "100%", height: "100%" }}
                className="h-full w-full"
              >
                <ReactFlow
                  className="h-full w-full"
                  style={{ width: "100%", height: "100%" }}
                  nodes={transformedNodes}
                  edges={transformedEdges}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={handleEdgesChange}
                  onNodeDragStop={handleNodeDragStop}
                  onConnect={onConnect}
                  onNodeClick={handleNodeClickWithSidebar}
                  onEdgeClick={onEdgeClick}
                  onPaneClick={onPaneClick}
                  onSelectionChange={onSelectionChange}
                  connectionMode={ConnectionMode.Loose}
                  nodeTypes={nodeTypes}
                  nodesDraggable={true}
                  nodesConnectable={true}
                  nodesFocusable={true}
                  edgesUpdatable={true}
                  edgesFocusable={true}
                  selectNodesOnDrag={false}
                  elevateNodesOnSelect={false}
                  elevateEdgesOnSelect={false}
                  panOnDrag={true}
                  panOnScroll={true}
                  fitView
                  attributionPosition="bottom-left"
                  deleteKeyCode={["Backspace", "Delete"]}
                  multiSelectionKeyCode={multiSelectionKeyCode}
                >
                  <Background variant={BackgroundVariant.Dots} />
                  <Controls />
                </ReactFlow>
              </div>
            )}
          </div>
        </main>
      </div>

      <DepartmentPopup
        show={showDepartmentPopup}
        selectedDepartment={selectedDepartment}
        nodes={nodes}
        departmentDimensions={departmentDimensions}
        onClose={handleCloseDepartmentPopup}
        onDimensionsChange={handleDepartmentDimensionsChange}
      />

      <RightSidebar
        isOpen={isRightSidebarOpen}
        onClose={closeRightSidebar}
        selectedGroup={selectedGroup}
        calculations={calculations}
        deviceData={sidebarDeviceData}
      />
    </div>
  );
};

export default DiagramPage;
