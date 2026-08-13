'use client';

interface WeatherWidgetProps {
  city?: string;
}

export function WeatherWidget({ city = 'Екатеринбург' }: WeatherWidgetProps) {
  const weather = {
    temp: 24,
    condition: 'Солнечно',
    humidity: 55,
    wind: 3.2,
    feelsLike: 26,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Погода в {city}</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-gray-900">{weather.temp}°C</span>
            <span className="text-gray-500">{weather.condition}</span>
          </div>
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>Ощущается как {weather.feelsLike}°C</span>
            <span>Влажность: {weather.humidity}%</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Ветер: {weather.wind} м/с
          </div>
        </div>
        <div className="text-4xl">☀️</div>
      </div>
    </div>
  );
}
