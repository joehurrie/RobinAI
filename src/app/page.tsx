'use client';
import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GeminiImageGenerator from './components/GeminiImageGenerator';
import ChatInterface from './components/ChatInterface';
import TranscriptionInterface from './components/TranscriptionInterface';
import DocumentSummary from './components/DocumentSummary';
import ProtectedRoute from './components/ProtectedRoute';

type Tab = 'image' | 'chat' | 'transcription' | 'summary';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('image');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'image':
        return (
          <>
            {/* Hero Section */}
            <section className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center pt-10 pb-10 px-6">
              <div className="flex flex-col items-center justify-center gap-6 text-center">
                <span className="uppercase tracking-widest text-xs text-[#6b7bb6] font-semibold mb-2">AI Image Generation</span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-[#1a2341] leading-tight drop-shadow-sm">
                  Create Stunning Images<br />With AI
                </h1>
                <p className="text-lg md:text-xl text-[#4a5677] mt-2 mb-4 max-w-md">
                Transform your ideas into beautiful images instantly.<br />
          
                </p>
              </div>
            </section>
            <GeminiImageGenerator />
          </>
        );
      case 'chat':
        return <ChatInterface />;
      case 'transcription':
        return <TranscriptionInterface />;
      case 'summary':
        return <DocumentSummary />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#f5f8ff] to-[#e6ecf7]">
        <Header 
          onSidebarToggle={() => setIsSidebarVisible(!isSidebarVisible)}
          isSidebarVisible={isSidebarVisible}
        />
        <div className="flex pt-16">
          {isSidebarVisible && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
          <main className={`flex-1 transition-all duration-300 ${isSidebarVisible ? 'ml-64' : 'ml-0'}`}>
            <div className="p-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
