import React from 'react';
import { Thermometer, Droplets, Wind } from 'lucide-react';

interface WeatherInfoProps {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
}

export const WeatherInfo: React.FC<WeatherInfoProps> = ({
  temperature,
  humidity,
  windSpeed,
  windDirection,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h3 className="text-base font-medium text-gray-900 mb-3">Weather Conditions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center">
          <div className="bg-blue-50 p-2 rounded-full">
            <Thermometer className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Temperature</p>
            <p className="text-base font-semibold text-gray-900">{temperature.toFixed(1)}°C</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-blue-50 p-2 rounded-full">
            <Droplets className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Humidity</p>
            <p className="text-base font-semibold text-gray-900">{humidity.toFixed(0)}%</p>
          </div>
        </div>
        
        <div className="flex items-center col-span-2">
          <div className="bg-blue-50 p-2 rounded-full">
            <Wind className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Wind</p>
            <p className="text-base font-semibold text-gray-900">
              {windSpeed.toFixed(1)} m/s from {windDirection}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};