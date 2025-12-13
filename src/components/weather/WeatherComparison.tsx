import React from 'react';
import { motion } from 'framer-motion';
import { X, Thermometer, Wind, Droplets, Sun, Sunrise, Sunset } from 'lucide-react';
import { WeatherData } from '../../types/weather';
import { useWeatherStore } from '../../store/useWeatherStore';
import { WeatherIcon } from './WeatherIcon';
import { cn } from '../../utils/cn';

interface WeatherComparisonProps {
  locations: WeatherData[];
  onClose: () => void;
}

export const WeatherComparison: React.FC<WeatherComparisonProps> = ({ locations, onClose }) => {
  const { temperatureUnit, removeFromComparison } = useWeatherStore();

  const convertTemp = (temp: number) => {
    return temperatureUnit === 'C' ? temp : Math.round(temp * 9 / 5 + 32);
  };

  const convertWind = (speed: number) => {
    return temperatureUnit === 'C' ? speed : Math.round(speed * 0.621371);
  };

  const windUnit = temperatureUnit === 'C' ? 'km/h' : 'mph';

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (locations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Compare Locations</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Select up to 3 locations to compare by clicking on weather cards
        </p>
      </motion.div>
    );
  }

  const metrics = [
    { key: 'temperature', label: 'Temperature', icon: Thermometer, getValue: (d: WeatherData) => `${convertTemp(d.temperature)}°${temperatureUnit}` },
    { key: 'feelsLike', label: 'Feels Like', icon: Thermometer, getValue: (d: WeatherData) => `${convertTemp(d.feelsLike)}°${temperatureUnit}` },
    { key: 'humidity', label: 'Humidity', icon: Droplets, getValue: (d: WeatherData) => `${d.humidity}%` },
    { key: 'wind', label: 'Wind', icon: Wind, getValue: (d: WeatherData) => `${convertWind(d.windSpeed)} ${windUnit} ${d.windDirection}` },
    { key: 'uvIndex', label: 'UV Index', icon: Sun, getValue: (d: WeatherData) => `${Math.round(d.uvIndex || 0)}` },
    { key: 'sunrise', label: 'Sunrise', icon: Sunrise, getValue: (d: WeatherData) => formatTime(d.sunrise) },
    { key: 'sunset', label: 'Sunset', icon: Sunset, getValue: (d: WeatherData) => formatTime(d.sunset) },
  ];

  // Find best values for highlighting
  const bestTemp = Math.max(...locations.map(l => convertTemp(l.temperature)));
  const lowestHumidity = Math.min(...locations.map(l => l.humidity));
  const lowestWind = Math.min(...locations.map(l => l.windSpeed));
  const lowestUV = Math.min(...locations.map(l => l.uvIndex || 0));

  const isBest = (metric: string, location: WeatherData) => {
    switch (metric) {
      case 'temperature':
        return convertTemp(location.temperature) === bestTemp;
      case 'humidity':
        return location.humidity === lowestHumidity;
      case 'wind':
        return location.windSpeed === lowestWind;
      case 'uvIndex':
        return (location.uvIndex || 0) === lowestUV;
      default:
        return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 overflow-x-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Compare Locations</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="min-w-max">
        {/* Header row with locations */}
        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `150px repeat(${locations.length}, 1fr)` }}>
          <div></div>
          {locations.map((location) => (
            <div key={location.id} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <WeatherIcon condition={location.condition} className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <button
                  onClick={() => removeFromComparison(location.id)}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                {location.city}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {location.condition}
              </div>
            </div>
          ))}
        </div>

        {/* Metric rows */}
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.key}
              className="grid gap-2 py-2 border-t border-gray-100 dark:border-gray-700"
              style={{ gridTemplateColumns: `150px repeat(${locations.length}, 1fr)` }}
            >
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Icon className="w-4 h-4" />
                {metric.label}
              </div>
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={cn(
                    "text-center text-sm font-medium py-1 px-2 rounded",
                    isBest(metric.key, location)
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "text-gray-900 dark:text-gray-100"
                  )}
                >
                  {metric.getValue(location)}
                </div>
              ))}
            </div>
          );
        })}

        {/* Forecast comparison */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">3-Day Forecast</h3>
          {[0, 1, 2].map((dayIndex) => (
            <div
              key={dayIndex}
              className="grid gap-2 py-2"
              style={{ gridTemplateColumns: `150px repeat(${locations.length}, 1fr)` }}
            >
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(locations[0]?.forecast[dayIndex]?.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              {locations.map((location) => {
                const day = location.forecast[dayIndex];
                return (
                  <div key={location.id} className="text-center text-xs">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {convertTemp(day?.maxTemp || 0)}°
                    </span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {convertTemp(day?.minTemp || 0)}°
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
