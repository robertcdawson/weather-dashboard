import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherIcon } from './WeatherIcon';
import { cn } from '../../utils/cn';
import { buttonStyles } from '../../utils/styles';

interface ForecastModalProps {
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
  }>;
  temperatureUnit: string;
  onClose: () => void;
  cardPosition: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export const ForecastModal: React.FC<ForecastModalProps> = ({
  forecast = [],
  temperatureUnit,
  onClose,
  cardPosition
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState({
    x: window.scrollX,
    y: window.scrollY
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset({
        x: window.scrollX,
        y: window.scrollY
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  const convertTemp = (temp: number) => {
    return temperatureUnit === 'C' ? temp : Math.round(temp * 9 / 5 + 32);
  };

  const modalStyle = {
    position: 'fixed' as const,
    top: `${cardPosition.top - scrollOffset.y}px`,
    left: `${cardPosition.left - scrollOffset.x}px`,
    width: `${cardPosition.width}px`,
    height: `${cardPosition.height}px`,
    transform: 'translate(0, 0)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const
  };

  if (!Array.isArray(forecast) || forecast.length === 0) {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={handleModalClick}
      >
        <motion.div
          ref={modalRef}
          style={modalStyle}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl w-full h-full flex items-center overflow-hidden"
        >
          <div className="w-full max-h-full overflow-y-auto py-2">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Forecast Unavailable
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Unable to load forecast data. Please try again later.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className={cn(
                buttonStyles.base,
                buttonStyles.hover,
                buttonStyles.focus,
                "mt-6 w-full px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
              )}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>,
      document.body
    );
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleModalClick}
    >
      <motion.div
        ref={modalRef}
        style={modalStyle}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl w-full h-full flex items-center overflow-hidden"
      >
        <div className="w-full max-h-full overflow-y-auto py-2">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            7-Day Forecast
          </h3>

          <div className="space-y-2">
            {forecast.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center space-x-2">
                  <WeatherIcon condition={day.condition} className="w-6 h-6" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(day.date)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {day.condition}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {convertTemp(day.maxTemp)}°
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {convertTemp(day.minTemp)}°
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClose}
            className={cn(
              buttonStyles.base,
              buttonStyles.hover,
              buttonStyles.focus,
              "mt-6 w-full px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
            )}
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}; 