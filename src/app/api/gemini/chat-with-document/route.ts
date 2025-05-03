import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Check if API key is available
if (!process.env.GOOGLE_API_KEY) {
  console.error('GOOGLE_API_KEY is not set in environment variables');
  throw new Error('GOOGLE_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const text = formData.get('text') as string;
    const question = formData.get('question') as string;

    if (!file && !text) {
      return NextResponse.json(
        { error: 'No document provided' },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: 'No question provided' },
        { status: 400 }
      );
    }

    let documentContent = text;

    if (file) {
      try {
        documentContent = await file.text();
      } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json(
          { error: 'Failed to read the uploaded file' },
          { status: 400 }
        );
      }
    }

    if (!documentContent.trim()) {
      return NextResponse.json(
        { error: 'No document content to analyze' },
        { status: 400 }
      );
    }

    const prompt = `You are an AI assistant helping to answer questions about a document. Please provide a helpful and accurate response based on the document content.

Document Content:
${documentContent}

Question: ${question}

Answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    if (!answer) {
      return NextResponse.json(
        { error: 'No answer generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error('Error in chat with document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
} 