import React from 'react';
import { useAqi } from '../context/AqiContext';
import { AlertTriangle, FileText, Calendar, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const WeeklyReport: React.FC = () => {
  const { report, isLoading, error } = useAqi();
  
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
  
  if (isLoading || !report) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading weekly report...</p>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMMM d, yyyy');
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly AQI Report</h2>
          <p className="mt-1 text-sm text-gray-500">
            Detailed analysis for the week of {formatDate(report.weekStarting)} to {formatDate(report.weekEnding)}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <button className="btn btn-primary flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Download Report
          </button>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900">Weekly Summary</h3>
        </div>
        
        <div className="prose prose-sm max-w-none text-gray-700">
          <p>{report.summary}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Factors Affecting Air Quality</h3>
          <ul className="space-y-3">
            {report.factors.map((factor, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full text-primary-700 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="ml-3 text-gray-700">{factor}</p>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
          <ul className="space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-secondary-100 rounded-full text-secondary-700 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="ml-3 text-gray-700">{recommendation}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-5">Trend Analysis</h3>
        <div className="prose prose-sm max-w-none text-gray-700">
          <p>{report.trendAnalysis}</p>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-5">Pollutant Breakdown</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pollutant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maximum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(report.pollutantBreakdown).map(([pollutant, data]) => (
                <tr key={pollutant} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pollutant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.average}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.max}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {getTrendIcon(data.trend)}
                      <span className="ml-1.5">
                        {data.trend.charAt(0).toUpperCase() + data.trend.slice(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h3 className="text-blue-800 text-lg font-medium mb-2">Analysis Methodology</h3>
        <p className="text-blue-700 text-sm">
          This report combines real-time AQI data with advanced machine learning models to analyze trends and identify key factors affecting air quality. The analysis includes correlation with meteorological data, traffic patterns, and industrial activities to provide a comprehensive understanding of air quality dynamics in Dwarka.
        </p>
      </div>
    </div>
  );
};