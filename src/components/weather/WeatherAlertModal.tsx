import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Clock, Thermometer, Wind, Droplets, Cloud } from 'lucide-react';
import { cn } from '../../utils/cn';

interface WeatherAlert {
  message: string;
  severity: 'extreme' | 'severe' | 'moderate' | 'advisory';
  type: string;
  timeContext?: string;
}

interface WeatherAlertModalProps {
  alerts: WeatherAlert[];
  onClose: () => void;
  position: {
    top: number;
    left: number;
  };
}

const severityConfig = {
  extreme: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-700',
    text: 'text-red-800 dark:text-red-200',
    icon: 'text-red-500'
  },
  severe: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-700',
    text: 'text-amber-800 dark:text-amber-200',
    icon: 'text-amber-500'
  },
  moderate: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-700',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: 'text-yellow-500'
  },
  advisory: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'text-blue-500'
  }
};

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'temperature':
      return <Thermometer className="w-4 h-4" />;
    case 'wind':
      return <Wind className="w-4 h-4" />;
    case 'humidity':
      return <Droplets className="w-4 h-4" />;
    case 'precipitation':
    case 'condition':
      return <Cloud className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

export const WeatherAlertModal: React.FC<WeatherAlertModalProps> = ({
  alerts,
  onClose,
  position,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (modalRef.current) {
      const modalRect = modalRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.left;
      let y = position.top + 40;

      if (x + modalRect.width > viewportWidth) {
        x = viewportWidth - modalRect.width - 20;
      }
      if (x < 20) x = 20;

      if (y + modalRect.height > viewportHeight) {
        y = position.top - modalRect.height - 20;
      }
      if (y < 20) y = 20;

      setModalPosition({ x, y });
    }
  }, [position]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        event.stopPropagation();
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

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      onClick={handleModalClick}
    >
      <motion.div
        ref={modalRef}
        onClick={handleModalClick}
        style={{
          position: 'absolute',
          top: modalPosition.y,
          left: modalPosition.x,
          width: 'auto',
          minWidth: '300px',
          maxWidth: '400px'
        }}
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl pointer-events-auto"
      >
        <div className="flex items-center justify-between mb-4" onClick={handleModalClick}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Weather Alerts
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3" onClick={handleModalClick}>
          {alerts.map((alert, index) => {
            const config = severityConfig[alert.severity];
            return (
              <motion.div
                key={index}
                onClick={handleModalClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-3 rounded-lg border",
                  config.bg,
                  config.border
                )}
              >
                <div className="flex items-start gap-2" onClick={handleModalClick}>
                  <div className={cn("mt-1", config.icon)}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", config.text)}>
                      {alert.message}
                    </p>
                    {alert.timeContext && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className={cn("w-3 h-3", config.icon)} />
                        <span className={cn("text-xs", config.text)}>
                          {alert.timeContext === 'current' ? 'Current conditions' : 'Upcoming conditions'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6" onClick={handleModalClick}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "w-full px-4 py-2 text-sm font-medium rounded-lg",
              "bg-gray-100 dark:bg-gray-700",
              "text-gray-900 dark:text-gray-100",
              "hover:bg-gray-200 dark:hover:bg-gray-600",
              "transition-colors duration-200"
            )}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}; 