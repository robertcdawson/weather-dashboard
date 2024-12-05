import React, { useState } from 'react';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import { WeatherData } from '../../types/weather';

interface WeatherCardProps {
  data: WeatherData;
  onRefresh: () => void;
  onRemove: () => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ data, onRefresh, onRemove }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full h-[400px] perspective-1000">
      <div className="relative w-full h-full">
        {!isFlipped && (
          <CardFront
            data={data}
            onFlip={() => setIsFlipped(true)}
          />
        )}
        {isFlipped && (
          <CardBack
            data={data}
            onRefresh={onRefresh}
            onRemove={onRemove}
            onFlip={() => setIsFlipped(false)}
          />
        )}
      </div>
    </div>
  );
}; 