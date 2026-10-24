import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';
import { OnboardingFlow } from './pages/onboarding/OnboardingFlow';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { FarmWorkspacePage } from './pages/farm/FarmWorkspacePage';
import { AiMitraPage } from './pages/ai/AiMitraPage';
import { CropCalendarPage } from './pages/calendar/CropCalendarPage';
import { MandiPricesPage } from './pages/mandi/MandiPricesPage';
import { CropExpensesPage } from './pages/expenses/CropExpensesPage';
import { DiseaseDetectionPage } from './pages/disease/DiseaseDetectionPage';
import { GovtSchemesPage } from './pages/schemes/GovtSchemesPage';
import { CommunityPage } from './pages/community/CommunityPage';
import { WeatherAlertsPage } from './pages/alerts/WeatherAlertsPage';
import { KhetHealthReportPage } from './pages/health/KhetHealthReportPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { HelpCenterPage } from './pages/help/HelpCenterPage';
import { SearchPage } from './pages/search/SearchPage';
import { AddLandWorkflowPage } from './pages/land/AddLandWorkflowPage';
import { MyLandListPage } from './pages/land/MyLandListPage';
import { LandDetailPage } from './pages/land/LandDetailPage';
import { NearbyMillsPage } from './pages/mills/NearbyMillsPage';

const AppRoutes: React.FC = () => {
  const { onboarding } = useApp();

  return (
    <Routes>
      {/* Onboarding Flow (Accessible directly or when onboarding is pending) */}
      <Route path="/onboarding" element={<OnboardingFlow />} />

      {/* Main Application Routes inside AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        
        {/* Land Management Workflow Routes */}
        <Route path="/add-land" element={<AddLandWorkflowPage />} />
        <Route path="/my-land" element={<MyLandListPage />} />
        <Route path="/land/:id" element={<LandDetailPage />} />
        <Route path="/nearby-mills" element={<NearbyMillsPage />} />

        {/* Existing Application Routes */}
        <Route path="/farm" element={<FarmWorkspacePage />} />
        <Route path="/ai-mitra" element={<AiMitraPage />} />
        <Route path="/calendar" element={<CropCalendarPage />} />
        <Route path="/mandi" element={<MandiPricesPage />} />
        <Route path="/expenses" element={<CropExpensesPage />} />
        <Route path="/crop-expenses" element={<Navigate to="/expenses" replace />} />
        <Route path="/disease-detection" element={<DiseaseDetectionPage />} />
        <Route path="/schemes" element={<GovtSchemesPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/alerts" element={<WeatherAlertsPage />} />
        <Route path="/health-report" element={<KhetHealthReportPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/subscription" element={<Navigate to="/" replace />} />
        <Route path="/subscription/checkout" element={<Navigate to="/?checkout=premium" replace />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
