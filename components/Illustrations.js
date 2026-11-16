// Illustrazioni festive in stile clay/velvet 3D, realizzate in SVG multilivello.
const common = { className: 'illu', 'aria-hidden': true, focusable: 'false' };

export function GiftHero(props) {
  return (
    <svg viewBox="0 0 200 200" {...common} {...props}>
      <defs>
        <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF6F63" /><stop offset=".55" stopColor="#E0312B" /><stop offset="1" stopColor="#A81C17" /></linearGradient>
        <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF8A7F" /><stop offset="1" stopColor="#D2271F" /></linearGradient>
        <linearGradient id="rb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C88A22" /><stop offset=".45" stopColor="#FBE19A" /><stop offset="1" stopColor="#C48A28" /></linearGradient>
        <radialGradient id="bw" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#FFF1C6" /><stop offset=".5" stopColor="#E7B24F" /><stop offset="1" stopColor="#A9741C" /></radialGradient>
        <radialGradient id="sh" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#8A4A1F" stopOpacity=".35" /><stop offset="1" stopColor="#8A4A1F" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="100" cy="182" rx="70" ry="10" fill="url(#sh)" />
      <rect x="40" y="88" width="120" height="88" rx="18" fill="url(#gb)" />
      <rect x="40" y="88" width="120" height="88" rx="18" fill="#fff" opacity=".08" />
      <path d="M52 100c10-4 30-5 48-5" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" fill="none" />
      <rect x="32" y="66" width="136" height="34" rx="14" fill="url(#gl)" />
      <path d="M44 74c18-3 44-4 70-3" stroke="#fff" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" fill="none" />
      <rect x="88" y="66" width="24" height="110" rx="6" fill="url(#rb)" />
      <path d="M100 66c-6-22-40-34-46-14-5 16 26 18 46 14z" fill="url(#bw)" />
      <path d="M100 66c6-22 40-34 46-14 5 16-26 18-46 14z" fill="url(#bw)" />
      <path d="M66 50c6-4 16-1 22 6" stroke="#FFF6D6" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="100" cy="64" rx="12" ry="10" fill="url(#bw)" />
      <ellipse cx="96" cy="60" rx="4" ry="3" fill="#fff" opacity=".7" />
      <circle cx="166" cy="40" r="4" fill="#D9A13B" /><circle cx="30" cy="52" r="3" fill="#9BD3F0" /><circle cx="176" cy="120" r="3" fill="#1F8A55" />
      <path d="M150 26l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#F5CF7E" />
    </svg>
  );
}

