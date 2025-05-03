"use client";

import {
  createClient,
  LiveClient,
  SOCKET_STATES,
  LiveTranscriptionEvents,
  type LiveSchema,
  type LiveTranscriptionEvent,
} from "@deepgram/sdk";

import { createContext, useContext, useState, ReactNode, FunctionComponent, useRef } from "react";

interface DeepgramContextType {
  connectToDeepgram: () => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SOCKET_STATES;
  realtimeTranscript: string;
  error: string | null;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(undefined);

interface DeepgramContextProviderProps {
  children: ReactNode;
}

const getApiKey = async (): Promise<string> => {
  const response = await fetch("/api/deepgram", { cache: "no-store" });
  const result = await response.json();
  return result.key;
};

const DeepgramContextProvider: FunctionComponent<DeepgramContextProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(SOCKET_STATES.closed);
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<MediaRecorder | null>(null);

  const connectToDeepgram = async () => {
    try {
      setError(null);
      setRealtimeTranscript("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current = new MediaRecorder(stream);

      const apiKey = await getApiKey();
      const deepgram = createClient(apiKey);
      
      const live = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        encoding: "linear16",
        sample_rate: 16000,
      });

      live.addListener(LiveTranscriptionEvents.Open, () => {
        setConnectionState(SOCKET_STATES.open);
        console.log("WebSocket connection opened");
        audioRef.current!.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && live.getReadyState() === SOCKET_STATES.open) {
            live.send(event.data);
          }
        });

        audioRef.current!.start(250);
      });

      live.addListener(LiveTranscriptionEvents.Transcript, (data: LiveTranscriptionEvent) => {
        if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
          const newTranscript = data.channel.alternatives[0].transcript;
          setRealtimeTranscript((prev) => prev + " " + newTranscript);
        }
      });

      live.addListener(LiveTranscriptionEvents.Error, (error) => {
        console.error("WebSocket error:", error);
        setError("Error connecting to Deepgram. Please try again.");
        disconnectFromDeepgram();
      });

      live.addListener(LiveTranscriptionEvents.Close, () => {
        setConnectionState(SOCKET_STATES.closed);
        console.log("WebSocket connection closed");
      });

      setConnection(live);
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setConnectionState(SOCKET_STATES.closed);
    }
  };

  const disconnectFromDeepgram = () => {
    if (connection) {
      connection.finish();
      setConnection(null);
    }
    if (audioRef.current) {
      audioRef.current.stop();
    }
    setRealtimeTranscript("");
    setConnectionState(SOCKET_STATES.closed);
  };

  return (
    <DeepgramContext.Provider
      value={{
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
        realtimeTranscript,
        error,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

// Use the useDeepgram hook to access the deepgram context and use the deepgram in any component.
// This allows you to connect to the deepgram and disconnect from the deepgram via a socket.
// Make sure to wrap your application in a DeepgramContextProvider to use the deepgram.
function useDeepgram(): DeepgramContextType {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error("useDeepgram must be used within a DeepgramContextProvider");
  }
  return context;
}

export {
  DeepgramContextProvider,
  useDeepgram,
  SOCKET_STATES,
  LiveTranscriptionEvents,
  type LiveTranscriptionEvent,
};
