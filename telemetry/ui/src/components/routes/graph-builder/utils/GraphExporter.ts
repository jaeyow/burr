import { Node, Edge } from '@xyflow/react';

export interface BurrGraphJSON {
  version: string;
  metadata: {
    created: string;
    title?: string;
    description?: string;
  };
  nodes: Array<{
    id: string;
    label: string;
    description?: string;
    nodeType: 'input' | 'action' | 'streaming_action';
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    condition?: string;
    isConditional: boolean;
  }>;
}

export class GraphExporter {
  static exportToJSON(nodes: Node[], edges: Edge[]): BurrGraphJSON {
    const exportData: BurrGraphJSON = {
      version: '1.0.0',
      metadata: {
        created: new Date().toISOString(),
        title: 'Burr Graph',
        description: 'Generated from Burr Graph Builder'
      },
      nodes: nodes.map((node) => ({
        id: node.id,
        label: (node.data.label as string) || 'Unnamed Node',
        description: (node.data.description as string) || undefined,
        nodeType: this.mapNodeType((node.data.nodeType as string) || 'action'),
        position: node.position
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        condition: (edge.data?.label as string) || (edge.data?.condition as string) || undefined,
        isConditional: Boolean(edge.data?.isConditional) || false
      }))
    };

    return exportData;
  }

  private static mapNodeType(nodeType: string): 'input' | 'action' | 'streaming_action' {
    switch (nodeType) {
      case 'input':
        return 'input';
      case 'streaming_action':
        return 'streaming_action';
      default:
        return 'action';
    }
  }
}
