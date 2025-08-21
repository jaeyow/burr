import { BurrGraphJSON } from './GraphExporter';

export class BurrGraphCodeGenerator {
  static generatePythonCode(graphData: BurrGraphJSON): string {
    const imports = this.generateImports(graphData.nodes);
    const actions = this.generateActions(graphData.nodes, graphData.edges);
    const graphFunction = this.generateGraphFunction(graphData);
    const main = this.generateMain();

    return [imports, actions, graphFunction, main].join('\n\n');
  }

  private static generateImports(nodes: BurrGraphJSON['nodes']): string {
    // Check if any nodes are streaming actions
    const hasStreamingAction = nodes.some((node) => node.nodeType === 'streaming_action');

    const actionImports = hasStreamingAction
      ? 'from burr.core.action import action, streaming_action'
      : 'from burr.core.action import action';

    const typingImports = hasStreamingAction
      ? 'from typing import AsyncGenerator, Optional, Tuple'
      : 'from typing import Tuple';

    return `${typingImports}
from burr.core import State, default, when
${actionImports}
from burr.core.graph import GraphBuilder`;
  }

  private static generateActions(
    nodes: BurrGraphJSON['nodes'],
    edges: BurrGraphJSON['edges']
  ): string {
    // Only generate actions for action nodes, not input nodes
    const processNodes = nodes.filter((node) => node.nodeType !== 'input');

    const actionFunctions = processNodes.map((node) => {
      const isStreamingAction = node.nodeType === 'streaming_action';

      if (isStreamingAction) {
        return this.generateStreamingAction(node, nodes, edges);
      } else {
        return this.generateRegularAction(node, nodes, edges);
      }
    });

    return actionFunctions.join('\n\n');
  }

  private static generateRegularAction(
    node: BurrGraphJSON['nodes'][0],
    nodes: BurrGraphJSON['nodes'],
    edges: BurrGraphJSON['edges']
  ): string {
    const functionName = this.sanitizeNodeName(node.label);
    const description = node.description ? `\n    """${node.description}"""` : '';

    // Find input nodes that connect to this action node
    const inputParams = this.getInputParameters(node.id, nodes, edges);
    const paramString =
      inputParams.length > 0 ? `state: State, ${inputParams.join(', ')}` : 'state: State';

    const stubDocstring = description
      ? `\n    """${description.slice(1)}\n    \n    This is a stub implementation. Please complete this action with your business logic.\n    """`
      : `\n    """This is a stub implementation. Please complete this action with your business logic."""`;

    return `@action(reads=[], writes=[])
def ${functionName}(${paramString}) -> Tuple[dict, State]:${stubDocstring}
    return {}, state`;
  }

  private static generateStreamingAction(
    node: BurrGraphJSON['nodes'][0],
    nodes: BurrGraphJSON['nodes'],
    edges: BurrGraphJSON['edges']
  ): string {
    const functionName = this.sanitizeNodeName(node.label);
    const description = node.description ? `\n    """${node.description}"""` : '';

    // Find input nodes that connect to this action node
    const inputParams = this.getInputParameters(node.id, nodes, edges);
    const paramString =
      inputParams.length > 0 ? `state: State, ${inputParams.join(', ')}` : 'state: State';

    const stubDocstring = description
      ? `\n    """${description.slice(1)}\n    \n    This is a stub implementation. Please complete this streaming action with your business logic.\n    """`
      : `\n    """This is a stub implementation. Please complete this streaming action with your business logic."""`;

    return `@streaming_action(reads=[], writes=[])
async def ${functionName}(${paramString}) -> AsyncGenerator[Tuple[dict, Optional[State]], None]:${stubDocstring}
    # TODO: Implement streaming action logic
    yield {}, state`;
  }

  private static getInputParameters(
    nodeId: string,
    nodes: BurrGraphJSON['nodes'],
    edges: BurrGraphJSON['edges']
  ): string[] {
    const inputParams: string[] = [];

    // Find all edges that target this node and come from input nodes
    edges.forEach((edge) => {
      if (edge.target === nodeId) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (sourceNode && sourceNode.nodeType === 'input') {
          // Extract parameter name from input node label (e.g., "input: prompt" -> "prompt")
          const paramName = sourceNode.label.replace(/^input:\s*/, '').trim();
          const sanitizedParam = this.sanitizeParameterName(paramName);
          inputParams.push(`${sanitizedParam}: str`);
        }
      }
    });

