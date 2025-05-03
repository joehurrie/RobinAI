import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Debug logging function
const debug = (message: string, data?: any) => {
  console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Retry function
const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate API key format
const isValidApiKey = (key: string | undefined): boolean => {
  if (!key) return false;
  // OpenAI API keys typically start with 'sk-' and are at least 40 characters long
  return key.startsWith('sk-') && key.length >= 40;
};

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const SYSTEM_PROMPT = 'You are a helpful AI assistant.';

export async function POST(req: Request) {
  debug('Starting POST request handling');
  
  try {
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      debug('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    if (!isValidApiKey(process.env.OPENAI_API_KEY)) {
      debug('OpenAI API key is invalid');
      return NextResponse.json(
        { error: 'OpenAI API key is invalid' },
        { status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      debug('Request body parsed successfully', body);
    } catch (parseError) {
      debug('Failed to parse request body', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { messages } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      debug('Invalid messages format', { messages });
      return NextResponse.json(
        { error: 'Invalid request format: messages must be an array' },
        { status: 400 }
      );
    }

    // Format messages
    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];
    debug('Formatted messages', formattedMessages);

    // Make OpenAI API call
    debug('Making OpenAI API call');
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.6,
        frequency_penalty: 0.6,
      });
      debug('OpenAI API call successful', completion);

      const response = completion.choices[0].message.content;
      if (!response) {
        debug('No content in OpenAI response', completion);
        return NextResponse.json(
          { error: 'No content in OpenAI response' },
          { status: 500 }
        );
      }

      debug('Sending successful response');
      return NextResponse.json({ response });
    } catch (apiError) {
      debug('OpenAI API call failed', apiError);
      if (apiError instanceof OpenAI.APIError) {
        return NextResponse.json(
          { 
            error: 'OpenAI API Error',
            details: {
              status: apiError.status,
              code: apiError.code,
              message: apiError.message,
            }
          },
          { status: apiError.status || 500 }
        );
      }
      throw apiError;
    }
  } catch (error) {
    debug('Error caught in POST handler', error);
    
    // Detailed error information
    const errorInfo = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
    };
    debug('Error details', errorInfo);

    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: errorInfo
      },
      { status: 500 }
    );
  }
}
