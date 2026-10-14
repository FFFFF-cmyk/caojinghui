/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CraftArchivePage } from './pages/CraftArchivePage';
import { MotionRecordingPage } from './pages/MotionRecordingPage';
import { SkillComparisonPage } from './pages/SkillComparisonPage';
import { LearningLabPage } from './pages/LearningLabPage';
import { TelemetryPoint, RecordingSession } from './types/craft';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedTechniqueForRecording, setSelectedTechniqueForRecording] = useState<string>(
    'Surface Application (Arc Sweep)'
  );
  const [userPracticeData, setUserPracticeData] = useState<TelemetryPoint[] | undefined>(undefined);

  // Scroll to top whenever tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleSelectTechniqueForRecording = (name: string) => {
    setSelectedTechniqueForRecording(name);
  };

  const handleExportPracticeData = (data: TelemetryPoint[]) => {
    setUserPracticeData(data);
  };

  const handleSendSessionToComparison = (session: RecordingSession) => {
    setUserPracticeData(session.data);
    setActiveTab('comparison');
  };

  return (
    <div className="min-h-screen bg-[#101210] text-[#F0EEE8] flex flex-col font-sans selection:bg-[#A5B49A] selection:text-[#101210]">
      {/* Fixed Navigation Bar with SENSOR STATUS: DEMO MODE indicator */}
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && <HomePage onNavigate={setActiveTab} />}

        {activeTab === 'archive' && (
          <CraftArchivePage
            onNavigate={setActiveTab}
            onSelectTechniqueForRecording={handleSelectTechniqueForRecording}
          />
        )}

        {activeTab === 'recording' && (
          <MotionRecordingPage
            onNavigate={setActiveTab}
            selectedTechniqueName={selectedTechniqueForRecording}
            onSendToComparison={handleSendSessionToComparison}
          />
        )}

        {activeTab === 'comparison' && (
          <SkillComparisonPage
            onNavigate={setActiveTab}
            userCustomLearnerData={userPracticeData}
          />
        )}

        {activeTab === 'learning' && (
          <LearningLabPage
            onNavigate={setActiveTab}
            onExportPracticeData={handleExportPracticeData}
          />
        )}
      </main>

      {/* Editorial Colophon & Research Archive Footer */}
      <Footer onSelectTab={setActiveTab} />
    </div>
  );
}
