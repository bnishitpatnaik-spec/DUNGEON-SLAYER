import React, { useMemo } from 'react';

interface MonsterSpriteProps {
  colorHex: string;
  name: string;
  isHit: boolean;
  isBoss?: boolean;
  isDead: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

// Generates a deterministic pixel grid pattern from the monster name & color
export const MonsterSprite: React.FC<MonsterSpriteProps> = ({
  colorHex,
  name,
  isHit,
  isBoss,
  isDead,
  onClick
}) => {
  // Generate pseudo-random monster features based on name string
  const features = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);

    const eyeCount = (absHash % 3) + 1; // 1, 2, or 3 eyes
    const mouthType = absHash % 4; // 0: fangs, 1: grin, 2: open void, 3: single tooth
    const hornType = (absHash >> 2) % 3; // 0: horns, 1: antenna, 2: none
    const bodyShape = (absHash >> 4) % 3; // 0: blob/slime, 1: robot/blocky, 2: winged demon

    return { eyeCount, mouthType, hornType, bodyShape, absHash };
  }, [name]);

  // Derive secondary dark/accent colors from colorHex
  const secondaryColor = useMemo(() => {
    // Simple hex brightness tweak
    const hex = colorHex.replace('#', '');
    if (hex.length !== 6) return '#475569';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const darkR = Math.max(0, Math.floor(r * 0.6));
    const darkG = Math.max(0, Math.floor(g * 0.6));
    const darkB = Math.max(0, Math.floor(b * 0.6));
    return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
  }, [colorHex]);

  if (isDead) {
    return (
      <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center opacity-30 scale-75 transition-all duration-300 pointer-events-none">
        <div className="text-4xl animate-ping">💥</div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      id="monster-target-sprite"
      className={`relative cursor-pointer select-none transition-transform duration-75 group active:scale-90 ${
        isHit ? 'animate-bounce scale-95 brightness-150' : 'hover:scale-105'
      } ${isBoss ? 'w-56 h-56 md:w-72 md:h-72' : 'w-44 h-44 md:w-56 md:h-56'}`}
    >
      {/* Boss Aura Glow */}
      {isBoss && (
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse pointer-events-none" />
      )}

      {/* SVG Pixel Monster Frame */}
      <svg
        viewBox="0 0 16 16"
        className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] filter transition-all duration-100"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Background Aura / Shadow */}
        <ellipse cx="8" cy="15" rx="6" ry="1" fill="#000000" opacity="0.4" />

        {/* Monster Horns / Antennas */}
        {features.hornType === 0 && (
          <g fill={secondaryColor}>
            <rect x="3" y="1" width="2" height="2" />
            <rect x="11" y="1" width="2" height="2" />
          </g>
        )}
        {features.hornType === 1 && (
          <g fill="#FACC15">
            <rect x="7" y="1" width="2" height="2" />
            <circle cx="8" cy="1" r="1" fill="#EF4444" />
          </g>
        )}

        {/* Body Base Shape */}
        {features.bodyShape === 0 && (
          // Slime Blob
          <g fill={colorHex}>
            <rect x="4" y="3" width="8" height="2" />
            <rect x="3" y="5" width="10" height="7" />
            <rect x="2" y="7" width="12" height="6" />
            <rect x="4" y="13" width="8" height="1" />
          </g>
        )}
        {features.bodyShape === 1 && (
          // Cyber Robot / Square
          <g fill={colorHex}>
            <rect x="3" y="3" width="10" height="10" />
            <rect x="2" y="4" width="12" height="8" />
            <rect x="4" y="13" width="3" height="2" fill={secondaryColor} />
            <rect x="9" y="13" width="3" height="2" fill={secondaryColor} />
          </g>
        )}
        {features.bodyShape === 2 && (
          // Winged Demon
          <g fill={colorHex}>
            <rect x="1" y="5" width="3" height="4" fill={secondaryColor} />
            <rect x="12" y="5" width="3" height="4" fill={secondaryColor} />
            <rect x="4" y="3" width="8" height="10" />
            <rect x="3" y="5" width="10" height="7" />
          </g>
        )}

        {/* Body Shading / Belly highlight */}
        <rect x="5" y="10" width="6" height="2" fill={secondaryColor} opacity="0.5" />

        {/* Eyes Rendering */}
        {features.eyeCount === 1 && (
          <g>
            <rect x="6" y="5" width="4" height="4" fill="#FFFFFF" />
            <rect x="7" y="6" width="2" height="2" fill="#000000" />
            <rect x="8" y="6" width="1" height="1" fill="#EF4444" />
          </g>
        )}
        {features.eyeCount === 2 && (
          <g>
            <rect x="4" y="5" width="3" height="3" fill="#FFFFFF" />
            <rect x="9" y="5" width="3" height="3" fill="#FFFFFF" />
            <rect x="5" y="6" width="1" height="1" fill="#000000" />
            <rect x="10" y="6" width="1" height="1" fill="#000000" />
          </g>
        )}
        {features.eyeCount === 3 && (
          <g>
            <rect x="3" y="5" width="2" height="2" fill="#FFFFFF" />
            <rect x="7" y="4" width="2" height="2" fill="#FFFFFF" />
            <rect x="11" y="5" width="2" height="2" fill="#FFFFFF" />
            <rect x="4" y="5" width="1" height="1" fill="#000000" />
            <rect x="8" y="4" width="1" height="1" fill="#EF4444" />
            <rect x="12" y="5" width="1" height="1" fill="#000000" />
          </g>
        )}

        {/* Mouth Rendering */}
        {features.mouthType === 0 && (
          // Fangs
          <g fill="#000000">
            <rect x="5" y="9" width="6" height="2" />
            <rect x="6" y="9" width="1" height="1" fill="#FFFFFF" />
            <rect x="9" y="9" width="1" height="1" fill="#FFFFFF" />
          </g>
        )}
        {features.mouthType === 1 && (
          // Wide Grin
          <rect x="4" y="9" width="8" height="1" fill="#000000" />
        )}
        {features.mouthType === 2 && (
          // Open Void
          <rect x="6" y="8" width="4" height="3" fill="#000000" />
        )}
        {features.mouthType === 3 && (
          // Single Tooth
          <g fill="#000000">
            <rect x="5" y="9" width="6" height="1" />
            <rect x="7" y="10" width="2" height="1" fill="#FFFFFF" />
          </g>
        )}
      </svg>

      {/* Tap indicator helper */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
        TAP TO SMASH!
      </div>
    </div>
  );
};
