import { NextResponse } from 'next/server';
import { Deepgram } from '@deepgram/sdk';

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY || '');

export async function POST(request: Request) {
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      return NextResponse.json(
        { error: 'Deepgram API key not configured' },
        { status: 500 }
      );
    }

    const { audioUrl } = await request.json();

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'No audio URL provided' },
        { status: 400 }
      );
    }

    // Fetch the audio data
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch audio data' },
        { status: 400 }
      );
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    try {
      // @ts-ignore - The transcription property exists but TypeScript doesn't know about it
      const transcription = await deepgram.transcription.preRecorded(
        { buffer: audioBuffer, mimetype: 'audio/webm' },
        {
          model: 'nova',
          smart_format: true,
          language: 'en-US',
          punctuate: true,
          diarize: false,
        }
      );

      if (!transcription.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
        return NextResponse.json(
          { error: 'No transcript found in response' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        transcript: transcription.results.channels[0].alternatives[0].transcript,
      });
    } catch (apiError) {
      console.error('Deepgram API error:', apiError);
      return NextResponse.json(
        { error: 'Deepgram API error: ' + (apiError instanceof Error ? apiError.message : 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Deepgram transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 