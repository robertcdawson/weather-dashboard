interface AlertCardProps {
  alert: WeatherAlert;
}

function AlertCard({ alert }: AlertCardProps) {
  return (
    <div className="p-4 rounded-lg bg-card hover:bg-card/90 transition-colors">
      {/* Card content */}
    </div>
  );
} 