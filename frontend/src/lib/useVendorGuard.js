import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../features/auth/AuthContext';
import { useHasMounted } from './useHasMounted';

// Shared route guard for /vendor/* pages: redirects guests to login and
// non-vendors back to the marketplace home, mirroring the checks that used
// to be duplicated inside each vendor page's own effect.
//
// This is a static export with no server-side auth, so the token only
// exists in localStorage on the client (see Sidebar.js/Topbar.js for the
// same issue). AuthContext resolves isAuthenticated/isVendor synchronously
// from localStorage on the client's very first render, which would already
// disagree with the server-rendered "logged out" markup on a hard
// navigation (direct URL, refresh) and trigger a hydration mismatch.
// Deferring both the render decision and the redirect until after mount
// keeps the first paint identical to SSR, then the real state takes over.
export function useVendorGuard() {
  const { isAuthenticated: authState, isVendor: vendorState } = useAuth();
  const router = useRouter();
  const mounted = useHasMounted();
  const isAuthenticated = mounted && authState;
  const isVendor = mounted && vendorState;

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (!isVendor) {
      router.replace('/');
    }
  }, [mounted, isAuthenticated, isVendor, router]);

  return { ready: isAuthenticated && isVendor };
}
