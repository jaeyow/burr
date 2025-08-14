export interface ExampleGraph {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  nodes: Array<{
    id: string;
    label: string;
    nodeType: 'input' | 'action' | 'streaming_action';
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

export const multiModalChatbotWorkflow: ExampleGraph = {
  id: 'multi-modal-chatbot',
  title: 'MultiModal Chatbot',
  description: 'A ChatGPT-like bot which supports multiple response modes, with regular actions.',
  thumbnail: '/api/placeholder/300/200',
  nodes: [
    {
      id: 'node_1755168143524',
      label: 'prompt',
      nodeType: 'action',
      position: { x: 761.037500880113, y: 91.09506390042952 }
    },
    {
      id: 'node_1755168145454',
      label: 'check_openai_key',
      nodeType: 'action',
      position: { x: 590.5769925133961, y: 193.12036269863717 }
    },
    {
      id: 'node_1755168147468',
      label: 'check_safety',
      nodeType: 'action',
      position: { x: 383.65998201541765, y: 342.06248126606005 }
    },
    {
      id: 'node_1755168149140',
      label: 'decide_mode',
      nodeType: 'action',
      position: { x: 244.80005994860784, y: 441.05510587215326 }
    },
    {
      id: 'node_1755168153170',
      label: 'prompt_for_more',
      nodeType: 'action',
      position: { x: 25.207474108894786, y: 640.3969252482271 }
    },
    {
      id: 'node_1755168154881',
      label: 'generate_image',
      nodeType: 'action',
      position: { x: 236.56019725567864, y: 673.4346924655473 }
    },
    {
      id: 'node_1755168155844',
      label: 'generate_code',
      nodeType: 'action',
      position: { x: 470.41704805045504, y: 747.1995954667069 }
    },
    {
      id: 'node_1755168156820',
      label: 'answer_question',
      nodeType: 'action',
      position: { x: 1019.1024641404044, y: 723.9567384216581 }
    },
    {
      id: 'node_1755168158828',
      label: 'response',
      nodeType: 'action',
      position: { x: 882.6938918472104, y: 908.6828932315728 }
    },
    {
      id: 'node_1755168167660',
      label: 'input: prompt',
      nodeType: 'input',
      position: { x: 790.4927287891975, y: -28.978341010082698 }
    },
    {
      id: 'node_1755168171045',
      label: 'input: model',
      nodeType: 'input',
      position: { x: 883.8675375478366, y: 548.864009480603 }
    },
    {
      id: 'node_1755168174222',
      label: 'input: display_type',
      nodeType: 'input',
      position: { x: 1085.9567336019784, y: 550.5927142846773 }
    }
  ],
  edges: [
    {
      id: 'xy-edge__node_1755168167660-node_1755168143524',
      source: 'node_1755168167660',
      target: 'node_1755168143524',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168143524-node_1755168145454',
      source: 'node_1755168143524',
      target: 'node_1755168145454',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168145454-node_1755168158828',
      source: 'node_1755168145454',
      target: 'node_1755168158828',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168145454-node_1755168147468',
      source: 'node_1755168145454',
      target: 'node_1755168147468',
      condition: 'has_openai_key=True',
      isConditional: true
    },
    {
      id: 'xy-edge__node_1755168147468-node_1755168149140',
      source: 'node_1755168147468',
      target: 'node_1755168149140',
      condition: 'safe=True',
      isConditional: true
    },
    {
      id: 'xy-edge__node_1755168147468-node_1755168158828',
      source: 'node_1755168147468',
      target: 'node_1755168158828',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168149140-node_1755168153170',
      source: 'node_1755168149140',
      target: 'node_1755168153170',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168149140-node_1755168154881',
      source: 'node_1755168149140',
      target: 'node_1755168154881',
      condition: 'mode="generate_image"',
      isConditional: true
    },
    {
      id: 'xy-edge__node_1755168149140-node_1755168155844',
      source: 'node_1755168149140',
      target: 'node_1755168155844',
      condition: 'mode="generate_code"',
      isConditional: true
    },
    {
      id: 'xy-edge__node_1755168149140-node_1755168156820',
      source: 'node_1755168149140',
      target: 'node_1755168156820',
      condition: 'mode="answer_question"',
      isConditional: true
    },
    {
      id: 'xy-edge__node_1755168156820-node_1755168158828',
      source: 'node_1755168156820',
      target: 'node_1755168158828',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168155844-node_1755168158828',
      source: 'node_1755168155844',
      target: 'node_1755168158828',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168154881-node_1755168158828',
      source: 'node_1755168154881',
      target: 'node_1755168158828',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168153170-node_1755168158828',
      source: 'node_1755168153170',
      target: 'node_1755168158828',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168158828-node_1755168143524',
      source: 'node_1755168158828',
      target: 'node_1755168143524',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168171045-node_1755168155844',
      source: 'node_1755168171045',
      target: 'node_1755168155844',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168171045-node_1755168156820',
      source: 'node_1755168171045',
      target: 'node_1755168156820',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168171045-node_1755168154881',
      source: 'node_1755168171045',
      target: 'node_1755168154881',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168174222-node_1755168156820',
      source: 'node_1755168174222',
      target: 'node_1755168156820',
      isConditional: false
    },
    {
      id: 'xy-edge__node_1755168174222-node_1755168155844',
      source: 'node_1755168174222',
      target: 'node_1755168155844',
      isConditional: false
    }
  ]
};

// Streaming Chatbot Workflow Example based on the Burr example
export const streamingChatbotWorkflow: ExampleGraph = {
  id: 'streaming-chatbot',
  title: 'Streaming Chatbot',
  description: 'A ChatGPT-like bot which supports multiple response modes, with streaming actions.',
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
      position: { x: 84.03444726319958, y: 436.1885862034143 }
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
      nodeType: 'streaming_action',
      position: { x: 760.6437018245337, y: 495.74251927018645 }
    },
    {
      id: 'generate_code',
      label: 'generate_code',
      nodeType: 'streaming_action',
      position: { x: 90.39526978261188, y: 635.0988174456529 }
    },
    {
      id: 'answer_question',
      label: 'answer_question',
      nodeType: 'streaming_action',
      position: { x: 298.9102312422387, y: 712.7724421894403 }
    },
    {
      id: 'generate_poem',
      label: 'generate_poem',
      nodeType: 'streaming_action',
      position: { x: 564.901182554347, y: 779.8023651086941 }
    },
    {
      id: 'prompt_for_more',
      label: 'prompt_for_more',
      nodeType: 'streaming_action',
      position: { x: 729.8023651086941, y: 676.5838559860262 }
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

export const examples = [multiModalChatbotWorkflow, adaptiveCRAGWorkflow, streamingChatbotWorkflow];
