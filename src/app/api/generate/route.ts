import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Initialize Fal client with API key
fal.config({
  credentials: process.env.FAL_API_KEY,
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }
  try {
    const result = await fal.run('fal-ai/flux/dev', {
      input: { 
        prompt,
        num_inference_steps: 50,
        guidance_scale: 7.5,
      },
    });
    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error('Fal API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 