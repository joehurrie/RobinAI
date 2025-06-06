'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiUser, FiMic, FiMicOff } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Message = {
  role: 'user' | 'assistant';
  content: string;
  chartData?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event: Event) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      });

      const contentType = response.headers.get('content-type');
      let aiResponse = '';
      let chartData;

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Server error: ${response.status}`);
        }
        aiResponse = data.response || '';
      } else {
        aiResponse = await response.text();
      }

      if (!aiResponse) {
        throw new Error('No response received from the AI');
      }

      // Check for chart data
      if (aiResponse.includes('CHART_DATA:')) {
        try {
          const chartDataStr = aiResponse.split('CHART_DATA:')[1].trim();
          const parsedData = JSON.parse(chartDataStr);
          chartData = {
            labels: parsedData.labels,
            datasets: [{
              label: parsedData.label || 'Data',
              data: parsedData.data,
              backgroundColor: 'rgba(107, 123, 182, 0.6)',
            }],
          };
        } catch (e) {
          console.error('Error parsing chart data:', e);
        }
      }

      const newMessage: Message = {
        role: 'assistant',
        content: aiResponse.split('CHART_DATA:')[0].trim(),
        ...(chartData && { chartData }),
      };

      setMessages(prev => [...prev, newMessage]);
      speakText(newMessage.content);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error instanceof Error 
          ? `Error: ${error.message}`
          : 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        {/* Chat Header */}
        <div className="p-2 sm:p-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">AI Chat</h2>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-center text-xs sm:text-base">Start a conversation with the AI assistant</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className="space-y-4">
                <div
                  className={`flex items-start space-x-2 sm:space-x-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#6b7bb6] flex items-center justify-center">
                      <RiRobot2Line className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-2 sm:p-3 text-xs sm:text-base ${
                      message.role === 'user'
                        ? 'bg-[#6b7bb6] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
                {message.chartData && (
                  <div className="max-w-[80%] mx-auto">
                    <Bar data={message.chartData} />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#6b7bb6] flex items-center justify-center">
                <RiRobot2Line className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
                <div className="flex space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-2 sm:p-4 border-t border-gray-200">
          <div className="flex space-x-2 sm:space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b7bb6] focus:border-transparent text-xs sm:text-base"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              disabled={isLoading}
            >
              {isListening ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-[#6b7bb6] text-white rounded-lg hover:bg-[#5a6aa5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}