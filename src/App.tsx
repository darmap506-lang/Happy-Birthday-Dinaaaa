/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { FallingPetals } from './components/FallingPetals';
import { OpeningConfetti } from './components/OpeningConfetti';
import { MainCard } from './components/MainCard';
import { SparkleTrail } from './components/SparkleTrail';
import { MusicToggle } from './components/MusicToggle';
import { PixelMascots } from './components/PixelMascots';
import { BloomingFlowerLayer } from './components/BloomingFlowerLayer';
import { FlyingBalloons } from './components/FlyingBalloons';
import { formatRecipientName } from './utils/greeting';
import { sound } from './utils/audio';
import { clearSavedWish } from './utils/birthdayWish';

const SurpriseModal = lazy(() =>
  import('./components/SurpriseModal').then((m) => ({ default: m.SurpriseModal }))
);

export default function App() {
  const [recipientName, setRecipientName] = useState('Dina Perwitasari');
  const [stage, setStage] = useState<'opening' | 'card'>('opening');
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [bouquetTrigger, setBouquetTrigger] = useState<{
    seq: number;
    x?: number;
    y?: number;
  } | null>(null);

  // Initialize query parameters, reset Make-a-Wish on fresh app open/close, and start background music autoplay
  useEffect(() => {
    clearSavedWish();
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

      const handlePageHide = () => {
        clearSavedWish();
      };
      window.addEventListener('pagehide', handlePageHide);
      return () => {
        window.removeEventListener('pagehide', handlePageHide);
      };
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

  const handleCloseSurprise = () => {
    clearSavedWish();
    setIsSurpriseOpen(false);
  };

  const handleCloseCard = () => {
    clearSavedWish();
    setIsSurpriseOpen(false);
    setStage('opening');
  };

  return (
    <main className="relative min-h-dvh w-full flex flex-col justify-center items-center px-3 pt-16 pb-24 sm:px-6 sm:py-8 overflow-x-hidden selection:bg-pink-300 selection:text-pink-900">
      {/* Background Music Toggle Button */}
      <MusicToggle />

      {/* Falling Sakura Petals Background */}
      <FallingPetals count={26} />

      {/* Interactive Click-to-Bloom Sakura Flowers Layer */}
      <BloomingFlowerLayer bouquetTrigger={bouquetTrigger} />

      {/* Poppable Floating Balloons on Main Greeting View */}
      {stage === 'card' && !isSurpriseOpen && (
        <FlyingBalloons runKey={1} count={6} zIndexClass="z-[5]" />
      )}

      {/* Pixel Panda (bottom-left) & Orange Cat (bottom-right) Shooting Confetti */}
      {!isSurpriseOpen && <PixelMascots />}

      {/* Magical Mouse & Touch Sparkle Trail */}
      <SparkleTrail globalTrack={true} />

      {/* Opening Pull-String Confetti Screen */}
      {stage === 'opening' && (
        <OpeningConfetti onOpenComplete={() => setStage('card')} />
      )}

      {/* Main Greeting Card */}
      {stage === 'card' && (
        <MainCard
          recipientName={recipientName}
          onOpenSurprise={() => setIsSurpriseOpen(true)}
          onCloseEnvelope={handleCloseCard}
          onBloomBouquet={({ x, y }) =>
            setBouquetTrigger((prev) => ({ seq: (prev?.seq ?? 0) + 1, x, y }))
          }
        />
      )}

      {/* Lazy-loaded Surprise Modal (Cake, Make a Wish, Photo Carousel & Roulette Game) */}
      {isSurpriseOpen && (
        <Suspense fallback={null}>
          <SurpriseModal
            isOpen={isSurpriseOpen}
            onClose={handleCloseSurprise}
            recipientName={recipientName}
          />
        </Suspense>
      )}
    </main>
  );
}
