import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';

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

    if (!file && !text) {
      return NextResponse.json(
        { error: 'No text or file provided for summarization' },
        { status: 400 }
      );
    }

    let contentToSummarize = text;

    if (file) {
      try {
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Handle .docx files
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          contentToSummarize = result.value;
        } else {
          // Handle other text files
          contentToSummarize = await file.text();
        }
      } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json(
          { error: 'Failed to read the uploaded file' },
          { status: 400 }
        );
      }
    }

    if (!contentToSummarize.trim()) {
      return NextResponse.json(
        { error: 'No content to summarize' },
        { status: 400 }
      );
    }

    const prompt = `Please provide a concise and useful summary of the following text. Focus on the main points and key information. If the text contains multiple sections or topics, organize the summary accordingly. Make sure to extract and summarize the actual content, not just describe the file format.

Text to summarize:
${contentToSummarize}

Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    if (!summary) {
      return NextResponse.json(
        { error: 'No summary generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in summarization:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary' },
      { status: 500 }
    );
  }
} 