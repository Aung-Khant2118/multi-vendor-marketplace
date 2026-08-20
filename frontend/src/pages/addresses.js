import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FiMapPin, FiTrash2, FiPlus } from 'react-icons/fi';
import { useAuth } from '../features/auth/AuthContext';
import AppLayout from '../components/layout/AppLayout';

const EMPTY_FORM = { label: '', line1: '', city: '', postalCode: '', phone: '' };

// There is no address API on the backend, so this is a local-only
// (localStorage) address book, scoped per signed-in email.
export default function Addresses() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const storageKey = user?.email ? `zaylink_addresses_${user.email}` : null;

  const [addresses, setAddresses] = useState(() => {
    if (typeof window === 'undefined' || !storageKey) return [];
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  const persist = (next) => {
    setAddresses(next);
    if (storageKey) window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const addAddress = (e) => {
    e.preventDefault();
    if (!form.label || !form.line1 || !form.city) {
      toast.error('Label, address line and city are required');
      return;
    }
    persist([...addresses, { ...form, id: Date.now() }]);
    setForm(EMPTY_FORM);
    toast.success('Address saved');
  };

  const removeAddress = (id) => {
    persist(addresses.filter((a) => a.id !== id));
  };

  if (!isAuthenticated) return null;

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <h1>Addresses</h1>
          <p>Saved shipping addresses for faster checkout</p>
        </div>
      </div>

      <div className="content-card">
        <h2 className="dashboard-subtitle">Add a new address</h2>
        <form onSubmit={addAddress}>
          <div className="form-group">
            <label className="form-label">Label</label>
            <input
              className="form-input"
              placeholder="Home, Office…"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address line</label>
            <input
              className="form-input"
              placeholder="123 Commerce St"
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              className="form-input"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Postal code</label>
            <input
              className="form-input"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-pill btn-pill-yellow">
            <FiPlus /> Save address
          </button>
        </form>
      </div>

      {addresses.length === 0 ? (
        <div className="empty-state">
          <FiMapPin size={32} />
          <div className="empty-state-title">No saved addresses</div>
          <p>Add an address above to use it at checkout.</p>
        </div>
      ) : (
        addresses.map((a) => (
          <div key={a.id} className="content-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{a.label}</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {a.line1}, {a.city} {a.postalCode}
                {a.phone ? ` · ${a.phone}` : ''}
              </p>
            </div>
            <button type="button" className="btn-sm btn-sm-danger" onClick={() => removeAddress(a.id)}>
              <FiTrash2 />
            </button>
          </div>
        ))
      )}
    </AppLayout>
  );
}
