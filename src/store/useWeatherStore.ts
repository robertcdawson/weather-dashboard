import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeatherData, Location } from '../types/weather';

interface WeatherStore {
  locations: Location[];
  weatherData: Record<string, WeatherData>;
  temperatureUnit: 'C' | 'F';
  isDarkMode: boolean | null;
  favorites: string[];
  showOnlyFavorites: boolean;
  addLocation: (location: Location) => void;
  removeLocation: (id: string) => void;
  updateWeatherData: (id: string, data: WeatherData) => void;
  toggleTemperatureUnit: () => void;
  toggleDarkMode: () => void;
  toggleShowOnlyFavorites: () => void;
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      locations: [],
      weatherData: {},
      temperatureUnit: 'F',
      isDarkMode: null,
      favorites: [],
      showOnlyFavorites: false,

      addLocation: (location) =>
        set((state) => ({
          locations: [...state.locations, location],
        })),

      removeLocation: (id) =>
        set((state) => ({
          locations: state.locations.filter((loc) => loc.id !== id),
          weatherData: Object.fromEntries(
            Object.entries(state.weatherData).filter(([key]) => key !== id)
          ),
          favorites: state.favorites.filter((favId) => favId !== id),
        })),

      updateWeatherData: (id, data) =>
        set((state) => ({
          weatherData: { ...state.weatherData, [id]: data },
        })),

      toggleTemperatureUnit: () =>
        set((state) => ({
          temperatureUnit: state.temperatureUnit === 'C' ? 'F' : 'C',
        })),

      toggleDarkMode: () =>
        set((state) => ({
          isDarkMode: state.isDarkMode === null ? true : !state.isDarkMode,
        })),

      toggleShowOnlyFavorites: () =>
        set((state) => ({
          showOnlyFavorites: !state.showOnlyFavorites,
        })),

      addToFavorites: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites
            : [...state.favorites, id],
        })),

      removeFromFavorites: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((favId) => favId !== id),
        })),

      isFavorite: (id) => get().favorites.includes(id),
    }),
    {
      name: 'weather-storage',
    }
  )
);