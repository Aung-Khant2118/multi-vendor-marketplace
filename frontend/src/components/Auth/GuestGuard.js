import Link from 'next/link';
import { FiLogIn } from 'react-icons/fi';
import AppLayout from '../layout/AppLayout';

export default function GuestGuard({ children, message, layout = true }) {
  const content = (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 480, textAlign: 'center' }}>
        <FiLogIn size={40} style={{ color: 'var(--accent)', marginBottom: 16 }} />
        <h2 className="auth-title">Please log in to continue</h2>
        <p className="auth-subtitle" style={{ marginBottom: 24 }}>
          {message || 'You need to be signed in to access this page.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/login" className="btn-pill btn-pill-yellow" style={{ textDecoration: 'none' }}>
            Log In
          </Link>
          <Link href="/auth/register" className="btn-pill btn-pill-outline" style={{ textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );

  if (!layout) return content;

  return <AppLayout>{content}</AppLayout>;
}
