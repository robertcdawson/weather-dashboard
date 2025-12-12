import { WeatherData, Location, WeatherAlert, AlertSeverity } from '../types/weather';
import { weatherRateLimiter, airQualityRateLimiter } from '../utils/rateLimiter';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

interface WeatherResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    is_day: number;
    weather_code: number;
    relative_humidity_2m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
    wind_gusts_10m_max: number[];
  };
}

const WMO_CODES: Record<number, { day: string; night: string }> = {
  0: { day: 'Clear sky', night: 'Clear sky' },
  1: { day: 'Mainly clear', night: 'Mainly clear' },
  2: { day: 'Partly cloudy', night: 'Partly cloudy' },
  3: { day: 'Overcast', night: 'Overcast' },
  45: { day: 'Foggy', night: 'Foggy' },
  48: { day: 'Depositing rime fog', night: 'Depositing rime fog' },
  51: { day: 'Light drizzle', night: 'Light drizzle' },
  53: { day: 'Moderate drizzle', night: 'Moderate drizzle' },
  55: { day: 'Dense drizzle', night: 'Dense drizzle' },
  56: { day: 'Light freezing drizzle', night: 'Light freezing drizzle' },
  57: { day: 'Dense freezing drizzle', night: 'Dense freezing drizzle' },
  61: { day: 'Slight rain', night: 'Slight rain' },
  63: { day: 'Moderate rain', night: 'Moderate rain' },
  65: { day: 'Heavy rain', night: 'Heavy rain' },
  66: { day: 'Light freezing rain', night: 'Light freezing rain' },
  67: { day: 'Heavy freezing rain', night: 'Heavy freezing rain' },
  71: { day: 'Slight snow fall', night: 'Slight snow fall' },
  73: { day: 'Moderate snow fall', night: 'Moderate snow fall' },
  75: { day: 'Heavy snow fall', night: 'Heavy snow fall' },
  77: { day: 'Snow grains', night: 'Snow grains' },
  80: { day: 'Slight rain showers', night: 'Slight rain showers' },
  81: { day: 'Moderate rain showers', night: 'Moderate rain showers' },
  82: { day: 'Violent rain showers', night: 'Violent rain showers' },
  85: { day: 'Slight snow showers', night: 'Slight snow showers' },
  86: { day: 'Heavy snow showers', night: 'Heavy snow showers' },
  95: { day: 'Thunderstorm', night: 'Thunderstorm' },
  96: { day: 'Thunderstorm with slight hail', night: 'Thunderstorm with slight hail' },
  99: { day: 'Thunderstorm with heavy hail', night: 'Thunderstorm with heavy hail' },
};



// Severe weather thresholds with expanded conditions
const SEVERE_WEATHER_THRESHOLDS = {
  WIND_GUST_KMH: { moderate: 40, severe: 50, extreme: 70 }, // km/h
  WIND_GUST_MPH: { moderate: 25, severe: 31, extreme: 43 }, // mph
  WIND_SPEED_KMH: { moderate: 25, severe: 30, extreme: 45 }, // km/h
  WIND_SPEED_MPH: { moderate: 15, severe: 19, extreme: 28 }, // mph
  PRECIPITATION_PROBABILITY: { moderate: 60, severe: 70, extreme: 90 }, // percentage
  TEMPERATURE_C: { cold: 0, veryCold: -10, hot: 30, veryHot: 35 }, // Celsius
  TEMPERATURE_F: { cold: 32, veryCold: 14, hot: 86, veryHot: 95 }, // Fahrenheit
  HUMIDITY: { high: 80, veryHigh: 90 }, // percentage
  SEVERE_WEATHER_CODES: {
    extreme: [95, 96, 99], // Thunderstorms with hail
    severe: [75, 82, 86], // Heavy snow, violent rain
    moderate: [65, 67, 71, 73, 77, 85], // Heavy rain, snow
    advisory: [45, 48, 51, 53, 55, 56, 57, 61, 63, 66, 80, 81] // Various conditions
  }
};

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

interface RateLimiter {
  acquireToken(): Promise<void>;
}

