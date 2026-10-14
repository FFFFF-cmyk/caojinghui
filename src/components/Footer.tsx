import React from 'react';
import { NavTab } from './Navbar';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="border-t border-[#252e25] bg-[#101210] text-[#A8ABA4] py-14">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#66765D] rotate-45" />
            <span className="font-serif text-lg tracking-wider font-medium text-[#F0EEE8]">
              CAO JIN HUI
            </span>
          </div>
          <p className="font-serif text-base text-[#F0EEE8]/90 italic max-w-md leading-relaxed">
            "Craftsmanship cannot be reduced to data, but data can help us understand what experience leaves behind."
          </p>
          <p className="text-xs text-[#A8ABA4] leading-relaxed max-w-md font-sans">
            A digital craft knowledge initiative dedicated to documenting, visualising, and transmitting the tacit, embodied skills of traditional Chinese lime and straw plastering through interactive telemetry and physical computing.
          </p>
        </div>

        <div className="md:col-span-3 space-y-3 font-mono text-xs">
          <div className="text-[#A5B49A] uppercase tracking-widest text-[11px] mb-2 font-medium">
            Archive Index
          </div>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onSelectTab('home')}
                className="hover:text-[#F0EEE8] transition-colors"
              >
                01. The Knowledge in Our Hands
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('archive')}
                className="hover:text-[#F0EEE8] transition-colors"
              >
                02. Master Xue & Technique Catalog
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('recording')}
                className="hover:text-[#F0EEE8] transition-colors"
              >
                03. Motion Recording Station
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('comparison')}
                className="hover:text-[#F0EEE8] transition-colors"
              >
                04. Expert vs. Learner Analysis
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('learning')}
                className="hover:text-[#F0EEE8] transition-colors"
              >
                05. Interactive Learning Lab
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-3 font-mono text-xs border-t md:border-t-0 md:border-l border-[#252e25] pt-6 md:pt-0 md:pl-8">
          <div className="text-[#A5B49A] uppercase tracking-widest text-[11px] mb-2 font-medium">
            Fieldwork & Curatorial Notes
          </div>
          <div className="space-y-1.5 text-[#A8ABA4]/80">
            <p>Subject: Cao Jin Hui (草筋灰) Lime & Straw Plastering</p>
            <p>Fieldwork Site: Lishui, Nanjing, China</p>
            <p>Documentary Informant: Master Xue</p>
            <p>Sensor Topology: Tri-axial force shear + 9-DOF IMU orientation</p>
            <p>Data Integrity: Demo Simulation Mode (Physical sensor uncoupled)</p>
          </div>
          <div className="pt-3 text-[11px] text-[#A8ABA4]/60">
            Royal College of Art / UAL Interaction Design Research Archive · English Edition
          </div>
        </div>
      </div>
    </footer>
  );
};
