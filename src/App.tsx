import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/AppLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseItems from './pages/BrowseItems';
import ReportForm from './pages/ReportForm';
import ItemDetails from './pages/ItemDetails';
import SmartMatches from './pages/SmartMatches';
import MyReports from './pages/MyReports';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main App Layout */}
          <Route element={<AppLayout />}>
            {/* Publicly browse items & view details */}
            <Route path="/browse" element={<BrowseItems />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            
            {/* Protected authenticated routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/report/lost" element={<ProtectedRoute><ReportForm type="lost" /></ProtectedRoute>} />
            <Route path="/report/found" element={<ProtectedRoute><ReportForm type="found" /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><SmartMatches /></ProtectedRoute>} />
            <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            
            {/* Admin Route */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
