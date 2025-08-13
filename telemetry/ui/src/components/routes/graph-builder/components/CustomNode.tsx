import React, { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Pastel color palette for nodes
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

export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  nodeType: string;
  icon: string;
  colorIndex?: number;
  onDelete?: (nodeId: string) => void;
  onLabelChange?: (nodeId: string, newLabel: string) => void;
}

type CustomNodeType = Node<CustomNodeData>;

const CustomNode: React.FC<NodeProps<CustomNodeType>> = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data.label);
  const [fixedWidth, setFixedWidth] = useState<number | null>(null);
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  // Use colorIndex if provided, otherwise generate based on node id
  const colorIndex = data.colorIndex ?? parseInt(id.replace(/\D/g, '')) % pastelColors.length;
  const colors = pastelColors[colorIndex];

  const handleDelete = () => {
    if (data.onDelete && typeof data.onDelete === 'function') {
      data.onDelete(id);
    }
  };

  const handleLabelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Capture current width and height before switching to edit mode
    if (paperRef.current) {
      setFixedWidth(paperRef.current.offsetWidth);
      setFixedHeight(paperRef.current.offsetHeight);
    }
    setIsEditing(true);
  }, []);

  const handleLabelChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLabelValue(event.target.value);
  }, []);

  const handleLabelBlur = useCallback(() => {
    setIsEditing(false);
    setFixedWidth(null); // Release the fixed width
    setFixedHeight(null); // Release the fixed height
    if (data.onLabelChange && labelValue.trim() !== data.label) {
      data.onLabelChange(id, labelValue.trim() || data.label);
    }
  }, [data, id, labelValue]);

  const handleLabelKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Stop propagation to prevent global keyboard handlers from interfering
      event.stopPropagation();

      if (event.key === 'Enter') {
        handleLabelBlur();
      } else if (event.key === 'Escape') {
        setLabelValue(data.label);
        setIsEditing(false);
        setFixedWidth(null); // Release the fixed width
        setFixedHeight(null); // Release the fixed height
      }
    },
    [data.label, handleLabelBlur]
  );

  // Determine styling based on node type
  const isInputNode = data.nodeType === 'input';

  return (
    <div
      ref={paperRef}
      className={`
        min-w-40 max-w-60 relative overflow-visible transition-all duration-200 ease-in-out
        ${selected ? 'shadow-lg scale-105' : 'shadow-sm'}
        ${isInputNode ? 'border-2 border-dashed border-gray-600 bg-white' : `border-2 border-solid bg-opacity-90`}
        rounded-lg
        hover:${selected ? 'scale-105' : 'scale-102'} hover:shadow-md
      `}
      style={{
        width: fixedWidth ? `${fixedWidth}px` : 'fit-content',
        height: fixedHeight ? `${fixedHeight}px` : 'auto',
        borderColor: isInputNode ? '#666' : colors.border,
        backgroundColor: isInputNode ? '#fff' : colors.background
      }}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: 'white',
          border: `2px solid ${isInputNode ? '#666' : colors.border}`,
          width: 12,
          height: 12
          // Centered on the top edge, extending beyond bounds
        }}
      />

      {/* Node Content */}
      <div
        className={`
        p-3 relative
        ${isInputNode ? 'flex flex-col items-center justify-center h-full text-center' : ''}
      `}>
        {/* Delete button - only show when selected */}
        {selected && (
          <button
            onClick={handleDelete}
            className={`
              absolute top-1 right-1 p-1 rounded hover:bg-opacity-20
              ${isInputNode ? 'text-gray-600 hover:bg-gray-600' : 'hover:bg-current'}
            `}
            style={{ color: isInputNode ? '#666' : colors.border }}>
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        )}

        {isEditing ? (
          <input
            value={labelValue}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className={`
              border-none outline-none bg-transparent text-sm font-bold font-inherit
              w-full box-border p-0 m-0 leading-normal block
              ${isInputNode ? 'text-center text-gray-600' : 'text-left'}
            `}
            style={{
              color: isInputNode ? '#666' : colors.border,
              marginBottom: data.description ? '8px' : 0,
              paddingRight: selected ? '24px' : 0
            }}
          />
        ) : (
          <div
            onClick={handleLabelClick}
            className={`
              font-bold cursor-pointer hover:opacity-80 break-words
              ${isInputNode ? 'text-center text-gray-600' : 'text-left'}
              ${data.description ? 'mb-2' : ''}
            `}
            style={{
              color: isInputNode ? '#666' : colors.border,
              paddingRight: selected ? '12px' : 0
            }}>
            {labelValue}
          </div>
        )}

        {data.description && (
          <div
            className={`
              text-xs opacity-80 block break-words
              ${isInputNode ? 'text-center text-gray-600' : 'text-left'}
            `}
            style={{ color: isInputNode ? '#666' : colors.border }}>
            {data.description}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: 'white',
          border: `2px solid ${isInputNode ? '#666' : colors.border}`,
          width: 12,
          height: 12
          // Centered on the bottom edge, extending beyond bounds
        }}
      />
    </div>
  );
};

export default memo(CustomNode);