    return inputParams;
  }

  private static sanitizeParameterName(name: string): string {
    // Convert parameter name to valid Python parameter name
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'param'
    );
  }

  private static generateGraphFunction(graphData: BurrGraphJSON): string {
    // Only include action nodes in actions, not input nodes
    const processNodes = graphData.nodes.filter((node) => node.nodeType !== 'input');
    const actionNames = processNodes.map((node) => this.sanitizeNodeName(node.label));
    const transitions = this.generateTransitions(graphData);

    const actionsString = actionNames.map((name) => `          ${name},`).join('\n');

    return `def create_burr_graph():
    """Create the Burr graph for the project."""
    return (
        GraphBuilder()
        .with_actions(
${actionsString}
        )
        .with_transitions(
${transitions}
        )
        .build()
    )`;
  }

  private static generateTransitions(graphData: BurrGraphJSON): string {
    const transitions: string[] = [];

    // Filter out edges that involve input nodes since they're not actions
    const processEdges = graphData.edges.filter((edge) => {
      const sourceNode = graphData.nodes.find((n) => n.id === edge.source);
      const targetNode = graphData.nodes.find((n) => n.id === edge.target);
      return sourceNode?.nodeType !== 'input' && targetNode?.nodeType !== 'input';
    });

    // Group edges by source node to handle conditional logic
    const edgesBySource = new Map<string, typeof processEdges>();
    processEdges.forEach((edge) => {
      if (!edgesBySource.has(edge.source)) {
        edgesBySource.set(edge.source, []);
      }
      edgesBySource.get(edge.source)!.push(edge);
    });

    // Collect all transitions (including conditional and default)
    const allTransitions: Array<{ source: string; target: string; condition: string }> = [];

    // Generate transitions
    edgesBySource.forEach((edges, sourceId) => {
      const sourceNode = graphData.nodes.find((n) => n.id === sourceId);
      if (!sourceNode || sourceNode.nodeType === 'input') return;

      const sourceName = this.sanitizeNodeName(sourceNode.label);

      if (edges.length === 1) {
        // Simple transition
        const edge = edges[0];
        const targetNode = graphData.nodes.find((n) => n.id === edge.target);
        if (targetNode && targetNode.nodeType !== 'input') {
          const targetName = this.sanitizeNodeName(targetNode.label);
          allTransitions.push({ source: sourceName, target: targetName, condition: 'default' });
        }
      } else {
        // Conditional transitions
        const conditionalEdges = edges.filter((e) => e.isConditional && e.condition);
        const defaultEdges = edges.filter((e) => !e.isConditional || !e.condition);

        // Add conditional transitions
        conditionalEdges.forEach((edge) => {
          const targetNode = graphData.nodes.find((n) => n.id === edge.target);
          if (targetNode && targetNode.nodeType !== 'input' && edge.condition) {
            const targetName = this.sanitizeNodeName(targetNode.label);
            allTransitions.push({
              source: sourceName,
              target: targetName,
              condition: `when(${edge.condition})`
            });
          }
        });

        // Add default transition if exists
        if (defaultEdges.length > 0) {
          const defaultEdge = defaultEdges[0]; // Take first default edge
          const targetNode = graphData.nodes.find((n) => n.id === defaultEdge.target);
          if (targetNode && targetNode.nodeType !== 'input') {
            const targetName = this.sanitizeNodeName(targetNode.label);
            allTransitions.push({ source: sourceName, target: targetName, condition: 'default' });
          }
        }
      }
    });

    // Group transitions by target and condition - only group if they have the same target AND same condition
    const groupedTransitions = new Map<string, string[]>();
    allTransitions.forEach(({ source, target, condition }) => {
      // Only group transitions with same target and 'default' condition
      // Conditional transitions (when(...)) should remain separate
      const key =
        condition === 'default' ? `${target}|default` : `${source}|${target}|${condition}`;
      if (!groupedTransitions.has(key)) {
        groupedTransitions.set(key, []);
      }
      groupedTransitions.get(key)!.push(source);
    });

    // Generate grouped transition strings
    groupedTransitions.forEach((sources, key) => {
      if (key.includes('|default')) {
        // This is a group of default transitions to the same target
        const target = key.split('|')[0];

        if (sources.length === 1) {
          // Single source - use simple tuple format
          transitions.push(`            ("${sources[0]}", "${target}", default),`);
        } else {
          // Multiple sources - use grouped format
          const sourceList = sources.map((s) => `                    "${s}"`).join(',\n');
          transitions.push(
            `            (\n                [\n${sourceList}\n                ],\n                "${target}",\n            ),`
          );
        }
      } else {
        // This is a conditional transition - always use simple tuple format
        const [source, target, condition] = key.split('|');
        transitions.push(`            ("${source}", "${target}", ${condition}),`);
      }
    });

    return transitions.join('\n');
  }

  private static generateMain(): string {
    return `graph = create_burr_graph()

if __name__ == "__main__":
    print("Burr graph created successfully.")
    print(graph)
    # You can now use \`graph\` in your Burr application.`;
  }

  private static sanitizeNodeName(label: string): string {
    // Convert label to valid Python function name
    return (
      label
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'unnamed_node'
    );
  }

  private static sanitizeConditionName(condition: string): string {
    // Convert condition to valid Python variable name
    return (
      condition
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'condition'
    );
  }
}
