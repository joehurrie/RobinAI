import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    if (!body.audio) {
      console.error('No audio data provided:', body);
      return NextResponse.json(
        { error: 'Audio data is required' },
        { status: 400 }
      );
    }

    try {
      // Convert base64 audio to a buffer
      const audioBuffer = Buffer.from(body.audio, 'base64');

      // Create a prompt for transcription
      const prompt = `Please transcribe the following audio: ${audioBuffer.toString('base64')}`;

      console.log('Sending transcription request to Gemini');
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        console.error('No transcription generated');
        return NextResponse.json(
          { error: 'No transcription generated' },
          { status: 500 }
        );
      }

      console.log('Transcription successful');
      return NextResponse.json({ text });

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