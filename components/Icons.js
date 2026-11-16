// Iconografia: glifi lineari + squircle "Apple Glass".
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };

export const Ico = {
  home: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M3.5 10.5 12 3.8l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-6h-5.6v6H5A1.5 1.5 0 0 1 3.5 19z" /></svg>),
  gift: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="3.5" y="8.5" width="17" height="4" rx="1.2" /><path d="M5 12.5v7a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-7M12 8.5V21" /><path d="M12 8.5S10.8 3.5 8.2 4.1C6 4.6 6.6 8.5 12 8.5zM12 8.5s1.2-5 3.8-4.4c2.2.5 1.6 4.4-3.8 4.4z" /></svg>),
  family: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="8" cy="8" r="3" /><circle cx="16.5" cy="9" r="2.5" /><path d="M2.8 19.5c.6-3.2 2.7-5 5.2-5s4.6 1.8 5.2 5M13.6 15.2c.9-.6 1.9-.9 2.9-.9 2.2 0 3.9 1.6 4.4 4.7" /></svg>),
  mail: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>),
  user: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="8.2" r="3.8" /><path d="M4.5 20c1-3.8 4-5.8 7.5-5.8s6.5 2 7.5 5.8" /></svg>),
  star: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" /></svg>),
  starFill: (p) => (<svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path fill="currentColor" d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" /></svg>),
  clock: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>),
  coin: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M14.8 9.2c-.5-.9-1.6-1.4-2.8-1.4-1.7 0-2.8.9-2.8 2.1 0 2.9 5.8 1.4 5.8 4.3 0 1.2-1.2 2.1-3 2.1-1.3 0-2.4-.6-2.9-1.5M12 6.3v1.5M12 16.3v1.5" /></svg>),
  pin: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 1 1 13 0c0 5.2-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>),
  calendar: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>),
  list: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M9 6.5h11M9 12h11M9 17.5h11" /><circle cx="4.8" cy="6.5" r="1.2" /><circle cx="4.8" cy="12" r="1.2" /><circle cx="4.8" cy="17.5" r="1.2" /></svg>),
  plus: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>),
  x: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>),
  chevron: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="m9 5 7 7-7 7" /></svg>),
  back: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="m15 5-7 7 7 7" /></svg>),
  arrow: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>),
  send: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 19V5M6 11l6-6 6 6" /></svg>),
  link: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>),
  search: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>),
  flip: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7" /></svg>),
  trash: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M4.5 7h15M10 7V4.8h4V7M6.5 7l.8 12.2A1.5 1.5 0 0 0 8.8 20.6h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" /></svg>),
  edit: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /></svg>),
  bell: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2H4.5zM10 20.5a2.2 2.2 0 0 0 4 0" /></svg>),
  lock: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>),
  shield: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 3.5 5 6v5.5c0 4.4 3 7.8 7 9 4-1.2 7-4.6 7-9V6z" /></svg>),
  shirt: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="m8.5 4-5 3 2 4 2-1v10h9V10l2 1 2-4-5-3a3.5 3.5 0 0 1-7 0z" /></svg>),
  eye: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></svg>),
  eyeOff: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M3 3l18 18M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.7M6.6 6.7C3.9 8.5 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.3-1.1M9.9 9.9a2.8 2.8 0 0 0 4.2 4.2" /></svg>),
  camera: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2.2h5.6L16.3 7h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" /><circle cx="12" cy="12.8" r="3.4" /></svg>),
  sparkle: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>),
  snow: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 2.5v19M4 7l16 10M4 17 20 7M9.5 4 12 6.5 14.5 4M9.5 20l2.5-2.5 2.5 2.5" /></svg>),
  logout: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14M10 12h10M16.5 8.5 20 12l-3.5 3.5" /></svg>),
  heart: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" /></svg>),
  phone: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="6.5" y="2.8" width="11" height="18.4" rx="2.6" /><path d="M10.5 18h3" /></svg>),
  // Glifi Safari (guida installazione)
  more: (p) => (<svg viewBox="0 0 24 24" aria-hidden="true" {...p}><circle cx="5.5" cy="12" r="1.9" fill="currentColor" /><circle cx="12" cy="12" r="1.9" fill="currentColor" /><circle cx="18.5" cy="12" r="1.9" fill="currentColor" /></svg>),
  share: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M8.5 9H7a1.5 1.5 0 0 0-1.5 1.5v8.5A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5v-8.5A1.5 1.5 0 0 0 17 9h-1.5M12 14V3M8.5 6.3 12 2.8l3.5 3.5" /></svg>),
  addSquare: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4" /><path d="M12 8v8M8 12h8" /></svg>),
  compass: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>),
};

/** Squircle in vetro colorato con riflesso speculare. */
export function GlassIcon({ name, tone = 'red', size = 44, label, className = '' }) {
  const G = Ico[name] || Ico.gift;
  return (
    <span className={`gicon ${tone} ${className}`} style={{ '--s': `${size}px` }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <G />
    </span>
  );
}
