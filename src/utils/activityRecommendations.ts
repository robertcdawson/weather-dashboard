import { WeatherData } from '../types/weather';

export interface ActivityScore {
  activity: string;
  score: number; // 0-100
  recommendation: string;
  icon: string;
}

export function getActivityRecommendations(data: WeatherData): ActivityScore[] {
  const activities: ActivityScore[] = [];
  
  const temp = data.temperature;
  const humidity = data.humidity;
  const windSpeed = data.windSpeed;
  const condition = data.condition.toLowerCase();
  const uvIndex = data.uvIndex || 0;
  const precipProb = data.forecast[0]?.precipitationProbability || 0;

  const isRainy = condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower');
  const isSnowy = condition.includes('snow');
  const isStormy = condition.includes('thunder');
  const isClear = condition.includes('clear') || condition.includes('sunny');
  const isCloudy = condition.includes('cloudy') || condition.includes('overcast');

  // Running/Jogging
  let runningScore = 100;
  if (temp < 5 || temp > 30) runningScore -= 30;
  else if (temp < 10 || temp > 25) runningScore -= 10;
  if (humidity > 80) runningScore -= 20;
  if (windSpeed > 30) runningScore -= 20;
  if (isRainy) runningScore -= 40;
  if (isStormy) runningScore = 0;
  if (uvIndex > 8) runningScore -= 15;
  
  activities.push({
    activity: 'Running',
    score: Math.max(0, runningScore),
    recommendation: getRunningRecommendation(runningScore, temp, condition),
    icon: '🏃'
  });

  // Cycling
  let cyclingScore = 100;
  if (temp < 5 || temp > 32) cyclingScore -= 30;
  else if (temp < 10 || temp > 28) cyclingScore -= 10;
  if (windSpeed > 25) cyclingScore -= 30;
  if (isRainy) cyclingScore -= 50;
  if (isStormy) cyclingScore = 0;
  if (precipProb > 60) cyclingScore -= 20;

  activities.push({
    activity: 'Cycling',
    score: Math.max(0, cyclingScore),
    recommendation: getCyclingRecommendation(cyclingScore, windSpeed, condition),
    icon: '🚴'
  });

  // Beach/Swimming
  let beachScore = 0;
  if (temp >= 25 && temp <= 35) beachScore = 100;
  else if (temp >= 22 && temp < 25) beachScore = 70;
  else if (temp >= 20 && temp < 22) beachScore = 40;
  if (isRainy || isStormy) beachScore = 0;
  if (isClear && beachScore > 0) beachScore += 10;
  if (uvIndex > 10) beachScore -= 20; // Too much sun
  if (windSpeed > 35) beachScore -= 30;

  activities.push({
    activity: 'Beach',
    score: Math.min(100, Math.max(0, beachScore)),
    recommendation: getBeachRecommendation(beachScore, temp, uvIndex),
    icon: '🏖️'
  });

  // Hiking
  let hikingScore = 100;
  if (temp < 5 || temp > 30) hikingScore -= 25;
  else if (temp >= 15 && temp <= 22) hikingScore += 10;
  if (isRainy) hikingScore -= 40;
  if (isStormy) hikingScore = 0;
  if (humidity > 85) hikingScore -= 20;
  if (precipProb > 50) hikingScore -= 15;

  activities.push({
    activity: 'Hiking',
    score: Math.min(100, Math.max(0, hikingScore)),
    recommendation: getHikingRecommendation(hikingScore, condition, precipProb),
    icon: '🥾'
  });

  // Photography
  let photoScore = 60;
  if (isClear) photoScore = 80;
  if (isCloudy) photoScore = 90; // Soft light is great
  if (condition.includes('fog')) photoScore = 95; // Atmospheric!
  if (isRainy && !isStormy) photoScore = 70; // Can be interesting
  if (isStormy) photoScore = 40;
  // Golden hour conditions
  const now = new Date();
  const hour = now.getHours();
  if ((hour >= 6 && hour <= 8) || (hour >= 17 && hour <= 19)) {
    photoScore += 15;
  }

  activities.push({
    activity: 'Photography',
    score: Math.min(100, Math.max(0, photoScore)),
    recommendation: getPhotoRecommendation(photoScore, condition),
    icon: '📷'
  });

  // Gardening
  let gardeningScore = 80;
  if (temp < 10 || temp > 32) gardeningScore -= 30;
  if (isRainy && !isStormy) gardeningScore = 60; // Light rain is ok
  if (isStormy) gardeningScore = 0;
  if (windSpeed > 30) gardeningScore -= 20;
  if (temp >= 18 && temp <= 25 && !isRainy) gardeningScore = 100;

  activities.push({
    activity: 'Gardening',
    score: Math.max(0, gardeningScore),
    recommendation: getGardeningRecommendation(gardeningScore, temp, condition),
    icon: '🌱'
  });

  // Indoor activities (inverse of outdoor)
  const avgOutdoorScore = activities.reduce((sum, a) => sum + a.score, 0) / activities.length;
  const indoorScore = Math.max(20, 100 - avgOutdoorScore * 0.7);

  activities.push({
    activity: 'Indoor Activities',
    score: Math.round(indoorScore),
    recommendation: getIndoorRecommendation(indoorScore, condition),
    icon: '🏠'
  });

  return activities.sort((a, b) => b.score - a.score);
}

