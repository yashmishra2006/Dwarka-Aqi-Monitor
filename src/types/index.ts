export interface AqiData {
  aqi: number;
  timestamp: string;
  location: string;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  category: AqiCategory;
  weather?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
  };
}

export type AqiCategory = 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export interface WeeklyAqiData {
  startDate: string;
  endDate: string;
  locations: {
    [key: string]: DailyAqiData[];
  };
  averages: {
    [key: string]: number;
  };
}

export interface DailyAqiData {
  date: string;
  averageAqi: number;
  maxAqi: number;
  minAqi: number;
  dominantPollutant: string;
  category: AqiCategory;
}

export interface AqiReport {
  id: string;
  weekStarting: string;
  weekEnding: string;
  summary: string;
  factors: string[];
  recommendations: string[];
  trendAnalysis: string;
  pollutantBreakdown: {
    [key: string]: {
      average: number;
      max: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
  };
}

export interface AqiForecast {
  date: string;
  aqi: number;
  category: AqiCategory;
  confidence: number;
}