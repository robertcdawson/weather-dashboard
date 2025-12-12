import { useEffect, useRef, useState } from 'react';
import { WeatherAlert } from '../types/weather';

export function useWeatherAlerts() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const notifiedAlertsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Check if we already have permission
    if (Notification.permission === 'granted') {
      setHasPermission(true);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showAlertNotification = (location: string, alert: WeatherAlert) => {
    if (!hasPermission) return;

    // Create a unique identifier for this alert
    const alertId = `${location}-${alert.type}-${alert.severity}-${alert.message}`;

    // Check if we've already notified about this alert
    if (notifiedAlertsRef.current.has(alertId)) return;

    // Add to notified alerts
    notifiedAlertsRef.current.add(alertId);

    // Create notification
    const notification = new Notification(`Weather Alert: ${location}`, {
      body: alert.message,
      icon: '/weather-icon.png', // You'll need to add this icon to your public folder
      tag: alertId,
      requireInteraction: alert.severity === 'extreme' || alert.severity === 'severe'
    });

    // Clear from notified alerts after 1 hour
    setTimeout(() => {
      notifiedAlertsRef.current.delete(alertId);
    }, 60 * 60 * 1000); // 1 hour

    return notification;
  };

  return {
    hasPermission,
    requestPermission,
    showAlertNotification
  };
} 