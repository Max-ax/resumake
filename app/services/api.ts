export interface ApiResponse {
  id: string;
  choices: {
    delta?: {
      content?: string;
      reasoning_content?: string;
    };
    message?: {
      role: string;
      content: string;
      reasoning_content?: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamCallbacks {
  onContent: (content: string) => void;
  onReasoningContent: (content: string) => void;
  onError: (error: string) => void;
  onComplete: () => void;
}

export async function streamCompletion(
  prompt: string,
  workRequirements: string,
  resumeContents: string,
  model: string,
  callbacks: StreamCallbacks
) {
  try {
    const systemPrompt = `我将会给你一份或者几份简历，你需要根据简历内容和我给的工作要求，挑选其中的经历，生成一份新的优化简历以契合工作要求，
    对于新简历内容要求：${prompt} 

    工作要求：${workRequirements}
    你最终输出的简历内容应当直接是markdown格式，不要包含任何其他内容和markdown代码块标识
    以下是简历内容：    
    ${resumeContents}
    `

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1",
        messages: [
          {
            role: "user",
            content: systemPrompt
          }
        ],
        stream: true,
        max_tokens: 8000,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        response_format: { type: "text" }
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        callbacks.onComplete();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== ''); 
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonString = line.slice(6); // Remove 'data: ' prefix
          if (jsonString === '[DONE]') {
            break;
          }

          try {
            const data: ApiResponse = JSON.parse(jsonString);
            if (data.choices[0].delta?.content) {
              console.log(data.choices[0].delta.content)
              callbacks.onContent(data.choices[0].delta.content);
            }
            if (data.choices[0].delta?.reasoning_content) {
              callbacks.onReasoningContent(data.choices[0].delta.reasoning_content);
            }
            if (data.choices[0].finish_reason === 'stop') {
              console.log("finish_reason", data.choices[0].finish_reason)
              console.log("usage", data.usage)
              
              callbacks.onComplete();
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in streamCompletion:', error);
    callbacks.onError(error instanceof Error ? error.message : 'An error occurred');
  }
} 