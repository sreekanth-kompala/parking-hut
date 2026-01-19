
import React from 'react';
import { Home, MapPin, Calendar, User } from 'lucide-react';

interface NavigationProps {
  activeTab: 'home' | 'spaces' | 'bookings' | 'profile';
  setActiveTab: (tab: 'home' | 'spaces' | 'bookings' | 'profile') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'spaces', icon: MapPin, label: 'Explore' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              activeTab === tab.id ? 'text-yellow-600' : 'text-slate-400'
            }`}
          >
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
