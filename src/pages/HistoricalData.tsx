import React, { useState } from 'react';
import { useAqi } from '../context/AqiContext';
import { AqiChart } from '../components/AqiChart';
import { AlertTriangle, BarChart2, Calendar } from 'lucide-react';

export const HistoricalData: React.FC = () => {
  const { weeklyData, locations, selectedLocation, setSelectedLocation, isLoading, error } = useAqi();
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
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
  
  if (isLoading || !weeklyData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading historical data...</p>
        </div>
      </div>
    );
  }
  
  const handleChangeChartType = (type: 'line' | 'bar') => {
    setChartType(type);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historical AQI Data</h2>
          <p className="mt-1 text-sm text-gray-500">
            View historical air quality data for different locations in Dwarka
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
            <button 
              onClick={() => handleChangeChartType('line')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                chartType === 'line' 
                  ? 'bg-white shadow-sm text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Line
            </button>
            <button 
              onClick={() => handleChangeChartType('bar')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                chartType === 'bar' 
                  ? 'bg-white shadow-sm text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bar
            </button>
          </div>
          
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Weekly AQI Trend: {weeklyData.startDate} to {weeklyData.endDate}
          </h3>
        </div>
        
        {weeklyData.locations[selectedLocation]?.length > 0 ? (
          <AqiChart 
            data={weeklyData.locations[selectedLocation]} 
            type={chartType}
            height={400}
          />
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            No data available for {selectedLocation}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart2 className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-medium text-gray-900">Average AQI by Location</h3>
          </div>
          
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {locations.map((location) => {
                const avgAqi = weeklyData.averages[location] || 0;
                const width = `${Math.min(100, (avgAqi / 300) * 100)}%`;
                
                return (
                  <li key={location} className="py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{location}</p>
                      <p className={`text-sm font-semibold ${
                        avgAqi <= 50 ? 'text-green-600' :
                        avgAqi <= 100 ? 'text-yellow-600' :
                        avgAqi <= 150 ? 'text-orange-600' :
                        avgAqi <= 200 ? 'text-red-600' :
                        avgAqi <= 300 ? 'text-purple-600' : 'text-red-900'
                      }`}>{avgAqi}</p>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          avgAqi <= 50 ? 'bg-aqi-good' :
                          avgAqi <= 100 ? 'bg-aqi-moderate' :
                          avgAqi <= 150 ? 'bg-aqi-sensitive' :
                          avgAqi <= 200 ? 'bg-aqi-unhealthy' :
                          avgAqi <= 300 ? 'bg-aqi-very-unhealthy' : 'bg-aqi-hazardous'
                        }`} 
                        style={{ width }}
                      ></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location Analysis</h3>
          
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-4">
              Data shows significant variations in air quality across different sectors of Dwarka. 
              The following patterns emerge from our analysis:
            </p>
            
            <ul className="space-y-2">
              <li>
                <strong>Dwarka Sector 1:</strong> Shows moderate AQI levels with occasional spikes during morning rush hours. Proximity to arterial roads contributes to higher pollutant levels.
              </li>
              <li>
                <strong>Dwarka Sector 8:</strong> Experiences higher pollution levels due to ongoing construction activities and moderate traffic congestion.
              </li>
              <li>
                <strong>Dwarka Sector 12:</strong> Consistently records the highest AQI readings, influenced by industrial emissions from neighboring areas and dense traffic.
              </li>
              <li>
                <strong>Dwarka Sector 21:</strong> Shows the best air quality among monitored locations, benefiting from more green spaces and distance from major traffic corridors.
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Interpreting the Data</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-base font-medium text-gray-800 mb-2">Understanding AQI Values</h4>
            <p className="text-sm text-gray-600">
              The Air Quality Index (AQI) is a standardized indicator for reporting air quality. It indicates how clean or polluted the air is and what associated health effects might be of concern.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-base font-medium text-gray-800 mb-2">Data Collection</h4>
            <p className="text-sm text-gray-600">
              The data is collected using a network of air quality monitoring stations located throughout Dwarka. Each station measures a variety of pollutants including PM2.5, PM10, O3, NO2, SO2, and CO.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-base font-medium text-gray-800 mb-2">Data Limitations</h4>
            <p className="text-sm text-gray-600">
              While we strive for accuracy, air quality data may be influenced by temporary local events, sensor calibration, and atmospheric conditions. Long-term trends are more reliable than individual data points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};