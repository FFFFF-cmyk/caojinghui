import React from 'react';
import { ArrowRight, Compass, Hand, Activity, Sparkles } from 'lucide-react';
import { ASSET_IMAGES } from '../data/mockData';
import { NavTab } from '../components/Navbar';

interface HomePageProps {
  onNavigate: (tab: NavTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen pt-20 pb-16 bg-[#101210] text-[#F0EEE8]">
      {/* 1. Hero Section */}
      <section className="relative max-w-[1440px] mx-auto px-6 pt-12 pb-24 border-b border-[#252e25]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Thesis */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#A5B49A]">
              <span>Fieldwork Archive</span>
              <span aria-hidden="true">·</span>
              <span>Lishui, Nanjing</span>
              <span aria-hidden="true">·</span>
              <span>Embodied Knowledge</span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-[#F0EEE8]">
              THE KNOWLEDGE <br />
              <span className="italic text-[#A5B49A]">IN OUR HANDS</span>
            </h1>

            <div className="space-y-4 max-w-xl">
              <p className="font-serif text-xl md:text-2xl text-[#F0EEE8]/90 font-light leading-snug">
                Documenting the movements, preserving the experience.
              </p>
              <p className="text-sm md:text-base text-[#A8ABA4] leading-relaxed font-sans">
                Traditional craftsmanship is more than a sequence of techniques. It is a form of knowledge developed through touch, movement, and years of experience. Cao Jin Hui is a traditional Chinese wall-plastering technique using lime and straw—where master craftsmen continuously modulate blade pitch, shear force, and stroke cadence to the breath of the wall.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-6">
              <button
                onClick={() => onNavigate('archive')}
                className="group inline-flex items-center gap-3 px-6 py-3.5 bg-[#A5B49A] text-[#101210] font-mono text-xs tracking-widest uppercase font-semibold hover:bg-[#F0EEE8] transition-all duration-200"
              >
                <span>EXPLORE THE ARCHIVE</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate('recording')}
                className="inline-flex items-center gap-2 px-5 py-3 border border-[#3b473b] hover:border-[#A5B49A] text-[#F0EEE8] font-mono text-xs tracking-widest uppercase transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-[#91A9B6]" />
                <span>Motion Station</span>
              </button>
            </div>

            {/* Core Design Philosophy Badge */}
            <div className="pt-6 border-t border-[#252e25]/80">
              <p className="font-serif text-sm italic text-[#A8ABA4] leading-relaxed">
                "Technology should not replace craftsmen. It should help preserve and communicate their embodied knowledge."
              </p>
            </div>
          </div>

          {/* Right Column: Hero Visual with Animated Plaster Vectors */}
          <div className="lg:col-span-6 relative">
            <div className="relative overflow-hidden border border-[#252e25] bg-[#1B211B] shadow-2xl">
              {/* Hand Plastering Documentary Photo */}
              <img
                src={ASSET_IMAGES.handPlastering}
                alt="Craftsman hand firmly holding traditional plastering trowel against wall"
                className="w-full h-[480px] lg:h-[560px] object-cover object-center filter contrast-[1.04] brightness-[0.96]"
                referrerPolicy="no-referrer"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#101210] via-transparent to-transparent opacity-75 pointer-events-none" />

              {/* Dynamic Overlay Graphic: Kinetic Vector Lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 600 560"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Upward Movement Vector Path */}
                <path
                  d="M 360 480 L 360 160"
                  stroke="#A5B49A"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="opacity-80"
                />
                {/* Secondary Trowel Flank Vector */}
                <path
                  d="M 330 460 L 330 200"
                  stroke="#91A9B6"
                  strokeWidth="1.5"
                  className="opacity-60"
                />
                {/* Force Vector at Trowel Contact Point */}
                <circle cx="360" cy="270" r="5" fill="#A5B49A" />
                <line x1="360" y1="270" x2="270" y2="230" stroke="#A5B49A" strokeWidth="1.5" />
                <text x="200" y="222" fill="#A5B49A" fontSize="11" fontFamily="IBM Plex Mono">
                  F: 36.4 N (Shear)
                </text>

                {/* Pitch Angle Indicator */}
                <circle cx="360" cy="180" r="4" fill="#91A9B6" />
                <line x1="360" y1="180" x2="430" y2="150" stroke="#91A9B6" strokeWidth="1" />
                <text x="435" y="145" fill="#91A9B6" fontSize="11" fontFamily="IBM Plex Mono">
                  θ: 28.5° (Pitch)
                </text>
              </svg>

              {/* Museum Figure Caption Box */}
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#101210]/80 backdrop-blur-md border border-[#252e25] flex items-center justify-between font-mono text-[11px] text-[#A8ABA4]">
                <span>FIG. 01 — VERTICAL TROWEL COMPACTION DYNAMICS</span>
                <span className="text-[#A5B49A]">LISHUI FIELDWORK · 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Introduction Section: WHAT CANNOT BE WRITTEN DOWN? */}
      <section className="max-w-[1440px] mx-auto px-6 py-24 border-b border-[#252e25]">
        <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-[#A5B49A] uppercase">
            Somatic & Epistemic Inquiry
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-normal text-[#F0EEE8]">
            WHAT CANNOT BE WRITTEN DOWN?
          </h2>
          <p className="text-sm md:text-base text-[#A8ABA4] leading-relaxed">
            Written manuals record proportions; video captures outer appearance. But the essential mastery resides in three intuitive bodily calibrations that leave no physical manual behind.
          </p>
        </div>

        {/* Three Key Concepts Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 01 — TOUCH */}
          <div className="p-8 bg-[#1B211B] border border-[#252e25] hover:border-[#66765D] transition-colors group">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#252e25]">
              <span className="font-mono text-sm tracking-widest text-[#A5B49A]">01</span>
              <Hand className="w-5 h-5 text-[#A5B49A]" />
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-medium tracking-wide text-[#F0EEE8]">
                TOUCH
              </h3>
              <p className="font-serif text-sm italic text-[#A5B49A]">
                Understanding material conditions through physical contact.
              </p>
              <p className="text-xs text-[#A8ABA4] leading-relaxed font-sans pt-2">
                Feeling the internal hydration of slaked lime and the tensile drag of dispersed straw fibres. Hands register when the mixture has achieved microscopic plasticity without mechanical instrumentation.
              </p>
            </div>

            {/* Interactive Vector Graphic */}
            <div className="mt-8 pt-4 border-t border-[#252e25]/60 flex items-center justify-between text-[11px] font-mono text-[#A8ABA4]">
              <span>Capillary Tack Sensing</span>
              <span className="text-[#A5B49A]">98.2% Accuracy</span>
            </div>
          </div>

          {/* 02 — MOVEMENT */}
          <div className="p-8 bg-[#1B211B] border border-[#252e25] hover:border-[#66765D] transition-colors group">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#252e25]">
              <span className="font-mono text-sm tracking-widest text-[#91A9B6]">02</span>
              <Compass className="w-5 h-5 text-[#91A9B6]" />
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-medium tracking-wide text-[#F0EEE8]">
                MOVEMENT
              </h3>
              <p className="font-serif text-sm italic text-[#91A9B6]">
                Adjusting pressure, angle, and rhythm through experience.
              </p>
              <p className="text-xs text-[#A8ABA4] leading-relaxed font-sans pt-2">
                A continuous bodily calibration where trowel heel pitch rises and falls by fractions of a degree. Pressure seamlessly ramps from 24N to 42N to compact lime without dislodging underlying fiber beds.
              </p>
            </div>

            {/* Interactive Vector Graphic */}
            <div className="mt-8 pt-4 border-t border-[#252e25]/60 flex items-center justify-between text-[11px] font-mono text-[#A8ABA4]">
              <span>Continuous Pitch Control</span>
              <span className="text-[#91A9B6]">±1.8° Variance</span>
            </div>
          </div>

          {/* 03 — JUDGEMENT */}
          <div className="p-8 bg-[#1B211B] border border-[#252e25] hover:border-[#66765D] transition-colors group">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#252e25]">
              <span className="font-mono text-sm tracking-widest text-[#A5B49A]">03</span>
              <Sparkles className="w-5 h-5 text-[#A5B49A]" />
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-medium tracking-wide text-[#F0EEE8]">
                JUDGEMENT
              </h3>
              <p className="font-serif text-sm italic text-[#A5B49A]">
                Making immediate decisions based on changing conditions.
              </p>
              <p className="text-xs text-[#A8ABA4] leading-relaxed font-sans pt-2">
                Adapting instantly to afternoon sun drying the wall too quickly, or an irregular mud-brick substrate drinking mortar thirstily. Every stroke is a dynamic response to lived architectural context.
              </p>
            </div>

            {/* Interactive Vector Graphic */}
            <div className="mt-8 pt-4 border-t border-[#252e25]/60 flex items-center justify-between text-[11px] font-mono text-[#A8ABA4]">
              <span>Situational Real-Time Correction</span>
              <span className="text-[#A5B49A]">Non-Linear</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Archival Tripartite Mission: CAPTURE / TRANSLATE / TRANSMIT */}
      <section className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3 border-t border-[#252e25] pt-6">
            <div className="font-mono text-xs text-[#A5B49A] tracking-widest uppercase">
              Phase 01
            </div>
            <h4 className="font-serif text-2xl text-[#F0EEE8]">CAPTURE</h4>
            <p className="text-xs text-[#A8ABA4] leading-relaxed">
              Recording selected aspects of craftsmen's physical movements via multi-axis pressure arrays and high-frequency spatial tracking during live wall plastering.
            </p>
          </div>

          <div className="space-y-3 border-t border-[#252e25] pt-6">
            <div className="font-mono text-xs text-[#91A9B6] tracking-widest uppercase">
              Phase 02
            </div>
            <h4 className="font-serif text-2xl text-[#F0EEE8]">TRANSLATE</h4>
            <p className="text-xs text-[#A8ABA4] leading-relaxed">
              Transforming raw kinetic and temporal data streams into intuitive, poetic visualisations that reveal the hidden structure of fluid plastering strokes.
            </p>
          </div>

          <div className="space-y-3 border-t border-[#252e25] pt-6">
            <div className="font-mono text-xs text-[#A5B49A] tracking-widest uppercase">
              Phase 03
            </div>
            <h4 className="font-serif text-2xl text-[#F0EEE8]">TRANSMIT</h4>
            <p className="text-xs text-[#A8ABA4] leading-relaxed">
              Supporting the learning and transmission of traditional craftsmanship by letting young apprentices compare their proprioceptive habits with master references.
            </p>
          </div>
        </div>

        {/* Quick Access Strip */}
        <div className="mt-16 p-8 bg-[#1B211B] border border-[#252e25] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="font-serif text-lg text-[#F0EEE8]">
              Ready to explore Master Xue's technique archive or test your strokes?
            </div>
            <div className="text-xs text-[#A8ABA4] font-mono">
              Access the craft catalog, live motion recorder, skill comparison tool, or practice lab.
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => onNavigate('recording')}
              className="px-5 py-2.5 bg-[#A5B49A] text-[#101210] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#F0EEE8] transition-colors"
            >
              Motion Recording →
            </button>
            <button
              onClick={() => onNavigate('learning')}
              className="px-5 py-2.5 border border-[#3b473b] hover:border-[#A5B49A] text-[#F0EEE8] font-mono text-xs uppercase tracking-wider transition-colors"
            >
              Interactive Lab
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
