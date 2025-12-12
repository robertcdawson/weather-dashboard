import React, { useState, useRef } from 'react';
import { WeatherIcon } from './WeatherIcon';
import { AlertTriangle, Star } from 'lucide-react';
import { WeatherData } from '../../types/weather';
import { useWeatherStore } from '../../store/useWeatherStore';
import { cn } from '../../utils/cn';
import { WeatherAlertModal } from './WeatherAlertModal';

interface CardFrontProps {
  data: WeatherData;
}

interface WeatherTheme {
  gradient: string;
  isLightBg: boolean;
}

const getWeatherTheme = (condition: string): WeatherTheme => {
  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes('clear sky')) {
    return {
      gradient: 'from-sky-400 to-blue-600',
      isLightBg: false
    };
  }
  if (lowerCondition.includes('mainly clear')) {
    return {
      gradient: 'from-sky-400 to-blue-500',
      isLightBg: false
    };
  }
  if (lowerCondition.includes('partly cloudy')) {
    return {
      gradient: 'from-blue-400 via-blue-500 to-blue-600',
      isLightBg: false
    };
  }
  if (lowerCondition.includes('overcast')) {
    return {
      gradient: 'from-slate-500 to-slate-700',
      isLightBg: false
    };
  }
  if (lowerCondition.includes('fog')) {
    return {
      gradient: 'from-slate-400 to-slate-600',
      isLightBg: false
    };
  }
  if (lowerCondition.includes('drizzle')) {
    return {
      gradient: 'from-blue-500 to-slate-600',
      isLightBg: false
    };
  }
  if (lowerCondition.includes('rain')) {
    return {
      gradient: 'from-blue-700 to-slate-800',
      isLightBg: false
    };
  }
  if (lowerCondition.includes('snow')) {
    return {
      gradient: 'from-slate-100 to-blue-100',
      isLightBg: true
    };
  }
  if (lowerCondition.includes('thunderstorm')) {
    return {
      gradient: 'from-slate-800 to-purple-900',
      isLightBg: false
    };
  }

  // Default clear sky
  return {
    gradient: 'from-sky-400 to-blue-600',
    isLightBg: false
  };
};

export const CardFront: React.FC<CardFrontProps> = ({ data }) => {
  const { temperatureUnit, addToFavorites, removeFromFavorites, isFavorite } = useWeatherStore();
  const isDarkMode = useWeatherStore((state) => state.isDarkMode);
  const theme = getWeatherTheme(data.condition);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alertPosition, setAlertPosition] = useState({ top: 0, left: 0 });
  const alertButtonRef = useRef<HTMLButtonElement>(null);

  const handleAlertClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (alertButtonRef.current) {
      const rect = alertButtonRef.current.getBoundingClientRect();
      setAlertPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
    setShowAlerts(true);
  };

  const textColorClass = theme.isLightBg
    ? 'text-slate-900'
    : 'text-white';

  const subTextColorClass = theme.isLightBg
    ? 'text-slate-700'
    : 'text-white/90';

  return (
    <div className="absolute inset-0">
      <div
        className={cn(
          "relative w-full h-full p-6 rounded-2xl shadow-lg cursor-pointer",
          `bg-gradient-to-br ${theme.gradient}`,
          "transform transition-transform duration-200 hover:scale-[1.02]"
        )}
      >
        {/* Location and Weather Icon */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cn(
              "text-2xl font-bold tracking-tight text-shadow-sm",
              textColorClass
            )}>
              {data.city}
            </h2>
            <p className={cn(
              "text-sm font-medium text-shadow-sm",
              subTextColorClass
            )}>
              {data.state ? `${data.state}, ` : ''}{data.country}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                isFavorite(data.id) ? removeFromFavorites(data.id) : addToFavorites(data.id);
              }}
              className="relative group z-10"
              aria-label={isFavorite(data.id) ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                className={cn(
                  "w-6 h-6 transition-all",
                  isFavorite(data.id)
                    ? "text-yellow-400 fill-yellow-400"
                    : theme.isLightBg
                      ? "text-gray-700/70 hover:text-gray-900"
                      : "text-white/70 hover:text-white",
                  "hover:scale-110"
                )}
                fill={isFavorite(data.id) ? "currentColor" : "none"}
              />
            </button>
            {data.hasSevereAlert && (
              <button
                ref={alertButtonRef}
                onClick={handleAlertClick}
                className="relative group z-10"
              >
                <AlertTriangle
                  className={cn(
                    "w-6 h-6 text-amber-500 animate-pulse",
                    "transition-transform hover:scale-110"
                  )}
                />
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {data.alerts.length}
                </span>
              </button>
            )}
            <WeatherIcon condition={data.condition} className={textColorClass} />
          </div>
        </div>

        {/* Temperature */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className={cn(
              "text-7xl font-bold tracking-tighter text-shadow-lg",
              textColorClass
            )}>
              {temperatureUnit === 'C' ? data.temperature : Math.round(data.temperature * 9 / 5 + 32)}°
              {temperatureUnit}
            </span>
            <div className={cn(
              "flex items-center justify-center gap-3 mt-2 text-lg font-medium text-shadow-sm",
              textColorClass
            )}>
              <span>H: {temperatureUnit === 'C'
                ? data.forecast[0].maxTemp
                : Math.round(data.forecast[0].maxTemp * 9 / 5 + 32)}°</span>
              <span>L: {temperatureUnit === 'C'
                ? data.forecast[0].minTemp
                : Math.round(data.forecast[0].minTemp * 9 / 5 + 32)}°</span>
            </div>
            <p className={cn(
              "text-xl mt-2 capitalize font-semibold text-shadow-sm",
              textColorClass
            )}>
              {data.condition}
            </p>
          </div>
        </div>

        {/* Weather-specific decorative elements */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          {data.condition.toLowerCase().includes('rain') && (
            <div className="absolute inset-0 opacity-30">
              <div className="rain-animation" />
            </div>
          )}
          {data.condition.toLowerCase().includes('snow') && (
            <div className="absolute inset-0 opacity-30">
              <div className="snow-animation" />
            </div>
          )}
        </div>

        {/* Decorative circles with condition-based opacity */}
        <div className={cn(
          "absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl",
          data.condition.toLowerCase().includes('clear') ? 'bg-white/20' : 'bg-white/10'
        )} />
        <div className={cn(
          "absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-xl",
          data.condition.toLowerCase().includes('clear') ? 'bg-white/20' : 'bg-white/10'
        )} />

        {showAlerts && (
          <WeatherAlertModal
            alerts={data.alerts}
            onClose={() => setShowAlerts(false)}
            position={alertPosition}
          />
        )}
      </div>
    </div>
  );
};