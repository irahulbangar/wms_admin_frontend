import { useState, useEffect, useCallback, useMemo } from "react";
import { type Connection, type Edge, addEdge } from "reactflow";
import type { DiagramEdge } from "../utils/diagramCalculations";

export const useDiagramControls = (
  setEdges: (
    edges: DiagramEdge[] | ((edges: DiagramEdge[]) => DiagramEdge[])
  ) => void,
  setHasChanges: (hasChanges: boolean) => void
) => {
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  // Handle edge connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
        animated: true,
        style: {
          stroke: "#6366f1",
          strokeWidth: 3,
        },
        type: "smoothstep",
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setHasChanges(true);
    },
    [setEdges, setHasChanges]
  );

  // Handle edge clicks
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedEdge(edge.id);

    const customEvent = new CustomEvent("edgeSelected", {
      detail: { edgeId: edge.id },
    });
    document.dispatchEvent(customEvent);
  }, []);

  // Handle pane clicks
  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setSelectedEdge(null);
    }
  }, []);

  // Handle selection changes
  const onSelectionChange = useCallback(({ edges }: { edges: Edge[] }) => {
    if (edges.length > 0) {
      setSelectedEdge(edges[0].id);
    } else {
      setSelectedEdge(null);
    }
  }, []);

  // Delete selected edge
  const handleDeleteSelectedEdge = useCallback(() => {
    if (selectedEdge) {
      const edgeToDelete = selectedEdge;

      setEdges((currentEdges) => {
        const filteredEdges = currentEdges.filter(
          (edge) => edge.id !== edgeToDelete
        );
        return filteredEdges;
      });

      setSelectedEdge(null);
      setHasChanges(true);

      const customEvent = new CustomEvent("edgeDeleted", {
        detail: { edgeId: edgeToDelete },
      });
      document.dispatchEvent(customEvent);
    }
  }, [selectedEdge, setEdges, setHasChanges]);

  // Clear all edges
  const handleClearAllEdges = useCallback(() => {
    setEdges([]);
    setHasChanges(true);
  }, [setEdges, setHasChanges]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedEdge) {
          event.preventDefault();
          event.stopPropagation();
          handleDeleteSelectedEdge();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keydown", handleKeyDown, true);

    const globalKeyHandler = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedEdge
      ) {
        handleDeleteSelectedEdge();
      }
    };

    document.addEventListener("keyup", globalKeyHandler, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keyup", globalKeyHandler, true);
    };
  }, [selectedEdge, handleDeleteSelectedEdge]);

  // Edge click handling with DOM events
  useEffect(() => {
    const handleEdgeClick = (event: Event) => {
      const target = event.target as HTMLElement;

      if (
        (target.tagName === "path" &&
          target.classList.contains("react-flow__edge-path")) ||
        target.closest(".react-flow__edge") ||
        target.classList.contains("react-flow__edge-clickable")
      ) {
        const edgeElement = target.closest(".react-flow__edge");
        if (edgeElement) {
          const edgeId = edgeElement.getAttribute("data-id");
          if (edgeId) {
            setSelectedEdge(edgeId);
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
      }
    };

    document.addEventListener("click", handleEdgeClick, true);
    document.addEventListener("mousedown", handleEdgeClick, true);
    document.addEventListener("mouseup", handleEdgeClick, true);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.classList.contains("react-flow__edge")) {
                element.addEventListener("click", (e) => {
                  const edgeId = element.getAttribute("data-id");
                  if (edgeId) {
                    setSelectedEdge(edgeId);
                    e.preventDefault();
                    e.stopPropagation();
                  }
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      document.removeEventListener("click", handleEdgeClick, true);
      document.removeEventListener("mousedown", handleEdgeClick, true);
      document.removeEventListener("mouseup", handleEdgeClick, true);
      observer.disconnect();
    };
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    if (
      target.tagName === "path" &&
      target.classList.contains("react-flow__edge-path")
    ) {
      const edgeElement = target.closest(".react-flow__edge");
      if (edgeElement) {
        const edgeId = edgeElement.getAttribute("data-id");
        if (edgeId) {
          setSelectedEdge(edgeId);
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
  }, []);

  const handleClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.closest(".react-flow__edge")) {
      const edgeElement = target.closest(".react-flow__edge");
      if (edgeElement) {
        const edgeId = edgeElement.getAttribute("data-id");
        if (edgeId) {
          setSelectedEdge(edgeId);
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
  }, []);

  // Node click handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    if (node.type !== "group") {
      event.stopPropagation();
    }
  }, []);

  const multiSelectionKeyCode = useMemo(() => ["Meta", "Ctrl"], []);

  return {
    selectedEdge,
    setSelectedEdge,
    onConnect,
    onEdgeClick,
    onPaneClick,
    onSelectionChange,
    handleDeleteSelectedEdge,
    handleClearAllEdges,
    handleMouseDown,
    handleClick,
    onNodeClick,
    multiSelectionKeyCode,
  };
};
