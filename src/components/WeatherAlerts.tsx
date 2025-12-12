function WeatherAlerts() {
  // ...
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {alerts.map((alert) => (
        <button
          key={alert.id}
          onClick={() => handleAlertClick(alert)}
          className="w-full text-left"
        >
          <AlertCard
            alert={alert}
          />
        </button>
      ))}
    </div>
  );
} 