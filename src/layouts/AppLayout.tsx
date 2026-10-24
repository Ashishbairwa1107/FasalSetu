import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/layout/AppHeader';
import { DesktopSidebar } from '../components/layout/DesktopSidebar';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { Toast } from '../components/common/Toast';
import { FarmerVoiceAssistantModal } from '../components/voice/FarmerVoiceAssistantModal';
import { Mic } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { voiceAssistantOpen, voiceAssistantMode, openVoiceAssistant, closeVoiceAssistant, language } = useApp();

  return (
    <div className="min-h-screen bg-[#FAFBF7] flex flex-col antialiased text-[#1C2A1F]">
      {/* Header */}
      <AppHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar & Mobile Drawer */}
        <DesktopSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8 px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation onOpenMenu={() => setSidebarOpen(true)} />

      {/* Global Floating Voice Assistant Mic Button for Farmers */}
      <button
        onClick={() => openVoiceAssistant('register_land')}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#087A43] via-[#075B35] to-[#10B981] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center ring-4 ring-white/90 cursor-pointer group"
        title={language === 'en' ? 'Farmer Voice Assistant' : 'किसान आवाज सहायक'}
        aria-label={language === 'en' ? 'Farmer Voice Assistant' : 'किसान आवाज सहायक'}
      >
        <div className="relative">
          <Mic className="w-7 h-7 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full ring-2 ring-white" />
        </div>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          {language === 'en' ? 'Voice Assistant' : 'आवाज सहायक'}
        </span>
      </button>

      {/* Farmer Voice Assistant Modal */}
      <FarmerVoiceAssistantModal
        isOpen={voiceAssistantOpen}
        onClose={closeVoiceAssistant}
        initialMode={voiceAssistantMode}
      />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
};
