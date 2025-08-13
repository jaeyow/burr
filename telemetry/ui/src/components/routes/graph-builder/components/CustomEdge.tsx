import React, { useState, useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  MarkerType,
  Edge
} from '@xyflow/react';

export interface CustomEdgeData extends Record<string, unknown> {
  condition?: string;
  isConditional?: boolean;
  label?: string;
  conditionalGroup?: string; // Identifies which conditional group this edge belongs to
  onLabelChange?: (edgeId: string, newLabel: string) => void;
  onGroupLabelChange?: (sourceNodeId: string, newLabel: string) => void;
}

type CustomEdgeType = Edge<CustomEdgeData>;

const CustomEdge: React.FC<EdgeProps<CustomEdgeType>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
  source // Add source prop to get source node ID
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const isConditional = data?.isConditional || (data?.condition && data.condition !== 'default');

  // For conditional edges, show the group label; for non-conditional edges, no label
  const displayLabel = isConditional ? data?.label || 'condition' : '';
  const [labelValue, setLabelValue] = useState(displayLabel);

  // Update labelValue when data changes (important for group label synchronization)
  React.useEffect(() => {
    const newDisplayLabel = isConditional ? data?.label || 'condition' : '';
    setLabelValue(newDisplayLabel);
  }, [data?.label, data?.condition, isConditional]);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const edgeStyle: React.CSSProperties = {
    strokeWidth: selected ? 4 : 2,
    stroke:
      (style as React.CSSProperties)?.stroke ||
      (data?.condition === 'default' ? '#94a3b8' : '#429dbce6'),
    ...(style as React.CSSProperties)
  };

  // Add dashed animation for conditional edges
  if (isConditional) {
    edgeStyle.strokeDasharray = '8,4';
    edgeStyle.animation = 'dash 2s linear infinite';
  }

  const handleLabelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleLabelChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLabelValue(event.target.value);
  }, []);

  const handleLabelBlur = useCallback(() => {
    setIsEditing(false);
    const newLabel = labelValue;
    // Always update label and condition to the new value (even if empty)
    if (data?.onLabelChange) {
      data.onLabelChange(id, newLabel);
    }
  }, [data, id, labelValue]);

  const handleLabelKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      event.stopPropagation();

      if (event.key === 'Enter') {
        handleLabelBlur();
      } else if (event.key === 'Escape') {
        setLabelValue(data?.label || data?.condition || '');
        setIsEditing(false);
      }
    },
    [data?.label, data?.condition, handleLabelBlur]
  );

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

      <BaseEdge path={edgePath} markerEnd={markerEnd || MarkerType.ArrowClosed} style={edgeStyle} />
      <EdgeLabelRenderer>
        {isConditional && (
          <div
            className="absolute text-xs pointer-events-auto"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`
            }}>
            {isEditing ? (
              <input
                value={labelValue}
                onChange={handleLabelChange}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="border border-gray-300 rounded-xl px-2 py-1 text-xs bg-white min-w-16 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <button
                onClick={handleLabelClick}
                className="bg-white border border-gray-300 rounded-xl px-2 py-1 text-xs cursor-pointer hover:bg-gray-50 transition-colors min-h-5 flex items-center">
                {data?.label ?? data?.condition ?? ''}
              </button>
            )}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
