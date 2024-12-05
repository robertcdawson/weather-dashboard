# Architecture Overview

## Core Technologies
- React 18 with TypeScript
- Zustand for state management
- Tailwind CSS for styling
- Open-Meteo API integration

## Project Structure
/src
├── api/          # API integration layer
│   ├── weather.ts    # Weather API integration
│   └── geocoding.ts  # Location search API
├── components/   # React components
│   ├── weather/      # Weather-specific components
│   ├── Header.tsx    # App header component
│   ├── LocationSearch.tsx  # Location search
│   └── WeatherCard.tsx    # Main weather card
├── hooks/        # Custom React hooks
│   ├── useWeatherData.ts  # Weather data fetching
│   └── useLocationSearch.ts # Location search logic
├── store/        # Zustand store definitions
│   └── useWeatherStore.ts # Global state management
├── types/        # TypeScript types/interfaces
│   └── weather.ts  # Weather-related types
└── utils/        # Utility functions
    └── cn.ts     # Tailwind class merging utility

## Key Design Decisions

### State Management
- Zustand for global state
- Persistent storage for user preferences
- Immutable state updates
- TypeScript type safety

### Component Architecture
- Functional components only
- Custom hooks for logic separation
- Atomic design principles
- Proper prop typing

### Styling Strategy
- Tailwind CSS for all styling
- Dark mode support
- Mobile-first responsive design
- Consistent spacing system

### API Integration
- Open-Meteo API for weather data
- Geocoding API for location search
- Error handling and rate limiting
- Response caching

### Performance Considerations
- Component memoization
- Lazy loading where appropriate
- Error boundaries
- Optimized re-renders

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance