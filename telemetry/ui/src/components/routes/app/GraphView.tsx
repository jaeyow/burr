import { ActionModel, ApplicationModel, Step } from '../../../api';

import ELK from 'elkjs/lib/elk.bundled.js';
import React, { createContext, useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  BaseEdge,
  Controls,
  EdgeProps,
  Handle,
  MarkerType,
  Position,
  ReactFlowProvider,
  getBezierPath,
  useReactFlow
} from '@xyflow/react';

import { backgroundColorsForIndex } from './AppView';
import { getActionStatus } from '../../../utils';

// Pastel color palette for nodes (same as GraphBuilder)
const pastelColors = [
  { border: '#FF6B6B', background: '#FFE5E5' }, // Coral
  { border: '#4ECDC4', background: '#E5F9F6' }, // Turquoise
  { border: '#45B7D1', background: '#E5F4FD' }, // Sky blue
  { border: '#96CEB4', background: '#F0F9F4' }, // Mint green
  { border: '#FFEAA7', background: '#FFFCF0' }, // Light yellow
  { border: '#DDA0DD', background: '#F5F0F5' }, // Plum
  { border: '#98D8C8', background: '#F0FAF7' }, // Seafoam
  { border: '#F7DC6F', background: '#FEFBF0' }, // Pale yellow
  { border: '#BB8FCE', background: '#F4F1F7' }, // Lavender
  { border: '#85C1E9', background: '#F0F8FF' } // Light blue
];

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.edgeNodeBetweenLayers': '50',
  'elk.spacing.edgeNode': '40',
  'elk.spacing.edgeEdge': '15',
  'elk.layered.nodePlacement.strategy': 'SIMPLE',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.cycleBreaking.strategy': 'GREEDY'
};

type ActionNodeData = {
  action: ActionModel;
  label: string;
};

type InputNodeData = {
  input: string;
  label: string;
};

type NodeData = ActionNodeData | InputNodeData;

type NodeType = {
  id: string;
  type: string;
  data: NodeData;
  position: {
    x: number;
    y: number;
  };
};

type EdgeData = {
  from: string;
  to: string;
  condition: string;
};
type EdgeType = {
  id: string;
  source: string;
  target: string;
  markerEnd: {
    type: MarkerType;
    width: number;
    height: number;
  };
  data: EdgeData;
};

const ActionNode = (props: { data: NodeData }) => {
  const {
    highlightedActions: previousActions,
    hoverAction,
    currentAction
  } = React.useContext(NodeStateProvider);
  const highlightedActions = [currentAction, ...(previousActions || [])].reverse();
  const data = props.data as ActionNodeData;
  const name = data.action.name;
  const indexOfAction = highlightedActions.findIndex(
    (step) => step?.step_start_log.action === data.action.name
  );
  const shouldHighlight = indexOfAction !== -1;
  const step = highlightedActions[indexOfAction];
  const isCurrentAction = currentAction?.step_start_log.action === name;
  
  // Calculate color index based on action name hash for consistent colors
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % pastelColors.length;
  const colors = pastelColors[colorIndex];
  
  const bgColor =
    isCurrentAction && step !== undefined
      ? backgroundColorsForIndex(0, getActionStatus(step))
      : shouldHighlight
        ? colors.background
        : colors.background;
  const opacity = hoverAction?.step_start_log.action === name ? 'opacity-50' : '';
  const borderColor = isCurrentAction
    ? '#429dbce6'
    : shouldHighlight
      ? colors.border
      : colors.border;
  
  return (
    <>
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          background: 'white',
          border: `2px solid ${colors.border}`,
          width: 12,
          height: 12
        }}
      />
      <div
        className={`${opacity} text-lg font-sans p-4 rounded-lg border-2 border-solid transition-all duration-200 ease-in-out shadow-sm hover:shadow-md`}
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          color: isCurrentAction ? 'white' : colors.border,
          minWidth: '120px'
        }}>
        {name}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="a"
        style={{
          background: 'white',
          border: `2px solid ${colors.border}`,
          width: 12,
          height: 12
        }}
      />
    </>
  );
};

