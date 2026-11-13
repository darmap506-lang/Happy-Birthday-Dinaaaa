import React, { memo, useMemo } from 'react';
import { calculatePetalStyle } from '../utils/greeting';

interface FallingPetalsProps {
  count?: number;
}

export const FallingPetals: React.FC<FallingPetalsProps> = memo(({ count = 28 }) => {
  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      ...calculatePetalStyle(i + 1),
    }));
  }, [count]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal-particle"
          style={{
            width: `${petal.width}px`,
            height: `${petal.height}px`,
            left: `${petal.left}vw`,
            backgroundColor: petal.color,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
            boxShadow: '0 2px 6px rgba(236, 64, 122, 0.15)',
          }}
        />
      ))}
    </div>
  );
});
