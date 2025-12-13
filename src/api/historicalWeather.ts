import { weatherRateLimiter } from '../utils/rateLimiter';

const HISTORICAL_API_URL = 'https://archive-api.open-meteo.com/v1/archive';

export interface HistoricalWeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  avgTemp: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
}

interface HistoricalResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    temperature_2m_mean: number[];
    weather_code: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
  };
}

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm',
};

export async function fetchHistoricalWeather(
  lat: number,
  lon: number,
  yearsBack: number = 1
): Promise<HistoricalWeatherData[]> {
  const today = new Date();
  const historicalDate = new Date(today);
  historicalDate.setFullYear(today.getFullYear() - yearsBack);
  
  // Get a 7-day window around this day last year
  const startDate = new Date(historicalDate);
  startDate.setDate(startDate.getDate() - 3);
  const endDate = new Date(historicalDate);
  endDate.setDate(endDate.getDate() + 3);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  try {
    await weatherRateLimiter.acquireToken();
    
    const response = await fetch(
      `${HISTORICAL_API_URL}?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,weather_code,precipitation_sum,wind_speed_10m_max&timezone=auto`
    );

    if (!response.ok) {
      throw new Error(`Historical API error: ${response.status}`);
    }

    const data: HistoricalResponse = await response.json();

    return data.daily.time.map((date, index) => ({
      date,
      maxTemp: Math.round(data.daily.temperature_2m_max[index]),
      minTemp: Math.round(data.daily.temperature_2m_min[index]),
      avgTemp: Math.round(data.daily.temperature_2m_mean[index]),
      condition: WMO_CODES[data.daily.weather_code[index]] || 'Unknown',
      precipitation: Math.round(data.daily.precipitation_sum[index] * 10) / 10,
      windSpeed: Math.round(data.daily.wind_speed_10m_max[index]),
    }));
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    return [];
  }
}

export async function fetchYearlyComparison(
  lat: number,
  lon: number,
  years: number = 5
): Promise<{ year: number; data: HistoricalWeatherData }[]> {
  const results: { year: number; data: HistoricalWeatherData }[] = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  for (let i = 1; i <= years; i++) {
    const targetDate = new Date(today.getFullYear() - i, currentMonth, currentDay);
    const dateStr = targetDate.toISOString().split('T')[0];

    try {
      await weatherRateLimiter.acquireToken();
      
      const response = await fetch(
        `${HISTORICAL_API_URL}?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,weather_code,precipitation_sum,wind_speed_10m_max&timezone=auto`
      );

      if (response.ok) {
        const data: HistoricalResponse = await response.json();
        
        if (data.daily.time.length > 0) {
          results.push({
            year: today.getFullYear() - i,
            data: {
              date: data.daily.time[0],
              maxTemp: Math.round(data.daily.temperature_2m_max[0]),
              minTemp: Math.round(data.daily.temperature_2m_min[0]),
              avgTemp: Math.round(data.daily.temperature_2m_mean[0]),
              condition: WMO_CODES[data.daily.weather_code[0]] || 'Unknown',
              precipitation: Math.round(data.daily.precipitation_sum[0] * 10) / 10,
              windSpeed: Math.round(data.daily.wind_speed_10m_max[0]),
            },
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching data for year ${today.getFullYear() - i}:`, error);
    }
  }

  return results;
}
