/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { FallingPetals } from './components/FallingPetals';
import { OpeningEnvelope } from './components/OpeningEnvelope';
import { MainCard } from './components/MainCard';
import { SparkleTrail } from './components/SparkleTrail';
import { MusicToggle } from './components/MusicToggle';
import { PixelMascots } from './components/PixelMascots';
import { formatRecipientName } from './utils/greeting';
import { sound } from './utils/audio';

const SurpriseModal = lazy(() =>
  import('./components/SurpriseModal').then((m) => ({ default: m.SurpriseModal }))
);

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

  // Warm-preload SurpriseModal chunk during idle time once user reaches the main card
  useEffect(() => {
    if (stage !== 'card' || typeof window === 'undefined') return;
    const preload = () => {
      void import('./components/SurpriseModal');
    };
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(preload);
      return () => w.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(preload, 450);
    return () => window.clearTimeout(timer);
  }, [stage]);

  return (
    <main className="relative min-h-dvh w-full flex flex-col justify-center items-center px-3 pt-16 pb-24 sm:px-6 sm:py-8 overflow-x-hidden selection:bg-pink-300 selection:text-pink-900">
      {/* Background Music Toggle Button */}
      <MusicToggle />

      {/* Falling Sakura Petals Background */}
      <FallingPetals count={26} />

      {/* Pixel Panda (bottom-left) & Orange Cat (bottom-right) Shooting Confetti */}
      {!isSurpriseOpen && <PixelMascots />}

      {/* Magical Mouse & Touch Sparkle Trail */}
      <SparkleTrail globalTrack={true} />

      {/* Opening Envelope Screen (4-Sided Luxury Unfolding) */}
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

      {/* Lazy-loaded Surprise Modal (Cake, Make a Wish, Photo Carousel & Roulette Game) */}
      {isSurpriseOpen && (
        <Suspense fallback={null}>
          <SurpriseModal
            isOpen={isSurpriseOpen}
            onClose={() => setIsSurpriseOpen(false)}
            recipientName={recipientName}
          />
        </Suspense>
      )}
    </main>
  );
}
