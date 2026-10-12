import React from 'react';

interface KlinikLogoProps {
  className?: string;
  size?: number;
}

export const KlinikLogo: React.FC<KlinikLogoProps> = ({ className = 'w-full h-full' }) => {
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="bk-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        <filter id="bk-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* 1. Golden spires / crowns (16 points) */}
      <g fill="#F5C400" stroke="#CA8A04" strokeWidth="0.5">
        <path id="bk-spike" d="M100 2 L103.5 10 L101.5 12 L103.5 16 L96.5 16 L98.5 12 L96.5 10 Z" />
        <use href="#bk-spike" transform="rotate(22.5 100 100)" />
        <use href="#bk-spike" transform="rotate(45 100 100)" />
        <use href="#bk-spike" transform="rotate(67.5 100 100)" />
        <use href="#bk-spike" transform="rotate(90 100 100)" />
        <use href="#bk-spike" transform="rotate(112.5 100 100)" />
        <use href="#bk-spike" transform="rotate(135 100 100)" />
        <use href="#bk-spike" transform="rotate(157.5 100 100)" />
        <use href="#bk-spike" transform="rotate(180 100 100)" />
        <use href="#bk-spike" transform="rotate(202.5 100 100)" />
        <use href="#bk-spike" transform="rotate(225 100 100)" />
        <use href="#bk-spike" transform="rotate(247.5 100 100)" />
        <use href="#bk-spike" transform="rotate(270 100 100)" />
        <use href="#bk-spike" transform="rotate(292.5 100 100)" />
        <use href="#bk-spike" transform="rotate(315 100 100)" />
        <use href="#bk-spike" transform="rotate(337.5 100 100)" />
      </g>

      {/* 2. Dark Green Lotus Wreath (16 lobes) */}
      <g fill="#0B5C35">
        <circle cx="100" cy="100" r="76" />
        <g id="bk-lobe">
          <circle cx="100" cy="20" r="11" />
        </g>
        <use href="#bk-lobe" transform="rotate(22.5 100 100)" />
        <use href="#bk-lobe" transform="rotate(45 100 100)" />
        <use href="#bk-lobe" transform="rotate(67.5 100 100)" />
        <use href="#bk-lobe" transform="rotate(90 100 100)" />
        <use href="#bk-lobe" transform="rotate(112.5 100 100)" />
        <use href="#bk-lobe" transform="rotate(135 100 100)" />
        <use href="#bk-lobe" transform="rotate(157.5 100 100)" />
        <use href="#bk-lobe" transform="rotate(180 100 100)" />
        <use href="#bk-lobe" transform="rotate(202.5 100 100)" />
        <use href="#bk-lobe" transform="rotate(225 100 100)" />
        <use href="#bk-lobe" transform="rotate(247.5 100 100)" />
        <use href="#bk-lobe" transform="rotate(270 100 100)" />
        <use href="#bk-lobe" transform="rotate(292.5 100 100)" />
        <use href="#bk-lobe" transform="rotate(315 100 100)" />
        <use href="#bk-lobe" transform="rotate(337.5 100 100)" />
      </g>

      {/* 3. White circular holes/eyelets (16 dots) */}
      <g fill="#FFFFFF">
        <circle id="bk-dot" cx="100" cy="20" r="4.2" />
        <use href="#bk-dot" transform="rotate(22.5 100 100)" />
        <use href="#bk-dot" transform="rotate(45 100 100)" />
        <use href="#bk-dot" transform="rotate(67.5 100 100)" />
        <use href="#bk-dot" transform="rotate(90 100 100)" />
        <use href="#bk-dot" transform="rotate(112.5 100 100)" />
        <use href="#bk-dot" transform="rotate(135 100 100)" />
        <use href="#bk-dot" transform="rotate(157.5 100 100)" />
        <use href="#bk-dot" transform="rotate(180 100 100)" />
        <use href="#bk-dot" transform="rotate(202.5 100 100)" />
        <use href="#bk-dot" transform="rotate(225 100 100)" />
        <use href="#bk-dot" transform="rotate(247.5 100 100)" />
        <use href="#bk-dot" transform="rotate(270 100 100)" />
        <use href="#bk-dot" transform="rotate(292.5 100 100)" />
        <use href="#bk-dot" transform="rotate(315 100 100)" />
        <use href="#bk-dot" transform="rotate(337.5 100 100)" />
      </g>

      {/* 4. Inner Green Medallion Background with subtle shade */}
      <circle cx="100" cy="100" r="68" fill="#0C653B" stroke="#084226" strokeWidth="1.5" />
      <path d="M48 64 A68 68 0 0 0 152 136 A68 68 0 0 1 48 64 Z" fill="#074426" opacity="0.35" />

      {/* 5. Vertical Black Rounded Shape (Bumi Kresna) */}
      <path d="M71 33 H101 A28 28 0 0 1 129 61 V166 H99 A28 28 0 0 1 71 138 Z" fill="#000000" filter="url(#bk-shadow)" />

      {/* 6. Three Golden Stars */}
      <g fill="#FACC15" stroke="#EAB308" strokeWidth="0.3">
        <path d="M100 38 L102.3 44.8 L109.5 44.8 L103.7 49 L105.9 55.8 L100 51.5 L94.1 55.8 L96.3 49 L90.5 44.8 L97.7 44.8 Z" />
        <path d="M86 52 L87.8 57.5 L93.5 57.5 L88.9 60.8 L90.6 66.2 L86 62.8 L81.4 66.2 L83.1 60.8 L78.5 57.5 L84.2 57.5 Z" />
        <path d="M114 52 L115.8 57.5 L121.5 57.5 L116.9 60.8 L118.6 66.2 L114 62.8 L109.4 66.2 L111.1 60.8 L106.5 57.5 L112.2 57.5 Z" />
      </g>

      {/* 7. Horizontal Yellow Rounded Shape (Cross & K) */}
      <path d="M61 71 H167 V101 A28 28 0 0 1 139 129 H33 V99 A28 28 0 0 1 61 71 Z" fill="#FACC15" filter="url(#bk-shadow)" />

      {/* 8. White Caduceus Emblem (Wings, Rod, Sphere, and Entwined Serpents) */}
      <g fill="#FFFFFF" filter="url(#bk-glow)">
        <circle cx="100" cy="80" r="4.2" />
        <rect x="98.7" y="84" width="2.6" height="70" rx="1.3" />
        {/* Wings */}
        <path d="M98 86 C86 82 70 81 53 85 C61 88 68 91 72 95 C77 92 84 90 91 89 C86 92 82 96 79 99 C86 96 92 93 98 91 Z" />
        <path d="M53 85 C64 82 78 83 94 86 C91 88 86 89 80 91 C72 87 62 86 53 85 Z" />
        <path d="M102 86 C114 82 130 81 147 85 C139 88 132 91 128 95 C123 92 116 90 109 89 C114 92 118 96 121 99 C114 96 108 93 102 91 Z" />
        <path d="M147 85 C136 82 122 83 106 86 C109 88 114 89 120 91 C128 87 138 86 147 85 Z" />
        {/* Serpents */}
        <path d="M94.5 91 C96 90 98 91 97.5 93 C96.5 94.5 94.5 94 94.5 91 Z" />
        <path d="M105.5 91 C104 90 102 91 102.5 93 C103.5 94.5 105.5 94 105.5 91 Z" />
        <path d="M96 92 C92 96 86 102 89 108 C91 113 97 115 100 117 C97 119 92 121 90 126 C88 131 92 137 97 141 C99 143 100 148 100 152" fill="none" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M104 92 C108 96 114 102 111 108 C109 113 103 115 100 117 C103 119 108 121 110 126 C112 131 108 137 103 141 C101 143 100 148 100 152" fill="none" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};
