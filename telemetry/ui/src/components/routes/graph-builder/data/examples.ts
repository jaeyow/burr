export interface ExampleGraph {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  nodes: Array<{
    id: string;
    label: string;
    nodeType: 'input' | 'action';
    position: { x: number; y: number };
    description?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    condition?: string;
    isConditional: boolean;
  }>;
}

// Multi-modal Chatbot Workflow Example based on the Burr example
export const multiModalChatbotWorkflow: ExampleGraph = {
  id: 'multi-modal-chatbot',
  title: 'Multi-modal Chatbot',
  description: 'A ChatGPT-like bot which supports multiple response modes.',
  thumbnail: '/api/placeholder/300/200',
  nodes: [
    {
      id: 'input_prompt',
      label: 'input: prompt',
      nodeType: 'input',
      position: { x: 500, y: 50 }
    },
    {
      id: 'input_model',
      label: 'input: model',
      nodeType: 'input',
      position: { x: 100, y: 400 }
    },
    {
      id: 'prompt',
      label: 'prompt',
      nodeType: 'action',
      position: { x: 500, y: 200 }
    },
    {
      id: 'check_safety',
      label: 'check_safety',
      nodeType: 'action',
      position: { x: 500, y: 350 }
    },
    {
      id: 'decide_mode',
      label: 'decide_mode',
      nodeType: 'action',
      position: { x: 400, y: 500 }
    },
    {
      id: 'unsafe_response',
      label: 'unsafe_response',
      nodeType: 'action',
      position: { x: 750, y: 500 }
    },
    {
      id: 'generate_code',
      label: 'generate_code',
      nodeType: 'action',
      position: { x: 150, y: 650 }
    },
    {
      id: 'answer_question',
      label: 'answer_question',
      nodeType: 'action',
      position: { x: 350, y: 700 }
    },
    {
      id: 'generate_poem',
      label: 'generate_poem',
      nodeType: 'action',
      position: { x: 550, y: 750 }
    },
    {
      id: 'prompt_for_more',
      label: 'prompt_for_more',
      nodeType: 'action',
      position: { x: 700, y: 700 }
    }
  ],
  edges: [
    {
      id: 'input_prompt-prompt',
      source: 'input_prompt',
      target: 'prompt',
      isConditional: false
    },
    {
      id: 'input_model-generate_code',
      source: 'input_model',
      target: 'generate_code',
      isConditional: false
    },
    {
      id: 'input_model-answer_question',
      source: 'input_model',
      target: 'answer_question',
      isConditional: false
    },
    {
      id: 'input_model-generate_poem',
      source: 'input_model',
      target: 'generate_poem',
      isConditional: false
    },
    {
      id: 'prompt-check_safety',
      source: 'prompt',
      target: 'check_safety',
      isConditional: false
    },
    {
      id: 'check_safety-decide_mode',
      source: 'check_safety',
      target: 'decide_mode',
      condition: 'safe=True',
      isConditional: true
    },
    {
      id: 'check_safety-unsafe_response',
      source: 'check_safety',
      target: 'unsafe_response',
      isConditional: false
    },
    {
      id: 'decide_mode-generate_code',
      source: 'decide_mode',
      target: 'generate_code',
      condition: 'mode="generate_code"',
      isConditional: true
    },
    {
      id: 'decide_mode-answer_question',
      source: 'decide_mode',
      target: 'answer_question',
      condition: 'mode="answer_question"',
      isConditional: true
    },
    {
      id: 'decide_mode-generate_poem',
      source: 'decide_mode',
      target: 'generate_poem',
      condition: 'mode="generate_poem"',
      isConditional: true
    },
    {
      id: 'decide_mode-prompt_for_more',
      source: 'decide_mode',
      target: 'prompt_for_more',
      isConditional: false
    },
    {
      id: 'generate_code-prompt',
      source: 'generate_code',
      target: 'prompt',
      isConditional: false
    },
    {
      id: 'answer_question-prompt',
      source: 'answer_question',
      target: 'prompt',
      isConditional: false
    },
    {
      id: 'generate_poem-prompt',
      source: 'generate_poem',
      target: 'prompt',
      isConditional: false
    },
    {
      id: 'unsafe_response-prompt',
      source: 'unsafe_response',
      target: 'prompt',
      isConditional: false
    },
    {
      id: 'prompt_for_more-prompt',
      source: 'prompt_for_more',
      target: 'prompt',
      isConditional: false
    }
  ]
};

