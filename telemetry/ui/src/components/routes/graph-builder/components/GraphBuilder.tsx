// Add Prism namespace for types
import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  ReactFlowInstance,
  MarkerType
} from '@xyflow/react';
// Import Tailwind common components
import { Button } from '../../../common/button';
import { Highlight } from 'prism-react-renderer';

// Type definitions for prism-react-renderer
interface HighlightRenderProps {
  className: string;
  style: React.CSSProperties;
  tokens: Array<Array<{ types: string[]; content: string }>>;
  getLineProps: (input: {
    line: Array<{ types: string[]; content: string }>;
    key?: React.Key;
  }) => React.HTMLAttributes<HTMLDivElement>;
  getTokenProps: (input: {
    token: { types: string[]; content: string };
    key?: React.Key;
  }) => React.HTMLAttributes<HTMLSpanElement>;
}
import theme from '../themes/dark';
import {
  PlusIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import ExampleGallery from './ExampleGallery';
import ConfirmLoadExampleDialog from './ConfirmLoadExampleDialog';
import { GraphExporter } from '../utils/GraphExporter';
import { BurrGraphCodeGenerator } from '../utils/BurrCodeGenerator';
import { ExampleLoader } from '../utils/ExampleLoader';
import { examples } from '../data/examples';
import type { ExampleGraph } from '../data/examples';

// Node types configuration
const nodeTypes: NodeTypes = {
  custom: CustomNode as any
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge as any
};

// Default edge options with arrow markers
const defaultEdgeOptions = {
  type: 'custom',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 15,
    height: 15,
    color: '#429dbce6'
  }
};

// Initial nodes - start with empty canvas
const initialNodes: Node[] = [];

// Initial edges - start with empty canvas
const initialEdges: Edge[] = [];

// Available node templates
const nodeTemplates = [
  { type: 'action', label: 'Burr Action', icon: <Cog6ToothIcon />, color: '#429dbce6' },
  { type: 'input', label: 'Input Node', icon: <QuestionMarkCircleIcon />, color: '#ff9800' }
];

interface NodeDialogData {
  label: string;
  description: string;
  nodeType: string;
  icon: string;
}

