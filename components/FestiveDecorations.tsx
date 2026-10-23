'use client';
import { useEffect, useState } from 'react';

export function FestiveDecorations({ theme }: { theme: string }) {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    // हर थीम के लिए अलग डेकोरेशन जनरेट करें
    if (theme === 'holi') {
      const colors = ['#FF007F', '#FFD700', '#00BFFF', '#32CD32', '#FF4500'];
      const newElements = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 3}s`,
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        width: `${Math.random() * 15 + 10}px`,
        height: `${Math.random() * 15 + 10}px`,
      }));
      setElements(newElements);
    } else if (theme === 'diwali') {
      const newElements = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 4}s`,
        animationDelay: `${Math.random() * 2}s`,
        text: Math.random() > 0.5 ? '✨' : '🪔',
        fontSize: `${Math.random() * 20 + 15}px`,
      }));
      setElements(newElements);
    } else if (theme === 'rakshabandhan') {
      const newElements = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 80 + 10}%`,
        text: '🪢',
      }));
      setElements(newElements);
    } else if (theme === 'newyear') {
      const newElements = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        text: '✦',
      }));
      setElements(newElements);
    }
  }, [theme]);

  if (theme === 'default') return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
      {/* Holi: Falling Colors */}
      {theme === 'holi' && elements.map((el) => (
        <div
          key={el.id}
          className="holi-color"
          style={{
            left: el.left,
            animationDuration: el.animationDuration,
            animationDelay: el.animationDelay,
            backgroundColor: el.backgroundColor,
            width: el.width,
            height: el.height,
          }}
        />
      ))}

      {/* Diwali: Floating Diyas & Sparkles */}
      {theme === 'diwali' && elements.map((el) => (
        <div
          key={el.id}
          className="diwali-glow absolute"
          style={{
            left: el.left,
            bottom: '-10vh',
            animation: `fall ${el.animationDuration} linear infinite`,
            animationDelay: el.animationDelay,
            fontSize: el.fontSize,
          }}
        >
          {el.text}
        </div>
      ))}

      {/* Rakshabandhan: Floating Rakhis */}
      {theme === 'rakshabandhan' && elements.map((el) => (
        <div
          key={el.id}
          className="rakhi-float"
          style={{ left: el.left, top: el.top }}
        >
          {el.text}
        </div>
      ))}

      {/* New Year: Twinkling Stars */}
      {theme === 'newyear' && elements.map((el) => (
        <div
          key={el.id}
          className="star-twinkle"
          style={{ 
            left: el.left, 
            top: el.top,
            animationDelay: `${Math.random() * 2}s` 
          }}
        >
          {el.text}
        </div>
      ))}
    </div>
  );
}