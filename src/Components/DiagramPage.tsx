import { useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactFlow, {
  Background,
  BackgroundVariant,
  type NodeDragHandler,
  Controls,
  ConnectionMode,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Success } from "../utils/toast";
import { nodeTypes } from "./Diagram/nodeTypes";
import { useDiagramData } from "./Diagram/hooks/useDiagramData";
import { useDiagramControls } from "./Diagram/hooks/useDiagramControls";
import { useDepartmentPopup } from "./Diagram/hooks/useDepartmentPopup";
// import { useRightSidebar } from "./Diagram/hooks/useRightSidebar";
import DepartmentPopup from "./Diagram/DepartmentPopup";
// import RightSidebar from "./Diagram/RightSidebar";
import DiagramControls from "./Diagram/DiagramControls";
import { ChartArea } from "lucide-react";

const DiagramWithZoomControls = ({
  nodes: _nodes,
  edges: _edges,
  onNodesChange,
  onEdgesChange,
  onNodeDragStop,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  onSelectionChange,
  nodeTypes,
  multiSelectionKeyCode,
  transformedNodes,
  transformedEdges,
}: any) => {
  return (
    <ReactFlow
      className="h-full w-full"
      style={{ width: "100%", height: "100%" }}
      nodes={transformedNodes}
      edges={transformedEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
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
      fitView={true}
      fitViewOptions={{
        padding: 0.2,
        minZoom: 0.1,
        maxZoom: 2,
        includeHiddenNodes: false,
      }}
      attributionPosition="bottom-left"
      deleteKeyCode={["Backspace", "Delete"]}
      multiSelectionKeyCode={multiSelectionKeyCode}
      minZoom={0.1}
      maxZoom={2}
    >
      <Background variant={BackgroundVariant.Dots} />
      <Controls />
      <ZoomControls />
    </ReactFlow>
  );
};

const ZoomControls = () => {
  const { zoomIn, zoomOut, fitView, setCenter, getNodes } = useReactFlow();

  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
  };

  const handleFitView = () => {
    fitView({
      duration: 500,
      padding: 0.2,
      minZoom: 0.1,
      maxZoom: 2,
      includeHiddenNodes: false,
    });
  };

  const handleResetView = () => {
    const nodes = getNodes();
    if (nodes.length > 0) {
      const bounds = nodes.reduce(
        (acc, node) => {
          const x = node.position.x;
          const y = node.position.y;
          const width = node.width || 100;
          const height = node.height || 100;

          return {
            minX: Math.min(acc.minX, x),
            maxX: Math.max(acc.maxX, x + width),
            minY: Math.min(acc.minY, y),
            maxY: Math.max(acc.maxY, y + height),
          };
        },
        {
          minX: Infinity,
          maxX: -Infinity,
          minY: Infinity,
          maxY: -Infinity,
        }
      );

      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      setCenter(centerX, centerY, { zoom: 0.8, duration: 500 });
    } else {
      setCenter(0, 0, { zoom: 1, duration: 500 });
    }
  };

  useEffect(() => {
    (window as any).diagramZoomControls = {
      zoomIn: handleZoomIn,
      zoomOut: handleZoomOut,
      fitView: handleFitView,
      resetView: handleResetView,
    };

    const nodes = getNodes();
    if (nodes.length > 0) {
      setTimeout(() => {
        handleFitView();
      }, 100);
    }
  }, [getNodes().length]);

  return null;
};

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

  // const {
  //   isOpen: isRightSidebarOpen,
  //   selectedGroup,
  //   calculations,
  //   deviceData: sidebarDeviceData,
  //   closeSidebar: closeRightSidebar,
  //   handleGroupClick,
  // } = useRightSidebar(deviceData);

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

  const handleZoomIn = useCallback(() => {
    if ((window as any).diagramZoomControls?.zoomIn) {
      (window as any).diagramZoomControls.zoomIn();
    } else {
      console.warn("Zoom controls not yet available");
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if ((window as any).diagramZoomControls?.zoomOut) {
      (window as any).diagramZoomControls.zoomOut();
    } else {
      console.warn("Zoom controls not yet available");
    }
  }, []);

  const handleFitView = useCallback(() => {
    if ((window as any).diagramZoomControls?.fitView) {
      (window as any).diagramZoomControls.fitView();
    } else {
      console.warn("Zoom controls not yet available");
    }
  }, []);

  const handleResetView = useCallback(() => {
    if ((window as any).diagramZoomControls?.resetView) {
      (window as any).diagramZoomControls.resetView();
    } else {
      console.warn("Zoom controls not yet available");
    }
  }, []);

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

    const excludedTypes = ["group", "virtual", "source", "sink", "resultant"];
    if (excludedTypes.includes(node.type)) {
      onNodeClick(event, node);
      return;
    }

    const nodeTypeToFamilyType: Record<string, string> = {
      fm: "fm",
      tank: "tank",
      brwhms: "brwhms",
      bdwfms: "bdwfms",
      phmc: "phmc",
      arg: "arg",
      dwlr: "dwlr",
    };

    const deviceFamilyType = nodeTypeToFamilyType[node.type];
    if (!deviceFamilyType || !deviceData || deviceData.length === 0) {
      onNodeClick(event, node);
      return;
    }

    const matchingDevice = deviceData.find((device) => {
      const deviceNameMatch = device.device_name === node.data?.label;
      if (!deviceNameMatch) return false;

      const deviceFamilyTypeLower = device.device_family_type?.toLowerCase();
      const deviceFamilyLower = device.device_family?.toLowerCase();

      if (deviceFamilyType === "bdwfms") {
        return (
          deviceFamilyTypeLower === "bdwfms" ||
          device.device_family_type === "BDWFMS" ||
          deviceFamilyLower?.includes("bdwfms")
        );
      }

      return (
        deviceFamilyTypeLower === deviceFamilyType ||
        deviceFamilyLower?.includes(deviceFamilyType)
      );
    });

    if (matchingDevice && plantId) {
      navigate(
        `/organization/devices/report/${deviceFamilyType}/${plantId}/${matchingDevice.device_id}`
      );
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
    return edges?.map((edge) => ({
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
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            onResetView={handleResetView}
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
                <DiagramWithZoomControls
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={handleEdgesChange}
                  onNodeDragStop={handleNodeDragStop}
                  onConnect={onConnect}
                  onNodeClick={handleNodeClickWithSidebar}
                  onEdgeClick={onEdgeClick}
                  onPaneClick={onPaneClick}
                  onSelectionChange={onSelectionChange}
                  nodeTypes={nodeTypes}
                  multiSelectionKeyCode={multiSelectionKeyCode}
                  transformedNodes={transformedNodes}
                  transformedEdges={transformedEdges}
                />
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

      {/* <RightSidebar
        isOpen={isRightSidebarOpen}
        onClose={closeRightSidebar}
        selectedGroup={selectedGroup}
        calculations={calculations}
        deviceData={sidebarDeviceData}
      /> */}
    </div>
  );
};

export default DiagramPage;
