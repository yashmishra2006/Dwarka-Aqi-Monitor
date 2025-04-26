import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface PollutantCardProps {
  name: string;
  value: number;
  unit: string;
  trend?: 'increasing' | 'decreasing' | 'stable';
  threshold?: number;
  info?: string;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({
  name,
  value,
  unit,
  trend,
  threshold,
  info,
}) => {
  const isAboveThreshold = threshold !== undefined && value > threshold;
  
  const getPollutantColor = () => {
    if (isAboveThreshold) {
      return 'text-red-600';
    }
    return 'text-gray-900';
  };
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className={`h-4 w-4 ${isAboveThreshold ? 'text-red-500' : 'text-amber-500'}`} />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="card p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{name}</h3>
          <div className="mt-1 flex items-baseline">
            <p className={`text-2xl font-semibold ${getPollutantColor()}`}>{value}</p>
            <p className="ml-1 text-sm text-gray-500">{unit}</p>
          </div>
        </div>
        
        {isAboveThreshold && (
          <div className="rounded-full bg-red-100 p-1">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
        )}
        
        {!isAboveThreshold && trend && (
          <div className="rounded-full bg-gray-100 p-1">
            {getTrendIcon()}
          </div>
        )}
      </div>
      
      {info && (
        <div className="mt-3">
          <p className="text-xs text-gray-500">{info}</p>
        </div>
      )}
      
      {trend && (
        <div className="mt-2 flex items-center text-xs">
          {getTrendIcon()}
          <span className="ml-1 text-gray-500">
            {trend === 'increasing' ? 'Increasing' : trend === 'decreasing' ? 'Decreasing' : 'Stable'}
          </span>
        </div>
      )}
    </div>
  );
};