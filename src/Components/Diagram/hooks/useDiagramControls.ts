import { useState, useEffect, useCallback, useMemo } from "react";
import { type Connection, type Edge, addEdge } from "reactflow";
import type { DiagramEdge } from "../utils/diagramCalculations";
import domtoimage from "dom-to-image";

export const useDiagramControls = (
  setEdges: (
    edges: DiagramEdge[] | ((edges: DiagramEdge[]) => DiagramEdge[])
  ) => void,
  setHasChanges: (hasChanges: boolean) => void
) => {
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [selectedNodeForConnection, setSelectedNodeForConnection] = useState<string | null>(null);

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

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedEdge(edge.id);

    const customEvent = new CustomEvent("edgeSelected", {
      detail: { edgeId: edge.id },
    });
    document.dispatchEvent(customEvent);
  }, []);

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setSelectedEdge(null);
    }
  }, []);

  const onSelectionChange = useCallback(({ edges }: { edges: Edge[] }) => {
    if (edges.length > 0) {
      setSelectedEdge(edges[0].id);
    } else {
      setSelectedEdge(null);
    }
  }, []);

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

  const handleClearAllEdges = useCallback(() => {
    setEdges([]);
    setHasChanges(true);
  }, [setEdges, setHasChanges]);

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

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    if (node.type !== "group") {
      event.stopPropagation();
    }
  }, []);

  const handleCtrlClickConnection = useCallback((event: React.MouseEvent, node: any) => {
    if (node.type === "group") {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      event.stopPropagation();

      if (selectedNodeForConnection === null) {
        setSelectedNodeForConnection(node.id);
        
        const customEvent = new CustomEvent("nodeSelectedForConnection", {
          detail: { nodeId: node.id, isFirst: true },
        });
        document.dispatchEvent(customEvent);
      } else if (selectedNodeForConnection !== node.id) {
        const newEdge: DiagramEdge = {
          id: `${selectedNodeForConnection}-${node.id}`,
          source: selectedNodeForConnection,
          target: node.id,
          animated: true,
          style: {
            stroke: "#6366f1",
            strokeWidth: 3,
          },
          type: "smoothstep",
        };

        setEdges((currentEdges) => {
          const edgeExists = currentEdges.some(
            (edge) => 
              (edge.source === selectedNodeForConnection && edge.target === node.id) ||
              (edge.source === node.id && edge.target === selectedNodeForConnection)
          );
          
          if (!edgeExists) {
            return [...currentEdges, newEdge];
          }
          return currentEdges;
        });

        setHasChanges(true);
        setSelectedNodeForConnection(null);

        const customEvent = new CustomEvent("nodeSelectedForConnection", {
          detail: { nodeId: null, isFirst: false },
        });
        document.dispatchEvent(customEvent);
      } else {
        setSelectedNodeForConnection(null);
        
        const customEvent = new CustomEvent("nodeSelectedForConnection", {
          detail: { nodeId: null, isFirst: false },
        });
        document.dispatchEvent(customEvent);
      }
    }
  }, [selectedNodeForConnection, setEdges, setHasChanges]);

  const clearConnectionSelection = useCallback(() => {
    setSelectedNodeForConnection(null);
    
    const customEvent = new CustomEvent("nodeSelectedForConnection", {
      detail: { nodeId: null, isFirst: false },
    });
    document.dispatchEvent(customEvent);
  }, []);

  const multiSelectionKeyCode = useMemo(() => ["Meta", "Ctrl"], []);

  const downloadDiagramAsImage = useCallback(async () => {
    try {
      const reactFlowElement = document.querySelector('.react-flow');
      if (!reactFlowElement) {
        throw new Error('ReactFlow container not found');
      }

      const tempStyle = document.createElement('style');
      tempStyle.id = 'dom-to-image-fix';
      tempStyle.textContent = `
        /* Hide controls and attribution */
        .react-flow__controls {
          display: none !important;
        }
        .react-flow__attribution {
          display: none !important;
        }
        .react-flow__minimap {
          display: none !important;
        }
        
        /* Ensure all text is visible and readable */
        .react-flow__node-label,
        .react-flow__node-text,
        text,
        [class*="label"] {
          color: #000000 !important;
          fill: #000000 !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Fix any oklab color issues */
        [style*="oklab"] {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
      `;
      
      document.head.appendChild(tempStyle);

      await new Promise(resolve => setTimeout(resolve, 200));

      let dataUrl: string;

      try {
        const rect = reactFlowElement.getBoundingClientRect();
        const scrollWidth = Math.max(reactFlowElement.scrollWidth, rect.width);
        const scrollHeight = Math.max(reactFlowElement.scrollHeight, rect.height);
        
        try {
          const svgDataUrl = await domtoimage.toSvg(reactFlowElement as HTMLElement, {
            width: scrollWidth,
            height: scrollHeight,
            style: {
              width: `${scrollWidth}px`,
              height: `${scrollHeight}px`,
            },
            filter: (node: any) => {
              if (node.classList?.contains('react-flow__controls') ||
                  node.classList?.contains('react-flow__attribution') ||
                  node.classList?.contains('react-flow__minimap')) {
                return false;
              }
              return true;
            }
          });
          
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          dataUrl = await new Promise((resolve, reject) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = scrollWidth * 2;
              canvas.height = scrollHeight * 2;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.scale(2, 2);
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png', 1.0));
              } else {
                reject(new Error('Could not get canvas context'));
              }
            };
            img.onerror = reject;
            img.src = svgDataUrl;
          });
        } catch (svgError) {
          console.warn('SVG method failed, trying PNG directly:', svgError);
          
          dataUrl = await domtoimage.toPng(reactFlowElement as HTMLElement, {
            quality: 1.0,
            bgcolor: '#ffffff',
            width: scrollWidth,
            height: scrollHeight,
            style: {
              width: `${scrollWidth}px`,
              height: `${scrollHeight}px`,
            },
            filter: (node: any) => {
              if (node.classList?.contains('react-flow__controls') ||
                  node.classList?.contains('react-flow__attribution') ||
                  node.classList?.contains('react-flow__minimap')) {
                return false;
              }
              return true;
            }
          });
        }
      } catch (domError) {
        console.warn('All dom-to-image methods failed, trying basic method:', domError);
        
        dataUrl = await domtoimage.toPng(reactFlowElement as HTMLElement, {
          quality: 0.95,
          bgcolor: '#ffffff'
        });
      }

      const styleElement = document.getElementById('dom-to-image-fix');
      if (styleElement) {
        styleElement.remove();
      }

      const link = document.createElement('a');
      link.download = `diagram-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading diagram:', error);
      const styleElement = document.getElementById('dom-to-image-fix');
      if (styleElement) {
        styleElement.remove();
      }
      throw new Error('Failed to download diagram image');
    }
  }, []);

  return {
    selectedEdge,
    setSelectedEdge,
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
  };
};