export function CandyCane(props) {
  return (
    <svg viewBox="0 0 200 200" {...common} {...props}>
      <defs>
        <clipPath id="cc"><path d="M118 184V70a26 26 0 0 0-52 0v8" fill="none" /></clipPath>
        <linearGradient id="ccs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E6DCD2" /><stop offset=".4" stopColor="#fff" /><stop offset="1" stopColor="#D8CCC0" /></linearGradient>
        <pattern id="str" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="26" height="26" fill="url(#ccs)" /><rect width="12" height="26" fill="#E0312B" /></pattern>
      </defs>
      <ellipse cx="118" cy="188" rx="28" ry="6" fill="#8A4A1F" opacity=".18" />
      <path d="M118 184V70a26 26 0 0 0-52 0v8" stroke="url(#str)" strokeWidth="26" strokeLinecap="round" fill="none" />
      <path d="M126 180V72" stroke="#fff" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" />
      <path d="M100 58a16 16 0 0 0-22 2" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M60 30c2 0 3 1 3 3s1 3 3 3c-2 0-3 1-3 3s-1-3-3-3c2 0 3-1 3-3" fill="#F5CF7E" />
      <path d="M40 120l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#9BD3F0" />
      <path d="M118 70c6-2 16 2 22 10" stroke="#1F8A55" strokeWidth="9" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Stocking(props) {
  return (
    <svg viewBox="0 0 200 200" {...common} {...props}>
      <defs>
        <linearGradient id="sk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF6A5E" /><stop offset="1" stopColor="#B21E18" /></linearGradient>
        <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#E9E1D8" /></linearGradient>
      </defs>
      <ellipse cx="100" cy="190" rx="56" ry="6" fill="#8A4A1F" opacity=".16" />
      <path d="M72 50h62v74c0 10 4 18 4 30 0 22-20 34-42 34H66c-18 0-28-12-28-26 0-16 14-26 34-30z" fill="url(#sk)" />
      <path d="M82 60v58" stroke="#fff" strokeOpacity=".4" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 160c10-6 22-6 32-2" stroke="#fff" strokeOpacity=".9" strokeWidth="0" />
      <circle cx="108" cy="92" r="5" fill="#F5CF7E" /><circle cx="94" cy="118" r="4" fill="#fff" opacity=".9" /><circle cx="116" cy="140" r="5" fill="#1F8A55" />
      <rect x="62" y="28" width="82" height="32" rx="16" fill="url(#cf)" />
      <circle cx="74" cy="44" r="5" fill="#fff" /><circle cx="94" cy="40" r="4" fill="#fff" /><circle cx="120" cy="46" r="5" fill="#fff" />
      <path d="M140 30c8-8 18-6 20 2" stroke="#D9A13B" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function SnowGlobe(props) {
  return (
    <svg viewBox="0 0 200 200" {...common} {...props}>
      <defs>
        <radialGradient id="gl1" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".6" stopColor="#D8EFFB" stopOpacity=".7" /><stop offset="1" stopColor="#9BD3F0" stopOpacity=".7" /></radialGradient>
        <linearGradient id="bs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2C871" /><stop offset=".5" stopColor="#D9A13B" /><stop offset="1" stopColor="#9A6A1A" /></linearGradient>
        <linearGradient id="tr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3DBA7C" /><stop offset="1" stopColor="#13643C" /></linearGradient>
      </defs>
      <ellipse cx="100" cy="186" rx="60" ry="7" fill="#8A4A1F" opacity=".18" />
      <circle cx="100" cy="92" r="66" fill="url(#gl1)" />
      <path d="M100 52l-22 34h10l-16 24h12l-14 22h60l-14-22h12l-16-24h10z" fill="url(#tr)" />
      <path d="M100 46l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#F5CF7E" />
      <ellipse cx="100" cy="140" rx="50" ry="12" fill="#fff" />
      <circle cx="62" cy="70" r="3" fill="#fff" /><circle cx="136" cy="64" r="2.5" fill="#fff" /><circle cx="128" cy="104" r="3" fill="#fff" /><circle cx="72" cy="112" r="2.5" fill="#fff" /><circle cx="110" cy="40" r="2" fill="#fff" />
      <path d="M58 60a50 50 0 0 1 30-24" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".8" />
      <path d="M44 146h112l-10 32H54z" fill="url(#bs)" />
      <path d="M52 154h96" stroke="#FFF1C6" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function Gingerbread(props) {
  return (
    <svg viewBox="0 0 200 200" {...common} {...props}>
      <defs>
        <radialGradient id="gbm" cx=".4" cy=".3" r=".9"><stop offset="0" stopColor="#E9A066" /><stop offset=".6" stopColor="#C26E34" /><stop offset="1" stopColor="#8E4A1E" /></radialGradient>
      </defs>
      <ellipse cx="100" cy="190" rx="54" ry="6" fill="#8A4A1F" opacity=".18" />
      <path d="M100 18a28 28 0 0 1 22 45c8 2 30 4 38 12 8 9 0 22-12 20l-22-4v18l20 34c6 10-2 24-14 20-6-2-10-8-14-14l-18-26-18 26c-4 6-8 12-14 14-12 4-20-10-14-20l20-34v-18l-22 4c-12 2-20-11-12-20 8-8 30-10 38-12a28 28 0 0 1 22-45z" fill="url(#gbm)" />
      <path d="M84 30a22 22 0 0 1 22-6" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="90" cy="44" r="4" fill="#3A2214" /><circle cx="110" cy="44" r="4" fill="#3A2214" />
      <path d="M90 56c6 5 14 5 20 0" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M50 86c4-3 8 3 12 0M138 86c4-3 8 3 12 0M72 154c4-3 8 3 12 0M116 154c4-3 8 3 12 0" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="86" r="5" fill="#E0312B" /><circle cx="100" cy="104" r="5" fill="#1F8A55" />
      <path d="M86 70h28l-14 8z" fill="#E0312B" />
    </svg>
  );
}

export const ILLUSTRATIONS = { gift: GiftHero, cane: CandyCane, stocking: Stocking, globe: SnowGlobe, ginger: Gingerbread };
