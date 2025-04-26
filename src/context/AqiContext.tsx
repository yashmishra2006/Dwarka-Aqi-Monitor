import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AqiData, WeeklyAqiData, AqiReport, AqiForecast } from '../types';
import { fetchCurrentAqi, fetchWeeklyAqi, fetchAqiReport, fetchAqiForecast } from '../api/aqiService';

interface AqiContextType {
  currentAqi: AqiData | null;
  weeklyData: WeeklyAqiData | null;
  report: AqiReport | null;
  forecast: AqiForecast[] | null;
  locations: string[];
  selectedLocation: string;
  isLoading: boolean;
  error: string | null;
  setSelectedLocation: (location: string) => void;
  refreshData: () => Promise<void>;
}

const AqiContext = createContext<AqiContextType | undefined>(undefined);

export const AqiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentAqi, setCurrentAqi] = useState<AqiData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyAqiData | null>(null);
  const [report, setReport] = useState<AqiReport | null>(null);
  const [forecast, setForecast] = useState<AqiForecast[] | null>(null);
  const [locations] = useState<string[]>(["Janakpuri", "Vasant Kunj", "Saket", "Mehrauli", "Pushp Vihar", "Rajouri Garden", "Moti Nagar", "Rohini", "Chattarpur", "Tilak Nagar", "Dwarka Sector 8", "Dwarka Sector 10", "Dwarka Sector 21"]);
  const [selectedLocation, setSelectedLocation] = useState<string>('Dwarka Sector 8');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try { 
      const [aqiData, weeklyAqiData, reportData, forecastData] = await Promise.all([
        fetchCurrentAqi(selectedLocation),
        fetchWeeklyAqi(),
        fetchAqiReport(),
        fetchAqiForecast(selectedLocation)
      ]);
      
      setCurrentAqi(aqiData);
      setWeeklyData(weeklyAqiData);
      setReport(reportData);
      setForecast(forecastData);
    } catch (err) {
      setError('Failed to load AQI data. Please try again later.');
      console.error('Error loading AQI data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Refresh data every 30 minutes
    const intervalId = setInterval(loadData, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [selectedLocation]);

  const refreshData = async () => {
    await loadData();
  };

  return (
    <AqiContext.Provider
      value={{
        currentAqi,
        weeklyData,
        report,
        forecast,
        locations,
        selectedLocation,
        isLoading,
        error,
        setSelectedLocation,
        refreshData
      }}
    >
      {children}
    </AqiContext.Provider>
  );
};

export const useAqi = () => {
  const context = useContext(AqiContext);
  if (context === undefined) {
    throw new Error('useAqi must be used within an AqiProvider');
  }
  return context;
};