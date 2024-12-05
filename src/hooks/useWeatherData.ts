import { useWeatherStore } from '../store/useWeatherStore';
import { Location, WeatherData } from '../types/weather';
import { fetchWeatherData } from '../api/weather';

export const useWeatherData = () => {
  const {
    locations,
    weatherData,
    addLocation,
    removeLocation: removeLocationFromStore,
    updateWeatherData,
  } = useWeatherStore();

  const getWeatherData = async (location: Location) => {
    try {
      const data = await fetchWeatherData(location);

      if (!locations.find(loc => loc.id === location.id)) {
        if (location.city === 'Current Location') {
          addLocation({
            ...location,
            city: data.city,
            state: data.state,
            country: data.country
          });
        } else {
          addLocation(location);
        }
      }

      updateWeatherData(location.id, data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // You might want to show an error message to the user here
    }
  };

  const removeLocation = (id: string) => {
    removeLocationFromStore(id);
  };

  return {
    weatherData,
    fetchWeatherData: getWeatherData,
    removeLocation,
  };
};