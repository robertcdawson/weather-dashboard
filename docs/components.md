# Component Documentation

## Core Components

### WeatherCard
The main wrapper component for displaying weather information. Features an interactive 3D flip card design using Framer Motion.

```typescript
interface WeatherCardProps {
  data: WeatherData;
  onRemove: () => void;
  onRefresh: () => void;
}
```

**Features:**
- 3D flip animation on click (rotateY transform)
- Perspective-based 3D effect
- Hover scale animation
- Delegates to CardFront and CardBack subcomponents

**Usage:**
```tsx
<WeatherCard
  data={weatherData}
  onRemove={() => removeLocation(id)}
  onRefresh={() => fetchWeatherData(location)}
/>
```

---

### CardFront
Displays the summary weather view with dynamic gradient backgrounds based on weather conditions.

```typescript
interface CardFrontProps {
  data: WeatherData;
}
```

**Features:**
- Dynamic gradient backgrounds (clear sky → blue, rain → slate, snow → light, thunderstorm → purple)
- City name with state/country
- Large temperature display with high/low
- Weather condition text and icon
- Favorite star toggle button
- Weather alert indicator badge (animated pulse)
- Weather-specific decorative animations (rain, snow)

**Weather Themes:**
| Condition | Gradient |
|-----------|----------|
| Clear sky | sky-400 → blue-600 |
| Partly cloudy | blue-400 → blue-600 |
| Overcast | slate-500 → slate-700 |
| Rain | blue-700 → slate-800 |
| Snow | slate-100 → blue-100 (light bg) |
| Thunderstorm | slate-800 → purple-900 |

---

### CardBack
Displays detailed weather metrics and action buttons.

```typescript
interface CardBackProps {
  data: WeatherData;
  onRefresh: () => void;
  onRemove: () => void;
  cardPosition: { top: number; left: number; width: number; height: number };
}
```

**Features:**
- "Feels like" temperature
- Wind speed (km/h or mph based on unit preference) and direction
- Humidity percentage
- Air Quality Index with color-coded badge
- Weather Insights button → opens WeatherInsightsModal
- 7-Day Forecast button → opens ForecastModal
- Refresh and Remove action buttons

---

### Header
App header with global controls.

```typescript
interface HeaderProps {
  isDarkMode: boolean | null;
  onDarkModeToggle: () => void;
  showOnlyFavorites: boolean;
  onShowOnlyFavoritesToggle: () => void;
}
```

**Features:**
- "Weather Dashboard" title
- Favorites filter toggle (star icon)
- Temperature unit toggle (°C/°F)
- Dark mode toggle (sun/moon icons)

---

### LocationSearch
Search component with autocomplete and geolocation support.

```typescript
interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
}
```

**Features:**
- Text input with search icon
- Real-time autocomplete suggestions from geocoding API
- Keyboard navigation (Arrow Up/Down, Enter, Escape)
- "Use current location" button with geolocation API
- Duplicate location detection (within 5km radius)
- Error display for invalid locations

---

### WeatherIcon
Condition-based weather icon component using Lucide React icons.

```typescript
interface WeatherIconProps {
  condition: string;
  className?: string;
}
```

**Icon Mapping:**
| Condition | Icon |
|-----------|------|
| Clear sky, Sunny | Sun |
| Mainly clear, Partly cloudy | CloudSun |
| Overcast | Cloud |
| Fog | CloudFog |
| Drizzle | CloudDrizzle |
| Rain, Showers | CloudRain |
| Snow | CloudSnow |
| Heavy snow | Snowflake |
| Thunderstorm | CloudLightning |
| Thunderstorm + hail | CloudHail |

---

## Modal Components

### ForecastModal
7-day weather forecast in a portal-based modal.

```typescript
interface ForecastModalProps {
  forecast: Array<{ date: string; maxTemp: number; minTemp: number; condition: string }>;
  temperatureUnit: string;
  onClose: () => void;
  cardPosition: { top: number; left: number; width: number; height: number };
}
```

**Features:**
- Positioned relative to card using cardPosition
- Animated entry/exit with Framer Motion
- Daily forecast items with weather icons
- Temperature unit conversion
- Escape key and click-outside to close

---

### WeatherAlertModal
Displays active weather alerts for a location.

**Features:**
- Severity-based styling (extreme → red, severe → orange, moderate → yellow)
- Alert message with type and time context
- Portal-rendered for proper z-index

---

### WeatherInsightsModal
AI-like weather insights and recommendations.

**Features:**
- Weather trend analysis (warming/cooling/steady)
- Clothing suggestions based on temperature and conditions
- Best time to travel recommendations
- Condition-aware advice (rain gear, sunscreen, etc.)

---

## UI Components

### AnimatedButton
Reusable button with Framer Motion animations.

```typescript
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

**Variants:**
- `primary`: Blue gradient with shadow
- `secondary`: Gray (adapts to dark mode)
- `danger`: Red tones

**Animations:**
- Hover: translateY(-2px)
- Tap: scale(0.95)

---

## Types

### Location
```typescript
interface Location {
  id: string;
  city: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  region?: string;
}
```

### WeatherData
```typescript
interface WeatherData {
  id: string;
  city: string;
  state?: string;
  country: string;
  temperature: number;        // Celsius from API
  condition: string;          // WMO code description
  feelsLike: number;
  windSpeed: number;          // km/h from API
  windGust: number;
  windDirection: string;      // N, NE, E, SE, S, SW, W, NW
  aqi: number;                // European AQI (0-100+)
  aqiDescription: string;     // Good, Fair, Moderate, Poor, Very Poor
  lat: number;
  lon: number;
  humidity: number;           // percentage
  alerts: WeatherAlert[];
  hasSevereAlert: boolean;
  forecast: ForecastDay[];
}
```

### WeatherAlert
```typescript
type AlertSeverity = 'extreme' | 'severe' | 'moderate' | 'advisory';

interface WeatherAlert {
  message: string;
  severity: AlertSeverity;
  type: string;               // temperature, condition, wind, humidity, precipitation
  timeContext?: string;       // current, upcoming
}
```

---

## State Management (Zustand)

The `useWeatherStore` hook provides global state:

```typescript
interface WeatherStore {
  // State
  locations: Location[];
  weatherData: Record<string, WeatherData>;
  temperatureUnit: 'C' | 'F';
  isDarkMode: boolean | null;
  favorites: string[];
  showOnlyFavorites: boolean;
  
  // Actions
  addLocation: (location: Location) => void;
  removeLocation: (id: string) => void;
  updateWeatherData: (id: string, data: WeatherData) => void;
  toggleTemperatureUnit: () => void;
  toggleDarkMode: () => void;
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
}
```

State is automatically persisted to localStorage via Zustand's `persist` middleware.
