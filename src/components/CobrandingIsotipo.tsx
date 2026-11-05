import React, { useState } from 'react';

interface CobrandingIsotipoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const COBRANDING_LOGO_URL = '/assets/aistudio/ISOTIPO_COBRANDING_c135f236.jpeg';

export const CobrandingIsotipo: React.FC<CobrandingIsotipoProps> = ({
  size = 44,
  className = '',
  showText = false,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official Circular Navy Seal with Sailing Velero (Cobranding) */}
      <div
        className="relative rounded-full overflow-hidden shrink-0 border-2 border-cyan-400/50 shadow-md bg-white flex items-center justify-center p-0 select-none group"
        style={{ width: size, height: size }}
      >
        {!imageError ? (
          <img
            src={COBRANDING_LOGO_URL}
            alt="Isotipo Oficial COBRANDING OPS"
            className="w-full h-full object-cover scale-[1.36] rounded-full transform transition-transform duration-300 group-hover:scale-[1.42]"
            onError={() => setImageError(true)}
          />
        ) : (
          /* SVG Fallback if image path fails */
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-1"
          >
            <circle cx="50" cy="50" r="46" stroke="#0a192f" strokeWidth="3" fill="#f8fafc" />
            <circle cx="50" cy="50" r="38" stroke="#0a192f" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <path d="M49 24 L49 60 L32 60 Z" fill="#0a192f" />
            <path d="M51 28 L64 60 L51 60 Z" fill="#0a192f" />
            <line x1="50" y1="22" x2="50" y2="62" stroke="#0a192f" strokeWidth="2" strokeLinecap="round" />
            <path d="M28 62 C 38 62, 45 64, 58 64 C 66 64, 71 63, 73 62 L 71 67 C 60 69, 40 69, 29 67 Z" fill="#0a192f" />
          </svg>
        )}
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-wider text-white">
              COBRANDING <span className="text-cyan-400">OPS</span>
            </span>
            <span className="bg-cyan-950 text-cyan-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-cyan-700/60 uppercase tracking-wider">
              Oficial
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium">
            Catamarán Cartagena &amp; María del Puerto
          </p>
        </div>
      )}
    </div>
  );
};
