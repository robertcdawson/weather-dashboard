import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Bell, Thermometer, Wind, Gauge } from 'lucide-react';
import { useWeatherStore, WindSpeedUnit, PressureUnit } from '../store/useWeatherStore';
import { requestNotificationPermission } from '../utils/notifications';
import { cn } from '../utils/cn';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const {
    temperatureUnit,
    windSpeedUnit,
    pressureUnit,
    notificationsEnabled,
    toggleTemperatureUnit,
    setWindSpeedUnit,
    setPressureUnit,
    setNotificationsEnabled,
  } = useWeatherStore();

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

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
    } else {
      setNotificationsEnabled(false);
    }
  };

  const windSpeedOptions: { value: WindSpeedUnit; label: string }[] = [
    { value: 'kmh', label: 'km/h' },
    { value: 'mph', label: 'mph' },
    { value: 'ms', label: 'm/s' },
    { value: 'knots', label: 'knots' },
  ];

  const pressureOptions: { value: PressureUnit; label: string }[] = [
    { value: 'hPa', label: 'hPa' },
    { value: 'inHg', label: 'inHg' },
    { value: 'mmHg', label: 'mmHg' },
  ];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Temperature Unit */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => temperatureUnit !== 'C' && toggleTemperatureUnit()}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                  temperatureUnit === 'C'
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                Celsius (°C)
              </button>
              <button
                onClick={() => temperatureUnit !== 'F' && toggleTemperatureUnit()}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                  temperatureUnit === 'F'
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Wind Speed Unit */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wind Speed</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {windSpeedOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setWindSpeedUnit(option.value)}
                  className={cn(
                    "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                    windSpeedUnit === option.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pressure Unit */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pressure</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {pressureOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPressureUnit(option.value)}
                  className={cn(
                    "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                    pressureUnit === option.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weather Alerts
                </span>
              </div>
              <button
                onClick={handleNotificationToggle}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  notificationsEnabled ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    notificationsEnabled ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
              Receive notifications for severe weather alerts
            </p>
          </div>
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
