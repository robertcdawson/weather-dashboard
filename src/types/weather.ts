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

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
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
  windDirectionDegrees: number;
  aqi: number;
  aqiDescription: string;
  lat: number;
  lon: number;
  humidity: number;
  pressure: number;
  alerts: WeatherAlert[];
  hasSevereAlert: boolean;
  sunrise: string;
  sunset: string;
  uvIndex: number;
  uvIndexMax: number;
  isDay: boolean;
  hourlyForecast: HourlyForecast[];
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    precipitationProbability: number;
    windGustsMax: number;
    sunrise: string;
    sunset: string;
    uvIndexMax: number;
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