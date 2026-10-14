import React, { useState } from 'react';
import { Volume2, VolumeX, Menu, X, Radio } from 'lucide-react';
import { toggleAudio, getAudioStatus } from '../utils/audio';

export type NavTab = 'home' | 'archive' | 'recording' | 'comparison' | 'learning';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const [audioActive, setAudioActive] = useState(getAudioStatus());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAudioToggle = () => {
    const newState = toggleAudio();
    setAudioActive(newState);
  };

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'HOME' },
    { id: 'archive', label: 'CRAFT ARCHIVE' },
    { id: 'recording', label: 'MOTION RECORDING' },
    { id: 'comparison', label: 'SKILL COMPARISON' },
    { id: 'learning', label: 'LEARNING LAB' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#101210]/95 backdrop-blur-md border-b border-[#252e25]">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A5B49A]"
        >
          <div className="w-2.5 h-2.5 bg-[#66765D] rotate-45 transition-transform duration-300 group-hover:rotate-90" />
          <span className="font-serif text-lg tracking-wider font-medium text-[#F0EEE8] whitespace-nowrap">
            CAO JIN HUI
          </span>
          <span className="hidden xl:inline text-xs font-mono text-[#A8ABA4]/60 tracking-wider">
            / CRAFT KNOWLEDGE ARCHIVE
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 text-xs tracking-widest font-mono uppercase whitespace-nowrap transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A5B49A] ${
                  isActive
                    ? 'text-[#F0EEE8] font-medium'
                    : 'text-[#A8ABA4] hover:text-[#F0EEE8]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#A5B49A]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Connection Status & Controls */}
        <div className="flex items-center gap-4">
          {/* Audio scraping toggle */}
          <button
            onClick={handleAudioToggle}
            title={audioActive ? 'Mute tool sound' : 'Enable trowel acoustic feedback'}
            className="p-1.5 text-[#A8ABA4] hover:text-[#F0EEE8] transition-colors rounded hover:bg-[#1B211B] focus:outline-none"
            aria-label="Toggle plaster acoustic feedback"
          >
            {audioActive ? (
              <Volume2 className="w-4 h-4 text-[#A5B49A]" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Prompt specified connection indicator: SENSOR STATUS: DEMO MODE */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1B211B] border border-[#2d382d] rounded-sm text-[11px] font-mono tracking-wider text-[#A5B49A] whitespace-nowrap">
            <Radio className="w-3 h-3 text-[#A5B49A] animate-pulse" />
            <span>SENSOR STATUS: DEMO MODE</span>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#A8ABA4] hover:text-[#F0EEE8] focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#101210] border-b border-[#252e25] px-6 py-4 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 text-xs tracking-widest font-mono uppercase ${
                activeTab === item.id ? 'text-[#A5B49A] font-semibold' : 'text-[#A8ABA4]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
