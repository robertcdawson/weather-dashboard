# Architecture Overview

## Core Technologies
- React 18 with TypeScript
- Vite 4.x build tool
- Zustand for state management with persistence
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI for accessible primitives
- Lucide React for icons
- Open-Meteo API for weather data
- Nominatim/Open-Meteo Geocoding for location search

## Project Structure
```
/src
├── api/                    # API integration layer
│   ├── weather.ts          # Weather & air quality API
│   └── geocoding.ts        # Location search & reverse geocoding
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   │   ├── AnimatedButton.tsx
│   │   └── Button.tsx
│   ├── weather/            # Weather-specific components
│   │   ├── CardFront.tsx   # Weather card front face
│   │   ├── CardBack.tsx    # Weather card back face (details)
│   │   ├── WeatherIcon.tsx # Condition-based weather icons
│   │   ├── ForecastModal.tsx
│   │   ├── WeatherAlertModal.tsx
│   │   ├── WeatherInsightsModal.tsx
│   │   ├── LocationCard.tsx
│   │   └── LocationsList.tsx
│   ├── Header.tsx          # App header with controls
│   ├── LocationSearch.tsx  # Location search with autocomplete
│   ├── WeatherCard.tsx     # Main flip card wrapper
│   ├── AlertCard.tsx       # Weather alert display
│   ├── WeatherAlerts.tsx   # Alert list component
│   └── WeatherMap.tsx      # Map display component
├── hooks/                  # Custom React hooks
│   ├── useWeatherData.ts   # Weather data fetching & state
│   ├── usePeriodicWeatherUpdate.ts  # Auto-refresh logic
│   ├── useLocationSearch.ts
│   ├── useElementPosition.ts  # Element positioning for modals
│   ├── useWeatherAlerts.ts
│   └── useTemperature.ts   # Temperature unit conversion
├── store/                  # Zustand store definitions
│   └── useWeatherStore.ts  # Global state with localStorage persistence
├── types/                  # TypeScript types/interfaces
│   └── weather.ts          # Location, WeatherData, WeatherAlert types
└── utils/                  # Utility functions
    ├── cn.ts               # Tailwind class merging (clsx + tailwind-merge)
    ├── rateLimiter.ts      # API rate limiting
    ├── weather.ts          # Weather helper functions
    ├── weatherInsights.ts  # AI-like weather insights generation
    └── styles.ts           # Shared style utilities
```

## Key Design Decisions

### State Management
- Zustand with `persist` middleware for localStorage
- Stores: locations, weatherData, temperatureUnit, isDarkMode, favorites
- Immutable state updates with TypeScript type safety
- Selector pattern for optimized re-renders

### Component Architecture
- Functional components with TypeScript
- Custom hooks for logic separation
- Compound component pattern (WeatherCard → CardFront/CardBack)
- Portal-based modals for proper z-index stacking

### Styling Strategy
- Tailwind CSS with custom utilities (3D transforms, backface-visibility)
- Dark mode via class strategy with system preference detection
- Mobile-first responsive design (1/2/3 column grid)
- Framer Motion for card flip and modal animations

### API Integration
- Open-Meteo Weather API (no API key required)
- Open-Meteo Air Quality API (European AQI)
- Nominatim for reverse geocoding (current location)
- Rate limiting with sliding window algorithm
- Automatic retry with exponential backoff

### Weather Features
- 7-day forecast with daily min/max temps
- Weather alerts system (extreme/severe/moderate/advisory)
- Weather insights (clothing suggestions, travel recommendations)
- Support for 20+ WMO weather condition codes
- Air Quality Index with descriptive labels

### Performance Considerations
- Periodic updates every 5 minutes
- Rate limiting to prevent API abuse
- Optimized re-renders via Zustand selectors
- CSS transforms with GPU acceleration

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation (Escape to close modals)
- Focus management in modals
- Color contrast compliance in both themes