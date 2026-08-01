import { AppDataProvider } from './AppDataContext';
import { AuthProvider } from './AuthContext';

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <AppDataProvider>{children}</AppDataProvider>
    </AuthProvider>
  );
}
