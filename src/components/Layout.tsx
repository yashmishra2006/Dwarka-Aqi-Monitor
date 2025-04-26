import React, { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Wind, BarChart2, FileText, Calendar, Menu, X, MapPin, RefreshCw } from 'lucide-react';
import { useAqi } from '../context/AqiContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { selectedLocation, locations, setSelectedLocation, refreshData, isLoading } = useAqi();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleRefresh = async () => {
    await refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Wind className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Dwarka AQI Monitor</h1>
            </div>
            
            <div className="hidden md:flex md:items-center md:space-x-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${
                    isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium flex items-center`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Wind className="mr-3 h-5 w-5" />
                Dashboard
              </NavLink>
              
              <NavLink
                to="/weekly-report"
                className={({ isActive }) =>
                  `${
                    isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium flex items-center`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="mr-3 h-5 w-5" />
                Weekly Report
              </NavLink>
              
              <NavLink
                to="/historical"
                className={({ isActive }) =>
                  `${
                    isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium flex items-center`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart2 className="mr-3 h-5 w-5" />
                Historical Data
              </NavLink>
              
              <NavLink
                to="/forecast"
                className={({ isActive }) =>
                  `${
                    isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium flex items-center`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Calendar className="mr-3 h-5 w-5" />
                Forecast
              </NavLink>
              
              <div className="pt-2 pb-1">
                <div className="flex items-center px-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="ml-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-3 px-3">
                  <button
                    onClick={() => {
                      handleRefresh();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar navigation */}
        <nav className="hidden md:block w-64 bg-white border-r border-gray-200 pt-5 pb-4 flex-shrink-0">
          <div className="h-full flex flex-col px-2">
            <div className="space-y-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${
                    isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`
                }
              >
                <Wind className="mr-3 h-5 w-5" />
                Dashboard
              </NavLink>
              
              <NavLink
                to="/weekly-report"
                className={({ isActive }) =>
                  `${
                    isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`
                }
              >
                <FileText className="mr-3 h-5 w-5" />
                Weekly Report
              </NavLink>
              
              <NavLink
                to="/historical"
                className={({ isActive }) =>
                  `${
                    isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`
                }
              >
                <BarChart2 className="mr-3 h-5 w-5" />
                Historical Data
              </NavLink>
              
              <NavLink
                to="/forecast"
                className={({ isActive }) =>
                  `${
                    isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`
                }
              >
                <Calendar className="mr-3 h-5 w-5" />
                Forecast
              </NavLink>
            </div>
            
            <div className="mt-auto p-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AQI Legend
                </h3>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-aqi-good"></div>
                    <span className="ml-2 text-xs text-gray-600">0-50: Good</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-aqi-moderate"></div>
                    <span className="ml-2 text-xs text-gray-600">51-100: Moderate</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-aqi-sensitive"></div>
                    <span className="ml-2 text-xs text-gray-600">101-150: Unhealthy for Sensitive Groups</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-aqi-unhealthy"></div>
                    <span className="ml-2 text-xs text-gray-600">151-200: Unhealthy</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-aqi-very-unhealthy"></div>
                    <span className="ml-2 text-xs text-gray-600">201-300: Very Unhealthy</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-aqi-hazardous"></div>
                    <span className="ml-2 text-xs text-gray-600">301+: Hazardous</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};