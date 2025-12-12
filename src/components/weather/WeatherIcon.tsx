import React from 'react';
import { 
  Cloud, 
  CloudDrizzle, 
  CloudFog, 
  CloudHail, 
  CloudLightning, 
  CloudRain, 
  CloudSnow, 
  Sun,
  CloudSun,
  Snowflake
} from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = "w-8 h-8" }) => {
  const lowerCondition = condition.toLowerCase();

  // Clear conditions
  if (lowerCondition.includes('clear sky') || lowerCondition === 'sunny') {
    return <Sun className={className} />;
  }

  // Partly cloudy / mainly clear
  if (lowerCondition.includes('mainly clear') || lowerCondition.includes('partly cloudy')) {
    return <CloudSun className={className} />;
  }

  // Overcast
  if (lowerCondition.includes('overcast')) {
    return <Cloud className={className} />;
  }

  // Fog conditions
  if (lowerCondition.includes('fog')) {
    return <CloudFog className={className} />;
  }

  // Drizzle conditions
  if (lowerCondition.includes('drizzle')) {
    return <CloudDrizzle className={className} />;
  }

  // Rain conditions
  if (lowerCondition.includes('rain') || lowerCondition.includes('showers')) {
    return <CloudRain className={className} />;
  }

  // Snow conditions
  if (lowerCondition.includes('snow')) {
    if (lowerCondition.includes('heavy')) {
      return <Snowflake className={className} />;
    }
    return <CloudSnow className={className} />;
  }

  // Snow grains
  if (lowerCondition.includes('grains')) {
    return <CloudSnow className={className} />;
  }

  // Thunderstorm conditions
  if (lowerCondition.includes('thunderstorm')) {
    if (lowerCondition.includes('hail')) {
      return <CloudHail className={className} />;
    }
    return <CloudLightning className={className} />;
  }

  // Default to sun
  return <Sun className={className} />;
};