// Adaptive CRAG Workflow Example based on the Burr example
export const adaptiveCRAGWorkflow: ExampleGraph = {
  id: 'adaptive-crag',
  title: 'Adaptive CRAG',
  description: `A system that can dynamically select the most suitable route for a given user query
  and then self-reflect on the retrieved documents to improve the quality of the response.`,
  thumbnail: '/api/placeholder/300/200',
  nodes: [
    {
      id: 'node_1755089685294',
      label: 'router',
      nodeType: 'action',
      position: {
        x: 821,
        y: 177
      }
    },
    {
      id: 'node_1755089690311',
      label: 'terminate',
      nodeType: 'action',
      position: {
        x: 1115,
        y: 339
      }
    },
    {
      id: 'node_1755089694185',
      label: 'rewrite_query_for_lancedb',
      nodeType: 'action',
      position: {
        x: 570,
        y: 343
      }
    },
    {
      id: 'node_1755089700914',
      label: 'search_lancedb',
      nodeType: 'action',
      position: {
        x: 394.5556101445897,
        y: 474.3736922140555
      }
    },
    {
      id: 'node_1755089703587',
      label: 'remove_irrelevant_lancedb_results',
      nodeType: 'action',
      position: {
        x: 221.95028444855586,
        y: 598.471168855937
      }
    },
    {
      id: 'node_1755089705880',
      label: 'extract_keywords_for_exa_search',
      nodeType: 'action',
      position: {
        x: 861.6864514076959,
        y: 755.013213212404
      }
    },
    {
      id: 'node_1755089707996',
      label: 'search_exa',
      nodeType: 'action',
      position: {
        x: 1014.1038166383757,
        y: 900.4557900504608
      }
    },
    {
      id: 'node_1755089713104',
      label: 'ask_assistant',
      nodeType: 'action',
      position: {
        x: 664.42304962349,
        y: 1049.9762444923501
      }
    },
    {
      id: 'node_1755089725529',
      label: 'input: query',
      nodeType: 'input',
      position: {
        x: 821.570514568526,
        y: 25.81884945807439
      }
    }
  ],
  edges: [
    {
      id: 'xy-edge__node_1755089725529-node_1755089685294',
      source: 'node_1755089725529',
      target: 'node_1755089685294',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755089685294-node_1755089694185',
      source: 'node_1755089685294',
      target: 'node_1755089694185',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755089694185-node_1755089700914',
      source: 'node_1755089694185',
      target: 'node_1755089700914',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755089700914-node_1755089703587',
      source: 'node_1755089700914',
      target: 'node_1755089703587',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755089703587-node_1755089713104',
      source: 'node_1755089703587',
      target: 'node_1755089713104',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755089703587-node_1755089705880',
      source: 'node_1755089703587',
      target: 'node_1755089705880',
      condition: 'len(lancedb_results) < docs_limit',
      isConditional: true
    },
    {
      id: 'xy-edge__node_1755089705880-node_1755089707996',
      source: 'node_1755089705880',
      target: 'node_1755089707996',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755089707996-node_1755089713104',
      source: 'node_1755089707996',
      target: 'node_1755089713104',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755089685294-node_1755089713104',
      source: 'node_1755089685294',
      target: 'node_1755089713104',
      condition: 'route="assistant"',
      isConditional: true
    },
    {
      id: 'xy-edge__node_1755089685294-node_1755089705880',
      source: 'node_1755089685294',
      target: 'node_1755089705880',
      condition: 'route="web_search"',
      isConditional: true
    },
    {
      id: 'xy-edge__node_1755089685294-node_1755089690311',
      source: 'node_1755089685294',
      target: 'node_1755089690311',
      condition: 'route="terminate"',
      isConditional: true
    }
  ]
};

export const examples = [multiModalChatbotWorkflow, adaptiveCRAGWorkflow];
