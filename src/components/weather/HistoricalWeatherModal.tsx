import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Calendar, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { WeatherData } from '../../types/weather';
import { fetchYearlyComparison, HistoricalWeatherData } from '../../api/historicalWeather';
import { useWeatherStore } from '../../store/useWeatherStore';
import { cn } from '../../utils/cn';

interface HistoricalWeatherModalProps {
  data: WeatherData;
  onClose: () => void;
}

interface YearlyData {
  year: number;
  data: HistoricalWeatherData;
}

export const HistoricalWeatherModal: React.FC<HistoricalWeatherModalProps> = ({ data, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<YearlyData[]>([]);
  const { temperatureUnit } = useWeatherStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
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

  useEffect(() => {
    const loadHistoricalData = async () => {
      setLoading(true);
      try {
        const results = await fetchYearlyComparison(data.lat, data.lon, 5);
        setHistoricalData(results);
      } catch (error) {
        console.error('Failed to load historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistoricalData();
  }, [data.lat, data.lon]);

  const convertTemp = (temp: number) => {
    return temperatureUnit === 'C' ? temp : Math.round(temp * 9 / 5 + 32);
  };

  const getTempDiff = (historicalTemp: number) => {
    const diff = data.temperature - historicalTemp;
    return diff;
  };

  const getDiffIcon = (diff: number) => {
    if (diff > 2) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (diff < -2) return <TrendingDown className="w-4 h-4 text-blue-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getDiffColor = (diff: number) => {
    if (diff > 2) return 'text-red-500';
    if (diff < -2) return 'text-blue-500';
    return 'text-gray-500';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Historical Weather
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{data.city}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Current weather summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Today</div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {convertTemp(data.temperature)}°{temperatureUnit}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">{data.condition}</span>
              </div>
              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                <div>H: {convertTemp(data.forecast[0]?.maxTemp || 0)}°</div>
                <div>L: {convertTemp(data.forecast[0]?.minTemp || 0)}°</div>
              </div>
            </div>
          </div>

          {/* Historical data */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-500">Loading historical data...</span>
            </div>
          ) : historicalData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No historical data available for this location.
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This day in previous years
              </h3>
              {historicalData.map((item, index) => {
                const tempDiff = getTempDiff(item.data.avgTemp);
                return (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.year}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(item.data.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {convertTemp(item.data.avgTemp)}°{temperatureUnit}
                          </span>
                          <div className="flex items-center gap-1">
                            {getDiffIcon(tempDiff)}
                            <span className={cn("text-sm", getDiffColor(tempDiff))}>
                              {tempDiff > 0 ? '+' : ''}{convertTemp(tempDiff)}°
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.data.condition}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>H: {convertTemp(item.data.maxTemp)}°</span>
                      <span>L: {convertTemp(item.data.minTemp)}°</span>
                      <span>Precip: {item.data.precipitation}mm</span>
                      <span>Wind: {item.data.windSpeed} km/h</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Temperature trend */}
          {!loading && historicalData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature Trend
              </h3>
              <div className="h-20 flex items-end gap-1">
                {historicalData.slice().reverse().map((item, index) => {
                  const maxHeight = 80;
                  const temps = historicalData.map(d => d.data.avgTemp);
                  const minT = Math.min(...temps, data.temperature);
                  const maxT = Math.max(...temps, data.temperature);
                  const range = maxT - minT || 1;
                  const height = ((item.data.avgTemp - minT) / range) * maxHeight;
                  
                  return (
                    <div key={item.year} className="flex-1 flex flex-col items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="w-full bg-blue-400 dark:bg-blue-500 rounded-t"
                        title={`${item.year}: ${convertTemp(item.data.avgTemp)}°`}
                      />
                      <span className="text-xs text-gray-400 mt-1">{item.year}</span>
                    </div>
                  );
                })}
                {/* Current year */}
                <div className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ 
                      height: ((data.temperature - Math.min(...historicalData.map(d => d.data.avgTemp), data.temperature)) / 
                               (Math.max(...historicalData.map(d => d.data.avgTemp), data.temperature) - 
                                Math.min(...historicalData.map(d => d.data.avgTemp), data.temperature) || 1)) * 80 
                    }}
                    transition={{ delay: historicalData.length * 0.1, duration: 0.5 }}
                    className="w-full bg-green-500 rounded-t"
                    title={`Now: ${convertTemp(data.temperature)}°`}
                  />
                  <span className="text-xs text-green-500 font-medium mt-1">Now</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};
