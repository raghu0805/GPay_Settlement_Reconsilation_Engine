import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';
import { BalancesPage } from './pages/BalancesPage';
import { CreateExpensePage } from './pages/CreateExpensePage';
import { DashboardPage } from './pages/DashboardPage';
import { DsrePage } from './pages/DsrePage';
import { GroupDetailsPage } from './pages/GroupDetailsPage';
import { GroupsPage } from './pages/GroupsPage';
import { LoginPage } from './pages/LoginPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';

function ProtectedApp() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return <AppLayout />;
}

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate replace to="/" /> : <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />} path="/login" />
      <Route element={<ProtectedApp />}>
        <Route element={<DashboardPage />} index />
        <Route element={<GroupsPage />} path="/groups" />
        <Route element={<GroupDetailsPage />} path="/groups/:groupId" />
        <Route element={<CreateExpensePage />} path="/expenses/new" />
        <Route element={<BalancesPage />} path="/balances" />
        <Route element={<DsrePage />} path="/dsre" />
        <Route element={<NotificationsPage />} path="/notifications" />
        <Route element={<SearchPage />} path="/search" />
        <Route element={<ProfilePage />} path="/profile" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
      <Route element={<NotFoundPage />} path="/not-found" />
    </Routes>
  );
}
