'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { FiImage, FiMessageSquare, FiMic, FiFileText, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi';

type Tab = 'image' | 'chat' | 'transcription' | 'summary';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, signInWithGoogle, signOut } = useAuth();

  const getUserName = (email: string) => {
    return email.split('@')[0];
  };

  const tabs = [
    { id: 'image' as Tab, label: 'Image Generation', icon: FiImage },
    { id: 'chat' as Tab, label: 'Chat', icon: FiMessageSquare },
    { id: 'transcription' as Tab, label: 'Transcription', icon: FiMic },
    { id: 'summary' as Tab, label: 'Document Summary', icon: FiFileText },
  ];

  return (
    <div className="w-64 bg-white shadow-sm h-screen fixed left-0 top-0 pt-16">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-10 w-10 rounded-full"
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
                  onClick={() => onTabChange(tab.id)}
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
      </nav>
    </div>
  );
} 