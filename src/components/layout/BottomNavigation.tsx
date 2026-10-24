import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import {
  Home,
  Layers,
  Bot,
  Users,
  Grid
} from 'lucide-react';

interface BottomNavigationProps {
  onOpenMenu: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onOpenMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useApp();

  const navItems = [
    {
      id: 'home',
      label: t('navHome', language),
      icon: Home,
      path: '/'
    },
    {
      id: 'farm',
      label: t('navMyLand', language),
      icon: Layers,
      path: '/my-land'
    },
    {
      id: 'ai',
      label: t('navAiMitra', language),
      icon: Bot,
      path: '/ai-mitra',
      highlight: true
    },
    {
      id: 'community',
      label: t('navCommunity', language),
      icon: Users,
      path: '/community'
    },
    {
      id: 'menu',
      label: t('menuLabel', language),
      icon: Grid,
      isAction: true,
      onClick: onOpenMenu
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = !item.isAction && location.pathname === item.path;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path!)}
                className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#087A43] to-[#10B981] text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 group-active:scale-95 transition-transform ring-4 ring-white">
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className={`text-[10px] mt-1 font-bold truncate max-w-[65px] ${
                  isActive ? 'text-[#087A43]' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isAction && item.onClick) {
                  item.onClick();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              className={`flex flex-col items-center justify-center w-16 py-1 transition-colors cursor-pointer ${
                isActive ? 'text-[#087A43]' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${
                isActive ? 'bg-emerald-50 text-[#087A43]' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] tracking-tight truncate max-w-[60px] font-medium ${
                isActive ? 'font-bold text-[#087A43]' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
