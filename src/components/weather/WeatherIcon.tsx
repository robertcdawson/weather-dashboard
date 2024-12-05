import React from 'react';
import { Cloud, CloudRain, Sun } from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = "w-8 h-8" }) => {
  switch (condition.toLowerCase()) {
    case 'sunny':
      return <Sun className={className} />;
    case 'cloudy':
      return <Cloud className={className} />;
    case 'rain':
      return <CloudRain className={className} />;
    default:
      return <Sun className={className} />;
  }
};