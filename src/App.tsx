import React, { useEffect } from 'react';
import { Sun, Moon, MapPin } from 'lucide-react';
import { WeatherCard } from './components/WeatherCard';
import { LocationSearch } from './components/LocationSearch';
import { useWeatherStore } from './store/useWeatherStore';
import { Header } from './components/Header';
import { useWeatherData } from './hooks/useWeatherData';
import { usePeriodicWeatherUpdate } from './hooks/usePeriodicWeatherUpdate';

function App() {
  const {
    locations,
    isDarkMode,
    toggleDarkMode,
    isFavorite,
    showOnlyFavorites,
    toggleShowOnlyFavorites,
  } = useWeatherStore();

  const { weatherData, fetchWeatherData, removeLocation } = useWeatherData();

  // Add periodic updates
  usePeriodicWeatherUpdate();

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const systemIsDark = mediaQuery.matches;
      document.documentElement.classList.toggle('dark', isDarkMode === null ? systemIsDark : isDarkMode);
    };

    mediaQuery.addEventListener('change', updateTheme);
    updateTheme(); // Initial theme setting

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [isDarkMode]);

  // Filter and sort locations
  const filteredAndSortedLocations = [...locations]
    .filter(location => !showOnlyFavorites || isFavorite(location.id))
    .sort((a, b) => {
      const aIsFavorite = isFavorite(a.id);
      const bIsFavorite = isFavorite(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="container mx-auto px-4 py-8">
        <Header
          isDarkMode={isDarkMode}
          onDarkModeToggle={toggleDarkMode}
          showOnlyFavorites={showOnlyFavorites}
          onShowOnlyFavoritesToggle={toggleShowOnlyFavorites}
        />

        <div className="mb-8">
          <LocationSearch onLocationSelect={(location) => {
            fetchWeatherData(location);
          }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {filteredAndSortedLocations.map((location) => (
            <div key={location.id} className="w-full max-w-[360px] h-[360px] transform hover:scale-[1.02] transition-all duration-300">
              <WeatherCard
                data={weatherData[location.id]}
                onRemove={() => removeLocation(location.id)}
                onRefresh={() => fetchWeatherData(location)}
              />
            </div>
          ))}
        </div>

        {filteredAndSortedLocations.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <MapPin className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
              {showOnlyFavorites
                ? "No favorite locations yet"
                : "Add a location to see weather information"}
            </p>
            <p className="mt-2 text-gray-500 dark:text-gray-500">
              {showOnlyFavorites
                ? "Add favorites by clicking the star icon on any weather card"
                : "Use the search bar above to find your city"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;