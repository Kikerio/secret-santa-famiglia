'use client';
export async function celebrate() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const confetti = (await import('canvas-confetti')).default;
  const colors = ['#E0312B', '#1F8A55', '#D9A13B', '#FFFFFF', '#9BD3F0'];
  confetti({ particleCount: 120, spread: 80, startVelocity: 42, origin: { y: 0.55 }, colors, scalar: 1.05 });
  let flake = null;
  try { flake = confetti.shapeFromText({ text: '❄️', scalar: 2 }); } catch {}
  const end = Date.now() + 1400;
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
    if (flake) confetti({ particleCount: 1, spread: 120, startVelocity: 18, gravity: 0.4, origin: { x: Math.random(), y: 0 }, shapes: [flake], scalar: 2 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
