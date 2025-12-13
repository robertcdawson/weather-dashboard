import { WeatherData, WeatherAlert } from '../types/weather';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendWeatherNotification(
  location: string,
  alert: WeatherAlert
): void {
  if (Notification.permission !== 'granted') return;

  const severityEmoji: Record<string, string> = {
    extreme: '🚨',
    severe: '⚠️',
    moderate: '⚡',
    advisory: 'ℹ️',
  };

  const emoji = severityEmoji[alert.severity] || '🌤️';
  
  new Notification(`${emoji} Weather Alert - ${location}`, {
    body: alert.message,
    icon: '/vite.svg',
    tag: `weather-alert-${location}-${alert.type}`,
    requireInteraction: alert.severity === 'extreme' || alert.severity === 'severe',
  });
}

export function sendSevereWeatherNotifications(
  weatherData: Record<string, WeatherData>,
  previousAlerts: Record<string, string[]>
): Record<string, string[]> {
  const newAlerts: Record<string, string[]> = {};

  Object.values(weatherData).forEach((data) => {
    if (!data.hasSevereAlert) return;

    const locationKey = data.id;
    const prevAlertMessages = previousAlerts[locationKey] || [];
    newAlerts[locationKey] = [];

    data.alerts
      .filter(alert => alert.severity === 'extreme' || alert.severity === 'severe')
      .forEach((alert) => {
        newAlerts[locationKey].push(alert.message);
        
        // Only send notification if it's a new alert
        if (!prevAlertMessages.includes(alert.message)) {
          sendWeatherNotification(data.city, alert);
        }
      });
  });

  return newAlerts;
}

export function sendMorningWeatherSummary(
  weatherData: Record<string, WeatherData>
): void {
  if (Notification.permission !== 'granted') return;

  const locations = Object.values(weatherData);
  if (locations.length === 0) return;

  const summaries = locations.slice(0, 3).map((data) => {
    return `${data.city}: ${data.temperature}°C, ${data.condition}`;
  }).join(' | ');

  new Notification('☀️ Morning Weather Summary', {
    body: summaries,
    icon: '/vite.svg',
    tag: 'morning-summary',
  });
}
