import React from 'react';
import { Sun, Moon, Star } from 'lucide-react';
import { useWeatherStore } from '../store/useWeatherStore';
import { cn } from '../utils/cn';

interface HeaderProps {
  isDarkMode: boolean | null;
  onDarkModeToggle: () => void;
  showOnlyFavorites: boolean;
  onShowOnlyFavoritesToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onDarkModeToggle,
  showOnlyFavorites,
  onShowOnlyFavoritesToggle,
}) => {
  const temperatureUnit = useWeatherStore((state) => state.temperatureUnit);
  const toggleTemperatureUnit = useWeatherStore((state) => state.toggleTemperatureUnit);

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Weather Dashboard
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={onShowOnlyFavoritesToggle}
          className={cn(
            "p-2 rounded-lg transition-colors",
            showOnlyFavorites
              ? "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400"
              : "hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400"
          )}
          aria-label={showOnlyFavorites ? "Show all locations" : "Show only favorites"}
        >
          <Star
            className={cn(
              "w-5 h-5",
              showOnlyFavorites && "fill-current"
            )}
          />
        </button>
        <button
          onClick={toggleTemperatureUnit}
          className="px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400"
        >
          °{temperatureUnit}
        </button>
        <button
          onClick={onDarkModeToggle}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};