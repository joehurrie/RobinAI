'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Send, MicOff, Volume2, VolumeX } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function RealTalk() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        if (!base64data) {
          reject(new Error('Failed to convert audio to base64'));
          return;
        }
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = base64data.split(',')[1];
        if (!base64) {
          reject(new Error('Failed to extract base64 data'));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => {
        reject(new Error('Error reading audio data'));
      };
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Check if we have enough audio data
          if (audioBlob.size < 1000) { // Less than 1KB
            console.log('Audio too short, ignoring');
            if (isContinuousMode) {
              startRecording();
            }
            return;
          }

          try {
            const base64Audio = await convertBlobToBase64(audioBlob);
            
            const response = await fetch('/api/gemini/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64Audio }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Transcription failed');
            }

            const data = await response.json();
            console.log('Transcription response:', data); // Debug log
            
            if (!data.text) {
              throw new Error('No transcription received');
            }

            const transcribedText = data.text.trim();
            console.log('Transcribed text:', transcribedText); // Debug log
            
            if (transcribedText) {
              // Add the transcribed text as a user message
              const newUserMessage: Message = { role: 'user', content: transcribedText };
              setMessages(prev => [...prev, newUserMessage]);
              
              // If in continuous mode, automatically send the message
              if (isContinuousMode) {
                handleSubmit(new Event('submit') as any);
              } else {
                // Otherwise, just update the input field
                setInput(transcribedText);
              }
            }
            setError(null);
          } catch (error) {
            console.error('Transcription error:', error);
            setError(error instanceof Error ? error.message : 'Failed to transcribe audio. Please try again.');
          }
        } finally {
          if (!isContinuousMode) {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
          }
        }
      };

      // Start recording with a small timeslice to detect silence
      mediaRecorder.start(100);
      setIsListening(true);
      setError(null);

      // Set up silence detection
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkSilence = () => {
        if (!isListening) return;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const isSilent = average < 10; // Adjust this threshold as needed

        if (isSilent) {
          if (!silenceTimeoutRef.current) {
            silenceTimeoutRef.current = setTimeout(() => {
              if (isListening && Date.now() - lastSpeechTimeRef.current > 1000) {
                stopRecording();
                if (isContinuousMode) {
                  startRecording();
                }
              }
            }, 1000); // Wait 1 second of silence before stopping
          }
        } else {
          lastSpeechTimeRef.current = Date.now();
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        }

        requestAnimationFrame(checkSilence);
      };

      checkSilence();
    } catch (error) {
      console.error('Recording error:', error);
      setError('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (isContinuousMode) {
          startRecording();
        }
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        if (isContinuousMode) {
          startRecording();
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending messages to Gemini:', [...messages, newUserMessage]); // Debug log
      
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate response');
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Add an empty assistant message to start with
      const assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = fullResponse;
            }
            return newMessages;
          });
        }
      }

      console.log('Full response received:', fullResponse); // Debug log
      
      // Speak the complete response
      speakText(fullResponse);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContinuousMode = () => {
    setIsContinuousMode(!isContinuousMode);
    if (!isContinuousMode && !isListening && !isSpeaking) {
      startRecording();
    } else if (!isContinuousMode && isListening) {
      stopRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && isListening) {
        mediaRecorderRef.current.stop();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [isListening]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Real Talk</h1>
        <p className="text-gray-600">Chat with Gemini AI using voice</p>
        <button
          onClick={toggleContinuousMode}
          className={`mt-2 px-4 py-2 rounded-lg ${
            isContinuousMode
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isContinuousMode ? 'Continuous Mode: ON' : 'Continuous Mode: OFF'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-black'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-black rounded-lg p-4">
              Thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-800 rounded-lg p-4">
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isListening ? stopRecording : startRecording}
            disabled={isLoading || isSpeaking}
            className={`p-2 rounded-full ${
              isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type or speak your message..."}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
            disabled={isLoading || isListening || isSpeaking}
          />
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              } else if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
                speakText(messages[messages.length - 1].content);
              }
            }}
            className={`p-2 rounded-full ${
              isSpeaking ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isListening || isSpeaking}
            className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}