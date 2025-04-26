import React from 'react';
import { AqiCategory } from '../types';

interface AqiGaugeProps {
  value: number;
  category: AqiCategory;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const AqiGauge: React.FC<AqiGaugeProps> = ({ 
  value, 
  category, 
  size = 'md',
  showLabel = true 
}) => {
  const getRotation = () => {
    // Map AQI from 0-500 to 0-180 degrees
    const rotation = Math.min(180, (value / 500) * 180);
    return `rotate(${rotation}deg)`;
  };
  
  const getCategoryLabel = () => {
    switch (category) {
      case 'good':
        return 'Good';
      case 'moderate':
        return 'Moderate';
      case 'sensitive':
        return 'Unhealthy for Sensitive Groups';
      case 'unhealthy':
        return 'Unhealthy';
      case 'very-unhealthy':
        return 'Very Unhealthy';
      case 'hazardous':
        return 'Hazardous';
      default:
        return '';
    }
  };
  
  const getCategoryColor = () => {
    switch (category) {
      case 'good':
        return 'bg-aqi-good';
      case 'moderate':
        return 'bg-aqi-moderate';
      case 'sensitive':
        return 'bg-aqi-sensitive';
      case 'unhealthy':
        return 'bg-aqi-unhealthy';
      case 'very-unhealthy':
        return 'bg-aqi-very-unhealthy';
      case 'hazardous':
        return 'bg-aqi-hazardous';
      default:
        return 'bg-gray-300';
    }
  };
  
  const getGaugeSize = () => {
    switch (size) {
      case 'sm':
        return 'w-24 h-12';
      case 'md':
        return 'w-32 h-16';
      case 'lg':
        return 'w-40 h-20';
      default:
        return 'w-32 h-16';
    }
  };
  
  const getValueSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xl';
      case 'md':
        return 'text-3xl';
      case 'lg':
        return 'text-4xl';
      default:
        return 'text-3xl';
    }
  };
  
  const getLabelSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${getGaugeSize()} overflow-hidden`}>
        {/* Gauge background */}
        <div className="absolute inset-0 bg-gray-200 rounded-t-full"></div>
        
        {/* Gauge sections */}
        <div className="absolute inset-0">
          <div className="h-full w-full flex">
            <div className="w-1/6 h-full bg-aqi-good rounded-tl-full"></div>
            <div className="w-1/6 h-full bg-aqi-moderate"></div>
            <div className="w-1/6 h-full bg-aqi-sensitive"></div>
            <div className="w-1/6 h-full bg-aqi-unhealthy"></div>
            <div className="w-1/6 h-full bg-aqi-very-unhealthy"></div>
            <div className="w-1/6 h-full bg-aqi-hazardous rounded-tr-full"></div>
          </div>
        </div>
        
        {/* Gauge needle */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 origin-bottom" style={{ transform: `translateX(-50%) ${getRotation()}` }}>
          <div className="w-0.5 h-full bg-gray-800"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-gray-800 -mt-1 -ml-1"></div>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <div className={`font-bold ${getValueSize()}`}>{value}</div>
        {showLabel && (
          <div className={`flex items-center justify-center mt-1 ${getLabelSize()}`}>
            <div className={`w-2 h-2 rounded-full ${getCategoryColor()} mr-1.5`}></div>
            <span className="text-gray-700">{getCategoryLabel()}</span>
          </div>
        )}
      </div>
    </div>
  );
};