'use client';
import { useEffect, useState } from 'react';

/** Neve leggera di sfondo (solo CSS, disattivata con prefers-reduced-motion). */
export default function Snow({ count = 22 }) {
  const [flakes, setFlakes] = useState([]);
  useEffect(() => {
    setFlakes(Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      size: 3 + Math.random() * 5,
      dur: 9 + Math.random() * 12,
      delay: -Math.random() * 20,
      dx: (Math.random() * 60 - 30).toFixed(0),
      op: 0.5 + Math.random() * 0.45,
    })));
  }, [count]);
  return (
    <div className="snow" aria-hidden="true">
      {flakes.map((f, i) => (
        <i key={i} style={{ left: `${f.left}%`, width: f.size, height: f.size, opacity: f.op, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, '--dx': `${f.dx}px` }} />
      ))}
    </div>
  );
}
