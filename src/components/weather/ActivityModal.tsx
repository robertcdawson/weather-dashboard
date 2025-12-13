import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { WeatherData } from '../../types/weather';
import { getActivityRecommendations, ActivityScore } from '../../utils/activityRecommendations';
import { cn } from '../../utils/cn';

interface ActivityModalProps {
  data: WeatherData;
  onClose: () => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({ data, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const activities = getActivityRecommendations(data);

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score > 0) return 'Poor';
    return 'Not Recommended';
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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Activity Recommendations
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{data.city}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.activity}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{activity.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {activity.activity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      activity.score >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" :
                      activity.score >= 60 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" :
                      activity.score >= 40 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300" :
                      "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                    )}>
                      {getScoreLabel(activity.score)}
                    </span>
                  </div>
                </div>
                
                {/* Score bar */}
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activity.score}%` }}
                    transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                    className={cn("h-full rounded-full", getScoreColor(activity.score))}
                  />
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {activity.recommendation}
                </p>
              </motion.div>
            ))}
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
