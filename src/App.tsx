/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { FallingPetals } from './components/FallingPetals';
import { OpeningEnvelope } from './components/OpeningEnvelope';
import { MainCard } from './components/MainCard';
import { SurpriseModal } from './components/SurpriseModal';
import { SparkleTrail } from './components/SparkleTrail';
import { MusicToggle } from './components/MusicToggle';
import { formatRecipientName } from './utils/greeting';
import { sound } from './utils/audio';

export default function App() {
  const [recipientName, setRecipientName] = useState('Dina Perwitasari');
  const [stage, setStage] = useState<'envelope' | 'card'>('envelope');
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);

  // Initialize query parameters and start background music autoplay
  useEffect(() => {
    sound.startAutoplay();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryName = params.get('name');
      if (queryName) {
        setRecipientName(formatRecipientName(queryName));
      }
      if (params.get('autostart') === '1') {
        setStage('card');
      }
    }
  }, []);

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-x-hidden selection:bg-pink-300 selection:text-pink-900">
      {/* Background Music Toggle Button */}
      <MusicToggle />

      {/* Falling Sakura Petals Background */}
      <FallingPetals count={26} />

      {/* Magical Mouse & Touch Sparkle Trail */}
      <SparkleTrail globalTrack={true} />

      {/* Opening Envelope Screen (3D Flap & Rising Letter) */}
      {stage === 'envelope' && (
        <OpeningEnvelope
          recipientName={recipientName}
          onOpenComplete={() => setStage('card')}
        />
      )}

      {/* Main Greeting Card */}
      {stage === 'card' && (
        <MainCard
          recipientName={recipientName}
          onOpenSurprise={() => setIsSurpriseOpen(true)}
          onCloseEnvelope={() => setStage('envelope')}
        />
      )}

      {/* Surprise Modal (with interactive blowable cake candles & special message) */}
      <SurpriseModal
        isOpen={isSurpriseOpen}
        onClose={() => setIsSurpriseOpen(false)}
        recipientName={recipientName}
      />
    </main>
  );
}
