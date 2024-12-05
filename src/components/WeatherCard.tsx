import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { WeatherData } from '../types/weather';
import { CardFront } from './weather/CardFront';
import { CardBack } from './weather/CardBack';
import { cn } from '../utils/cn';
import { useElementPosition } from '../hooks/useElementPosition';

interface WeatherCardProps {
  data: WeatherData;
  onRemove: () => void;
  onRefresh: () => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  data,
  onRemove,
  onRefresh,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const position = useElementPosition(cardRef);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (!data) {
    return null;
  }

  return (
    <div
      ref={cardRef}
      className="relative w-full h-full perspective-1000"
      onClick={handleFlip}
    >
      <motion.div
        className={cn(
          "relative w-full h-full transition-transform duration-500 transform-style-3d"
        )}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          type: "tween",
          duration: 0.2,
          ease: "easeInOut"
        }}
      >
        <CardFront data={data} />
        <CardBack
          data={data}
          onRemove={onRemove}
          onRefresh={onRefresh}
          cardPosition={position}
        />
      </motion.div>
    </div>
  );
};