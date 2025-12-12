import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import { useWeatherStore } from '../store/useWeatherStore';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in Vite
// Import marker icons locally instead of using CDN
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Delete default icon
delete (Icon.Default.prototype as any)._getIconUrl;

// Set up the default icon
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface WeatherMapProps {
  className?: string;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({ className }) => {
  const locations = useWeatherStore((state) => state.locations);
  const weatherData = useWeatherStore((state) => state.weatherData);
  const isFavorite = useWeatherStore((state) => state.isFavorite);
  const isDarkMode = useWeatherStore((state) => state.isDarkMode);

  // Calculate bounds to fit all markers
  const bounds = useMemo(() => {
    if (locations.length === 0) return null;

    const latLngs = locations.map(loc => new LatLng(loc.lat, loc.lon));
    return new LatLngBounds(latLngs);
  }, [locations]);

  // Default center if no locations
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;

  // Choose tile layer based on dark mode
  const tileLayer = isDarkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileLayerAttribution = isDarkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className={className}>
      <MapContainer
        center={locations.length > 0 ? [locations[0].lat, locations[0].lon] : defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full rounded-xl shadow-lg"
        style={{ minHeight: '400px' }}
        bounds={bounds || undefined}
      >
        <TileLayer
          attribution={tileLayerAttribution}
          url={tileLayer}
        />
        {locations.map((location) => {
          const data = weatherData[location.id];
          return (
            <Marker
              key={location.id}
              position={[location.lat, location.lon]}
            >
              <Popup className="weather-popup">
                <div className="p-2">
                  <h3 className="font-semibold text-lg">
                    {location.city}
                    {isFavorite(location.id) && (
                      <span className="ml-2 text-yellow-500">★</span>
                    )}
                  </h3>
                  {location.state && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {location.state}, {location.country}
                    </p>
                  )}
                  {data && (
                    <>
                      <p className="text-lg font-medium mt-2">{data.temperature}°</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{data.condition}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <p>Humidity: {data.humidity}%</p>
                        <p>Wind: {data.windSpeed} mph</p>
                      </div>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}; 