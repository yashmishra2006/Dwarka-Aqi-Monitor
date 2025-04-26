import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { WeeklyReport } from './pages/WeeklyReport';
import { HistoricalData } from './pages/HistoricalData';
import { Forecast } from './pages/Forecast';
import { AqiProvider } from './context/AqiContext';

function App() {
  return (
    <AqiProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weekly-report" element={<WeeklyReport />} />
            <Route path="/historical" element={<HistoricalData />} />
            <Route path="/forecast" element={<Forecast />} />
          </Routes>
        </Layout>
      </Router>
    </AqiProvider>
  );
}

export default App;