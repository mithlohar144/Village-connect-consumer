
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { Layout } from './components/Layout';
import { LanguageSelection } from './screens/LanguageSelection';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { Mandi } from './screens/Mandi';
import { Wallet } from './screens/Wallet';
import { Profile } from './screens/Profile';
import { ServiceProviderOnboarding } from './screens/ServiceProviderOnboarding';
import { ServiceList } from './screens/ServiceList';
import { Bookings } from './screens/Bookings';
import { KycVerification } from './screens/KycVerification';
import { Chats } from './screens/Chats';
import { Weather } from './screens/Weather';
import { Emergency } from './screens/Emergency';
import { Notifications } from './screens/Notifications';
import { EditProfile } from './screens/EditProfile';
import { ProfileSetup } from './screens/ProfileSetup';

// Added optional children type to satisfy specific TypeScript environments that fail to detect JSX children
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const user = useStore((state) => state.user);
  if (!user) return <Navigate to="/language" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  const setOffline = useStore((state) => state.setOffline);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline]);

  return (
    <Routes>
      <Route path="/language" element={<LanguageSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding-provider" element={<ServiceProviderOnboarding />} />
      <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
      <Route path="/kyc" element={<ProtectedRoute><KycVerification /></ProtectedRoute>} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/services/:category" element={
        <ProtectedRoute>
          <Layout>
            <ServiceList />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/bookings" element={
        <ProtectedRoute>
          <Layout>
            <Bookings />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/mandi" element={
        <ProtectedRoute>
          <Layout>
            <Mandi />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/wallet" element={
        <ProtectedRoute>
          <Layout>
            <Wallet />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/chats" element={
        <ProtectedRoute>
          <Layout>
            <Chats />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile/edit" element={
        <ProtectedRoute>
          <Layout>
            <EditProfile />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/weather" element={
        <ProtectedRoute>
          <Weather />
        </ProtectedRoute>
      } />

      <Route path="/emergency" element={
        <ProtectedRoute>
          <Emergency />
        </ProtectedRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-neutral relative shadow-xl overflow-x-hidden selection:bg-primary/20">
      <Router>
        <AppContent />
      </Router>
    </div>
  );
};

export default App;
