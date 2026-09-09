import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../features/auth/AuthContext';
import { useHasMounted } from './useHasMounted';

// Route guard for /admin/* pages: guests → login, non-admins → home.
export function useAdminGuard() {
  const { isAuthenticated: authState, isAdmin: adminState, syncing } = useAuth();
  const router = useRouter();
  const mounted = useHasMounted();
  const isAuthenticated = mounted && authState;
  const isAdmin = mounted && adminState;
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!mounted || syncing || hasRedirected.current) return;

    if (!isAuthenticated) {
      hasRedirected.current = true;
      router.replace('/auth/login');
      return;
    }
    if (!isAdmin) {
      hasRedirected.current = true;
      router.replace('/');
    }
  }, [mounted, isAuthenticated, isAdmin, syncing, router]);

  return { ready: isAuthenticated && isAdmin };
}
