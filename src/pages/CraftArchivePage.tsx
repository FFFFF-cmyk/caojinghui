import React, { useState } from 'react';
import { ArrowUpRight, X, Play, Sliders, Check, MapPin, Sparkles } from 'lucide-react';
import { MASTER_XUE_PROFILE, TECHNIQUES, ASSET_IMAGES } from '../data/mockData';
import { TechniqueItem } from '../types/craft';
import { NavTab } from '../components/Navbar';

interface CraftArchivePageProps {
  onNavigate: (tab: NavTab) => void;
  onSelectTechniqueForRecording?: (techniqueName: string) => void;
}

export const CraftArchivePage: React.FC<CraftArchivePageProps> = ({
  onNavigate,
  onSelectTechniqueForRecording,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeTechnique, setActiveTechnique] = useState<TechniqueItem | null>(null);

  const filterOptions = [
    { id: 'all', label: 'All Techniques' },
    { id: 'preparation', label: 'Preparation' },
    { id: 'mixing', label: 'Mixing & Adjustment' },
    { id: 'application', label: 'Surface Application' },
    { id: 'control', label: 'Angle & Pressure' },
  ];

  const filteredTechniques = TECHNIQUES.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  const handleLaunchMotion = (technique: TechniqueItem) => {
    if (onSelectTechniqueForRecording) {
      onSelectTechniqueForRecording(technique.title);
    }
    onNavigate('recording');
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#101210] text-[#F0EEE8]">
      {/* Page Title & Header */}
      <section className="max-w-[1440px] mx-auto px-6 pt-8 pb-14 border-b border-[#252e25]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#A5B49A]">
            <span>Archival Inventory</span>
            <span aria-hidden="true">·</span>
            <span>Documentary Repository</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-normal tracking-tight text-[#F0EEE8]">
            CRAFT ARCHIVE
          </h1>
          <p className="font-serif text-xl md:text-2xl text-[#A5B49A] italic font-light">
            Every movement carries a story.
          </p>
        </div>
      </section>

      {/* Featured Craftsman Profile: MASTER XUE */}
      <section className="max-w-[1440px] mx-auto px-6 py-16 border-b border-[#252e25]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Portrait Image Column */}
          <div className="lg:col-span-5 relative">
            <div className="border border-[#252e25] bg-[#1B211B] p-2 overflow-hidden shadow-xl">
              <img
                src={ASSET_IMAGES.masterXue}
                alt="Portrait of Master Xue, traditional plaster craftsman"
                className="w-full h-[480px] object-cover filter contrast-[1.05]"
                referrerPolicy="no-referrer"
              />
              <div className="p-3 bg-[#101210] border-t border-[#252e25] flex items-center justify-between text-xs font-mono text-[#A8ABA4]">
                <span>ARCHIVE REF: CHN-JS-LS-01</span>
                <span className="text-[#A5B49A]">FIELDWORK ARCHIVE</span>
              </div>
            </div>
          </div>

          {/* Master Details Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="border-b border-[#252e25] pb-6 space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-serif text-3xl md:text-4xl font-normal text-[#F0EEE8]">
                  {MASTER_XUE_PROFILE.name}
                </span>
                <span className="text-xl font-serif text-[#A5B49A]/80">
                  {MASTER_XUE_PROFILE.chineseName}
                </span>
              </div>
              <p className="text-sm font-mono text-[#A5B49A] tracking-wider uppercase">
                {MASTER_XUE_PROFILE.role}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#A8ABA4]">
                <MapPin className="w-3.5 h-3.5 text-[#A5B49A]" />
                <span>{MASTER_XUE_PROFILE.location}</span>
                <span aria-hidden="true">·</span>
                <span>Craft: {MASTER_XUE_PROFILE.craft}</span>
              </div>
            </div>

            {/* Biographical & Fieldwork Note */}
            <div className="space-y-4 text-sm text-[#A8ABA4] leading-relaxed font-sans">
              <p>
                {MASTER_XUE_PROFILE.bio}
              </p>
              <div className="p-4 bg-[#1B211B] border border-[#252e25] text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#A8ABA4]">Years of experience:</span>
                  <span className="text-[#F0EEE8] font-medium">{MASTER_XUE_PROFILE.experience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A8ABA4]">Primary Medium:</span>
                  <span className="text-[#F0EEE8]">Aged slaked lime (Ca(OH)₂), chopped straw fibers</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A8ABA4]">Motion Recording Status:</span>
                  <span className="text-[#A5B49A]">4 Core Kinematic Passes Catalogued</span>
                </div>
              </div>
            </div>

            {/* Recorded Techniques Checklist */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-[#A5B49A]">
                Recorded Techniques in Registry
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MASTER_XUE_PROFILE.recordedTechniques.map((tech, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3 bg-[#1B211B]/60 border border-[#252e25] text-xs font-mono text-[#F0EEE8]"
                  >
                    <Check className="w-3.5 h-3.5 text-[#A5B49A] shrink-0" />
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interview Quotes Section */}
      <section className="max-w-[1440px] mx-auto px-6 py-20 border-b border-[#252e25]">
        <div className="mb-10">
          <p className="font-mono text-xs tracking-widest text-[#A5B49A] uppercase mb-1">
            Voices from the Workshop
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-[#F0EEE8]">
            INTERVIEW EXCERPTS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MASTER_XUE_PROFILE.quotes.map((q, idx) => (
            <div
              key={idx}
              className="p-8 bg-[#1B211B] border border-[#252e25] flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <span className="font-mono text-xs text-[#A5B49A]">0{idx + 1} / ORAL EVIDENCE</span>
                <p className="font-serif text-2xl md:text-3xl font-light text-[#F0EEE8] italic leading-snug">
                  "{q.text}"
                </p>
              </div>
              <p className="font-mono text-[11px] text-[#A8ABA4] pt-4 border-t border-[#252e25]">
                {q.context}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Technique Archive Section */}
      <section className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <p className="font-mono text-xs tracking-widest text-[#A5B49A] uppercase">
              Curated Documentation
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-[#F0EEE8]">
              TECHNIQUE ARCHIVE
            </h2>
            <p className="text-xs text-[#A8ABA4] max-w-xl font-sans">
              Select any technique to view high-resolution photographic documentation, sensory parameters, and motion telemetry recordings.
            </p>
          </div>

          {/* Filter System */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#1B211B] border border-[#252e25]">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors whitespace-nowrap ${
                  selectedFilter === opt.id
                    ? 'bg-[#A5B49A] text-[#101210] font-semibold'
                    : 'text-[#A8ABA4] hover:text-[#F0EEE8]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTechniques.map((tech) => (
            <div
              key={tech.id}
              onClick={() => setActiveTechnique(tech)}
              className="cursor-pointer bg-[#1B211B] border border-[#252e25] hover:border-[#A5B49A] transition-all duration-300 group flex flex-col justify-between overflow-hidden shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#101210]">
                <img
                  src={tech.image}
                  alt={tech.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.05]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#101210]/90 px-2 py-0.5 border border-[#252e25] font-mono text-xs text-[#A5B49A]">
                  {tech.number}
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-[#A5B49A]">
                      {tech.category}
                    </span>
                    <span className="font-serif text-xs text-[#A8ABA4]">
                      {tech.chineseTitle}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-normal text-[#F0EEE8] group-hover:text-[#A5B49A] transition-colors">
                    {tech.title}
                  </h3>
                  <p className="text-xs text-[#A8ABA4] line-clamp-3 leading-relaxed">
                    {tech.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#252e25] flex items-center justify-between text-xs font-mono text-[#A8ABA4] group-hover:text-[#F0EEE8]">
                  <span>Inspect Details</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Modal / Panel when technique card clicked */}
      {activeTechnique && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-4xl bg-[#1B211B] border border-[#3b473b] shadow-2xl overflow-y-auto max-h-[90vh] text-[#F0EEE8]">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1B211B] z-10 px-6 py-4 border-b border-[#252e25] flex items-center justify-between">
              <div className="flex items-center gap-3 font-mono text-xs text-[#A5B49A]">
                <span>TECHNIQUE {activeTechnique.number}</span>
                <span aria-hidden="true">/</span>
                <span className="uppercase">{activeTechnique.category}</span>
                <span aria-hidden="true">/</span>
                <span className="text-[#F0EEE8] font-serif text-sm">
                  {activeTechnique.chineseTitle}
                </span>
              </div>
              <button
                onClick={() => setActiveTechnique(null)}
                className="p-1.5 text-[#A8ABA4] hover:text-[#F0EEE8] transition-colors rounded hover:bg-[#252e25]"
                aria-label="Close technique panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div className="border border-[#252e25] overflow-hidden aspect-[4/3] bg-[#101210]">
                    <img
                      src={activeTechnique.image}
                      alt={activeTechnique.title}
                      className="w-full h-full object-cover filter contrast-[1.05]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-3 bg-[#101210] border border-[#252e25] text-[11px] font-mono text-[#A8ABA4]">
                    <span className="text-[#A5B49A]">Field Observation Note:</span>
                    <p className="mt-1 text-[#F0EEE8]/80 leading-relaxed font-sans text-xs">
                      {activeTechnique.fieldNotes}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-3xl font-normal text-[#F0EEE8]">
                      {activeTechnique.title}
                    </h3>
                    <p className="mt-3 text-sm text-[#A8ABA4] leading-relaxed font-sans">
                      {activeTechnique.description}
                    </p>
                  </div>

                  {/* Sensory & Kinetic Parameters */}
                  <div className="space-y-3">
                    <div className="text-xs font-mono uppercase tracking-widest text-[#A5B49A]">
                      Key Kinetic Parameters
                    </div>
                    {activeTechnique.parameters.map((param, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#101210] border border-[#252e25] space-y-1 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[#F0EEE8] font-medium">{param.label}</span>
                          <span className="text-[#A5B49A]">{param.optimalRange}</span>
                        </div>
                        <p className="text-[11px] text-[#A8ABA4] font-sans">
                          {param.sensorSignificance}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Associated Movement Trace */}
                  <div className="p-3 bg-[#101210] border border-[#252e25] text-xs font-mono text-[#A8ABA4]">
                    <span className="text-[#91A9B6]">Associated Motion Signature:</span>
                    <p className="mt-1 text-[#F0EEE8]">{activeTechnique.associatedMotion}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => handleLaunchMotion(activeTechnique)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#A5B49A] text-[#101210] font-mono text-xs tracking-wider uppercase font-semibold hover:bg-[#F0EEE8] transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Record & Trace in Motion Lab</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTechnique(null);
                        onNavigate('comparison');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#3b473b] hover:border-[#91A9B6] text-[#F0EEE8] font-mono text-xs tracking-wider uppercase transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#91A9B6]" />
                      <span>Compare Technique</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
