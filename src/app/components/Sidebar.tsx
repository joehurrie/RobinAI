'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { FiImage, FiMessageSquare, FiMic, FiFileText, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi';
import Image from 'next/image';
import type { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isSidebarVisible: boolean;
  onClose?: () => void;
  language: string;
  onToggleLanguage: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isSidebarVisible, onClose, language, onToggleLanguage }: SidebarProps) {
  const { user, signInWithGoogle, signOut } = useAuth();

  const getUserName = (email: string) => {
    return email.split('@')[0];
  };

  const handleTabChange = (tab: Tab) => {
    onTabChange(tab);
    // Close sidebar on mobile when a tab is selected
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  const tabs = [
    { id: 'image' as Tab, label: 'Image Generation', icon: FiImage },
    { id: 'chat' as Tab, label: 'Chat', icon: FiMessageSquare },
    { id: 'real-talk' as Tab, label: 'Real Talk', icon: FiMic },
    { id: 'summary' as Tab, label: 'Document Summary', icon: FiFileText },
  ];

  return (
    <div className={`w-full md:w-64 bg-white shadow-sm h-auto md:h-screen fixed md:left-0 top-16 z-20 md:z-10 transition-transform duration-300 ${
      isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#6b7bb6] flex items-center justify-center">
                    <FiUser className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a2341]">
                    {user.displayName || getUserName(user.email || '')}
                  </p>
                  <p className="text-xs text-[#4a5677]">
                    {user.email}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 w-full">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiUser className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a2341]">
                    Guest User
                  </p>
                  <p className="text-xs text-[#4a5677]">
                    Not signed in
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <button
                onClick={signOut}
                className="p-2 text-[#4a5677] hover:text-[#6b7bb6] transition-colors"
                title="Sign Out"
              >
                <FiLogOut size={20} />
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="p-2 text-[#4a5677] hover:text-[#6b7bb6] transition-colors"
                title="Sign In"
              >
                <FiLogIn size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#6b7bb6] text-white'
                      : 'text-[#4a5677] hover:bg-[#6b7bb6]/10'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {/* Language Switch Button: mobile only */}
        <button
          onClick={onToggleLanguage}
          className="mt-4 w-full md:hidden border border-blue-500 text-blue-600 px-4 py-2 rounded bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
        >
          {language === 'en' ? 'Swahili' : 'English'}
        </button>
      </nav>
    </div>
  );
}