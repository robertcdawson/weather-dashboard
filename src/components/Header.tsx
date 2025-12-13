import React, { useState } from 'react';
import { Sun, Moon, Star, Settings, GitCompare } from 'lucide-react';
import { useWeatherStore } from '../store/useWeatherStore';
import { cn } from '../utils/cn';
import { SettingsModal } from './SettingsModal';

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
  const [showSettings, setShowSettings] = useState(false);
  const temperatureUnit = useWeatherStore((state) => state.temperatureUnit);
  const comparisonMode = useWeatherStore((state) => state.comparisonMode);
  const toggleComparisonMode = useWeatherStore((state) => state.toggleComparisonMode);

  return (
    <>
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Weather Dashboard
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
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
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-sm font-medium"
            title="Temperature unit"
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
    </>
  );
};