async function fetchWithRateLimit(url: string, rateLimiter: RateLimiter): Promise<Response> {
  try {
    await rateLimiter.acquireToken();
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        // If we still hit rate limit, wait longer and retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchWithRateLimit(url, rateLimiter);
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API request failed: ${error.message}`);
    }
    throw error;
  }
}

async function fetchAirQuality(lat: number, lon: number) {
  try {
    const response = await fetchWithRateLimit(
      `${AIR_QUALITY_API_URL}?latitude=${lat}&longitude=${lon}&current=european_aqi`,
      airQualityRateLimiter
    );
    const data = await response.json();

    const aqi = data.current?.european_aqi;
    if (typeof aqi !== 'number') {
      throw new Error('Invalid AQI data');
    }

    return {
      aqi,
      aqiDescription: getAQIDescription(aqi)
    };
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return {
      aqi: -1,
      aqiDescription: 'Unavailable'
    };
  }
}

function getAQIDescription(aqi: number): string {
  if (aqi <= 20) return 'Good';
  if (aqi <= 40) return 'Fair';
  if (aqi <= 60) return 'Moderate';
  if (aqi <= 80) return 'Poor';
  if (aqi <= 100) return 'Very Poor';
  return 'Extremely Poor';
}

// Function to check if weather conditions are severe
function isSevereWeather(data: WeatherResponse, temperatureUnit: string): {
  isSevere: boolean;
  alerts: WeatherAlert[]
} {
  const alerts: WeatherAlert[] = [];
  const isImperial = temperatureUnit === 'F';
  const temp = isImperial ? (data.current.temperature_2m * 9 / 5 + 32) : data.current.temperature_2m;
  const thresholds = isImperial ?
    SEVERE_WEATHER_THRESHOLDS.TEMPERATURE_F :
    SEVERE_WEATHER_THRESHOLDS.TEMPERATURE_C;

  // Temperature-based alerts
  if (temp <= thresholds.veryCold) {
    alerts.push({
      message: `Extreme cold temperature of ${Math.round(temp)}°${temperatureUnit}`,
      severity: 'extreme',
      type: 'temperature',
      timeContext: 'current'
    });
  } else if (temp <= thresholds.cold) {
    alerts.push({
      message: `Cold temperature of ${Math.round(temp)}°${temperatureUnit}`,
      severity: 'moderate',
      type: 'temperature',
      timeContext: 'current'
    });
  } else if (temp >= thresholds.veryHot) {
    alerts.push({
      message: `Extreme heat of ${Math.round(temp)}°${temperatureUnit}`,
      severity: 'extreme',
      type: 'temperature',
      timeContext: 'current'
    });
  } else if (temp >= thresholds.hot) {
    alerts.push({
      message: `High temperature of ${Math.round(temp)}°${temperatureUnit}`,
      severity: 'moderate',
      type: 'temperature',
      timeContext: 'current'
    });
  }

  // Weather condition alerts
  const weatherCode = data.current.weather_code;
  if (SEVERE_WEATHER_THRESHOLDS.SEVERE_WEATHER_CODES.extreme.includes(weatherCode)) {
    alerts.push({
      message: WMO_CODES[weatherCode].day,
      severity: 'extreme',
      type: 'condition',
      timeContext: 'current'
    });
  } else if (SEVERE_WEATHER_THRESHOLDS.SEVERE_WEATHER_CODES.severe.includes(weatherCode)) {
    alerts.push({
      message: WMO_CODES[weatherCode].day,
      severity: 'severe',
      type: 'condition',
      timeContext: 'current'
    });
  } else if (SEVERE_WEATHER_THRESHOLDS.SEVERE_WEATHER_CODES.moderate.includes(weatherCode)) {
    alerts.push({
      message: WMO_CODES[weatherCode].day,
      severity: 'moderate',
      type: 'condition',
      timeContext: 'current'
    });
  } else if (SEVERE_WEATHER_THRESHOLDS.SEVERE_WEATHER_CODES.advisory.includes(weatherCode)) {
    alerts.push({
      message: WMO_CODES[weatherCode].day,
      severity: 'advisory',
      type: 'condition',
      timeContext: 'current'
    });
  }

  // Wind alerts
  const windGustThresholds = isImperial ?
    SEVERE_WEATHER_THRESHOLDS.WIND_GUST_MPH :
    SEVERE_WEATHER_THRESHOLDS.WIND_GUST_KMH;
  const windSpeedThresholds = isImperial ?
    SEVERE_WEATHER_THRESHOLDS.WIND_SPEED_MPH :
    SEVERE_WEATHER_THRESHOLDS.WIND_SPEED_KMH;

  const windGustSpeed = isImperial ? data.current.wind_gusts_10m * 0.621371 : data.current.wind_gusts_10m;
  const windSpeed = isImperial ? data.current.wind_speed_10m * 0.621371 : data.current.wind_speed_10m;
  const unit = isImperial ? 'mph' : 'km/h';

  if (windGustSpeed >= windGustThresholds.extreme) {
    alerts.push({
      message: `Dangerous wind gusts of ${Math.round(windGustSpeed)} ${unit}`,
      severity: 'extreme',
      type: 'wind',
      timeContext: 'current'
    });
  } else if (windGustSpeed >= windGustThresholds.severe) {
    alerts.push({
      message: `Strong wind gusts of ${Math.round(windGustSpeed)} ${unit}`,
      severity: 'severe',
      type: 'wind',
      timeContext: 'current'
    });
  } else if (windGustSpeed >= windGustThresholds.moderate) {
    alerts.push({
      message: `Moderate wind gusts of ${Math.round(windGustSpeed)} ${unit}`,
      severity: 'moderate',
      type: 'wind',
      timeContext: 'current'
    });
  }

  // Humidity alerts
  if (data.current.relative_humidity_2m >= SEVERE_WEATHER_THRESHOLDS.HUMIDITY.veryHigh) {
    alerts.push({
      message: `Very high humidity of ${data.current.relative_humidity_2m}%`,
      severity: 'severe',
      type: 'humidity',
      timeContext: 'current'
    });
  } else if (data.current.relative_humidity_2m >= SEVERE_WEATHER_THRESHOLDS.HUMIDITY.high) {
    alerts.push({
      message: `High humidity of ${data.current.relative_humidity_2m}%`,
      severity: 'moderate',
      type: 'humidity',
      timeContext: 'current'
    });
  }

  // Precipitation probability alerts
  const precipProb = data.daily.precipitation_probability_max[0];
  if (precipProb >= SEVERE_WEATHER_THRESHOLDS.PRECIPITATION_PROBABILITY.extreme) {
    alerts.push({
      message: `Very high precipitation probability of ${precipProb}%`,
      severity: 'severe',
      type: 'precipitation',
      timeContext: 'upcoming'
    });
  } else if (precipProb >= SEVERE_WEATHER_THRESHOLDS.PRECIPITATION_PROBABILITY.severe) {
    alerts.push({
      message: `High precipitation probability of ${precipProb}%`,
      severity: 'moderate',
      type: 'precipitation',
      timeContext: 'upcoming'
    });
  }

  // Sort alerts by severity
  const severityOrder: Record<AlertSeverity, number> = {
    extreme: 0,
    severe: 1,
    moderate: 2,
    advisory: 3
  };

  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    isSevere: alerts.length > 0,
    alerts
  };
}

function getCondition(code: number, isDay: number) {
  const conditions = WMO_CODES[code] || WMO_CODES[0];
  return isDay ? conditions.day : conditions.night;
}

export async function fetchWeatherData(location: Location, temperatureUnit: string = 'C'): Promise<WeatherData> {
  try {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 6);

    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const [weatherResponse, airQuality] = await Promise.all([
      fetchWithRateLimit(
        `${WEATHER_API_URL}?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,is_day,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,wind_gusts_10m_max&timezone=auto&start_date=${startDateStr}&end_date=${endDateStr}`,
        weatherRateLimiter
      ),
      fetchAirQuality(location.lat, location.lon)
    ]);

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Weather API error:', errorText);
      throw new Error('Failed to fetch weather data');
    }

    const data: WeatherResponse = await weatherResponse.json();
    const current = data.current;

    if (!data.daily?.time ||
      !data.daily?.temperature_2m_max ||
      !data.daily?.temperature_2m_min ||
      !data.daily?.weather_code) {
      console.error('Missing daily forecast data:', data.daily);
      throw new Error('Daily forecast data is missing or invalid');
    }

    const currentCondition = getCondition(current.weather_code, current.is_day);
    const severityCheck = isSevereWeather(data, temperatureUnit);

    const forecast = data.daily.time.map((date, index) => ({
      date,
      maxTemp: Math.round(data.daily.temperature_2m_max[index]),
      minTemp: Math.round(data.daily.temperature_2m_min[index]),
      condition: WMO_CODES[data.daily.weather_code[index]]?.day || 'Clear sky',
      precipitationProbability: data.daily.precipitation_probability_max[index],
      windGustsMax: Math.round(data.daily.wind_gusts_10m_max[index])
    }));

    return {
      id: location.id,
      city: location.city,
      state: location.state,
      country: location.country,
      temperature: Math.round(current.temperature_2m),
      condition: currentCondition,
      feelsLike: Math.round(current.apparent_temperature),
      windSpeed: Math.round(current.wind_speed_10m),
      windGust: Math.round(current.wind_gusts_10m),
      windDirection: getWindDirection(current.wind_direction_10m),
      aqi: airQuality.aqi,
      aqiDescription: airQuality.aqiDescription,
      lat: location.lat,
      lon: location.lon,
      forecast: forecast,
      humidity: Math.round(current.relative_humidity_2m),
      alerts: severityCheck.alerts,
      hasSevereAlert: severityCheck.isSevere
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}