const InputNode = (props: { data: NodeData }) => {
  return (
    <>
      <div 
        className="text-lg font-sans p-4 rounded-lg border-2 border-dashed transition-all duration-200 ease-in-out shadow-sm hover:shadow-md text-center"
        style={{
          borderColor: '#666',
          backgroundColor: '#fff',
          color: '#666',
          minWidth: '120px'
        }}>
        {props.data.label}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="a"
        style={{
          background: 'white',
          border: '2px solid #666',
          width: 12,
          height: 12
        }}
      />
    </>
  );
};
// Custom edge component with GraphBuilder styling
export const ActionActionEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
  selected
}: EdgeProps) => {
  data = data as EdgeData;
  const { highlightedActions: previousActions, currentAction } =
    React.useContext(NodeStateProvider);
  const allActionsInPath = [...(previousActions || []), ...(currentAction ? [currentAction] : [])];
  const containsFrom = allActionsInPath.some(
    (action) => action.step_start_log.action === data?.from
  );
  const containsTo = allActionsInPath.some((action) => action.step_start_log.action === data?.to);
  const shouldHighlight = containsFrom && containsTo;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const isConditional = data?.condition && data.condition !== 'default';

  const edgeStyle: React.CSSProperties = {
    strokeWidth: selected ? 4 : shouldHighlight ? 3 : 2,
    stroke: shouldHighlight ? '#429dbce6' : data?.condition === 'default' ? '#94a3b8' : '#429dbce6'
  };

  // Add dashed animation for conditional edges
  if (isConditional) {
    edgeStyle.strokeDasharray = '8,4';
    edgeStyle.animation = 'dash 2s linear infinite';
  }

  return (
    <>
      {/* Add CSS animation for dashed lines */}
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -12;
            }
          }
        `}
      </style>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
    </>
  );
};

const getLayoutedElements = (
  nodes: NodeType[],
  edges: EdgeType[],
  options: { [key: string]: string } = {}
) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const nodeNameMap = nodes.reduce(
    (acc, node) => {
      acc[node.id] = node;
      return acc;
    },
    {} as { [key: string]: NodeType }
  );
  const edgeNameMap = edges.reduce(
    (acc, edge) => {
      acc[edge.id] = edge;
      return acc;
    },
    {} as { [key: string]: EdgeType }
  );
  
  const graph = {
    id: 'root',
    layoutOptions: { ...elkOptions, ...options },
    children: nodes.map((node) => {
      // Calculate approximate dimensions based on node content
      const nodeData = node.data as ActionNodeData | InputNodeData;
      const labelLength = nodeData.label.length;
      const width = Math.max(150, labelLength * 8 + 40); // Dynamic width based on label
      const height = node.type === 'externalInput' ? 60 : 80; // Different heights for different node types
      
      return {
        ...node,
        // Adjust the target and source handle positions based on the layout direction
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
        // Use calculated dimensions
        width,
        height
      };
    }),
    edges: edges.map((edge) => {
      return {
        ...edge,
        sources: [edge.source],
        targets: [edge.target]
      };
    })
  };
  return elk.layout(graph).then((layoutedGraph) => ({
    nodes: (layoutedGraph.children || []).map((node) => {
      const originalNode = nodeNameMap[node.id];
      return {
        ...originalNode,
        position: {
          x: node.x as number,
          y: node.y as number
        }
      };
    }),
    edges: (layoutedGraph?.edges || []).map((edge) => {
      return {
        ...edge,
        markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#429dbce6' },
        source: edge.sources[0],
        target: edge.targets[0],
        data: {
          from: edge.sources[0],
          to: edge.targets[0],
          condition: edgeNameMap[edge.id].data.condition
        }
      };
    })
  }));
};

const convertApplicationToGraph = (stateMachine: ApplicationModel): [NodeType[], EdgeType[]] => {
  const shouldDisplayInput = (input: string) => !input.startsWith('__');
  const inputUniqueID = (action: ActionModel, input: string) => `${action.name}:${input}`; // Currently they're distinct by name

  const allActionNodes = stateMachine.actions.map((action) => ({
    id: action.name,
    type: 'action',
    data: { action, label: action.name },
    position: { x: 0, y: 0 }
  }));
  // TODO -- consider displaying optional inputs
  const allInputNodes = stateMachine.actions.flatMap((action) =>
    (action.inputs || []).filter(shouldDisplayInput).map((input) => ({
      id: inputUniqueID(action, input),
      type: 'externalInput',
      data: { input, label: input },
      position: { x: 0, y: 0 }
    }))
  );
  const allInputTransitions = stateMachine.actions.flatMap((action) =>
    (action.inputs || []).filter(shouldDisplayInput).map((input) => ({
      id: `${action.name}:${input}-${action.name}`,
      source: inputUniqueID(action, input),
      target: action.name,
      markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#429dbce6' },
      data: { from: inputUniqueID(action, input), condition: input, to: action.name }
    }))
  );
  const allTransitionEdges = stateMachine.transitions.map((transition) => ({
    id: `${transition.from_}-${transition.to}`,
    source: transition.from_,
    target: transition.to,
    markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#429dbce6' },
    data: { from: transition.from_, to: transition.to, condition: transition.condition }
  }));
  return [
    [...allActionNodes, ...allInputNodes],
    [...allInputTransitions, ...allTransitionEdges]
  ];
};

const nodeTypes = {
  action: ActionNode,
  externalInput: InputNode // if this is "input" it is reserved...
};

const edgeTypes = {
  default: ActionActionEdge
};

type NodeState = {
  highlightedActions: Step[] | undefined; // one for each highlighted action, in order from most recent to least recent
  hoverAction: Step | undefined; // the action currently being hovered over
  currentAction: Step | undefined; // the action currently being viewed
};
const NodeStateProvider = createContext<NodeState>({
  highlightedActions: undefined,
  hoverAction: undefined,
  currentAction: undefined
});

export const _Graph = (props: {
  stateMachine: ApplicationModel;
  currentAction: Step | undefined;
  previousActions: Step[] | undefined;
  hoverAction: Step | undefined;
}) => {
  const [initialNodes, initialEdges] = React.useMemo(() => {
    return convertApplicationToGraph(props.stateMachine);
  }, [props.stateMachine]);

  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);

  const { fitView } = useReactFlow();

  const onLayout = useCallback(
    ({ direction = 'DOWN', useInitialNodes = false }): void => {
      const opts = { ...elkOptions, 'elk.direction': direction };
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;

      getLayoutedElements(ns, es, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        window.requestAnimationFrame(() => fitView());
      });
    },
    [nodes, edges, initialNodes, initialEdges, fitView]
  );

  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN', useInitialNodes: true });
  }, []);

  return (
    <NodeStateProvider.Provider
      value={{
        highlightedActions: props.previousActions,
        hoverAction: props.hoverAction,
        currentAction: props.currentAction
      }}>
      <div className="h-full w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgesReconnectable={false}
          nodesDraggable={false}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          maxZoom={100}
          minZoom={0.1}
        />
        <Controls position="bottom-right" className=" relative" />
      </div>
    </NodeStateProvider.Provider>
  );
};

export const GraphView = (props: {
  stateMachine: ApplicationModel;
  currentAction: Step | undefined;
  highlightedActions: Step[] | undefined;
  hoverAction: Step | undefined;
}) => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const childRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={parentRef} className="h-full w-full flex-1">
      <div ref={childRef} className="h-full w-full">
        <ReactFlowProvider>
          <_Graph
            stateMachine={props.stateMachine}
            currentAction={props.currentAction}
            previousActions={props.highlightedActions}
            hoverAction={props.hoverAction}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
};
