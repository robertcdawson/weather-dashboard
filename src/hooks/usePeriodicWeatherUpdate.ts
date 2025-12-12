import { useEffect, useCallback } from 'react';
import { useWeatherStore } from '../store/useWeatherStore';
import { fetchWeatherData } from '../api/weather';

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 5000;

export function usePeriodicWeatherUpdate() {
  const locations = useWeatherStore((state) => state.locations);
  const updateWeatherData = useWeatherStore((state) => state.updateWeatherData);

  const updateAllLocations = useCallback(async (isMounted: boolean) => {
    let retryCount = 0;
    let retryDelay = INITIAL_RETRY_DELAY;

    while (retryCount < MAX_RETRIES) {
      try {
        if (!isMounted) return;

        // Update locations sequentially to respect rate limits
        for (const location of locations) {
          try {
            if (!isMounted) break;
            const data = await fetchWeatherData(location);
            if (!isMounted) break;
            updateWeatherData(location.id, data);
          } catch (error) {
            console.error(`Error updating weather for ${location.city}:`, error);
            // Continue with next location even if one fails
            continue;
          }
        }
        break; // Success, exit loop
      } catch (error) {
        retryCount++;
        if (retryCount === MAX_RETRIES) {
          console.error('Max retries reached for weather update:', error);
          break;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Double the delay for next retry
      }
    }
  }, [locations, updateWeatherData]);

  useEffect(() => {
    let isMounted = true;

    // Initial update
    updateAllLocations(isMounted);

    // Set up periodic updates
    const intervalId = setInterval(() => updateAllLocations(isMounted), UPDATE_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [updateAllLocations]);
} 