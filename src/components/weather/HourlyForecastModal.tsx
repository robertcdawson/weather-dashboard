import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { WeatherIcon } from './WeatherIcon';
import { cn } from '../../utils/cn';
import { buttonStyles } from '../../utils/styles';
import { HourlyForecast } from '../../types/weather';
import { Droplets, Wind } from 'lucide-react';

interface HourlyForecastModalProps {
  hourlyForecast: HourlyForecast[];
  temperatureUnit: string;
  onClose: () => void;
  cardPosition: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export const HourlyForecastModal: React.FC<HourlyForecastModalProps> = ({
  hourlyForecast,
  temperatureUnit,
  onClose,
  cardPosition
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  const convertTemp = (temp: number) => {
    return temperatureUnit === 'C' ? temp : Math.round(temp * 9 / 5 + 32);
  };

  const convertWind = (speed: number) => {
    return temperatureUnit === 'C' ? speed : Math.round(speed * 0.621371);
  };

  const windUnit = temperatureUnit === 'C' ? 'km/h' : 'mph';

  // Find min and max temps for the chart
  const temps = hourlyForecast.map(h => convertTemp(h.temperature));
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const modalStyle = {
    position: 'fixed' as const,
    top: `${cardPosition.top}px`,
    left: `${cardPosition.left}px`,
    width: `${Math.max(cardPosition.width, 400)}px`,
    maxWidth: '90vw',
    maxHeight: '80vh',
    transform: 'translate(0, 0)',
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-auto py-4"
      onClick={handleModalClick}
    >
      <motion.div
        ref={modalRef}
        style={modalStyle}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl overflow-hidden"
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          24-Hour Forecast
        </h3>

        {/* Temperature Graph */}
        <div className="mb-4 h-24 relative">
          <svg className="w-full h-full" viewBox={`0 0 ${hourlyForecast.length * 40} 100`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area under the line */}
            <path
              d={`M 0 ${100 - ((convertTemp(hourlyForecast[0]?.temperature || 0) - minTemp) / tempRange) * 80 - 10} ${hourlyForecast.map((h, i) => `L ${i * 40 + 20} ${100 - ((convertTemp(h.temperature) - minTemp) / tempRange) * 80 - 10}`).join(' ')} L ${(hourlyForecast.length - 1) * 40 + 20} 100 L 0 100 Z`}
              fill="url(#tempGradient)"
            />
            {/* Line */}
            <path
              d={`M ${hourlyForecast.map((h, i) => `${i * 40 + 20} ${100 - ((convertTemp(h.temperature) - minTemp) / tempRange) * 80 - 10}`).join(' L ')}`}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
            />
            {/* Points */}
            {hourlyForecast.map((h, i) => (
              <circle
                key={i}
                cx={i * 40 + 20}
                cy={100 - ((convertTemp(h.temperature) - minTemp) / tempRange) * 80 - 10}
                r="3"
                fill="rgb(59, 130, 246)"
              />
            ))}
          </svg>
        </div>

        {/* Hourly Details */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-2" style={{ minWidth: `${hourlyForecast.length * 70}px` }}>
            {hourlyForecast.map((hour, index) => (
              <motion.div
                key={hour.time}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex-shrink-0 w-16 text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {formatTime(hour.time)}
                </div>
                <WeatherIcon condition={hour.condition} className="w-6 h-6 mx-auto mb-1 text-gray-700 dark:text-gray-300" />
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {convertTemp(hour.temperature)}°
                </div>
                <div className="flex items-center justify-center text-xs text-blue-500 mt-1">
                  <Droplets className="w-3 h-3 mr-0.5" />
                  {hour.precipitationProbability}%
                </div>
                <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <Wind className="w-3 h-3 mr-0.5" />
                  {convertWind(hour.windSpeed)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClose}
          className={cn(
            buttonStyles.base,
            buttonStyles.hover,
            buttonStyles.focus,
            "mt-4 w-full px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
          )}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>,
    document.body
  );
};