function getRunningRecommendation(score: number, temp: number, condition: string): string {
  if (score >= 80) return 'Perfect conditions for a run!';
  if (score >= 60) return 'Good for running, stay hydrated.';
  if (score >= 40) return 'Consider a shorter run or indoor alternative.';
  if (score > 0) return 'Challenging conditions - take precautions.';
  return 'Not recommended due to weather conditions.';
}

function getCyclingRecommendation(score: number, wind: number, condition: string): string {
  if (score >= 80) return 'Great day for a bike ride!';
  if (score >= 60) return wind > 20 ? 'Watch for wind gusts.' : 'Decent cycling weather.';
  if (score >= 40) return 'Consider indoor cycling today.';
  return 'Poor cycling conditions - stay safe indoors.';
}

function getBeachRecommendation(score: number, temp: number, uv: number): string {
  if (score >= 80) return uv > 6 ? 'Beach day! Apply sunscreen.' : 'Perfect beach weather!';
  if (score >= 60) return 'Warm enough for the beach.';
  if (score >= 40) return 'A bit cool for swimming.';
  return 'Not ideal beach weather today.';
}

function getHikingRecommendation(score: number, condition: string, precipProb: number): string {
  if (score >= 80) return 'Excellent hiking conditions!';
  if (score >= 60) return precipProb > 30 ? 'Pack rain gear just in case.' : 'Good day for a hike.';
  if (score >= 40) return 'Trails may be wet - wear proper footwear.';
  return 'Consider postponing your hike.';
}

function getPhotoRecommendation(score: number, condition: string): string {
  if (condition.includes('fog')) return 'Misty conditions - great for atmospheric shots!';
  if (condition.includes('cloudy')) return 'Soft, diffused light - ideal for portraits.';
  if (score >= 80) return 'Great lighting conditions for photography!';
  if (score >= 60) return 'Decent photo opportunities today.';
  return 'Challenging light - consider indoor photography.';
}

function getGardeningRecommendation(score: number, temp: number, condition: string): string {
  if (score >= 80) return 'Perfect gardening weather!';
  if (score >= 60) return 'Good for light garden work.';
  if (score >= 40) return temp < 15 ? 'A bit cool - dress warmly.' : 'Take breaks in shade.';
  return 'Best to stay indoors today.';
}

function getIndoorRecommendation(score: number, condition: string): string {
  if (score >= 80) return 'Great day to stay cozy indoors!';
  if (score >= 60) return 'Weather is nice, but indoor activities work too.';
  return 'Weather is beautiful - consider going outside!';
}
