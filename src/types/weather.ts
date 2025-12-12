export interface Location {
  id: string;
  city: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  region?: string;
}

export type AlertSeverity = 'extreme' | 'severe' | 'moderate' | 'advisory';

export interface WeatherAlert {
  message: string;
  severity: AlertSeverity;
  type: string;
  timeContext?: string;
}

export interface WeatherData {
  id: string;
  city: string;
  state?: string;
  country: string;
  temperature: number;
  condition: string;
  feelsLike: number;
  windSpeed: number;
  windGust: number;
  windDirection: string;
  aqi: number;
  aqiDescription: string;
  lat: number;
  lon: number;
  humidity: number;
  alerts: WeatherAlert[];
  hasSevereAlert: boolean;
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    precipitationProbability: number;
    windGustsMax: number;
  }>;
}

export interface SavedLocation {
  id: string;
  city: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  region?: string;
}