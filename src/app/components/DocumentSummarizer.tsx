'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Send, User, MessageSquare } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function DocumentSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setText('');
      setSummary('');
      setUploadProgress(0);
      setError('');
      setChatMessages([]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setFile(null);
    setSummary('');
    setUploadProgress(0);
    setError('');
    setChatMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!file && !text.trim()) || isLoading) return;

    setIsLoading(true);
    setUploadProgress(0);
    setError('');
    setSummary('');
    setChatMessages([]);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', text);
      }

      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      if (!data.summary) {
        throw new Error('No summary received from the server');
      }

      setSummary(data.summary);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate summary. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading || (!file && !text.trim())) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', text);
      }
      formData.append('question', userMessage);

      const response = await fetch('/api/gemini/chat-with-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      if (!data.response) {
        throw new Error('No response received');
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error instanceof Error ? `Error: ${error.message}` : 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Document Summarizer</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choose File</span>
                </button>
                {file && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{file.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Paste Text
              </label>
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your text here..."
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b7bb6] focus:border-transparent text-gray-900"
                rows={4}
              />
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#6b7bb6] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                {uploadProgress < 100 ? 'Processing...' : 'Generating summary...'}
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (!file && !text.trim())}
            className="w-full px-4 py-2 bg-[#6b7bb6] text-white rounded-lg hover:bg-[#5a6aa5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating Summary...' : 'Generate Summary'}
          </button>
        </form>

        {summary && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
            <div className="prose max-w-none">
              <p className="text-gray-900 whitespace-pre-wrap">{summary}</p>
            </div>
          </div>
        )}

        {summary && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat with Document
            </h3>
            <div className="flex flex-col h-[400px] bg-gray-50 rounded-lg overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p className="text-center">Ask questions about the document</p>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#6b7bb6] flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-[#6b7bb6] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#6b7bb6] flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about the document..."
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b7bb6] focus:border-transparent text-black"
                    disabled={isChatLoading}
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !chatInput.trim()}
                    className="p-2 bg-[#6b7bb6] text-white rounded-lg hover:bg-[#5a6aa5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 