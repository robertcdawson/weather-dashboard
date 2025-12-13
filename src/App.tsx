import React, { useEffect, useMemo } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { WeatherCard } from './components/WeatherCard';
import { LocationSearch } from './components/LocationSearch';
import { useWeatherStore } from './store/useWeatherStore';
import { Header } from './components/Header';
import { useWeatherData } from './hooks/useWeatherData';
import { usePeriodicWeatherUpdate } from './hooks/usePeriodicWeatherUpdate';
import { WeatherComparison } from './components/weather/WeatherComparison';
import { sendSevereWeatherNotifications } from './utils/notifications';
import { cn } from './utils/cn';
import { ToastContainer } from './components/ui/ToastContainer';

function App() {
  const {
    locations,
    locationOrder,
    isDarkMode,
    toggleDarkMode,
    isFavorite,
    showOnlyFavorites,
    toggleShowOnlyFavorites,
    comparisonMode,
    comparisonLocations,
    addToComparison,
    removeFromComparison,
    toggleComparisonMode,
    notificationsEnabled,
    reorderLocations,
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

  // Send notifications for severe weather (stored alerts to avoid duplicates)
  useEffect(() => {
    if (!notificationsEnabled) return;
    
    const storedAlerts = localStorage.getItem('previousWeatherAlerts');
    const previousAlerts = storedAlerts ? JSON.parse(storedAlerts) : {};
    
    const newAlerts = sendSevereWeatherNotifications(weatherData, previousAlerts);
    localStorage.setItem('previousWeatherAlerts', JSON.stringify(newAlerts));
  }, [weatherData, notificationsEnabled]);

  // Filter and sort locations based on order
  const filteredAndSortedLocations = useMemo(() => {
    // Create a map for quick lookup
    const locationMap = new Map(locations.map(loc => [loc.id, loc]));
    
    // Use locationOrder if available, otherwise use locations array order
    const orderedLocations = locationOrder.length > 0
      ? locationOrder.map(id => locationMap.get(id)).filter(Boolean)
      : locations;
    
    return orderedLocations
      .filter(location => location && (!showOnlyFavorites || isFavorite(location.id)))
      .sort((a, b) => {
        if (!a || !b) return 0;
        const aIsFavorite = isFavorite(a.id);
        const bIsFavorite = isFavorite(b.id);
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return 0;
      });
  }, [locations, locationOrder, showOnlyFavorites, isFavorite]);

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    
    reorderLocations(result.source.index, result.destination.index);
  };

  // Get comparison data
  const comparisonData = useMemo(() => {
    return comparisonLocations
      .map(id => weatherData[id])
      .filter(Boolean);
  }, [comparisonLocations, weatherData]);

  const isInComparison = (id: string) => comparisonLocations.includes(id);

  const handleCardClick = (locationId: string) => {
    if (!comparisonMode) return;
    
    if (isInComparison(locationId)) {
      removeFromComparison(locationId);
    } else if (comparisonLocations.length < 3) {
      addToComparison(locationId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="container mx-auto px-4 py-8">
        <Header
          isDarkMode={isDarkMode}
          onDarkModeToggle={toggleDarkMode}
          showOnlyFavorites={showOnlyFavorites}
          onShowOnlyFavoritesToggle={toggleShowOnlyFavorites}
          weatherData={weatherData}
        />

        <div className="mb-8">
          <LocationSearch onLocationSelect={(location) => {
            fetchWeatherData(location);
          }} />
        </div>

        {/* Comparison Mode UI */}
        {comparisonMode && (
          <WeatherComparison
            locations={comparisonData}
            onClose={toggleComparisonMode}
          />
        )}

        {/* Comparison mode hint */}
        {comparisonMode && comparisonLocations.length < 3 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Click on {3 - comparisonLocations.length} more card{comparisonLocations.length < 2 ? 's' : ''} to compare
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="weather-cards" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center"
              >
                {filteredAndSortedLocations.map((location, index) => (
                  <Draggable 
                    key={location.id} 
                    draggableId={location.id} 
                    index={index}
                    isDragDisabled={comparisonMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(
                          "w-full max-w-[400px] h-[360px] transform transition-all duration-300",
                          comparisonMode && "cursor-pointer",
                          comparisonMode && isInComparison(location.id) && "ring-4 ring-blue-500 rounded-2xl",
                          !comparisonMode && !snapshot.isDragging && "hover:scale-[1.02]",
                          snapshot.isDragging && "scale-105 shadow-2xl z-50"
                        )}
                        onClick={() => handleCardClick(location.id)}
                      >
                        <WeatherCard
                          data={weatherData[location.id]}
                          onRemove={() => removeLocation(location.id)}
                          onRefresh={() => fetchWeatherData(location)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

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
      <ToastContainer />
    </div>
  );
}

export default App;