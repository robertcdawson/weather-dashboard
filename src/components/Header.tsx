import React, { useState } from 'react';
import { Sun, Moon, Star, Settings, GitCompare, Map } from 'lucide-react';
import { useWeatherStore } from '../store/useWeatherStore';
import { cn } from '../utils/cn';
import { SettingsModal } from './SettingsModal';
import { WeatherMapModal } from './weather/WeatherMapModal';
import { WeatherData } from '../types/weather';

interface HeaderProps {
  isDarkMode: boolean | null;
  onDarkModeToggle: () => void;
  showOnlyFavorites: boolean;
  onShowOnlyFavoritesToggle: () => void;
  weatherData?: Record<string, WeatherData>;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onDarkModeToggle,
  showOnlyFavorites,
  onShowOnlyFavoritesToggle,
  weatherData = {},
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const temperatureUnit = useWeatherStore((state) => state.temperatureUnit);
  const toggleTemperatureUnit = useWeatherStore((state) => state.toggleTemperatureUnit);
  const comparisonMode = useWeatherStore((state) => state.comparisonMode);
  const toggleComparisonMode = useWeatherStore((state) => state.toggleComparisonMode);
  
  const locations = Object.values(weatherData).filter(Boolean);

  return (
    <>
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Weather Dashboard
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowMap(true)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 transition-colors"
            aria-label="Weather Map"
            title="Weather Map"
            disabled={locations.length === 0}
          >
            <Map className="w-5 h-5" />
          </button>
          <button
            onClick={toggleComparisonMode}
            className={cn(
              "p-2 rounded-lg transition-colors",
              comparisonMode
                ? "bg-blue-400/20 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400"
            )}
            aria-label={comparisonMode ? "Exit comparison mode" : "Compare locations"}
            title={comparisonMode ? "Exit comparison mode" : "Compare locations"}
          >
            <GitCompare className="w-5 h-5" />
          </button>
          <button
            onClick={onShowOnlyFavoritesToggle}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showOnlyFavorites
                ? "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400"
                : "hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400"
            )}
            aria-label={showOnlyFavorites ? "Show all locations" : "Show only favorites"}
            title={showOnlyFavorites ? "Show all locations" : "Show only favorites"}
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
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 text-gray-600 dark:text-gray-400 text-sm font-medium transition-colors cursor-pointer"
            title={`Switch to ${temperatureUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
            aria-label={`Switch to ${temperatureUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
          >
            °{temperatureUnit}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onDarkModeToggle}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showMap && locations.length > 0 && (
        <WeatherMapModal locations={locations} onClose={() => setShowMap(false)} />
      )}
    </>
  );
};