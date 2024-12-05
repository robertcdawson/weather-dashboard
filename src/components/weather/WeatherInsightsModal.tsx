import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { buttonStyles, cn } from "../../utils/styles";

interface WeatherInsightsModalProps {
  trend: string;
  clothing: string[];
  bestTimeToTravel: string;
  onClose: () => void;
  cardPosition: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export const WeatherInsightsModal: React.FC<WeatherInsightsModalProps> = ({
  trend,
  clothing,
  bestTimeToTravel,
  onClose,
  cardPosition,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState({
    x: window.scrollX,
    y: window.scrollY
  });

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
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Weather Insights
          </h3>

          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Temperature Trend</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{trend}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-medium text-gray-700 dark:text-gray-300">What to Wear</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{clothing}</p>
            </motion.div>

            {bestTimeToTravel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Best Time to Travel</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{bestTimeToTravel}</p>
              </motion.div>
            )}
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