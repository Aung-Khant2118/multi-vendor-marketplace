import { useEffect } from 'react';
import { useRouter } from 'next/router';

// The marketplace home page is now the "Overview" / dashboard itself,
// matching the sidebar's first nav item in the redesigned layout.
export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
