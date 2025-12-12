import { Location } from '../types/weather';
import { v4 as uuidv4 } from 'uuid';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_GEOCODING_URL = 'https://nominatim.openstreetmap.org/reverse';

// Map of US state names to their GeoNames admin1_id values
const US_STATES: Record<string, number> = {
  'california': 5332921,
  'new york': 5128638,
  'texas': 4736286,
  'florida': 4155751,
  // Add more as needed
};

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  feature_code: string;
  country: string;
  country_code?: string;
  admin1?: string;
  admin1_id?: number;
  timezone?: string;
  population?: number;
  distance?: number;
}

export async function searchLocations(query: string): Promise<Location[]> {
  // Check if query is coordinates (from current location)
  const isCoords = query.includes(',');

  try {
    if (isCoords) {
      // Handle coordinates search (existing code)
      const [lat, lon] = query.split(',').map(coord => parseFloat(coord.trim()));
      const apiUrl = `${REVERSE_GEOCODING_URL}?lat=${lat}&lon=${lon}&format=json`;

      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'WeatherApp/1.0'
        }
      });
      const data = await response.json();

      const city = data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.suburb ||
        'Unknown Location';

      const state = data.address?.state || '';

      return [{
        id: uuidv4(),
        city,
        state,
        country: data.address?.country || 'Unknown',
        lat,
        lon,
        region: state || data.address?.country || 'Other'
      }];
    } else {
      // Check if the query matches a US state
      const stateId = US_STATES[query.toLowerCase()];

      if (stateId) {
        // Search for major cities using multiple queries
        const cityQueries = ['los angeles', 'san francisco', 'san diego', 'sacramento'].map(city =>
          fetch(`${GEOCODING_API_URL}?name=${encodeURIComponent(city)}&language=en&format=json&country=United%20States&count=1`)
            .then(r => r.json())
        );

        const cityResults = await Promise.all(cityQueries);

        if (!Array.isArray(cityResults)) {
          return [];
        }

        return cityResults.flatMap(result => result.results || [])
          .filter((r: GeocodingResult) =>
            r.admin1_id === stateId &&
            (r.feature_code.startsWith('PPL') || r.feature_code === 'PPLA' || r.feature_code === 'PPLA2')
          )
          .sort((a: GeocodingResult, b: GeocodingResult) =>
            (b.population || 0) - (a.population || 0)
          );
      }

      // Fall back to regular search if not a state or no cities found
      const regularUrl = `${GEOCODING_API_URL}?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
      const response = await fetch(regularUrl);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error('No location found');
      }

      return data.results.map((result: GeocodingResult) => ({
        id: uuidv4(),
        city: result.name || 'Unknown Location',
        state: result.admin1 || '',
        country: result.country || 'Unknown',
        lat: result.latitude,
        lon: result.longitude,
        region: result.admin1 || result.country || 'Other'
      }));
    }
  } catch (error) {
    console.error('Error searching locations:', error);
    if (isCoords) {
      const [lat, lon] = query.split(',').map(coord => parseFloat(coord.trim()));
      return [{
        id: uuidv4(),
        city: 'Unknown Location',
        state: '',
        country: 'Current Location',
        lat,
        lon,
        region: 'Current Location'
      }];
    }
    throw error;
  }
}