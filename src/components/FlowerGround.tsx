import React from 'react';

export const FlowerGround: React.FC = () => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-28 sm:h-36 md:h-44 pointer-events-none z-[1] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Floral ground illustration using generated local asset */}
      <img
        src="/src/assets/images/floral_ground_border_1794327772760.jpg"
        alt="Dekorasi bunga sakura di bagian bawah"
        className="w-full h-full object-cover object-bottom opacity-40 mix-blend-multiply"
      />
      {/* Soft gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-t from-pink-200/50 via-transparent to-transparent" />
    </div>
  );
};
