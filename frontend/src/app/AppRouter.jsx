import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PrivateRoute from './PrivateRoute';
import Background from '../components/ui/Background';

const Login = lazy(() => import('../pages/Auth/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const ItemsPage = lazy(() => import('../pages/Items/ItemsPage'));
const ItemDetailPage = lazy(() => import('../pages/Items/ItemDetailPage'));
const CategoriesPage = lazy(() => import('../pages/Categories/CategoriesPage'));
const BorrowingsPage = lazy(() => import('../pages/Borrowings/BorrowingsPage'));
const MaintenancePage = lazy(() => import('../pages/Maintenance/MaintenancePage'));
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-base text-slate-600">Memuat halaman...</div>}>
        <Background />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/items"
          element={
            <PrivateRoute>
              <ItemsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/items/:id"
          element={
            <PrivateRoute>
              <ItemDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <CategoriesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/borrowings"
          element={
            <PrivateRoute>
              <BorrowingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <PrivateRoute>
              <MaintenancePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