const GraphBuilder: React.FC = () => {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodeDialog, setNodeDialog] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedExample, setSelectedExample] = useState<ExampleGraph | null>(null);
  const [nodeDialogData, setNodeDialogData] = useState<NodeDialogData>({
    label: '',
    description: '',
    nodeType: 'action',
    icon: 'settings'
  });
  const [tabIndex, setTabIndex] = useState(0);
  const [copied, setCopied] = useState<'python' | 'json' | null>(null);

  const edgeColors = [
    '#429dbce6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#6b7280'
  ];

  // Handle node deletion
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  // Handle node label change
  const handleLabelChange = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node
        )
      );
    },
    [setNodes]
  );

  // Handle edge label change
  const handleEdgeLabelChange = useCallback(
    (edgeId: string, newLabel: string) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? { ...edge, data: { ...edge.data, label: newLabel, condition: newLabel } }
            : edge
        )
      );
    },
    [setEdges]
  );

  // Handle conditional group label change - updates all edges from the same source
  // No longer needed: group label editing
  const handleConditionalGroupLabelChange = useCallback(
    (_sourceNodeId: string, _newLabel: string) => {
      // No-op: group label editing is disabled
    },
    []
  );

  // Handle canvas click with Cmd/Ctrl key to create nodes
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.metaKey || event.ctrlKey) {
        // Determine node type based on mouse button
        const isRightClick = event.button === 2 || event.type === 'contextmenu';
        const nodeType = isRightClick ? 'input' : 'action';
        const nodeLabel = isRightClick ? `Input ${nodes.length + 1}` : `Node ${nodes.length + 1}`;

        // Cmd/Ctrl + click to create a action node
        // Cmd/Ctrl + right-click to create an input node
        let position;

        if (reactFlowInstance) {
          // Use ReactFlow's positioning when instance is available
          position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
          });
        } else {
          // Fallback positioning for when ReactFlow instance isn't ready yet
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
          position = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          };
        }

        const newNode: Node = {
          id: `node_${Date.now()}`,
          type: 'custom',
          position,
          data: {
            label: nodeLabel,
            description: '',
            nodeType: nodeType,
            icon: 'settings',
            colorIndex: nodes.length % 10, // Cycle through the 10 pastel colors
            onDelete: handleDeleteNode,
            onLabelChange: handleLabelChange
          }
        };

        setNodes((nds) => [...nds, newNode]);

        // Prevent default context menu on right-click
        if (isRightClick) {
          event.preventDefault();
        }
      }
    },
    [nodes.length, setNodes, handleDeleteNode, handleLabelChange, reactFlowInstance]
  );

  // Handle context menu (right-click) for input node creation
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      const reactEvent = event as React.MouseEvent;
      if (reactEvent.metaKey || reactEvent.ctrlKey) {
        onPaneClick(reactEvent);
      }
    },
    [onPaneClick]
  );

  // Handle keyboard events
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle delete keys if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((event.key === 'Backspace' || event.key === 'Delete') && !isInputFocused) {
        // Delete selected node or edge only if not editing text
        if (selectedNode) {
          setNodes((nds) => nds.filter((node) => node.id !== selectedNode));
          setEdges((eds) =>
            eds.filter((edge) => edge.source !== selectedNode && edge.target !== selectedNode)
          );
          setSelectedNode(null);
        } else if (selectedEdge) {
          setEdges((eds) => {
            const filteredEdges = eds.filter((edge) => edge.id !== selectedEdge);

            // Find the source of the deleted edge to recalculate conditional status
            const deletedEdge = eds.find((edge) => edge.id === selectedEdge);
            if (deletedEdge) {
              const sourceEdges = filteredEdges.filter(
                (edge) => edge.source === deletedEdge.source
              );
              const shouldBeConditional = sourceEdges.length > 1;

              // Update remaining edges from same source if needed
              return filteredEdges.map((edge) => {
                if (edge.source === deletedEdge.source) {
                  // Preserve the group label if still conditional, clear if not
                  const preservedLabel = shouldBeConditional
                    ? deletedEdge.data?.label || edge.data?.label || 'condition'
                    : undefined;
                  return {
                    ...edge,
                    data: {
                      ...edge.data,
                      isConditional: shouldBeConditional,
                      label: preservedLabel,
                      onLabelChange: handleEdgeLabelChange,
                      onGroupLabelChange: handleConditionalGroupLabelChange
                    }
                  };
                }
                return edge;
              });
            }

            return filteredEdges;
          });
          setSelectedEdge(null);
        }
      }
    },
    [
      selectedNode,
      selectedEdge,
      setNodes,
      setEdges,
      handleEdgeLabelChange,
      handleConditionalGroupLabelChange
    ]
  );

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Check if source node already has outgoing edges
      const sourceEdges = edges.filter((edge) => edge.source === params.source);
      const willBeConditional = sourceEdges.length > 0;

      // Find the target node's label
      const targetNode = nodes.find((node) => node.id === params.target);
      const targetLabel = targetNode?.data?.label || params.target;
      const conditionString = `condition="${targetLabel}"`;

      const newEdge = {
        ...params,
        type: 'custom',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#429dbce6'
        },
        data: {
          condition: willBeConditional ? conditionString : undefined,
          isConditional: willBeConditional,
          label: willBeConditional ? conditionString : undefined,
          onLabelChange: handleEdgeLabelChange,
          onGroupLabelChange: handleConditionalGroupLabelChange
        }
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, edges, nodes, handleEdgeLabelChange, handleConditionalGroupLabelChange]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
    setSelectedEdge(null);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge.id);
    setSelectedNode(null);
    setColorPickerAnchor(event.currentTarget as HTMLElement);
    setColorPickerOpen(true);
  }, []);

  // Handle edge color change
  const handleEdgeColorChange = useCallback(
    (color: string) => {
      if (selectedEdge) {
        setEdges((eds) =>
          eds.map((edge) =>
            edge.id === selectedEdge ? { ...edge, style: { ...edge.style, stroke: color } } : edge
          )
        );
      }
      setColorPickerOpen(false);
      setColorPickerAnchor(null);
    },
    [selectedEdge, setEdges]
  );

  // Toggle isConditional for an edge in a group
  const handleToggleConditional = useCallback(() => {
    if (!selectedEdge) return;
    setEdges((eds) => {
      const targetEdge = eds.find((e) => e.id === selectedEdge);
      if (!targetEdge) return eds;
      const source = targetEdge.source;
      const target = targetEdge.target;
      const groupEdges = eds.filter((e) => e.source === source);
      const toggledIsConditional = !targetEdge.data?.isConditional;

      // Find the target node's label
      const targetNode = nodes.find((node) => node.id === target);
      const targetLabel = targetNode?.data?.label || target;
      const conditionString = `condition="${targetLabel}"`;

      return eds.map((edge) => {
        if (edge.id === selectedEdge) {
          return {
            ...edge,
            data: {
              ...edge.data,
              isConditional: toggledIsConditional,
              // If toggling to conditional, set condition/label to condition="node name"
              condition: toggledIsConditional ? conditionString : undefined,
              label: toggledIsConditional ? conditionString : undefined
            }
          };
        }
        // If toggling OFF, recalculate group conditional status
        if (edge.source === source && edge.id !== selectedEdge) {
          // If only one edge left as conditional, set it to false
          if (!toggledIsConditional) {
            const stillConditional =
              groupEdges.filter((e) => e.id !== selectedEdge && e.data?.isConditional).length > 1;
            return {
              ...edge,
              data: {
                ...edge.data,
                isConditional: stillConditional
              }
            };
          }
        }
        return edge;
      });
    });
    setColorPickerOpen(false);
    setColorPickerAnchor(null);
  }, [selectedEdge, setEdges, nodes]);

  const handleAddNode = useCallback(() => {
    setNodeDialog(true);
  }, []);

  const handleCreateNode = useCallback(() => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 500 + 100, y: Math.random() * 500 + 100 },
      data: {
        label: nodeDialogData.label,
        description: nodeDialogData.description,
        nodeType: nodeDialogData.nodeType,
        icon: nodeDialogData.icon,
        colorIndex: nodes.length % 10, // Cycle through the 10 pastel colors
        onDelete: handleDeleteNode,
        onLabelChange: handleLabelChange
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeDialog(false);
    setNodeDialogData({
      label: '',
      description: '',
      nodeType: 'action',
      icon: 'settings'
    });
  }, [nodeDialogData, setNodes, nodes.length, handleDeleteNode, handleLabelChange]);

  // Generate code for tabs
  const graphData = GraphExporter.exportToJSON(nodes, edges);
  const pythonCode = BurrGraphCodeGenerator.generatePythonCode(graphData);
  const jsonCode = JSON.stringify(graphData, null, 2);

  // Example loading functions
  const hasExistingContent = nodes.length > 0 || edges.length > 0;

  const handleLoadExample = useCallback((example: ExampleGraph) => {
    setSelectedExample(example);
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmLoadExample = useCallback(() => {
    if (!selectedExample) return;

    // Validate example
    const errors = ExampleLoader.validateExample(selectedExample);
    if (errors.length > 0) {
      console.error('Example validation failed:', errors);
      return;
    }

    // Convert and load example
    const { nodes: newNodes, edges: newEdges } = ExampleLoader.convertToReactFlow(selectedExample);

    // Add handlers to nodes
    const nodesWithHandlers = newNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onDelete: handleDeleteNode,
        onLabelChange: handleLabelChange
      }
    }));

    // Add handlers to edges
    const edgesWithHandlers = newEdges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        onLabelChange: handleEdgeLabelChange,
        onGroupLabelChange: handleConditionalGroupLabelChange
      }
    }));

    setNodes(nodesWithHandlers);
    setEdges(edgesWithHandlers);
    setConfirmDialogOpen(false);
    setSelectedExample(null);

    // Fit view after a short delay to ensure nodes are rendered
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.1 });
      }
    }, 100);
  }, [
    selectedExample,
    handleDeleteNode,
    handleLabelChange,
    handleEdgeLabelChange,
    handleConditionalGroupLabelChange,
    setNodes,
    setEdges,
    reactFlowInstance
  ]);

  const handleCancelLoadExample = useCallback(() => {
    setConfirmDialogOpen(false);
    setSelectedExample(null);
  }, []);

  return (
    <div className="flex overflow-hidden border-t">
      {/* Left sidebar with instructions */}
      <div
        className={`${leftOpen ? 'w-72' : 'w-12'} flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-200 overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Scrollable sidebar content (only when open) */}
          {leftOpen ? (
            <div className="flex-1 overflow-auto p-4">
              <h3 className="text-lg font-semibold mb-4">Key Commands</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Create a Burr action</h4>
                  <p className="text-sm text-gray-600">⌘ + click anywhere on the canvas</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Create an input node</h4>
                  <p className="text-sm text-gray-600">⌘ + right-click anywhere on the canvas</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Create an edge</h4>
                  <p className="text-sm text-gray-600">
                    click + drag from the bottom of one node to the top of another
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Create a conditional edge</h4>
                  <p className="text-sm text-gray-600">
                    connect one node to multiple nodes (creates animated dashed lines with shared
                    names)
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Edit edge labels</h4>
                  <p className="text-sm text-gray-600">
                    click on edge label to edit. Each edge has its own independent label.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Create a cycle</h4>
                  <p className="text-sm text-gray-600">
                    click + drag from the bottom to the top of a node
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Delete an edge/node</h4>
                  <p className="text-sm text-gray-600">
                    click the edge/node and hit the backspace key
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Color an edge</h4>
                  <p className="text-sm text-gray-600">
                    click the edge and select an option from the color picker
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}
          {/* Chevron toggle always visible at bottom */}
          <div className={`flex items-center ${leftOpen ? 'justify-start' : 'justify-center'} p-2`}>
            <button
              onClick={() => setLeftOpen(!leftOpen)}
              className="p-1 rounded hover:bg-gray-100">
              {leftOpen ? (
                <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 relative">
        {/* Tab navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            <button
              onClick={() => setTabIndex(0)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                tabIndex === 0
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              Canvas
            </button>
            <button
              onClick={() => setTabIndex(1)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                tabIndex === 1
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              Python
            </button>
            <button
              onClick={() => setTabIndex(2)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                tabIndex === 2
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              JSON
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 flex flex-col">
          {tabIndex === 0 && (
            <div
              className="relative overflow-hidden"
              style={{
                height: 'calc(100vh - 108px)', // 100vh minus tab navigation height (approx 48px)
                width: '100%'
              }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                onPaneContextMenu={onPaneContextMenu}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
                attributionPosition="bottom-left"
                deleteKeyCode="Backspace"
                style={{ width: '100%', height: '100%' }}>
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
              </ReactFlow>
              <button
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
                onClick={handleAddNode}
                aria-label="add node">
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
          )}
          {tabIndex === 1 && (
            <div
              className="bg-gray-900 flex flex-col relative"
              style={{
                height: 'calc(100vh - 108px)'
              }}>
              <div className="absolute top-2 right-5 z-10 bg-white bg-opacity-85 rounded">
                <button
                  className={`p-2 rounded ${
                    copied === 'python' ? 'text-green-600' : 'text-blue-600'
                  } hover:bg-gray-100`}
                  onClick={async () => {
                    await navigator.clipboard.writeText(pythonCode);
                    setCopied('python');
                    setTimeout(() => setCopied(null), 1200);
                  }}
                  aria-label="Copy Python code">
                  <ClipboardDocumentIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="h-full overflow-auto">
                <Highlight code={pythonCode} language="python" theme={theme}>
                  {({
                    className,
                    style,
                    tokens,
                    getLineProps,
                    getTokenProps
                  }: HighlightRenderProps) => (
                    <pre
                      className={className}
                      style={{
                        ...style,
                        margin: 0,
                        padding: 16,
                        fontSize: 14,
                        borderRadius: 4,
                        boxSizing: 'border-box'
                      }}>
                      {tokens.map(
                        (line: Array<{ types: string[]; content: string }>, i: number) => {
                          const lineProps = getLineProps({ line });
                          return (
                            <div key={i} {...lineProps}>
                              {line.map(
                                (token: { types: string[]; content: string }, key: number) => {
                                  const tokenProps = getTokenProps({ token });
                                  return <span key={key} {...tokenProps} />;
                                }
                              )}
                            </div>
                          );
                        }
                      )}
                    </pre>
                  )}
                </Highlight>
              </div>
            </div>
          )}
          {tabIndex === 2 && (
            <div
              className="bg-gray-900 flex flex-col relative"
              style={{
                height: 'calc(100vh - 108px)'
              }}>
              <div className="absolute top-2 right-5 z-10 bg-white bg-opacity-85 rounded">
                <button
                  className={`p-2 rounded ${
                    copied === 'json' ? 'text-green-600' : 'text-blue-600'
                  } hover:bg-gray-100`}
                  onClick={async () => {
                    await navigator.clipboard.writeText(jsonCode);
                    setCopied('json');
                    setTimeout(() => setCopied(null), 1200);
                  }}
                  aria-label="Copy JSON code">
                  <ClipboardDocumentIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="h-full overflow-auto">
                <Highlight code={jsonCode} language="json" theme={theme}>
                  {({
                    className,
                    style,
                    tokens,
                    getLineProps,
                    getTokenProps
                  }: HighlightRenderProps) => (
                    <pre
                      className={className}
                      style={{
                        ...style,
                        margin: 0,
                        padding: 16,
                        fontSize: 14,
                        borderRadius: 4,
                        boxSizing: 'border-box'
                      }}>
                      {tokens.map(
                        (line: Array<{ types: string[]; content: string }>, i: number) => (
                          <div key={i} {...getLineProps({ line })}>
                            {line.map(
                              (token: { types: string[]; content: string }, key: number) => (
                                <span key={key} {...getTokenProps({ token })} />
                              )
                            )}
                          </div>
                        )
                      )}
                    </pre>
                  )}
                </Highlight>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right panel: ExampleGallery only */}
      <div
        className={`${rightOpen ? 'w-72' : 'w-12'} flex-shrink-0 bg-white shadow-lg z-10 transition-all duration-200 overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Scrollable content (only when open) */}
          {rightOpen ? (
            <div className="flex-1 overflow-auto p-4">
              <ExampleGallery examples={examples} onLoadExample={handleLoadExample} />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          {/* Chevron toggle always visible at bottom */}
          <div
            className={`flex items-center ${rightOpen ? 'justify-start' : 'justify-center'} p-2`}>
            <button
              onClick={() => setRightOpen(!rightOpen)}
              className="p-1 rounded hover:bg-gray-100">
              {rightOpen ? (
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add Node Dialog */}
      {nodeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Node</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Node Label</label>
                <input
                  type="text"
                  value={nodeDialogData.label}
                  onChange={(e) => setNodeDialogData({ ...nodeDialogData, label: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={nodeDialogData.description}
                  onChange={(e) =>
                    setNodeDialogData({ ...nodeDialogData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Node Type</label>
                <select
                  value={nodeDialogData.nodeType}
                  onChange={(e) =>
                    setNodeDialogData({ ...nodeDialogData, nodeType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {nodeTemplates.map((template) => (
                    <option key={template.type} value={template.type}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button onClick={() => setNodeDialog(false)} outline>
                Cancel
              </Button>
              <Button onClick={handleCreateNode}>Create Node</Button>
            </div>
          </div>
        </div>
      )}

      {/* Color Picker Popover for Edges */}
      {colorPickerOpen && colorPickerAnchor && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
          style={{
            top: colorPickerAnchor.getBoundingClientRect().bottom + 8,
            left: colorPickerAnchor.getBoundingClientRect().left
          }}>
          <h3 className="text-sm font-medium mb-3">Select Edge Color</h3>
          <div className="grid grid-cols-4 gap-2">
            {edgeColors.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-transparent hover:border-black transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => handleEdgeColorChange(color)}
              />
            ))}
          </div>
          {(() => {
            if (!selectedEdge) return null;
            const selected = edges.find((e) => e.id === selectedEdge);
            if (!selected) return null;
            const groupEdges = edges.filter((e) => e.source === selected.source);
            if (groupEdges.length > 1) {
              return (
                <div className="mt-4">
                  {selected.data?.isConditional ? (
                    <Button className="w-full" color="blue">
                      Make Default
                    </Button>
                  ) : (
                    <Button className="w-full" outline>
                      Make Conditional
                    </Button>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Confirm Load Example Dialog */}
      <ConfirmLoadExampleDialog
        open={confirmDialogOpen}
        onClose={handleCancelLoadExample}
        onConfirm={handleConfirmLoadExample}
        exampleTitle={selectedExample?.title || ''}
        hasExistingContent={hasExistingContent}
      />
    </div>
  );
};

export default GraphBuilder;
