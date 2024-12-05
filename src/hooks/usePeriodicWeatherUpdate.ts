import { useEffect, useRef } from 'react';
import { useWeatherStore } from '../store/useWeatherStore';
import { fetchWeatherData } from '../api/weather';

const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export function usePeriodicWeatherUpdate() {
  const locations = useWeatherStore((state) => state.locations);
  const updateWeatherData = useWeatherStore((state) => state.updateWeatherData);
  const temperatureUnit = useWeatherStore((state) => state.temperatureUnit);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userActiveRef = useRef(true);

  useEffect(() => {
    // Function to update weather for all locations
    const updateAllLocations = async () => {
      if (!userActiveRef.current) return;

      for (const location of locations) {
        try {
          const data = await fetchWeatherData(location, temperatureUnit);
          updateWeatherData(location.id, data);
        } catch (error) {
          console.error(`Failed to update weather for ${location.city}:`, error);
        }
      }
    };

    // Set up user activity tracking
    const handleUserActivity = () => {
      userActiveRef.current = true;
      document.addEventListener('mousemove', resetInactivityTimer);
      document.addEventListener('keypress', resetInactivityTimer);
    };

    const resetInactivityTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, UPDATE_INTERVAL);
    };

    // Initial update
    if (locations.length > 0) {
      updateAllLocations();
    }

    // Set up interval for hourly updates
    const intervalId = setInterval(() => {
      if (locations.length > 0) {
        updateAllLocations();
      }
    }, UPDATE_INTERVAL);

    // Set up activity listeners
    handleUserActivity();
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keypress', handleUserActivity);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keypress', handleUserActivity);
    };
  }, [locations, updateWeatherData, temperatureUnit]);
} 