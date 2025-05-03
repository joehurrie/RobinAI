'use client';
import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GeminiImageGenerator from './components/GeminiImageGenerator';
import ChatInterface from './components/ChatInterface';
import RealTalk from './components/RealTalk';
import DocumentSummarizer from './components/DocumentSummarizer';
import ProtectedRoute from './components/ProtectedRoute';

type Tab = 'image' | 'chat' | 'real-talk' | 'summary';

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
      case 'real-talk':
        return <RealTalk />;
      case 'summary':
        return <DocumentSummarizer />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header 
          isSidebarVisible={isSidebarVisible}
          onSidebarToggle={() => setIsSidebarVisible(!isSidebarVisible)}
        />
        <div className="flex">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isSidebarVisible={isSidebarVisible}
            onClose={() => setIsSidebarVisible(false)}
          />
          <main className="flex-1 pt-16">
            {renderContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
