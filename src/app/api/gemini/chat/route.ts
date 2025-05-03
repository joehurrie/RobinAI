import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Check for API key
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export async function POST(request: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Parsed request body:', body);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      console.error('Invalid request format:', body);
      return NextResponse.json(
        { error: 'Invalid request format. Messages array is required.' },
        { status: 400 }
      );
    }

    // Convert messages to Gemini format
    const prompt = body.messages
      .map((msg: { role: string; content: string }) => {
        const role = msg.role === 'assistant' ? 'Assistant' : 'User';
        return `${role}: ${msg.content}`;
      })
      .join('\n\n');

    console.log(`Sending prompt to Gemini: ${prompt}`);

    try {
      const result = await model.generateContentStream(prompt);

      // Convert the response stream into a readable stream
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          for await (const chunk of result.stream) {
            try {
              const text = chunk.text();
              controller.enqueue(encoder.encode(text));
            } catch (err: any) {
              console.error("Error processing stream chunk:", err);
              controller.enqueue(encoder.encode(`\n[Error processing chunk: ${err.message}]\n`));
            }
          }
          controller.close();
        },
        cancel() {
          console.log("Stream cancelled by client.");
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (apiError) {
      console.error('Error in Gemini API call:', apiError);
      return NextResponse.json(
        { error: apiError instanceof Error ? apiError.message : 'Error communicating with Gemini API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 