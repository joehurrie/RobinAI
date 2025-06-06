'use client';
import { useLayoutEffect, useState } from 'react';
import { Pen } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GeminiImageGenerator from './components/GeminiImageGenerator';
import ChatInterface from './components/ChatInterface';
import RealTalk from './components/RealTalk';
import DocumentSummarizer from './components/DocumentSummarizer';
import ProtectedRoute from './components/ProtectedRoute';

type Tab = 'image' | 'chat' | 'imageToVideo' | 'summary';

const translations = {
  en: {
    heading: "Create Stunning Images With AI",
    subheading: "Transform your ideas into beautiful images instantly.",
    menu: {
      chat: "Chat",
      imageToVideo: "Image to Video",
      summary: "Summarise Document",
    },
  },
  sw: {
    heading: "Tengeneza Picha Ukitumia AI",
    subheading: "Geuza mawazo yako kuwa picha nzuri papo hapo.",
    menu: {
      chat: "Soga",
      imageToVideo: "Picha hadi Video",
      summary: "Fupisha Hati",
    },
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [language, setLanguage] = useState<"sw" | "en">("sw");
  const [prompt, setPrompt] = useState('');

  // Scroll to top on mount (prevents scroll flashes)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const examplePrompts = [
    {
      image: "/images/lady.png",
      prompt: "an african lady wearing a beautiful kitenge on the beach",
    },
    {
      image: "/images/lion.png",
      prompt: "A lion wearing sunglasses in the savannah",
    },
    {
      image: "/images/kitabu.png",
      prompt: "A cup of coffee with a book in a cozy setting",
    },
    {
      image: "/images/kilimanjaro.png",
      prompt: "Mout Kilimanjaro at sunset with a clear sky",
    },
  ];

  const otherServicesHeading = (
    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 text-center mb-2 mt-10">
      {language === "en" ? "Other Services" : "Huduma Nyingine"}
    </h2>
  );

  const commercialForm = (
    <section className="w-full max-w-2xl mx-auto mt-12 mb-8 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 text-center">
        {language === "en"
          ? "Request for Commercial Use"
          : "Omba Matumizi ya Kibiashara"}
      </h3>
      <form
        className="flex flex-col gap-4"
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <input
          type="email"
          placeholder={language === "en" ? "Your email address" : "Barua pepe yako"}
          className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b7bb6] focus:border-transparent text-gray-900 text-sm"
          required
        />
        <textarea
          placeholder={language === "en" ? "Your message" : "Ujumbe wako"}
          className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b7bb6] focus:border-transparent text-gray-900 text-sm"
          rows={4}
          required
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#6b7bb6] text-white rounded-lg hover:bg-[#5a6aa5] transition-colors text-sm"
        >
          {language === "en" ? "Send Request" : "Tuma Ombi"}
        </button>
      </form>
    </section>
  );

  const ServiceTabs = (
    <section className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center px-4 pb-8">
      <div className="w-full flex flex-col items-center">
        <div className="flex gap-2 md:gap-4 mb-4 border-b border-gray-200 w-full justify-center">
          <button
            className={`px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-700 bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            {translations[language].menu.chat}
          </button>
          <button
            className={`px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors ${
              activeTab === 'imageToVideo'
                ? 'border-blue-500 text-blue-700 bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('imageToVideo')}
          >
            {translations[language].menu.imageToVideo}
          </button>
          <button
            className={`px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-700 bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            {translations[language].menu.summary}
          </button>
        </div>
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-4 mb-2 text-center text-gray-700 text-base md:text-lg">
          {activeTab === 'chat' && (
            <span>
              {language === "en"
                ? "Chat with our AI assistant for instant answers and creative help."
                : "Zungumza na msaidizi wetu wa AI upate majibu na msaada wa ubunifu papo hapo."}
            </span>
          )}
          {activeTab === 'imageToVideo' && (
            <span>
              {language === "en"
                ? "Turn your generated images into stunning videos with AI."
                : "Geuza picha ulizotengeneza kuwa video nzuri kwa kutumia AI."}
            </span>
          )}
          {activeTab === 'summary' && (
            <span>
              {language === "en"
                ? "Summarise documents or text instantly with AI-powered insights."
                : "Fupisha hati au maandishi mara moja kwa msaada wa AI."}
            </span>
          )}
        </div>
      </div>
    </section>
  );

  const renderContent = () => {
    return (
      <>
        <section className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center pt-10 pb-10 px-6">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <span className="uppercase tracking-widest text-xs text-[#6b7bb6] font-semibold mb-2">AI Image Generation</span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#1a2341] leading-tight drop-shadow-sm">
              {translations[language].heading.split("<br />").map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="text-base md:text-lg text-[#4a5677] mt-2 mb-2 max-w-md font-medium">
              {language === "en"
                ? "Turn your idea into an image instantly:"
                : "Geuza wazo lako kuwa picha papo hapo:"}
            </p>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {examplePrompts.map((item, idx) => (
                <div
                  key={idx}
                  className="relative group bg-white rounded-xl shadow-md overflow-hidden w-full h-40 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300"
                  style={{}}
                >
                  <img
                    src={item.image}
                    alt="Example"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-50"
                  />
                  <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center transition-opacity duration-300">
                    <span className="text-black text-sm px-4 text-center mb-2">{item.prompt}</span>
                    <button
                      className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 flex items-center justify-center"
                      onClick={e => {
                        e.stopPropagation();
                        setPrompt(item.prompt);
                      }}
                      aria-label="Edit prompt"
                    >
                      <Pen className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-lg md:text-xl text-[#4a5677] mt-2 mb-4 max-w-md">
              {translations[language].subheading.split("<br />").map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
        </section>
        <GeminiImageGenerator
          language={language}
          prompt={prompt}
          setPrompt={setPrompt}
        />
        {otherServicesHeading}
        {ServiceTabs}
        <div className="w-full max-w-5xl mx-auto">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'imageToVideo' && (
            <div className="bg-white rounded-lg shadow p-6 mt-4 text-center text-gray-700">
              {language === "en"
                ? "Image to Video service coming soon."
                : "Huduma ya Picha hadi Video inakuja hivi karibuni."}
            </div>
          )}
          {activeTab === 'summary' && <DocumentSummarizer />}
        </div>
        {commercialForm}
      </>
    );
  };

  // Handler for toggling language
  const handleToggleLanguage = () => setLanguage(language === "en" ? "sw" : "en");

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen bg-gray-50 relative overflow-hidden"
        style={{
          minHeight: '100vh',
        }}
      >
        <div className="absolute inset-0 -z-10 w-full h-full">
          <img
            src="/images/animation.gif"
            alt="Animated background"
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
            aria-hidden="true"
          />
        </div>
        <Header 
          isSidebarVisible={isSidebarVisible}
          onSidebarToggle={() => setIsSidebarVisible(!isSidebarVisible)}
          language={language}
          onToggleLanguage={handleToggleLanguage}
        />
        <div className="flex">
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              // Auto-close sidebar on mobile
              if (window.innerWidth < 768) setIsSidebarVisible(false);
            }}
            isSidebarVisible={isSidebarVisible}
            onClose={() => setIsSidebarVisible(false)}
            language={language}
            onToggleLanguage={handleToggleLanguage}
          />
          <main className={`flex-1 pt-16 transition-all duration-300 ${isSidebarVisible ? 'md:ml-64' : ''}`}>
            {renderContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
