import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { userAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import AppLayout from '../components/layout/AppLayout';

export default function Profile() {
  const { isAuthenticated, loading, user, fetchCurrentUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) fetchCurrentUser();
  }, [isAuthenticated]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile({
        firstName: firstNameRef.current.value,
        lastName: lastNameRef.current.value,
      });
      toast.success('Profile updated');
      fetchCurrentUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile updates are not available yet');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>Profile settings</h1>
          <p>Manage your account details</p>
        </div>
      </div>

      <div className="content-card">
        <h2 className="dashboard-subtitle">Account</h2>
        <div className="info-row">
          <strong>Email:</strong> {user?.email}
        </div>
        <div className="info-row">
          <strong>Role:</strong> {user?.role || 'CUSTOMER'}
        </div>
        {user?.vendorStatus && (
          <div className="info-row">
            <strong>Store status:</strong> {user.vendorStatus}
          </div>
        )}
      </div>

      <div className="content-card">
        <h2 className="dashboard-subtitle">Edit name</h2>
        {/* Keyed on the user's email so the uncontrolled fields re-initialize
            once /auth/me resolves and the real name becomes available. */}
        <form onSubmit={save} key={user?.email || 'loading'}>
          <div className="form-group">
            <label className="form-label">First name</label>
            <input className="form-input" defaultValue={user?.firstName || ''} ref={firstNameRef} />
          </div>
          <div className="form-group">
            <label className="form-label">Last name</label>
            <input className="form-input" defaultValue={user?.lastName || ''} ref={lastNameRef} />
          </div>
          <button type="submit" className="btn-pill btn-pill-yellow" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
