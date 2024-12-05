interface WeatherPattern {
  trend: string;
  clothing: string[];
  bestTimeToTravel: string | null;
}

export function getWeatherInsights(
  forecast: Array<{ date: string; maxTemp: number; minTemp: number; condition: string }>,
  currentTemp: number,
  currentCondition: string,
  humidity: number
): WeatherPattern {
  // Convert Celsius to Fahrenheit for consistent temperature handling
  const tempF = (currentTemp * 9 / 5) + 32;

  // Get weather trend
  const getTrend = () => {
    const today = forecast[0];
    const tomorrow = forecast[1];

    if (tomorrow.maxTemp > today.maxTemp + 3) {
      return "Getting warmer tomorrow";
    } else if (tomorrow.maxTemp < today.maxTemp - 3) {
      return "Cooling down tomorrow";
    } else {
      return "Temperature staying steady";
    }
  };

  // Get clothing suggestions
  const getClothingSuggestions = () => {
    const suggestions: string[] = [];

    // Temperature based suggestions (using Fahrenheit internally)
    if (tempF <= 32) {
      suggestions.push("Heavy winter coat", "gloves and hat");
    } else if (tempF <= 50) {
      suggestions.push("Warm jacket", "light gloves");
    } else if (tempF <= 65) {
      suggestions.push("Light jacket or sweater");
    } else if (tempF <= 75) {
      suggestions.push("Light layers", "long sleeves");
    } else if (tempF <= 85) {
      suggestions.push("Light breathable clothing", "short sleeves");
      if (humidity > 70) {
        suggestions.push("moisture-wicking fabrics");
      }
    } else {
      suggestions.push("Very light clothing", "sun protection");
      if (humidity > 70) {
        suggestions.push("moisture-wicking fabrics");
      }
    }

    // Condition based suggestions
    if (currentCondition.includes("rain") || currentCondition.includes("drizzle")) {
      suggestions.push("umbrella", "waterproof shoes");
    }
    if (currentCondition.includes("snow")) {
      suggestions.push("snow boots", "warm socks");
    }
    if (currentCondition.includes("Clear sky") || currentCondition.includes("Sunny") || currentCondition.includes("Overcast")) {
      if (tempF > 75) {
        suggestions.push("sunscreen", "sunglasses");
      }
    }

    // Join all suggestions with proper capitalization
    return [suggestions[0]].concat(suggestions.slice(1).map(s => s.toLowerCase()));
  };

  // Get best time to travel
  const getBestTimeToTravel = () => {
    // Check severe conditions first
    if (currentCondition.includes('Thunderstorm') ||
      currentCondition.includes('Heavy snow fall') ||
      currentCondition.includes('Heavy rain')) {
      return "Consider postponing travel - severe weather conditions";
    }

    // Temperature-based recommendations
    if (tempF < 32) {
      if (forecast[0].maxTemp > 32) {
        return "Travel between 10 AM and 2 PM when temperatures are highest";
      }
      return "Travel during midday when warmer - watch for icy conditions";
    }

    if (tempF > 85 && humidity > 70) {
      return "Travel early morning (6-9 AM) or evening (after 6 PM) to avoid heat stress";
    }

    // Precipitation-based recommendations
    if (currentCondition.includes('rain') || currentCondition.includes('snow')) {
      const improvedCondition = forecast[0].condition;
      if (!improvedCondition.includes('rain') && !improvedCondition.includes('snow')) {
        const timeFrame = tempF < 32 ? "when temperatures rise" : "once precipitation clears";
        return `Consider waiting ${timeFrame} for better conditions`;
      }
    }

    // Default good conditions
    if (tempF >= 45 && tempF <= 75 &&
      !currentCondition.includes('rain') &&
      !currentCondition.includes('snow')) {
      return "Current conditions are ideal for travel";
    }

    return "Current conditions acceptable for travel - exercise normal caution";
  };

  const result = {
    trend: getTrend(),
    clothing: getClothingSuggestions(),
    bestTimeToTravel: getBestTimeToTravel() || "Current conditions acceptable for travel"
  };

  return result;
} 