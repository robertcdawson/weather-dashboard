import React from 'react';
import { Location } from '../../types/weather';
import { useWeatherStore } from '../../store/useWeatherStore';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LocationCardProps {
  location: Location;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  const weatherData = useWeatherStore((state) => state.weatherData[location.id]);
  const isFavorite = useWeatherStore((state) => state.isFavorite(location.id));
  const addToFavorites = useWeatherStore((state) => state.addToFavorites);
  const removeFromFavorites = useWeatherStore((state) => state.removeFromFavorites);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(location.id);
    } else {
      addToFavorites(location.id);
    }
  };

  return (
    <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {location.city}
          </h3>
          {location.state && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {location.state}, {location.country}
            </p>
          )}
        </div>
        <button
          onClick={toggleFavorite}
          className={cn(
            "p-1 rounded-lg transition-colors",
            isFavorite
              ? "text-yellow-500"
              : "text-gray-400 hover:text-yellow-500"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
        </button>
      </div>

      {weatherData && (
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {weatherData.temperature}°
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {weatherData.condition}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Feels like: {weatherData.feelsLike}°</p>
            <p>Wind: {weatherData.windSpeed} mph</p>
            <p>Humidity: {weatherData.humidity}%</p>
          </div>
        </div>
      )}
    </div>
  );
}; 