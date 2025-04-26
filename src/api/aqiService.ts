import axios from 'axios';
import { AqiData, WeeklyAqiData, AqiReport, AqiForecast, AqiCategory } from '../types';
import { format, subDays, addDays, parseISO } from 'date-fns';

// Dwarka coordinates for different sectors
const LOCATIONS_COORDS = {
  "Janakpuri": { "lat": 28.5894, "lon": 77.0580 },
  "Vasant Kunj": { "lat": 28.5270, "lon": 77.1375 },
  "Saket": { "lat": 28.5260, "lon": 77.1798 },
  "Mehrauli": { "lat": 28.5242, "lon": 77.1867 },
  "Pushp Vihar": { "lat": 28.5285, "lon": 77.1743 },
  "Rajouri Garden": { "lat": 28.6287, "lon": 77.1195 },
  "Moti Nagar": { "lat": 28.6491, "lon": 77.1277 },
  "Rohini": { "lat": 28.7094, "lon": 77.1372 },
  "Chattarpur": { "lat": 28.5270, "lon": 77.1871 },
  "Tilak Nagar": { "lat": 28.5962, "lon": 77.1075 },
  "Dwarka Sector 8": { "lat": 28.5747, "lon": 77.0717 },
  "Dwarka Sector 10": { "lat": 28.5805, "lon": 77.0425 },
  "Dwarka Sector 21": { "lat": 28.5523, "lon": 77.0583 }
}
;

// EPA AQI Breakpoints
const PM25_BREAKPOINTS = [
  { min: 0, max: 12.0, aqi_min: 0, aqi_max: 50 },
  { min: 12.1, max: 35.4, aqi_min: 51, aqi_max: 100 },
  { min: 35.5, max: 55.4, aqi_min: 101, aqi_max: 150 },
  { min: 55.5, max: 150.4, aqi_min: 151, aqi_max: 200 },
  { min: 150.5, max: 250.4, aqi_min: 201, aqi_max: 300 },
  { min: 250.5, max: 500.4, aqi_min: 301, aqi_max: 500 }
];

const PM10_BREAKPOINTS = [
  { min: 0, max: 54, aqi_min: 0, aqi_max: 50 },
  { min: 55, max: 154, aqi_min: 51, aqi_max: 100 },
  { min: 155, max: 254, aqi_min: 101, aqi_max: 150 },
  { min: 255, max: 354, aqi_min: 151, aqi_max: 200 },
  { min: 355, max: 424, aqi_min: 201, aqi_max: 300 },
  { min: 425, max: 604, aqi_min: 301, aqi_max: 500 }
];

const O3_BREAKPOINTS = [
  { min: 0, max: 54, aqi_min: 0, aqi_max: 50 },
  { min: 55, max: 70, aqi_min: 51, aqi_max: 100 },
  { min: 71, max: 85, aqi_min: 101, aqi_max: 150 },
  { min: 86, max: 105, aqi_min: 151, aqi_max: 200 },
  { min: 106, max: 200, aqi_min: 201, aqi_max: 300 }
];

const NO2_BREAKPOINTS = [
  { min: 0, max: 53, aqi_min: 0, aqi_max: 50 },
  { min: 54, max: 100, aqi_min: 51, aqi_max: 100 },
  { min: 101, max: 360, aqi_min: 101, aqi_max: 150 },
  { min: 361, max: 649, aqi_min: 151, aqi_max: 200 },
  { min: 650, max: 1249, aqi_min: 201, aqi_max: 300 },
  { min: 1250, max: 2049, aqi_min: 301, aqi_max: 500 }
];

const SO2_BREAKPOINTS = [
  { min: 0, max: 35, aqi_min: 0, aqi_max: 50 },
  { min: 36, max: 75, aqi_min: 51, aqi_max: 100 },
  { min: 76, max: 185, aqi_min: 101, aqi_max: 150 },
  { min: 186, max: 304, aqi_min: 151, aqi_max: 200 },
  { min: 305, max: 604, aqi_min: 201, aqi_max: 300 }
];

const CO_BREAKPOINTS = [
  { min: 0, max: 4.4, aqi_min: 0, aqi_max: 50 },
  { min: 4.5, max: 9.4, aqi_min: 51, aqi_max: 100 },
  { min: 9.5, max: 12.4, aqi_min: 101, aqi_max: 150 },
  { min: 12.5, max: 15.4, aqi_min: 151, aqi_max: 200 },
  { min: 15.5, max: 30.4, aqi_min: 201, aqi_max: 300 }
];

