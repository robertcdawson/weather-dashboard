import React, { useState } from 'react';
import { Thermometer, Wind, Droplets, RefreshCw, X, Sunrise, Sunset, Sun, Clock, Activity } from 'lucide-react';
import { WeatherData } from '../../types/weather';
import { useWeatherStore } from '../../store/useWeatherStore';
import { cn } from '../../utils/cn';
import { ForecastModal } from './ForecastModal';
import { HourlyForecastModal } from './HourlyForecastModal';
import { getWeatherInsights } from '../../utils/weatherInsights';
import { WeatherInsightsModal } from './WeatherInsightsModal';
import { ActivityModal } from './ActivityModal';
import { AnimatedButton } from '../ui/AnimatedButton';

interface CardBackProps {
  data: WeatherData;
  onRefresh: () => void;
  onRemove: () => void;
  cardPosition: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export const CardBack: React.FC<CardBackProps> = ({ data, onRefresh, onRemove, cardPosition }) => {
  const temperatureUnit = useWeatherStore((state) => state.temperatureUnit);
  const feelsLike = temperatureUnit === 'C' ? data.feelsLike : (data.feelsLike * 9 / 5) + 32;
  const [showForecast, setShowForecast] = useState(false);
  const [showHourly, setShowHourly] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100';
    if (aqi <= 100) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-100';
    if (aqi <= 150) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-100';
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100';
  };

  const getUvColor = (uv: number) => {
    if (uv <= 2) return 'text-green-600 dark:text-green-400';
    if (uv <= 5) return 'text-yellow-600 dark:text-yellow-400';
    if (uv <= 7) return 'text-orange-600 dark:text-orange-400';
    if (uv <= 10) return 'text-red-600 dark:text-red-400';
    return 'text-purple-600 dark:text-purple-400';
  };

  const getUvLabel = (uv: number) => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const insights = getWeatherInsights(
    data.forecast,
    temperatureUnit === 'C' ? (data.temperature * 9 / 5) + 32 : data.temperature,
    data.condition,
    data.humidity
  );

  return (
    <>
      <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-pointer backface-hidden rotate-y-180 overflow-y-auto">
        <div className="p-4 space-y-2">
          {/* Row 1: Feels like & Wind */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center">
                <Thermometer className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Feels</span>
              </div>
              <span className="text-sm font-medium dark:text-gray-100">
                {Math.round(feelsLike)}°
              </span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center">
                <Wind className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Wind</span>
              </div>
              <span className="text-sm font-medium dark:text-gray-100">
                {temperatureUnit === 'C' ? data.windSpeed : Math.round(data.windSpeed * 0.621371)} {data.windDirection}
              </span>
            </div>
          </div>

          {/* Row 2: Humidity & UV */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center">
                <Droplets className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Humidity</span>
              </div>
              <span className="text-sm font-medium dark:text-gray-100">{data.humidity}%</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center">
                <Sun className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">UV</span>
              </div>
              <span className={cn("text-sm font-medium", getUvColor(data.uvIndex || 0))}>
                {Math.round(data.uvIndex || 0)} {getUvLabel(data.uvIndex || 0)}
              </span>
            </div>
          </div>

          {/* Row 3: Sunrise & Sunset */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center">
                <Sunrise className="w-4 h-4 mr-1 text-orange-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Rise</span>
              </div>
              <span className="text-sm font-medium dark:text-gray-100">{formatTime(data.sunrise)}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center">
                <Sunset className="w-4 h-4 mr-1 text-orange-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Set</span>
              </div>
              <span className="text-sm font-medium dark:text-gray-100">{formatTime(data.sunset)}</span>
            </div>
          </div>

          {/* Air Quality */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Air Quality</span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getAqiColor(data.aqi))}>
              {data.aqi > 0 ? `${data.aqi} - ${data.aqiDescription}` : 'N/A'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <AnimatedButton
              onClick={(e) => { e.stopPropagation(); setShowHourly(true); }}
              variant="secondary"
              size="sm"
              className="text-xs py-1.5"
            >
              <Clock className="w-3 h-3 mr-1" />
              Hourly
            </AnimatedButton>
            <AnimatedButton
              onClick={(e) => { e.stopPropagation(); setShowForecast(true); }}
              variant="secondary"
              size="sm"
              className="text-xs py-1.5"
            >
              7-Day
            </AnimatedButton>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <AnimatedButton
              onClick={(e) => { e.stopPropagation(); setShowInsights(true); }}
              variant="secondary"
              size="sm"
              className="text-xs py-1.5"
            >
              Insights
            </AnimatedButton>
            <AnimatedButton
              onClick={(e) => { e.stopPropagation(); setShowActivity(true); }}
              variant="secondary"
              size="sm"
              className="text-xs py-1.5"
            >
              <Activity className="w-3 h-3 mr-1" />
              Activities
            </AnimatedButton>
          </div>
          <div className="flex gap-2 pt-1">
            <AnimatedButton
              aria-label="Refresh"
              title="Refresh"
              onClick={(e) => { e.stopPropagation(); onRefresh(); }}
              variant="secondary"
              size="sm"
              className="flex-1 p-1.5"
            >
              <RefreshCw className="w-4 h-4 mx-auto" />
            </AnimatedButton>
            <AnimatedButton
              aria-label="Remove"
              title="Remove"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              variant="danger"
              size="sm"
              className="flex-1 p-1.5"
            >
              <X className="w-4 h-4 mx-auto" />
            </AnimatedButton>
          </div>
        </div>

      </div>

      <div className="transform-none">
        {showForecast && (
          <ForecastModal
            forecast={data.forecast}
            temperatureUnit={temperatureUnit}
            onClose={() => setShowForecast(false)}
            cardPosition={cardPosition}
          />
        )}

        {showHourly && data.hourlyForecast && (
          <HourlyForecastModal
            hourlyForecast={data.hourlyForecast}
            temperatureUnit={temperatureUnit}
            onClose={() => setShowHourly(false)}
            cardPosition={cardPosition}
          />
        )}

        {showInsights && (
          <WeatherInsightsModal
            trend={insights.trend}
            clothing={insights.clothing}
            bestTimeToTravel={insights.bestTimeToTravel || ''}
            onClose={() => setShowInsights(false)}
            cardPosition={cardPosition}
          />
        )}

        {showActivity && (
          <ActivityModal
            data={data}
            onClose={() => setShowActivity(false)}
          />
        )}
      </div>
    </>
  );
};