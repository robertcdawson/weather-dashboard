# Weather Dashboard - Project Requirements

A responsive web app that displays weather conditions for user-specified cities using a multi-column card layout.

## Implementation Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| Free weather API | ✅ Done | Open-Meteo (no API key needed) |
| City search with autocomplete | ✅ Done | Open-Meteo Geocoding API |
| Persist city list & preferences | ✅ Done | Zustand with localStorage |
| Light/dark mode | ✅ Done | System preference detection |
| Mobile-first responsive | ✅ Done | 1/2/3 column grid |
| Error handling | ✅ Done | API errors, duplicate locations |
| Interactive flip cards | ✅ Done | Framer Motion 3D animation |
| Temperature unit toggle | ✅ Done | °C/°F with persistence |
| AQI display | ✅ Done | European AQI with colors |
| Card flip animation | ✅ Done | Smooth 3D transform |
| Refresh button | ✅ Done | Per-card refresh |

## Additional Features Implemented

- **Favorites System**: Star locations to mark as favorites, filter view
- **7-Day Forecast**: Modal with daily high/low temps and conditions
- **Weather Alerts**: Automatic alerts for extreme temperatures, wind, humidity
- **Weather Insights**: Clothing suggestions, travel recommendations
- **Current Location**: Geolocation API to add current position
- **Periodic Auto-Refresh**: Weather data updates every 5 minutes
- **Rate Limiting**: Prevents API abuse with sliding window algorithm
- **20+ Weather Conditions**: Full WMO code support with appropriate icons

## Card Design

### Front (Summary View)
- City, state, country display
- Large current temperature (°C or °F)
- High/Low temperatures for today
- Weather condition text and icon
- Dynamic gradient background based on condition
- Favorite star toggle
- Weather alert badge (if applicable)

### Back (Detailed View)
- "Feels like" temperature
- Wind speed (km/h or mph) and direction
- Humidity percentage
- Air Quality Index with color-coded badge
- Weather Insights button
- 7-Day Forecast button
- Refresh and Remove buttons

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **State**: Zustand with persist middleware
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **APIs**: 
  - Open-Meteo Weather API
  - Open-Meteo Air Quality API
  - Open-Meteo Geocoding API
  - Nominatim (reverse geocoding)

## Responsive Breakpoints

| Screen | Columns | Card Width |
|--------|---------|------------|
| Mobile | 1 | Full width |
| Tablet (md) | 2 | max-w-[360px] |
| Desktop (lg) | 3 | max-w-[360px] |

---

## Original Requirements (for reference)

### General Requirements

1. Use a free weather API (like Open-Meteo) to fetch weather data.
2. Allow users to input and save a list of cities or ZIP codes. Use autocomplete suggestions to populate the location field accurately.
3. Persist the user's city list and preferences (e.g., temperature units) using local storage or a database.
4. Include light/dark mode support.
5. Ensure responsiveness for mobile, tablet, and desktop. Use a mobile-first design approach.
6. Implement error handling:
   - If an API request fails, show an error message like, "Could not fetch weather data for this location. Please try again later."
   - Handle invalid user input gracefully (e.g., unsupported ZIP codes).

### Card Design

**Front (Summary View):**
- Show the city, state, and country (in shortest form, e.g., "New York, NY, USA").
- Display the current temperature in the user's preferred unit (°C or °F).
- Include a brief weather condition (e.g., "Sunny," "Light Rain").

**Back (Detailed View):**
- Show the "feels like" temperature.
- Display wind speed and direction (e.g., "10 mph NE").
- Include the Air Quality Index (AQI) with a simple descriptor (e.g., "45 - Good"), using a suitable API if available.

### UI/UX Features

1. **Interactive Cards**: Cards should be tappable (mobile) or clickable (desktop) to flip between front and back views.
2. **Add/Remove Cities**: Provide an input field for users to add cities, with autocomplete suggestions. Allow users to delete cities from the list.
3. **Dynamic Layout**: Use a multi-column grid for desktop (3 columns), 2 columns for tablets, and 1 column for mobile.
4. **Customization**: Allow users to toggle temperature units between °C and °F. Persist this preference.

### Enhancements (Optional)

1. ✅ Animate the card flip transition for smoother interaction.
2. ✅ Use color coding for AQI or weather severity.
3. ✅ Provide a refresh button for each card to manually update weather data.