// Conversion factors from µg/m³ to ppb/ppm
const CONVERSION_FACTORS = {
  O3: 0.5, // µg/m³ to ppb
  NO2: 0.53, // µg/m³ to ppb
  SO2: 0.38, // µg/m³ to ppb
  CO: 0.000873 // µg/m³ to ppm
};

export const fetchCurrentAqi = async (location: string): Promise<AqiData> => {
  const coords = LOCATIONS_COORDS[location];
  if (!coords) {
    throw new Error(`Invalid location: ${location}`);
  }

  try {
    const [airQualityResponse, weatherResponse] = await Promise.all([
      axios.get(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`
      ),
      axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto`
      )
    ]);

    const current = airQualityResponse.data.current;
    const weather = weatherResponse.data.current;

    console.log('Current AQI data:', current);
    console.log('Current weather data:', weather);

    // Calculate individual AQI values
    const pm25Aqi = calculateAQI(current.pm2_5, PM25_BREAKPOINTS);
    const pm10Aqi = calculateAQI(current.pm10, PM10_BREAKPOINTS);
    const o3Aqi = calculateAQI(current.ozone * CONVERSION_FACTORS.O3, O3_BREAKPOINTS);
    const no2Aqi = calculateAQI(current.nitrogen_dioxide * CONVERSION_FACTORS.NO2, NO2_BREAKPOINTS);
    const so2Aqi = calculateAQI(current.sulphur_dioxide * CONVERSION_FACTORS.SO2, SO2_BREAKPOINTS);
    const coAqi = calculateAQI(current.carbon_monoxide * CONVERSION_FACTORS.CO, CO_BREAKPOINTS);

    // Overall AQI is the highest of individual AQIs
    const aqiValues = [pm25Aqi, pm10Aqi, o3Aqi, no2Aqi, so2Aqi, coAqi].filter(val => val > 0);
    const aqi = aqiValues.length > 0 ? Math.max(...aqiValues) : 0;

    return {
      aqi,
      timestamp: new Date(current.time).toISOString(),
      location,
      pollutants: {
        pm25: current.pm2_5,
        pm10: current.pm10,
        o3: current.ozone,
        no2: current.nitrogen_dioxide,
        so2: current.sulphur_dioxide,
        co: current.carbon_monoxide
      },
      category: getAqiCategory(aqi),
      weather: {
        temperature: weather.temperature_2m,
        humidity: weather.relative_humidity_2m,
        windSpeed: weather.wind_speed_10m,
        windDirection: getWindDirection(weather.wind_direction_10m)
      }
    };
  } catch (error) {
    console.error(`Error fetching current AQI for ${location}:`, error);
    throw new Error(`Failed to fetch AQI data for ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to calculate AQI based on breakpoints
const calculateAQI = (concentration: number, breakpoints: any[]): number => {
  // Handle missing or invalid data
  if (concentration === null || concentration === undefined || isNaN(concentration)) {
    return 0;
  }

  // If concentration is below the lowest breakpoint minimum
  if (concentration < breakpoints[0].min) {
    return 0;
  }

  // Find the appropriate breakpoint range
  const range = breakpoints.find(bp => concentration >= bp.min && concentration <= bp.max);
  
  // If concentration is higher than the highest breakpoint, use the last range
  if (!range) {
    if (concentration > breakpoints[breakpoints.length - 1].max) {
      const bp = breakpoints[breakpoints.length - 1];
      // For values exceeding maximum, use the highest range's slope
      return Math.round(
        ((bp.aqi_max - bp.aqi_min) / (bp.max - bp.min)) * (concentration - bp.min) + bp.aqi_min
      );
    }
    return 0; // If no range found and not above max, return 0
  }
  
  // Calculate AQI using the formula
  return Math.round(
    ((range.aqi_max - range.aqi_min) / (range.max - range.min)) * (concentration - range.min) + range.aqi_min
  );
};

const getAqiCategory = (aqi: number): AqiCategory => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 22.5) % 16;
  return directions[index];
};

const processHistoricalData = (hourlyData: any): any[] => {
  const dailyData: any[] = [];
  const days = new Map();

  // Group data by day
  hourlyData.time.forEach((timestamp: string, index: number) => {
    if (!timestamp) return; // Skip if timestamp is missing
    
    try {
      const date = format(parseISO(timestamp), 'yyyy-MM-dd');
      if (!days.has(date)) {
        days.set(date, []);
      }
      
      const reading = {
        pm2_5: hourlyData.pm2_5[index] ?? null,
        pm10: hourlyData.pm10[index] ?? null,
        ozone: hourlyData.ozone[index] ?? null,
        nitrogen_dioxide: hourlyData.nitrogen_dioxide[index] ?? null,
        sulphur_dioxide: hourlyData.sulphur_dioxide[index] ?? null,
        carbon_monoxide: hourlyData.carbon_monoxide[index] ?? null
      };
      
      days.get(date).push(reading);
    } catch (error) {
      console.error(`Error processing timestamp ${timestamp}:`, error);
    }
  });

  // Process each day's data
  days.forEach((readings, date) => {
    if (readings.length === 0) return; // Skip days with no readings
    
    const aqiValues = readings.map((reading: any) => {
      const validAqis = [
        reading.pm2_5 !== null ? calculateAQI(reading.pm2_5, PM25_BREAKPOINTS) : 0,
        //reading.pm10 !== null ? calculateAQI(reading.pm10, PM10_BREAKPOINTS) : 0,
        reading.ozone !== null ? calculateAQI(reading.ozone * CONVERSION_FACTORS.O3, O3_BREAKPOINTS) : 0,
        reading.nitrogen_dioxide !== null ? calculateAQI(reading.nitrogen_dioxide * CONVERSION_FACTORS.NO2, NO2_BREAKPOINTS) : 0,
        reading.sulphur_dioxide !== null ? calculateAQI(reading.sulphur_dioxide * CONVERSION_FACTORS.SO2, SO2_BREAKPOINTS) : 0,
        reading.carbon_monoxide !== null ? calculateAQI(reading.carbon_monoxide * CONVERSION_FACTORS.CO, CO_BREAKPOINTS) : 0
      ].filter(val => val > 0);
      
      return validAqis.length > 0 ? Math.max(...validAqis) : 0;
    }).filter(aqi => aqi > 0);

    if (aqiValues.length === 0) return; // Skip if no valid AQI values

    const averageAqi = Math.round(aqiValues.reduce((a: number, b: number) => a + b, 0) / aqiValues.length);
    const maxAqi = Math.max(...aqiValues);
    const minAqi = Math.min(...aqiValues);

    // Find the reading with most complete data to determine dominant pollutant
    const bestReading = readings.reduce((best: any, current: any) => {
      const bestNonNullCount = Object.values(best).filter(val => val !== null).length;
      const currentNonNullCount = Object.values(current).filter(val => val !== null).length;
      return currentNonNullCount > bestNonNullCount ? current : best;
    }, readings[0]);

    dailyData.push({
      date,
      averageAqi,
      maxAqi,
      minAqi,
      dominantPollutant: getDominantPollutant(bestReading),
      category: getAqiCategory(averageAqi)
    });
  });

  return dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const getDominantPollutant = (reading: any): string => {
  if (!reading) return 'Unknown';
  
  const pollutants: Record<string, number> = {
    'PM2.5': reading.pm2_5 !== null ? calculateAQI(reading.pm2_5, PM25_BREAKPOINTS) : 0,
    'PM10': reading.pm10 !== null ? calculateAQI(reading.pm10, PM10_BREAKPOINTS) : 0,
    'O3': reading.ozone !== null ? calculateAQI(reading.ozone * CONVERSION_FACTORS.O3, O3_BREAKPOINTS) : 0,
    'NO2': reading.nitrogen_dioxide !== null ? calculateAQI(reading.nitrogen_dioxide * CONVERSION_FACTORS.NO2, NO2_BREAKPOINTS) : 0,
    'SO2': reading.sulphur_dioxide !== null ? calculateAQI(reading.sulphur_dioxide * CONVERSION_FACTORS.SO2, SO2_BREAKPOINTS) : 0,
    'CO': reading.carbon_monoxide !== null ? calculateAQI(reading.carbon_monoxide * CONVERSION_FACTORS.CO, CO_BREAKPOINTS) : 0
  };

  const entries = Object.entries(pollutants).filter(([_, value]) => value > 0);
  if (entries.length === 0) return 'Unknown';
  
  return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

const processForecastData = (hourlyData: any): AqiForecast[] => {
  if (!hourlyData || !hourlyData.time || !Array.isArray(hourlyData.time)) {
    return [];
  }
  
  const dailyForecasts = new Map();

  // Group forecast data by day
  hourlyData.time.forEach((timestamp: string, index: number) => {
    if (!timestamp) return; // Skip if timestamp is missing
    
    try {
      const date = format(parseISO(timestamp), 'yyyy-MM-dd');
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, []);
      }
      
      const reading = {
        pm2_5: hourlyData.pm2_5?.[index] ?? null,
        pm10: hourlyData.pm10?.[index] ?? null,
        ozone: hourlyData.ozone?.[index] ?? null,
        nitrogen_dioxide: hourlyData.nitrogen_dioxide?.[index] ?? null,
        sulphur_dioxide: hourlyData.sulphur_dioxide?.[index] ?? null,
        carbon_monoxide: hourlyData.carbon_monoxide?.[index] ?? null
      };
      
      dailyForecasts.get(date).push(reading);
    } catch (error) {
      console.error(`Error processing forecast timestamp ${timestamp}:`, error);
    }
  });

  const forecasts: AqiForecast[] = [];

  // Process each day's forecast
  dailyForecasts.forEach((readings, date) => {
    if (readings.length === 0) return; // Skip days with no readings
    
    const aqiValues = readings.map((reading: any) => {
      const validAqis = [
        reading.pm2_5 !== null ? calculateAQI(reading.pm2_5, PM25_BREAKPOINTS) : 0,
        //reading.pm10 !== null ? calculateAQI(reading.pm10, PM10_BREAKPOINTS) : 0,
        reading.ozone !== null ? calculateAQI(reading.ozone * CONVERSION_FACTORS.O3, O3_BREAKPOINTS) : 0,
        reading.nitrogen_dioxide !== null ? calculateAQI(reading.nitrogen_dioxide * CONVERSION_FACTORS.NO2, NO2_BREAKPOINTS) : 0,
        reading.sulphur_dioxide !== null ? calculateAQI(reading.sulphur_dioxide * CONVERSION_FACTORS.SO2, SO2_BREAKPOINTS) : 0,
        reading.carbon_monoxide !== null ? calculateAQI(reading.carbon_monoxide * CONVERSION_FACTORS.CO, CO_BREAKPOINTS) : 0
      ].filter(val => val > 0);
      
      return validAqis.length > 0 ? Math.max(...validAqis) : 0;
    }).filter(aqi => aqi > 0);

    if (aqiValues.length === 0) return; // Skip if no valid AQI values

    const aqi = Math.round(aqiValues.reduce((sum: number, val: number) => sum + val, 0) / aqiValues.length);

    forecasts.push({
      date,
      aqi,
      category: getAqiCategory(aqi),
      confidence: calculateForecastConfidence(readings.length, new Date(date))
    });
  });

  return forecasts;
};

const calculateForecastConfidence = (dataPoints: number, forecastDate: Date): number => {
  const today = new Date();
  const daysInFuture = Math.floor((forecastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Confidence decreases as forecast date gets further in the future
  const baseConfidence = 85 - (daysInFuture * 5);
  
  // More data points increase confidence
  const dataPointsBonus = Math.min(10, dataPoints / 2);
  
  // Ensure confidence stays within reasonable bounds
  return Math.min(95, Math.max(50, baseConfidence + dataPointsBonus));
};

export const fetchWeeklyAqi = async (): Promise<WeeklyAqiData> => {
  const today = new Date();
  const startDate = format(subDays(today, 6), 'yyyy-MM-dd');
  const endDate = format(today, 'yyyy-MM-dd');
  
  const locationsData: { [key: string]: any[] } = {};
  const averages: { [key: string]: number } = {};
  
  try {
    // Fetch historical data for each location
    const locationPromises = Object.entries(LOCATIONS_COORDS).map(async ([location, coords]) => {
      try {
        const response = await axios.get(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&start_date=${startDate}&end_date=${endDate}&timezone=auto`
        );
        
        const hourlyData = response.data.hourly;
        const dailyData = processHistoricalData(hourlyData);
        
        console.log(`Fetched hourly data for ${location}:`, hourlyData);
        console.log(`Fetched data for ${location}:`, dailyData);


        return { location, dailyData };
      } catch (error) {
        console.error(`Error fetching data for ${location}:`, error);
        return { location, dailyData: [] };
      }
    });
    
    const results = await Promise.all(locationPromises);
    
    // Process results
    results.forEach(({ location, dailyData }) => {
      locationsData[location] = dailyData;
      
      // Calculate average if we have data
      if (dailyData.length > 0) {
        averages[location] = Math.round(
          dailyData.reduce((sum: number, day: any) => sum + day.averageAqi, 0) / dailyData.length
        );
      } else {
        averages[location] = 0;
      }
    });
    
    return {
      startDate,
      endDate,
      locations: locationsData,
      averages
    };
  } catch (error) {
    console.error('Error in fetchWeeklyAqi:', error);
    throw new Error(`Failed to fetch weekly AQI data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const fetchAqiReport = async (): Promise<AqiReport> => {
  const today = new Date();
  const weekStarting = format(subDays(today, 6), 'yyyy-MM-dd');
  const weekEnding = format(today, 'yyyy-MM-dd');
  
  try {
    // Fetch data for all locations to generate the report
    const locationsDataPromises = Object.entries(LOCATIONS_COORDS).map(async ([location, coords]) => {
      try {
        const response = await axios.get(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&start_date=${weekStarting}&end_date=${weekEnding}&timezone=auto`
        );
        return {
          location,
          data: response.data.hourly
        };
      } catch (error) {
        console.error(`Error fetching report data for ${location}:`, error);
        return {
          location,
          data: { time: [], pm2_5: [], pm10: [], ozone: [], nitrogen_dioxide: [], sulphur_dioxide: [], carbon_monoxide: [] }
        };
      }
    });
    
    const locationsData = await Promise.all(locationsDataPromises);
    
    // Generate the report
    const report = {
      summary: generateSummary(locationsData),
      pollutantBreakdown: analyzePollutants(locationsData),
      factors: determineFactors(locationsData),
      recommendations: generateRecommendations(),
      trendAnalysis: analyzeTrends(locationsData)
    };
    
    return {
      id: 'report-' + Date.now(),
      weekStarting,
      weekEnding,
      ...report
    };
  } catch (error) {
    console.error('Error in fetchAqiReport:', error);
    throw new Error(`Failed to generate AQI report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const fetchAqiForecast = async (location: string): Promise<AqiForecast[]> => {
  const coords = LOCATIONS_COORDS[location];
  if (!coords) {
    throw new Error(`Invalid location: ${location}`);
  }

  try {
    const today = new Date();
    const endDate = format(addDays(today, 4), 'yyyy-MM-dd');

    const response = await axios.get(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&start_date=${format(today, 'yyyy-MM-dd')}&end_date=${endDate}&timezone=auto`
    );

    return processForecastData(response.data.hourly);
  } catch (error) {
    console.error(`Error fetching forecast for ${location}:`, error);
    throw new Error(`Failed to fetch AQI forecast for ${location}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const analyzePollutants = (locationsData: any[]): any => {
  const pollutants: any = {
    'PM2.5': { total: 0, max: 0, count: 0 },
    'PM10': { total: 0, max: 0, count: 0 },
    'O3': { total: 0, max: 0, count: 0 },
    'NO2': { total: 0, max: 0, count: 0 },
    'SO2': { total: 0, max: 0, count: 0 },
    'CO': { total: 0, max: 0, count: 0 }
  };

  locationsData.forEach(location => {
    const hourlyData = location.data;
    if (!hourlyData || !hourlyData.time) return;
    
    for (let i = 0; i < hourlyData.time.length; i++) {
      // PM2.5
      if (hourlyData.pm2_5?.[i] !== null && hourlyData.pm2_5?.[i] !== undefined) {
        pollutants['PM2.5'].total += hourlyData.pm2_5[i];
        pollutants['PM2.5'].max = Math.max(pollutants['PM2.5'].max, hourlyData.pm2_5[i]);
        pollutants['PM2.5'].count++;
      }

      // PM10
      if (hourlyData.pm10?.[i] !== null && hourlyData.pm10?.[i] !== undefined) {
        pollutants['PM10'].total += hourlyData.pm10[i];
        pollutants['PM10'].max = Math.max(pollutants['PM10'].max, hourlyData.pm10[i]);
        pollutants['PM10'].count++;
      }

      // O3
      if (hourlyData.ozone?.[i] !== null && hourlyData.ozone?.[i] !== undefined) {
        pollutants['O3'].total += hourlyData.ozone[i];
        pollutants['O3'].max = Math.max(pollutants['O3'].max, hourlyData.ozone[i]);
        pollutants['O3'].count++;
      }

      // NO2
      if (hourlyData.nitrogen_dioxide?.[i] !== null && hourlyData.nitrogen_dioxide?.[i] !== undefined) {
        pollutants['NO2'].total += hourlyData.nitrogen_dioxide[i];
        pollutants['NO2'].max = Math.max(pollutants['NO2'].max, hourlyData.nitrogen_dioxide[i]);
        pollutants['NO2'].count++;
      }

      // SO2
      if (hourlyData.sulphur_dioxide?.[i] !== null && hourlyData.sulphur_dioxide?.[i] !== undefined) {
        pollutants['SO2'].total += hourlyData.sulphur_dioxide[i];
        pollutants['SO2'].max = Math.max(pollutants['SO2'].max, hourlyData.sulphur_dioxide[i]);
        pollutants['SO2'].count++;
      }

      // CO
      if (hourlyData.carbon_monoxide?.[i] !== null && hourlyData.carbon_monoxide?.[i] !== undefined) {
        pollutants['CO'].total += hourlyData.carbon_monoxide[i];
        pollutants['CO'].max = Math.max(pollutants['CO'].max, hourlyData.carbon_monoxide[i]);
        pollutants['CO'].count++;
      }
    }
  });

  return Object.entries(pollutants).reduce((acc: any, [key, data]: [string, any]) => {
    if (data.count === 0) {
      acc[key] = { average: 0, max: 0, trend: 'unknown' };
    } else {
      const average = data.total / data.count;
      acc[key] = {
        average: Math.round(average * 100) / 100,
        max: Math.round(data.max * 100) / 100,
        trend: determineTrend(average, key)
      };
    }
    return acc;
  }, {});
};

const determineTrend = (value: number, pollutant?: string): string => {
  if (value === 0) return 'unknown';
  
  // Different thresholds for different pollutants
  if (pollutant) {
    switch (pollutant) {
      case 'PM2.5':
        if (value > 35) return 'increasing';
        if (value < 12) return 'decreasing';
        break;
      case 'PM10':
        if (value > 150) return 'increasing';
        if (value < 54) return 'decreasing';
        break;
      case 'O3':
        if (value > 70) return 'increasing';
        if (value < 50) return 'decreasing';
        break;
      case 'NO2':
        if (value > 100) return 'increasing';
        if (value < 53) return 'decreasing';
        break;
      case 'SO2':
        if (value > 75) return 'increasing';
        if (value < 35) return 'decreasing';
        break;
        case 'CO':
          if (value > 9) return 'increasing';
          if (value < 4) return 'decreasing';
          break;
      }
    }
    
    // Default behavior if no specific pollutant case or no match
    if (value > 100) return 'increasing';
    if (value < 50) return 'decreasing';
    return 'stable';
  };
  
  const determineFactors = (locationsData: any[]): string[] => {
    const factors = new Set<string>();
    let hasHighPollution = false;
    let hasPersistentModerate = false;
    
    locationsData.forEach(location => {
      const hourlyData = location.data;
      if (!hourlyData || !hourlyData.time || !Array.isArray(hourlyData.time)) return;
      
      // Check for high pollution periods
      const pm25Values = hourlyData.pm2_5?.filter((val: number | null) => val !== null) || [];
      const highPm25Count = pm25Values.filter((val: number) => calculateAQI(val, PM25_BREAKPOINTS) > 150).length;
      
      if (highPm25Count > 0) {
        hasHighPollution = true;
      }
      
      // Check for persistent moderate pollution
      const moderatePm25Count = pm25Values.filter((val: number) => {
        const aqi = calculateAQI(val, PM25_BREAKPOINTS);
        return aqi >= 51 && aqi <= 100;
      }).length;
      
      if (moderatePm25Count > pm25Values.length * 0.5) {
        hasPersistentModerate = true;
      }
    });
    
    // Add identified factors
    if (hasHighPollution) {
      factors.add('High pollution levels detected in multiple areas');
    }
    
    if (hasPersistentModerate) {
      factors.add('Persistent moderate pollution levels throughout the week');
    }
    
    // Add common factors
    factors.add('Vehicle emissions from major roads');
    factors.add('Construction activities in developing sectors');
    factors.add('Industrial emissions from nearby areas');
    
    return Array.from(factors);
  };
  
  const generateRecommendations = (): string[] => {
    return [
      'Use air purifiers with HEPA filters in homes and offices',
      'Wear N95 masks when air quality is poor',
      'Keep windows closed during peak pollution hours (early morning and evening)',
      'Use air quality monitors indoors to track pollution levels',
      'Avoid strenuous outdoor activities when AQI exceeds 150',
      'Limit outdoor exposure for children and elderly during poor air quality days',
      'Avoid areas with active construction'
    ];
  };
  
  const generateSummary = (locationsData: any[]): string => {
    let totalAqi = 0;
    let readingCount = 0;
    let highestAqi = 0;
    let lowestAqi = Infinity;
  
    locationsData.forEach(location => {
      const hourlyData = location.data;
      if (!hourlyData || !hourlyData.time) return;
      
      for (let i = 0; i < hourlyData.time.length; i++) {
        // Calculate AQI only if we have at least one pollutant value
        const hasPollutantData = [
          hourlyData.pm2_5?.[i], 
          hourlyData.pm10?.[i], 
          hourlyData.ozone?.[i], 
          hourlyData.nitrogen_dioxide?.[i], 
          hourlyData.sulphur_dioxide?.[i], 
          hourlyData.carbon_monoxide?.[i]
        ].some(val => val !== null && val !== undefined);
        
        if (!hasPollutantData) continue;
        
        // Calculate individual pollutant AQIs
        const pm25Aqi = hourlyData.pm2_5?.[i] !== undefined ? 
          calculateAQI(hourlyData.pm2_5[i], PM25_BREAKPOINTS) : 0;
        
        // const pm10Aqi = hourlyData.pm10?.[i] !== undefined ? 
        //   calculateAQI(hourlyData.pm10[i], PM10_BREAKPOINTS) : 0;
        
        const o3Aqi = hourlyData.ozone?.[i] !== undefined ? 
          calculateAQI(hourlyData.ozone[i] * CONVERSION_FACTORS.O3, O3_BREAKPOINTS) : 0;
        
        const no2Aqi = hourlyData.nitrogen_dioxide?.[i] !== undefined ? 
          calculateAQI(hourlyData.nitrogen_dioxide[i] * CONVERSION_FACTORS.NO2, NO2_BREAKPOINTS) : 0;
        
        const so2Aqi = hourlyData.sulphur_dioxide?.[i] !== undefined ? 
          calculateAQI(hourlyData.sulphur_dioxide[i] * CONVERSION_FACTORS.SO2, SO2_BREAKPOINTS) : 0;
        
        const coAqi = hourlyData.carbon_monoxide?.[i] !== undefined ? 
          calculateAQI(hourlyData.carbon_monoxide[i] * CONVERSION_FACTORS.CO, CO_BREAKPOINTS) : 0;
        
        // Filter out zero values and get max AQI
        const validAqis = [pm25Aqi, o3Aqi, no2Aqi, so2Aqi, coAqi].filter(aqi => aqi > 0);
        if (validAqis.length === 0) continue;
        
        const maxAqi = Math.max(...validAqis);
        totalAqi += maxAqi;
        readingCount++;
        
        // Track highest and lowest AQI
        highestAqi = Math.max(highestAqi, maxAqi);
        lowestAqi = Math.min(lowestAqi, maxAqi);
      }
    });
    
    // Handle case with no valid readings
    if (readingCount === 0) {
      return "No valid air quality data was available for Dwarka this week. Please check back later for updated information.";
    }
    
    const averageAqi = Math.round(totalAqi / readingCount);
    const category = getAqiCategory(averageAqi);
    
    // Determine trend description
    let trendDesc = "";
    if (highestAqi - lowestAqi > 100) {
      trendDesc = "significant fluctuations";
    } else if (highestAqi - lowestAqi > 50) {
      trendDesc = "moderate variations";
    } else {
      trendDesc = "relatively stable conditions";
    }
    
    return `The average Air Quality Index (AQI) across Dwarka this week was ${averageAqi}, categorized as ${category}. The highest recorded AQI was ${highestAqi} and the lowest was ${lowestAqi === Infinity ? 'unknown' : lowestAqi}, indicating ${trendDesc}. The data suggests ${
      averageAqi > 150 ? 'significant air quality challenges' : 
      averageAqi > 100 ? 'moderate air quality concerns' : 
      'generally acceptable air quality'
    } in the region.`;
  };
  
  const analyzeTrends = (locationsData: any[]): string => {
    // Extract daily AQI values for each location
    const locationTrends: { [location: string]: { daily: number[], trend: string } } = {};
    
    locationsData.forEach(location => {
      const hourlyData = location.data;
      if (!hourlyData || !hourlyData.time) return;
      
      // Group data by day
      const dailyAqis = new Map<string, number[]>();
      
      for (let i = 0; i < hourlyData.time.length; i++) {
        try {
          const timestamp = hourlyData.time[i];
          if (!timestamp) continue;
          
          const date = format(parseISO(timestamp), 'yyyy-MM-dd');
          if (!dailyAqis.has(date)) {
            dailyAqis.set(date, []);
          }
          
          // Calculate AQI for this hour
          const validAqis = [
            hourlyData.pm2_5?.[i] !== undefined ? calculateAQI(hourlyData.pm2_5[i], PM25_BREAKPOINTS) : 0,
            hourlyData.pm10?.[i] !== undefined ? calculateAQI(hourlyData.pm10[i], PM10_BREAKPOINTS) : 0,
            hourlyData.ozone?.[i] !== undefined ? calculateAQI(hourlyData.ozone[i] * CONVERSION_FACTORS.O3, O3_BREAKPOINTS) : 0,
            hourlyData.nitrogen_dioxide?.[i] !== undefined ? calculateAQI(hourlyData.nitrogen_dioxide[i] * CONVERSION_FACTORS.NO2, NO2_BREAKPOINTS) : 0,
            hourlyData.sulphur_dioxide?.[i] !== undefined ? calculateAQI(hourlyData.sulphur_dioxide[i] * CONVERSION_FACTORS.SO2, SO2_BREAKPOINTS) : 0,
            hourlyData.carbon_monoxide?.[i] !== undefined ? calculateAQI(hourlyData.carbon_monoxide[i] * CONVERSION_FACTORS.CO, CO_BREAKPOINTS) : 0
          ].filter(aqi => aqi > 0);
          
          if (validAqis.length > 0) {
            dailyAqis.get(date)!.push(Math.max(...validAqis));
          }
        } catch (error) {
          console.error(`Error processing trend data for timestamp:`, error);
        }
      }
      
      // Calculate average AQI for each day
      const dailyAvgAqis: number[] = [];
      Array.from(dailyAqis.entries())
        .sort(([a], [b]) => a.localeCompare(b)) // Sort by date
        .forEach(([_, aqis]) => {
          if (aqis.length > 0) {
            dailyAvgAqis.push(Math.round(aqis.reduce((sum, aqi) => sum + aqi, 0) / aqis.length));
          }
        });
      
      // Determine trend
      let trend = 'stable';
      if (dailyAvgAqis.length >= 3) {
        const firstHalf = dailyAvgAqis.slice(0, Math.ceil(dailyAvgAqis.length / 2));
        const secondHalf = dailyAvgAqis.slice(Math.floor(dailyAvgAqis.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, aqi) => sum + aqi, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, aqi) => sum + aqi, 0) / secondHalf.length;
        
        const difference = secondHalfAvg - firstHalfAvg;
        
        if (difference > 15) {
          trend = 'increasing';
        } else if (difference < -15) {
          trend = 'decreasing';
        } else {
          trend = 'stable';
        }
      }
      
      locationTrends[location.location] = {
        daily: dailyAvgAqis,
        trend
      };
    });
    
    // Count trends to determine the dominant one
    const trendCounts: { [trend: string]: number } = { increasing: 0, decreasing: 0, stable: 0 };
    Object.values(locationTrends).forEach(({ trend }) => {
      if (trend in trendCounts) {
        trendCounts[trend]++;
      }
    });
    
    // Find the dominant trend
    let dominantTrend = 'stable';
    let maxCount = 0;
    
    Object.entries(trendCounts).forEach(([trend, count]) => {
      if (count > maxCount) {
        dominantTrend = trend;
        maxCount = count;
      }
    });
    
    // Generate the trend analysis text
    const trendDescriptions = {
      increasing: 'worsening air quality',
      decreasing: 'improving air quality',
      stable: 'consistent air quality'
    };
    
    // Count how many sectors show each trend
    const sectorsWithData = Object.keys(locationTrends).length;
    const trendPercentage = Math.round((maxCount / sectorsWithData) * 100);
    
    return `Air quality trends show a ${dominantTrend} pattern (${trendPercentage}% of locations) indicating ${trendDescriptions[dominantTrend as keyof typeof trendDescriptions]} across most of Dwarka. This is likely due to a combination of seasonal weather patterns, local emission sources, and regional pollution factors.`;
  };