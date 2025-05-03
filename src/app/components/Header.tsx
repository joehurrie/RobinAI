'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';

interface HeaderProps {
  isSidebarVisible: boolean;
  onSidebarToggle: () => void;
}

export default function Header({ isSidebarVisible, onSidebarToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle - Always visible on mobile */}
            <button
              onClick={onSidebarToggle}
              className="p-2 text-[#4a5677] hover:text-[#6b7bb6] transition-colors sm:hidden"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarVisible ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Image src="/logo.svg" alt="Robin.AI Logo" width={40} height={40} priority />
              <span className="ml-2 text-xl font-bold text-[#1a2341]">Robin.AI</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
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

            {/* Sidebar Toggle - Desktop Only */}
            <button
              onClick={onSidebarToggle}
              className="hidden sm:block p-2 text-[#4a5677] hover:text-[#6b7bb6] transition-colors"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarVisible ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 