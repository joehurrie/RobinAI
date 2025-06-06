'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';

interface HeaderProps {
  isSidebarVisible: boolean;
  onSidebarToggle: () => void;
  language: 'en' | 'sw';
  onToggleLanguage: () => void;
}

export default function Header({ isSidebarVisible, onSidebarToggle, language, onToggleLanguage }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo */}
          <div className="flex items-center">
            <Image src="/logo.svg" alt="Robin.AI Logo" width={40} height={40} priority />
            <span className="ml-2 text-xl font-bold text-[#1a2341]">Robin.AI</span>
          </div>

          {/* Right Section: Search | Language | Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden sm:block w-[200px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#6b7bb6] focus:ring-2 focus:ring-[#6b7bb6]/20 outline-none transition-all text-[#1a2341]"
                />
              </div>
            </div>
            {/* Language button: only visible on desktop, between search and menu */}
            <button
              onClick={onToggleLanguage}
              className="hidden md:inline-block border border-blue-500 text-blue-600 px-4 py-2 rounded bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'English' : 'Swahili'}
            </button>
            {/* Sidebar Toggle */}
            <button
              onClick={onSidebarToggle}
              className="p-2 text-[#4a5677] hover:text-[#6b7bb6] transition-colors"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
              aria-label="Toggle menu"
            >
              {isSidebarVisible ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}