# Component Documentation

## WeatherCard
The main component for displaying weather information. Features an interactive flip card design with summary information on the front and detailed weather data on the back.

### Props
```typescript
interface WeatherCardProps {
  data: WeatherData;
  onRemove: () => void;
  onRefresh: () => void;
}
```

### Usage
```tsx
<WeatherCard
  data={weatherData}
  onRemove={() => handleRemove()}
  onRefresh={() => handleRefresh()}
/>
```

### Features
- Interactive flip card animation
- Front side displays:
  - City name with state/country
  - Current temperature
  - Weather condition with icon
- Back side displays:
  - "Feels like" temperature
  - Wind speed and direction
  - Air quality index (AQI)
  - Refresh and remove buttons

### Subcomponents
- `CardFront`: Displays summary weather information
- `CardBack`: Shows detailed weather metrics and card actions

### State
- Uses Zustand store for temperature unit preferences
- Local state for card flip animation

### Styling
- Responsive design using Tailwind CSS
- Dark mode support
- Smooth flip transition animations

## Header
Navigation and controls component displaying the app title and global settings.

### Props
```typescript
interface HeaderProps {
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
}
```

### Features
- App title display
- Temperature unit toggle (°C/°F)
- Dark mode toggle with icon

## LocationSearch
Search component for finding and adding new locations.

### Props
```typescript
interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
}
```

### Features
- Autocomplete location search
- Integration with geocoding API
- Error handling for invalid searches

## WeatherIcon
Component for displaying weather condition icons.

### Props
```typescript
interface WeatherIconProps {
  condition: string;
  className?: string;
}
```

### Features
- Condition-based icon selection
- Uses Lucide React icons
- Customizable size through className

## Implementation Details

### State Management
All components integrate with the Zustand store (`useWeatherStore`) for:
- Location management
- Weather data
- Temperature unit preference
- Dark mode setting

### API Integration
Components interact with two main APIs:
- Open-Meteo API for weather data
- Geocoding API for location search

### Error Handling
- Graceful error display for API failures
- Loading states during data fetching
- Fallback UI for missing data

### Accessibility
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly content
- Proper heading hierarchy

### Performance
- Memoization where appropriate
- Optimized re-renders
- Lazy loading for larger components

### Responsive Design
- Mobile-first approach
- Fluid typography
- Adaptive layouts
- Touch-friendly interactions
