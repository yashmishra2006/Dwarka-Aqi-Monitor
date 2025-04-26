import React from 'react';
import { useAqi } from '../context/AqiContext';
import { AqiGauge } from '../components/AqiGauge';
import { AlertTriangle, Calendar, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const Forecast: React.FC = () => {
  const { forecast, selectedLocation, isLoading, error } = useAqi();
  
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
  
  if (isLoading || !forecast) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading forecast data...</p>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'EEEE, MMMM d');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AQI Forecast</h2>
          <p className="mt-1 text-sm text-gray-500">
            5-day air quality forecast for {selectedLocation}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-1 bg-blue-50 rounded-md px-3 py-2 text-blue-700 text-sm">
          <Info className="h-4 w-4 mr-1" />
          Forecast updated daily
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900">5-Day Forecast</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {forecast.map((day) => (
            <div key={day.date} className="card p-4 flex flex-col items-center hover:border-primary-200 transition-colors duration-200">
              <h4 className="text-base font-medium text-gray-900 mb-3">{formatDate(day.date)}</h4>
              
              <AqiGauge value={day.aqi} category={day.category} size="sm" />
              
              <div className="mt-3 text-center">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  day.category === 'good' ? 'bg-aqi-good/20 text-green-800' :
                  day.category === 'moderate' ? 'bg-aqi-moderate/20 text-yellow-800' :
                  day.category === 'sensitive' ? 'bg-aqi-sensitive/20 text-orange-800' :
                  day.category === 'unhealthy' ? 'bg-aqi-unhealthy/20 text-red-800' :
                  day.category === 'very-unhealthy' ? 'bg-aqi-very-unhealthy/20 text-purple-800' : 
                  'bg-aqi-hazardous/20 text-red-900'
                }`}>
                  {day.category === 'good' && 'Good'}
                  {day.category === 'moderate' && 'Moderate'}
                  {day.category === 'sensitive' && 'Unhealthy for Sensitive Groups'}
                  {day.category === 'unhealthy' && 'Unhealthy'}
                  {day.category === 'very-unhealthy' && 'Very Unhealthy'}
                  {day.category === 'hazardous' && 'Hazardous'}
                </div>
                
                <p className="mt-2 text-xs text-gray-500">
                  Confidence: {day.confidence}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Forecast Insights</h3>
          
          <div className="prose prose-sm max-w-none text-gray-700">
            <p>
              The forecast indicates {
                forecast[0].category === 'good' ? 'good air quality' :
                forecast[0].category === 'moderate' ? 'moderate air quality concerns' :
                forecast[0].category === 'sensitive' ? 'potential issues for sensitive groups' :
                forecast[0].category === 'unhealthy' ? 'unhealthy conditions' :
                forecast[0].category === 'very-unhealthy' ? 'significantly unhealthy conditions' : 
                'hazardous air quality'
              } in the coming days, with {
                forecast.some(day => 
                  ['unhealthy', 'very-unhealthy', 'hazardous'].includes(day.category)
                ) ? 'several days of poor air quality expected' : 
                'generally acceptable conditions throughout the period'
              }.
            </p>
            
            <ul className="mt-4 space-y-2">
              <li>
                <strong>Expected pattern:</strong> {
                  forecast.every(day => day.category === forecast[0].category) 
                    ? 'Stable air quality conditions throughout the forecast period.' 
                    : 'Varying air quality conditions with changes likely due to weather patterns and pollution sources.'
                }
              </li>
              <li>
                <strong>Best day:</strong> {
                  formatDate(forecast.reduce((best, current) => 
                    current.aqi < best.aqi ? current : best
                  ).date)
                } is expected to have the best air quality this week.
              </li>
              <li>
                <strong>Worst day:</strong> {
                  formatDate(forecast.reduce((worst, current) => 
                    current.aqi > worst.aqi ? current : worst
                  ).date)
                } may see the highest pollution levels.
              </li>
            </ul>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Planning Recommendations</h3>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-green-800 mb-1">Outdoor Activities</h4>
              <p className="text-xs text-green-700">
                {forecast.every(day => day.category === 'good') 
                  ? 'Excellent conditions for outdoor activities throughout the week.' 
                  : forecast.some(day => ['unhealthy', 'very-unhealthy', 'hazardous'].includes(day.category))
                    ? 'Consider limiting outdoor activities, especially on days with unhealthy AQI levels.'
                    : 'Good to moderate conditions for outdoor activities, with some caution needed for sensitive individuals.'
                }
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Health Precautions</h4>
              <p className="text-xs text-blue-700">
                {forecast.some(day => ['very-unhealthy', 'hazardous'].includes(day.category))
                  ? 'High risk days ahead. Keep medications handy if you have respiratory conditions. Consider using air purifiers indoors.'
                  : forecast.some(day => ['unhealthy', 'sensitive'].includes(day.category))
                    ? 'Moderate risk for sensitive groups. Keep windows closed during peak pollution hours and limit prolonged outdoor exposure.'
                    : 'Low health risk from air pollution. Normal activities can continue as planned.'
                }
              </p>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-amber-800 mb-1">Travel Planning</h4>
              <p className="text-xs text-amber-700">
                {forecast.some(day => ['very-unhealthy', 'hazardous'].includes(day.category))
                  ? 'Consider postponing non-essential travel during days with very unhealthy air quality.'
                  : 'No significant air quality concerns for travel, but check updates before heading out.'
                }
              </p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-purple-800 mb-1">Long-term Outlook</h4>
              <p className="text-xs text-purple-700">
                Current models suggest that air quality conditions may {
                  forecast[forecast.length - 1].aqi < forecast[0].aqi 
                    ? 'improve' 
                    : forecast[forecast.length - 1].aqi > forecast[0].aqi 
                      ? 'deteriorate' 
                      : 'remain stable'
                } beyond the 5-day forecast period. Extended forecasts will be updated as new data becomes available.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">About Our Forecast</h3>
        
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            Our AQI forecasting system combines historical air quality data, current measurements, and advanced meteorological models to predict future air quality conditions.
          </p>
          <p>
            The confidence percentage represents the statistical reliability of each prediction, with higher percentages indicating greater certainty in the forecast. Multiple factors can affect forecast accuracy, including unexpected weather changes, sudden pollution events, and other variables.
          </p>
          <p>
            Forecasts are updated daily with the latest available data to maintain accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};