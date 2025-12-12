import React, { useState } from 'react';
import { Thermometer, Wind, Droplets, RefreshCw, X } from 'lucide-react';
import { WeatherData } from '../../types/weather';
import { useWeatherStore } from '../../store/useWeatherStore';
import { cn } from '../../utils/cn';
import { ForecastModal } from './ForecastModal';
import { getWeatherInsights } from '../../utils/weatherInsights';
import { WeatherInsightsModal } from './WeatherInsightsModal';
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
  const [showInsights, setShowInsights] = useState(false);

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100';
    if (aqi <= 100) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-100';
    if (aqi <= 150) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-100';
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100';
  };

  const insights = getWeatherInsights(
    data.forecast,
    temperatureUnit === 'C' ? (data.temperature * 9 / 5) + 32 : data.temperature,
    data.condition,
    data.humidity
  );

  return (
    <>
      <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-pointer backface-hidden rotate-y-180">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Thermometer className="w-5 h-5 mr-2 dark:text-gray-200" />
              <span className="text-sm text-gray-600 dark:text-gray-200">Feels like</span>
            </div>
            <span className="font-medium dark:text-gray-100">
              {Math.round(feelsLike)}°{temperatureUnit}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wind className="w-5 h-5 mr-2 dark:text-gray-200" />
              <span className="text-sm text-gray-600 dark:text-gray-200">Wind</span>
            </div>
            <span className="font-medium dark:text-gray-100">
              {temperatureUnit === 'C' 
                ? `${data.windSpeed} km/h` 
                : `${Math.round(data.windSpeed * 0.621371)} mph`} {data.windDirection}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Droplets className="w-5 h-5 mr-2 dark:text-gray-200" />
              <span className="text-sm text-gray-600 dark:text-gray-200">Humidity</span>
            </div>
            <span className="font-medium dark:text-gray-100">
              {data.humidity}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-200">Air Quality</span>
            <span className={cn(
              'px-2 py-1 rounded-full text-sm font-medium',
              getAqiColor(data.aqi)
            )}>
              {data.aqi} - {data.aqiDescription}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-14">
            <AnimatedButton
              onClick={(e) => {
                e.stopPropagation();
                setShowInsights(true);
              }}
              variant="secondary"
              size="sm"
            >
              Weather Insights
            </AnimatedButton>

            <AnimatedButton
              onClick={(e) => {
                e.stopPropagation();
                setShowForecast(true);
              }}
              variant="secondary"
              size="sm"
            >
              7-Day Forecast
            </AnimatedButton>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          <AnimatedButton
            aria-label="Refresh weather data"
            title="Refresh weather data"
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            variant="secondary"
            size="sm"
            className="p-3 rounded-full"
          >
            <RefreshCw className="w-6 h-6" />
          </AnimatedButton>

          <AnimatedButton
            aria-label="Remove location"
            title="Remove location"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            variant="danger"
            size="sm"
            className="p-3 rounded-full"
          >
            <X className="w-6 h-6" />
          </AnimatedButton>
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

        {showInsights && (
          <WeatherInsightsModal
            trend={insights.trend}
            clothing={insights.clothing}
            bestTimeToTravel={insights.bestTimeToTravel || ''}
            onClose={() => setShowInsights(false)}
            cardPosition={cardPosition}
          />
        )}
      </div>
    </>
  );
};