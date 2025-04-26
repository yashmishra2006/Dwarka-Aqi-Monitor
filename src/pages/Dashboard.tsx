import React from 'react';
import { useAqi } from '../context/AqiContext';
import { AqiGauge } from '../components/AqiGauge';
import { AqiChart } from '../components/AqiChart';
import { PollutantCard } from '../components/PollutantCard';
import { WeatherInfo } from '../components/WeatherInfo';
import { AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { currentAqi, weeklyData, selectedLocation, isLoading, error } = useAqi();
  
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading || !currentAqi) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading air quality data...</p>
        </div>
      </div>
    );
  }
  
  // Get daily data for the current location
  const dailyData = weeklyData?.locations[selectedLocation] || [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Air Quality Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Real-time air quality monitoring for {selectedLocation}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          Last updated: {format(new Date(currentAqi.timestamp), 'MMM d, yyyy h:mm a')}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current AQI</h3>
          <AqiGauge value={currentAqi.aqi} category={currentAqi.category} size="lg" />
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              The air quality is currently{' '}
              <span className="font-medium">
                {currentAqi.category === 'good' && 'Good'}
                {currentAqi.category === 'moderate' && 'Moderate'}
                {currentAqi.category === 'sensitive' && 'Unhealthy for Sensitive Groups'}
                {currentAqi.category === 'unhealthy' && 'Unhealthy'}
                {currentAqi.category === 'very-unhealthy' && 'Very Unhealthy'}
                {currentAqi.category === 'hazardous' && 'Hazardous'}
              </span>
            </p>
          </div>
        </div>
        
        <div className="card p-6 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Trend</h3>
          {dailyData.length > 0 ? (
            <AqiChart data={dailyData} height={230} />
          ) : (
            <div className="h-[230px] flex items-center justify-center text-gray-500">
              No weekly data available
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Pollutant Levels</h3>
          <div className="grid grid-cols-2 gap-4">
            <PollutantCard
              name="PM2.5"
              value={currentAqi.pollutants.pm25}
              unit="μg/m³"
              threshold={35}
              info="Fine particulate matter"
              trend="increasing"
            />
            <PollutantCard
              name="PM10"
              value={currentAqi.pollutants.pm10}
              unit="μg/m³"
              threshold={150}
              info="Coarse particulate matter"
              trend="increasing"
            />
            <PollutantCard
              name="O₃"
              value={currentAqi.pollutants.o3}
              unit="ppb"
              threshold={70}
              info="Ozone"
              trend="stable"
            />
            <PollutantCard
              name="NO₂"
              value={currentAqi.pollutants.no2}
              unit="ppb"
              threshold={100}
              info="Nitrogen dioxide"
              trend="decreasing"
            />
            <PollutantCard
              name="SO₂"
              value={currentAqi.pollutants.so2}
              unit="ppb"
              threshold={75}
              info="Sulfur dioxide"
              trend="stable"
            />
            <PollutantCard
              name="CO"
              value={currentAqi.pollutants.co}
              unit="ppm"
              threshold={9}
              info="Carbon monoxide"
              trend="stable"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Weather Conditions</h3>
            {currentAqi.weather && (
              <WeatherInfo
                temperature={currentAqi.weather.temperature}
                humidity={currentAqi.weather.humidity}
                windSpeed={currentAqi.weather.windSpeed}
                windDirection={currentAqi.weather.windDirection}
              />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Health Recommendations</h3>
            <div className="card p-4">
              <div className="space-y-3">
                {currentAqi.category === 'good' && (
                  <>
                    <p className="text-sm text-gray-700">Air quality is satisfactory, and air pollution poses little or no risk.</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Enjoy outdoor activities</li>
                      <li>Keep windows open for fresh air</li>
                    </ul>
                  </>
                )}
                
                {currentAqi.category === 'moderate' && (
                  <>
                    <p className="text-sm text-gray-700">Air quality is acceptable, but there may be a risk for some people, particularly those who are unusually sensitive to air pollution.</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Consider reducing prolonged outdoor activities if you experience symptoms</li>
                      <li>People with respiratory conditions should monitor their response</li>
                    </ul>
                  </>
                )}
                
                {currentAqi.category === 'sensitive' && (
                  <>
                    <p className="text-sm text-gray-700">Members of sensitive groups may experience health effects. The general public is less likely to be affected.</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>People with respiratory or heart conditions should limit prolonged outdoor activity</li>
                      <li>Consider wearing masks when outdoors for extended periods</li>
                      <li>Keep windows closed during peak pollution hours</li>
                    </ul>
                  </>
                )}
                
                {currentAqi.category === 'unhealthy' && (
                  <>
                    <p className="text-sm text-gray-700">Some members of the general public may experience health effects; members of sensitive groups may experience more serious effects.</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Avoid prolonged outdoor activities</li>
                      <li>Use air purifiers indoors</li>
                      <li>Wear N95 masks when outdoors</li>
                      <li>Keep windows and doors closed</li>
                    </ul>
                  </>
                )}
                
                {currentAqi.category === 'very-unhealthy' && (
                  <>
                    <p className="text-sm text-gray-700">Health alert: everyone may experience more serious health effects.</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Avoid all outdoor physical activities</li>
                      <li>Stay indoors with air purifiers running</li>
                      <li>Wear N95 masks if going outdoors is essential</li>
                      <li>Consider relocating temporarily if possible</li>
                    </ul>
                  </>
                )}
                
                {currentAqi.category === 'hazardous' && (
                  <>
                    <p className="text-sm text-gray-700">Health warning of emergency conditions: everyone is more likely to be affected.</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Remain indoors with windows and doors closed</li>
                      <li>Run multiple air purifiers</li>
                      <li>Avoid all physical activity outdoors</li>
                      <li>Consider evacuation if prolonged exposure is expected</li>
                      <li>Seek medical attention if experiencing symptoms</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};