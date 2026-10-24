'use client';
import { useEffect, useState } from 'react';

export function FestiveDecorations({ type }: { type: string }) {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    if (type === 'diwali_lights') {
      const newElements = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: `${(i * 8) + Math.random() * 4}%`,
        delay: `${Math.random() * 2}s`,
        text: Math.random() > 0.5 ? '🏮' : '🪔',
        stringHeight: `${Math.random() * 60 + 40}px`,
      }));
      setElements(newElements);
    } 
    else if (type === 'holi_colors') {
      const colors = ['#FF007F', '#FFD700', '#00BFFF', '#32CD32', '#FF4500', '#9400D3'];
      const newElements = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        width: `${Math.random() * 15 + 10}px`,
        height: `${Math.random() * 15 + 10}px`,
      }));
      setElements(newElements);
    } 
    else if (type === 'rakhi') {
      const newElements = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 80 + 10}%`,
        text: Math.random() > 0.5 ? '🪢' : '🌼',
      }));
      setElements(newElements);
    } 
    else if (type === 'stars') {
      const newElements = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
      }));
      setElements(newElements);
    }
  }, [type]);

  if (type === 'none' || !type) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
      {type === 'diwali_lights' && elements.map((el) => (
        <div key={el.id} className="hanging-wrapper" style={{ left: el.left, animationDelay: el.delay }}>
          <div className="hanging-string" style={{ height: el.stringHeight }}></div>
          <div className="hanging-item">{el.text}</div>
        </div>
      ))}

      {type === 'holi_colors' && elements.map((el) => (
        <div key={el.id} className="holi-color" style={{
            left: el.left, animationDuration: el.animationDuration, animationDelay: el.animationDelay,
            backgroundColor: el.backgroundColor, width: el.width, height: el.height,
        }} />
      ))}

      {type === 'rakhi' && elements.map((el) => (
        <div key={el.id} className="rakhi-float" style={{ left: el.left, top: el.top }}>
          {el.text}
        </div>
      ))}

      {type === 'stars' && elements.map((el) => (
        <div key={el.id} className="star-twinkle" style={{ left: el.left, top: el.top, animationDelay: el.animationDelay }}>
          ✦
        </div>
      ))}
    </div>
  );
}