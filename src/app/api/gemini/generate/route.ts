import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from "@google/genai";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { prompt } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json({ error: "Google API key is not configured" }, { status: 500 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    const images: string[] = [];

    // Generate 4 different variations
    for (let i = 0; i < 4; i++) {
      const variationPrompt = `${prompt} ${i + 1}/4 variation`;
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: variationPrompt,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      // Extract image from response
      let imageData;
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageData = part.inlineData.data; // base64 string
            break;
          }
        }
      }

      if (imageData) {
        images.push(imageData);
      }
    }

    if (images.length === 0) {
      return NextResponse.json({ error: "No images generated" }, { status: 500 });
    }

    // Return images as data URLs
    return NextResponse.json({ 
      data: {
        images: images,
        mimeType: "image/png"
      }
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 