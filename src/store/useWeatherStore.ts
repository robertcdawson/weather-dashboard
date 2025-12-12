import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeatherData, Location } from '../types/weather';

interface WeatherState {
  locations: Location[];
  weatherData: Record<string, WeatherData>;
  temperatureUnit: 'C' | 'F';
  isDarkMode: boolean | null;
  favorites: string[];
  showOnlyFavorites: boolean;
  locationOrder: string[];
  sortByFavorites: boolean;
}

interface WeatherStore extends WeatherState {
  addLocation: (location: Location) => void;
  removeLocation: (id: string) => void;
  updateWeatherData: (id: string, data: WeatherData) => void;
  toggleTemperatureUnit: () => void;
  toggleDarkMode: () => void;
  toggleShowOnlyFavorites: () => void;
  toggleSortByFavorites: () => void;
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  reorderLocations: (startIndex: number, endIndex: number) => void;
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
      locationOrder: [],
      sortByFavorites: false,

      addLocation: (location) =>
        set((state) => {
          const newLocations = [...state.locations, location];
          const newOrder = [...state.locationOrder, location.id];
          return {
            locations: newLocations,
            locationOrder: newOrder,
          };
        }),

      removeLocation: (id) =>
        set((state) => ({
          locations: state.locations.filter((loc) => loc.id !== id),
          weatherData: Object.fromEntries(
            Object.entries(state.weatherData).filter(([key]) => key !== id)
          ),
          favorites: state.favorites.filter((favId) => favId !== id),
          locationOrder: state.locationOrder.filter((locId) => locId !== id),
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

      toggleSortByFavorites: () =>
        set((state) => ({
          sortByFavorites: !state.sortByFavorites,
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

      reorderLocations: (startIndex: number, endIndex: number) =>
        set((state) => {
          const newOrder = [...state.locationOrder];
          const [removed] = newOrder.splice(startIndex, 1);
          newOrder.splice(endIndex, 0, removed);
          return { locationOrder: newOrder };
        }),
    }),
    {
      name: 'weather-storage',
    }
  )
);