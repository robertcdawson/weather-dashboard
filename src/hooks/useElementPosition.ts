import { useEffect, useState } from 'react';

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const useElementPosition = (ref: React.RefObject<HTMLElement>) => {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [ref]);

  return position;
}; 