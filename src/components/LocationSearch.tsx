import React, { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Location } from '../types/weather';
import { searchLocations } from '../api/geocoding';
import { cn } from '../utils/cn';
import { useWeatherStore } from '../store/useWeatherStore';
import { buttonStyles } from "../utils/styles";
import { useLocationSearch } from '../hooks/useLocationSearch';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
}

// Helper function to check if coordinates are close (within ~5km)
const areCoordinatesClose = (lat1: number, lon1: number, lat2: number, lon2: number): boolean => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance < 5; // Return true if distance is less than 5km
};

export const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect }) => {
  const {
    searchTerm,
    suggestions,
    selectedIndex,
    isLoading: isSearching,
    setSearchTerm,
    getSuggestions,
    handleKeyDown: hookHandleKeyDown,
    clearSuggestions
  } = useLocationSearch();

  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locations = useWeatherStore((state) => state.locations);

  const handleLocationAdd = (location: Location) => {
    // Check if location already exists
    const exists = locations.some(existingLoc =>
      areCoordinatesClose(existingLoc.lat, existingLoc.lon, location.lat, location.lon)
    );

    // Always clear the search UI
    setSearchTerm('');
    clearSuggestions();

    if (exists) {
      setError('This location is already added');
      setTimeout(() => setError(null), 3000);
      return;
    }

    onLocationSelect(location);
  };

  const handleSuggestionClick = (location: Location) => {
    handleLocationAdd(location);
  };

  // Pass handleLocationAdd to hook's handleKeyDown via wrapper
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    hookHandleKeyDown(e, handleLocationAdd);
  };

  const handleCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const locations = await searchLocations(`${latitude},${longitude}`);

      if (locations.length > 0) {
        handleLocationAdd(locations[0]);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Unable to get current location');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by city or state..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              getSuggestions(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            className="w-full px-6 py-3 pl-12 pr-10 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-lg transition-all duration-300"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
          )}
        </div>

        <button
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className={cn(
            buttonStyles.base,
            buttonStyles.hover,
            buttonStyles.focus,
            "p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          )}
          title="Use current location"
          aria-label="Use current location"
        >
          <MapPin className="w-5 h-5" />
          {isLocating && <span className="text-sm font-medium">Loading...</span>}
        </button>
      </div>

      {error && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 p-2 min-w-[200px] max-w-[300px] bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 text-sm rounded-lg text-center z-50 shadow-lg">
          {error}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            return (
              <button
                key={suggestion.id}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition-colors",
                  "flex items-center space-x-3",
                  index === selectedIndex && "bg-blue-50/50 dark:bg-blue-900/30",
                  index !== suggestions.length - 1 && "border-b border-gray-100 dark:border-gray-700/50"
                )}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {suggestion.city}
                    {suggestion.state && (
                      <span className={cn(
                        "ml-1 text-sm",
                        suggestion.state.toLowerCase() === searchTerm.toLowerCase()
                          ? "text-blue-500 dark:text-blue-400 font-medium"
                          : "text-gray-500 dark:text-gray-400"
                      )}>
                        ({suggestion.state})
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {suggestion.country}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};