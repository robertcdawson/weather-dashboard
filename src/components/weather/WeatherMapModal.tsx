import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Layers, Cloud, Thermometer, Wind, Droplets } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WeatherData } from '../../types/weather';
import { cn } from '../../utils/cn';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface WeatherMapModalProps {
  locations: WeatherData[];
  onClose: () => void;
}

type MapLayer = 'precipitation' | 'temperature' | 'wind' | 'clouds' | 'pressure';

const MapLayerControl: React.FC<{ layer: MapLayer; onChange: (layer: MapLayer) => void }> = ({ layer, onChange }) => {
  const layers: { key: MapLayer; label: string; icon: React.ReactNode }[] = [
    { key: 'precipitation', label: 'Precipitation', icon: <Droplets className="w-4 h-4" /> },
    { key: 'clouds', label: 'Clouds', icon: <Cloud className="w-4 h-4" /> },
    { key: 'temperature', label: 'Temperature', icon: <Thermometer className="w-4 h-4" /> },
    { key: 'wind', label: 'Wind', icon: <Wind className="w-4 h-4" /> },
  ];

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
      <div className="flex items-center gap-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
        <Layers className="w-3 h-3" />
        Layers
      </div>
      <div className="flex flex-col gap-1">
        {layers.map((l) => (
          <button
            key={l.key}
            onClick={() => onChange(l.key)}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors",
              layer === l.key
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            )}
          >
            {l.icon}
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const FitBounds: React.FC<{ locations: WeatherData[] }> = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;

    const bounds = L.latLngBounds(
      locations.map((loc) => [loc.lat, loc.lon] as [number, number])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
  }, [locations, map]);

  return null;
};

export const WeatherMapModal: React.FC<WeatherMapModalProps> = ({ locations, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>('precipitation');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // OpenWeatherMap tile layers (free tier)
  const getWeatherTileUrl = (layer: MapLayer) => {
    // Using Open-Meteo or RainViewer as free alternatives
    // RainViewer API for precipitation radar
    const timestamp = Math.floor(Date.now() / 1000);
    
    switch (layer) {
      case 'precipitation':
        return `https://tilecache.rainviewer.com/v2/radar/{z}/{x}/{y}/2/1_1.png`;
      case 'clouds':
        return `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=demo`;
      case 'temperature':
        return `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=demo`;
      case 'wind':
        return `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=demo`;
      default:
        return '';
    }
  };

  const defaultCenter: [number, number] = locations.length > 0
    ? [locations[0].lat, locations[0].lon]
    : [40, -100];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Weather Map</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="relative h-[calc(100%-60px)]">
          <MapContainer
            center={defaultCenter}
            zoom={4}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Weather overlay layer */}
            <TileLayer
              url={getWeatherTileUrl(selectedLayer)}
              opacity={0.6}
            />

            {/* Location markers */}
            {locations.map((location) => (
              <Marker key={location.id} position={[location.lat, location.lon]}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{location.city}</div>
                    <div className="text-gray-600">
                      {location.temperature}°C - {location.condition}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Humidity: {location.humidity}% | Wind: {location.windSpeed} km/h
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            <FitBounds locations={locations} />
          </MapContainer>

          <MapLayerControl layer={selectedLayer} onChange={setSelectedLayer} />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};
