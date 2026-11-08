import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

// Lazy loading of all pages for performance optimization
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/Register'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ProfessionalListPage = lazy(() => import('./pages/ProfessionalList'));
const ProfessionalDetailPage = lazy(() => import('./pages/ProfessionalDetail'));
const MyAppointmentsPage = lazy(() => import('./pages/MyAppointments'));
const ProfessionalAppointmentsPage = lazy(() => import('./pages/ProfessionalAppointments'));
const MyFavoritesPage = lazy(() => import('./pages/MyFavorites'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <LoadingSpinner size="lg" text="Cargando aplicación..." />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="professionals" element={<ProfessionalListPage />} />
              <Route path="professionals/:id" element={<ProfessionalDetailPage />} />

              {/* Protected Routes: Authenticated general */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Patient Only Routes */}
              <Route
                path="appointments"
                element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <MyAppointmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="favorites"
                element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <MyFavoritesPage />
                  </ProtectedRoute>
                }
              />

              {/* Professional Only Routes */}
              <Route
                path="professional/appointments"
                element={
                  <ProtectedRoute roles={['PROFESSIONAL']}>
                    <ProfessionalAppointmentsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
