'use client';
import { useEffect, useState } from 'react';

export function FestiveDecorations({ theme }: { theme: string }) {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    // Diwali: ऊपर से लटकते हुए लालटेन और दीये
    if (theme === 'diwali') {
      const newElements = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: `${(i * 8) + Math.random() * 4}%`, // स्क्रीन पर समान दूरी पर फैलाएँ
        delay: `${Math.random() * 2}s`,
        text: Math.random() > 0.5 ? '🏮' : '🪔',
        stringHeight: `${Math.random() * 60 + 40}px`, // डोरी की लंबाई अलग-अलग
      }));
      setElements(newElements);
    } 
    // Holi: रंगों की बौछार
    else if (theme === 'holi') {
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
    // Rakshabandhan: तैरती हुई राखियां
    else if (theme === 'rakshabandhan') {
      const newElements = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 80 + 10}%`,
        text: Math.random() > 0.5 ? '🪢' : '🌼',
      }));
      setElements(newElements);
    } 
    // New Year: चमकते सितारे
    else if (theme === 'newyear') {
      const newElements = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
      }));
      setElements(newElements);
    }
  }, [theme]);

  if (theme === 'default') return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
      
      {/* Diwali: Hanging Lanterns */}
      {theme === 'diwali' && elements.map((el) => (
        <div
          key={el.id}
          className="hanging-lantern-wrapper"
          style={{ left: el.left, animationDelay: el.delay }}
        >
          <div className="hanging-string" style={{ height: el.stringHeight }}></div>
          <div className="hanging-lantern">{el.text}</div>
        </div>
      ))}

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
          style={{ left: el.left, top: el.top, animationDelay: el.animationDelay }}
        >
          ✦
        </div>
      ))}

    </div>
  );
}