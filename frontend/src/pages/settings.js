import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import {
  FiCamera,
  FiShield,
  FiPackage,
  FiTag,
  FiVolume2,
  FiCheckCircle,
  FiArrowLeft,
} from 'react-icons/fi';
import { userAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';

const SECTIONS_ALL = [
  { id: 'profile', label: 'Profile' },
  { id: 'account-security', label: 'Account & Security' },
  { id: 'notifications', label: 'Notifications' },
];

const DEFAULT_NOTIF_PREFS = {
  orders: true,
  promotions: true,
  security: true,
  marketing: false,
};

const initialsOf = (user) => {
  if (!user) return '';
  const a = user.firstName?.[0] || '';
  const b = user.lastName?.[0] || '';
  return (a + b || user.email?.[0] || '?').toUpperCase();
};

// Small, self-contained checkbox-based switch — the design system has no
// existing toggle component, so this reuses the project's yellow/navy
// tokens rather than pulling in a new one.
function ToggleSwitch({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-switch-track" />
    </label>
  );
}

export default function Settings() {
  const { isAuthenticated, loading, user, fetchCurrentUser } = useAuth();
  const router = useRouter();
  const storageKey = user?.email ? `zaylink_${user.email}` : null;
  const fileInputRef = useRef(null);
  const sectionRefs = useRef({});

  const [activeSection, setActiveSection] = useState('profile');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [profileForm, setProfileForm] = useState({ fullName: '', username: '', phoneNumber: '' });
  const [securityForm, setSecurityForm] = useState({ newEmail: '', newPassword: '', confirmPassword: '' });
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF_PREFS);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) fetchCurrentUser();
  }, [isAuthenticated]);

  // Keyed on the user's email so uncontrolled-ish state re-initializes once
  // /auth/me resolves and per-user localStorage data becomes available.
  useEffect(() => {
    if (!user?.email) return;
    setProfileForm({
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      username: user.username || '',
      phoneNumber: user.phoneNumber || '',
    });

    try {
      const rawAvatar = window.localStorage.getItem(`zaylink_avatar_${user.email}`);
      setAvatarUrl(rawAvatar || null);

      const rawNotifs = window.localStorage.getItem(`zaylink_notif_prefs_${user.email}`);
      setNotifPrefs(rawNotifs ? { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(rawNotifs) } : DEFAULT_NOTIF_PREFS);
    } catch {
      // ignore malformed local data
    }
  }, [user?.email]);

  // Scroll-spy: highlights the sub-nav tab for whichever section is in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-120px 0px -60% 0px' }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const jumpTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const [firstName, ...rest] = profileForm.fullName.trim().split(/\s+/);
      await userAPI.updateProfile({
        firstName: firstName || '',
        lastName: rest.join(' '),
        username: profileForm.username,
        phoneNumber: profileForm.phoneNumber,
      });
      toast.success('Profile updated');
      fetchCurrentUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile updates are not available yet');
    } finally {
      setSavingProfile(false);
    }
  };

  // Resized client-side so the data URL saved to localStorage stays small.
  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file || !storageKey) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const size = 160;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        try {
          window.localStorage.setItem(`zaylink_avatar_${user.email}`, dataUrl);
          setAvatarUrl(dataUrl);
          toast.success('Photo updated');
        } catch {
          toast.error('Could not save that photo');
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const saveSecurity = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setSavingSecurity(true);
    try {
      // There is no account-security API on the backend yet (no change-email
      // or change-password endpoint), so this mirrors the profile page's
      // graceful-degradation pattern rather than pretending it persisted.
      toast.info('Security updates are not available yet — check back soon');
      setSecurityForm({ newEmail: '', newPassword: '', confirmPassword: '' });
    } finally {
      setSavingSecurity(false);
    }
  };

  const saveNotifPrefs = (e) => {
    e.preventDefault();
    setSavingNotifs(true);
    if (storageKey) {
      window.localStorage.setItem(`zaylink_notif_prefs_${user.email}`, JSON.stringify(notifPrefs));
    }
    toast.success('Notification preferences saved');
    setSavingNotifs(false);
  };

  const setSectionRef = (id) => (el) => {
    sectionRefs.current[id] = el;
  };

  const avatarInitials = useMemo(() => initialsOf(user), [user]);

  const sections = useMemo(() => {
    const role = user?.role;
    return SECTIONS_ALL.filter((s) => !s.roles || s.roles.includes(role));
  }, [user?.role]);

  if (!mounted) return null;
  if (!isAuthenticated) return null;

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="settings-standalone">
      <div className="settings-standalone-header">
        <button type="button" className="settings-back-btn" onClick={handleBack}>
          <FiArrowLeft size={18} />
        </button>
        <h1>Settings</h1>
        <div />
      </div>
      <div className="settings-standalone-content">
        <div className="page-heading">
          <div>
            <p>Manage your profile, security and notification preferences</p>
          </div>
        </div>

        <div className="tab-row">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`tab-pill ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => jumpTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ---------- PROFILE ---------- */}
        <div id="profile" ref={setSectionRef('profile')} className="content-card settings-section">
        <div className="settings-section-head">
          <div>
            <h2>
              <span className="settings-section-bar" />
              Profile
            </h2>
            <p>Manage your photo, full name, and personal contact details.</p>
          </div>
        </div>

        <div className="settings-avatar-row">
          <div className="settings-avatar-wrap">
            <div className="settings-avatar">
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" /> : avatarInitials}
            </div>
            <button
              type="button"
              className="settings-avatar-edit"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change photo"
            >
              <FiCamera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarPick}
            />
          </div>
          <div>
            <div className="settings-avatar-name">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
            </div>
            <div className="settings-avatar-sub">@{user?.username || (user?.email || '').split('@')[0]}</div>
          </div>
        </div>

        <form onSubmit={saveProfile} key={user?.email || 'loading'}>
          <div className="settings-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email || ''} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="settings-actions">
            <button type="submit" className="btn-pill btn-pill-yellow" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
        </div>

        {/* ---------- ACCOUNT & SECURITY ---------- */}
        <div id="account-security" ref={setSectionRef('account-security')} className="content-card settings-section">
          <div className="settings-section-head">
            <div>
              <h2>
                <span className="settings-section-bar" />
                Account &amp; Security
              </h2>
              <p>Update your login email and password.</p>
            </div>
          </div>

          <form onSubmit={saveSecurity}>
            <div className="settings-form-grid">
              <div className="form-group settings-field-tagged">
                <label className="form-label">Current Email</label>
                <input className="form-input" value={user?.email || ''} disabled />
                <span className="settings-field-tag">Active</span>
              </div>
              <div className="form-group">
                <label className="form-label">Change Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter new email address"
                  value={securityForm.newEmail}
                  onChange={(e) => setSecurityForm({ ...securityForm, newEmail: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Change Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Change Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <div className="settings-actions">
              <button type="submit" className="btn-pill btn-pill-yellow" disabled={savingSecurity}>
                {savingSecurity ? 'Updating…' : 'Update Security Details'}
              </button>
            </div>
          </form>
        </div>

        {/* ---------- NOTIFICATIONS ---------- */}
        <div id="notifications" ref={setSectionRef('notifications')} className="content-card settings-section">
          <div className="settings-section-head">
            <div>
              <h2>
                <span className="settings-section-bar" />
                Notifications
              </h2>
              <p>Configure your email and push alert notification preferences.</p>
            </div>
          </div>

          <form onSubmit={saveNotifPrefs}>
            <div className="settings-notif-row">
              <div className="settings-notif-main">
                <div className="settings-notif-icon tone-amber">
                  <FiPackage />
                </div>
                <div>
                  <h4 className="settings-notif-title">Orders &amp; Deliveries</h4>
                  <ul className="settings-notif-list">
                    <li>New order placement receipts</li>
                    <li>Shipping status updates &amp; live tracking</li>
                    <li>Order delivery confirmations</li>
                  </ul>
                </div>
              </div>
              <ToggleSwitch checked={notifPrefs.orders} onChange={(v) => setNotifPrefs({ ...notifPrefs, orders: v })} />
            </div>

            <div className="settings-notif-row">
              <div className="settings-notif-main">
                <div className="settings-notif-icon tone-green">
                  <FiTag />
                </div>
                <div>
                  <h4 className="settings-notif-title">Promotions &amp; Offers</h4>
                  <ul className="settings-notif-list">
                    <li>Exclusive discount coupons</li>
                    <li>Flash sales alerts</li>
                    <li>New product arrivals from saved vendors</li>
                  </ul>
                </div>
              </div>
              <ToggleSwitch
                checked={notifPrefs.promotions}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, promotions: v })}
              />
            </div>

            <div className="settings-notif-row">
              <div className="settings-notif-main">
                <div className="settings-notif-icon tone-blue">
                  <FiShield />
                </div>
                <div>
                  <h4 className="settings-notif-title">Account Security</h4>
                  <ul className="settings-notif-list">
                    <li>Login alerts from new devices</li>
                    <li>Password change notifications</li>
                  </ul>
                </div>
              </div>
              <ToggleSwitch
                checked={notifPrefs.security}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, security: v })}
              />
            </div>

            <div className="settings-notif-row">
              <div className="settings-notif-main">
                <div className="settings-notif-icon tone-purple">
                  <FiVolume2 />
                </div>
                <div>
                  <h4 className="settings-notif-title">Marketing &amp; Feedback</h4>
                  <ul className="settings-notif-list">
                    <li>Personalized product recommendations</li>
                    <li>Platform feature updates</li>
                    <li>Customer feedback surveys</li>
                  </ul>
                </div>
              </div>
              <ToggleSwitch
                checked={notifPrefs.marketing}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, marketing: v })}
              />
            </div>

            <div className="settings-actions">
              <button type="submit" className="btn-pill btn-pill-yellow" disabled={savingNotifs}>
                <FiCheckCircle /> Save Notification Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
